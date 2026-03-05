"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function useDebounce<T>(value: T, delay: number): T {
    const [dv, setDv] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDv(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return dv;
}

interface FormSearchBarProps {
    onSearch: (q: string) => void;
    onExpandChange?: (expanded: boolean) => void;
    suggestions?: string[];
    placeholder?: string;
}

export function FormSearchBar({
    onSearch,
    onExpandChange,
    suggestions = [],
    placeholder = "Search endpoints…",
}: FormSearchBarProps) {
    const [text, setText] = useState("");
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);

    const debounced = useDebounce(text, 300);

    useEffect(() => {
        if (!debounced) { setResults([]); setLoading(false); onSearch(""); return; }
        let cancelled = false;
        setLoading(true);
        const t = setTimeout(() => {
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(debounced.toLowerCase())
            );
            if (!cancelled) { setResults(filtered); setLoading(false); onSearch(debounced); }
        }, 200);
        return () => { cancelled = true; clearTimeout(t); };
    }, [debounced]);

    const clear = () => { setText(""); setResults([]); onSearch(""); };

    return (
        <div className="relative flex-1 w-full">
            {/* Input */}
            <div className={`flex items-center h-10 rounded-lg border bg-muted transition-colors duration-200 ${focused ? "border-ring" : "border-border"}`}>
                <span className="pl-3.5 pr-2 shrink-0 text-muted-foreground">
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Search className="h-4 w-4" />
                    }
                </span>
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={() => { setFocused(true); onExpandChange?.(true); }}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                />
                <AnimatePresence>
                    {text && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            onClick={clear}
                            className="mr-2 h-5 w-5 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Suggestion dropdown */}
            <AnimatePresence>
                {focused && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-border bg-popover backdrop-blur-xl shadow-xl overflow-hidden"
                    >
                        {results.slice(0, 6).map((item) => (
                            <button
                                key={item}
                                onMouseDown={() => { setText(item); onSearch(item); }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                            >
                                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                {item}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
