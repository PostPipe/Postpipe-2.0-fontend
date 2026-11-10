"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2, Search, AlertCircle, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReferenceConfig {
  collection: string;
  displayField?: string;
}

interface Collection {
  id: string;
  name: string;
  fields?: Array<{ name: string; type: string; isRelationalSource?: boolean }>;
}

interface ReferenceFieldConfigProps {
  /** Current reference config (controlled) */
  value: ReferenceConfig | undefined;
  /** Called when config changes */
  onChange: (config: ReferenceConfig | undefined) => void;
  /** Available collections / forms to reference */
  collections?: Collection[];
  /** Compact mode — used inside the field card in the form builder */
  compact?: boolean;
  className?: string;
}

// ── Simple debounce hook ───────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ── Main Component ─────────────────────────────────────────────────────────

/**
 * ReferenceFieldConfig — Rendered inside the form builder when a field
 * has type "reference", "foreign_key", or "uuid".
 *
 * Lets the user:
 *   1. Pick the target collection from a searchable dropdown
 *   2. Toggle bidirectional / lazy / validate options
 */
export function ReferenceFieldConfig({
  value,
  onChange,
  collections = [],
  compact = false,
  className,
}: ReferenceFieldConfigProps) {
  const [openCollection, setOpenCollection] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filtered = collections.filter(
    (c) =>
      !debouncedSearch ||
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const update = useCallback(
    (patch: Partial<ReferenceConfig>) => {
      if (!patch.collection && !value?.collection) return;
      onChange({
        collection: value?.collection ?? "",
        displayField: value?.displayField ?? "name",
        ...patch,
      });
    },
    [value, onChange]
  );

  const clear = () => onChange(undefined);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Collection picker */}
      <div className="space-y-1">
        <Label className="text-[10px] text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-3 h-3" /> Target Collection
        </Label>

        <Popover
          open={openCollection}
          onOpenChange={(open) => {
            setOpenCollection(open);
            if (!open) setSearch("");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-8 w-full items-center justify-between rounded-md px-3 text-xs bg-violet-500/10 border border-violet-500/30 text-white",
                "hover:border-violet-400/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors"
              )}
            >
              <span className="truncate">
                {collections.find((c) => c.id === value?.collection)?.name ||
                  value?.collection ||
                  "Select collection…"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0 bg-[#09090D] border border-white/10 text-white shadow-xl z-50 rounded-lg overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 bg-[#09090D]">
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                <Search className="w-3 h-3 text-neutral-500 shrink-0" />
                <input
                  placeholder="Search collections…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 outline-none"
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-neutral-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[200px] p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.2) transparent',
              }}
            >
              {filtered.length === 0 ? (
                <p className="py-4 text-center text-xs text-neutral-500">
                  {collections.length === 0
                    ? "No collections available — deploy a form first"
                    : "No matches found"}
                </p>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-semibold text-violet-300 px-2 py-1 uppercase tracking-wider">
                    Your Forms / Collections
                  </div>
                  {filtered.map((c) => {
                    const isSelected = value?.collection === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          update({ collection: c.id });
                          setOpenCollection(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors",
                          isSelected
                            ? "bg-violet-500/20 text-white font-medium"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium truncate">{c.name}</span>
                          {c.id !== c.name && (
                            <span className="font-mono text-[9px] text-neutral-500 truncate">
                              {c.id}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {value?.collection && (
          <button
            onClick={clear}
            className="text-[10px] text-neutral-500 hover:text-red-400 flex items-center gap-1 mt-0.5 transition-colors"
          >
            <X className="w-2.5 h-2.5" /> Remove reference
          </button>
        )}
      </div>

      {/* Display Field Picker */}
      {value?.collection && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
          <Label className="text-[10px] text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Target Field
          </Label>
          <Select
            value={value?.displayField || ""}
            onValueChange={(field) => update({ displayField: field })}
          >
            <SelectTrigger
              className={cn(
                "h-8 text-xs bg-violet-500/10 border-violet-500/30 text-white",
                "hover:border-violet-400/50 focus:ring-violet-500/30 transition-colors"
              )}
            >
              <SelectValue placeholder="Pick relational field…" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              <SelectGroup>
                <SelectLabel className="text-[10px] text-neutral-500 uppercase px-2 py-1">Available Fields</SelectLabel>
                {(() => {
                  const targetCollection = collections.find(c => c.id === value.collection);
                  if (!targetCollection || !targetCollection.fields) {
                    return <SelectItem disabled value="no-fields" className="text-xs">No fields found</SelectItem>;
                  }
                  
                  const relationalFields = targetCollection.fields.filter(f => f.isRelationalSource);
                  // Optional fallback: if none toggled, show all fields (better UX than preventing linking entirely)
                  const displayFields = relationalFields.length > 0 ? relationalFields : targetCollection.fields;

                  return displayFields.map((f) => (
                    <SelectItem key={f.name} value={f.name} className="text-xs">
                      {f.name} {f.isRelationalSource && <span className="text-[9px] text-emerald-400 ml-1 ml-1">(relational)</span>}
                    </SelectItem>
                  ));
                })()}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-[9px] text-neutral-500 ml-1 italic">Selecting which field's value will be used</p>
        </div>
      )}

      {/* Removed advanced options for simplicity */}

    </div>
  );
}

// ── Legacy ReferenceInput (read-path select) ───────────────────────────────

interface ReferenceInputProps {
  placeholder?: string;
  collections: Collection[];
  onValueChange: (value: string | null) => void;
  value?: string | null;
  label?: string;
  required?: boolean;
  searchable?: boolean;
}

/**
 * ReferenceInput — A searchable dropdown for SELECTING a referenced record
 * at form fill-time (end-user facing, not builder facing).
 */
export function ReferenceInput({
  placeholder = "Select a reference",
  collections,
  onValueChange,
  value = null,
  label,
  required = false,
  searchable = true,
}: ReferenceInputProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 200);

  const filtered = collections
    .filter(
      (c) =>
        !debouncedSearch ||
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .slice(0, 20);

  const selectedName = collections.find((c) => c.id === value)?.name || value;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {required && (
            <span className="text-destructive text-xs">*</span>
          )}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-white/5 bg-[#12121A] px-3 text-sm text-white hover:border-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
          >
            <span className={cn("truncate", !selectedName && "text-muted-foreground")}>
              {selectedName || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0 bg-[#09090D] border border-white/10 text-white shadow-xl z-50 rounded-lg overflow-hidden"
        >
          {searchable && (
            <div className="p-2 border-b border-white/5 bg-[#09090D]">
              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <input
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 outline-none"
                  autoFocus
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="text-neutral-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            className="overflow-y-auto max-h-[200px] p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.2) transparent',
            }}
          >
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-neutral-500">No collections found</p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map((c) => {
                  const isSelected = value === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onValueChange(c.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors",
                        isSelected
                          ? "bg-white/15 text-white font-medium"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}