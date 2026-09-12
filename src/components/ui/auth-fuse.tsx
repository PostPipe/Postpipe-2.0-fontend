"use client";

import * as React from "react";
import { useState, useEffect, useActionState, type ReactNode } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { login, signup, resendVerification, forgotPassword } from "@/lib/auth/actions";
import Loader from "@/components/ui/loader";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Styled UI Components matching the AuthSectionOne aesthetic
// ----------------------------------------------------------------------

function SocialButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-11 items-center justify-center gap-2.5 rounded-[10px] border border-black/25 bg-white px-4 text-sm sm:text-[15px] font-medium leading-none text-black transition-colors hover:bg-black/[0.03] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 active:scale-[0.98]"
        >
            <span className="shrink-0 scale-90 sm:scale-100">{icon}</span>
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
}

function FieldBox({
    label,
    name,
    type = "text",
    required = false,
    error,
    defaultValue,
    ...props
}: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    error?: string;
    defaultValue?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!defaultValue);

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className={cn(
                "relative flex h-11 sm:h-12 w-full items-center rounded-[10px] border px-4 text-[15px] sm:text-base leading-none transition-colors group cursor-text",
                error ? "border-red-500/50 bg-red-500/5" : "border-black/25 bg-white dark:border-white/15 dark:bg-white/5",
                "focus-within:border-black/50 dark:focus-within:border-white/40"
            )}>
                <input
                    name={name}
                    type={type}
                    required={required}
                    defaultValue={defaultValue}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        setHasValue(e.target.value.length > 0);
                    }}
                    onChange={(e) => setHasValue(e.target.value.length > 0)}
                    className="min-w-0 w-full bg-transparent text-black outline-none placeholder:text-transparent dark:text-white dark:placeholder:text-transparent"
                    placeholder={label}
                    {...props}
                />
                {!isFocused && !hasValue && (
                    <span className="absolute left-4 text-black/40 dark:text-white/40 pointer-events-none transition-opacity font-normal text-sm sm:text-[15px]">{label}</span>
                )}
            </label>
            {error && <span className="text-xs text-red-500 font-medium px-1">{error}</span>}
        </div>
    );
}

function PasswordFieldBox({
    label,
    name,
    required = false,
    error,
    ...props
}: {
    label: string;
    name: string;
    required?: boolean;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-1 w-full">
            <label className={cn(
                "relative flex h-11 sm:h-12 w-full items-center rounded-[10px] border px-4 text-[15px] sm:text-base leading-none transition-colors group cursor-text",
                error ? "border-red-500/50 bg-red-500/5" : "border-black/25 bg-white dark:border-white/15 dark:bg-white/5",
                "focus-within:border-black/50 dark:focus-within:border-white/40"
            )}>
                <input
                    name={name}
                    type={showPassword ? "text" : "password"}
                    required={required}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        setHasValue(e.target.value.length > 0);
                    }}
                    onChange={(e) => setHasValue(e.target.value.length > 0)}
                    className="min-w-0 w-full bg-transparent text-black outline-none placeholder:text-transparent dark:text-white dark:placeholder:text-transparent pr-10"
                    placeholder={label}
                    {...props}
                />
                {!isFocused && !hasValue && (
                    <span className="absolute left-4 text-black/40 dark:text-white/40 pointer-events-none transition-opacity font-normal text-sm sm:text-[15px]">{label}</span>
                )}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors p-1 rounded-md"
                >
                    {showPassword ? <EyeOff className="size-4 sm:size-4" /> : <Eye className="size-4 sm:size-4" />}
                </button>
            </label>
            {error && <span className="text-xs text-red-500 font-medium px-1">{error}</span>}
        </div>
    );
}

function CheckboxLine({ children, required, name }: { children: ReactNode; required?: boolean; name?: string }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <span className="relative mt-[3px] sm:mt-1 size-3.5 sm:size-4 shrink-0">
                <input
                    type="checkbox"
                    name={name}
                    required={required}
                    className="peer size-full appearance-none rounded-[3px] border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white cursor-pointer transition-colors"
                />
                <svg
                    viewBox="0 0 12 12"
                    className="pointer-events-none absolute inset-0 hidden size-full p-[3px] text-white peer-checked:block dark:text-black"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M3 6.2 5 8.1 9 3.9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="text-sm leading-snug text-black/60 dark:text-white/60 group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">{children}</span>
        </label>
    );
}

// ----------------------------------------------------------------------
// Icons
// ----------------------------------------------------------------------

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EB4335" />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="dark:invert">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}


// ----------------------------------------------------------------------
// Form Modules
// ----------------------------------------------------------------------

function SignInForm({ setView }: { setView: (v: "signin" | "signup" | "forgot") => void }) {
    const [state, formAction, isPending] = useActionState(login, { success: false, message: "" });

    return (
        <form action={formAction} autoComplete="on" className="space-y-5">
            <div>
                <h1 className="whitespace-nowrap text-2xl font-medium tracking-tight sm:text-3xl xl:text-4xl text-black dark:text-white">
                    Sign in
                </h1>
                <p className="mt-1.5 sm:mt-2 whitespace-nowrap text-[15px] leading-snug text-black/60 dark:text-white/55 sm:text-base xl:text-lg">
                    Access your Postpipe workspace
                </p>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 pt-1">
                <SocialButton icon={<GoogleIcon />} label="Sign in with Google" onClick={() => window.location.href = "/api/auth/google"} />
                <SocialButton icon={<GithubIcon />} label="Sign in with GitHub" onClick={() => window.location.href = "/api/auth/github"} />
            </div>

            <div className="my-4 sm:my-6 text-center text-base sm:text-lg font-medium text-black/40 dark:text-white/30">
                or
            </div>

            <div className="space-y-3 sm:space-y-4">
                <FieldBox
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                />
                <div>
                    <PasswordFieldBox
                        label="Password"
                        name="password"
                        required
                        autoComplete="current-password"
                    />
                    <div className="flex justify-end pt-1.5">
                        <button type="button" onClick={() => setView("forgot")} className="text-xs sm:text-[13px] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:underline transition-colors">
                            Forgot password?
                        </button>
                    </div>
                </div>

                {state.message && (
                    <div className={cn("p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2", state.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400")}>
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-4 sm:mt-6 flex h-11 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-base sm:text-lg font-medium text-white transition-all hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                    {isPending ? <div className="scale-75 flex items-center justify-center"><Loader /></div> : "Sign In"}
                </button>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-black/60 dark:text-white/60">
                Don't have an account?{" "}
                <button type="button" className="font-medium text-black dark:text-white hover:underline underline-offset-2" onClick={() => setView("signup")}>
                    Sign up now
                </button>
            </div>
        </form>
    );
}

function SignUpForm({ setView }: { setView: (v: "signin" | "signup" | "forgot") => void }) {
    const [state, formAction, isPending] = useActionState(signup, { success: false, message: "" });
    const [resendState, resendAction] = useActionState(resendVerification, { success: false, message: "" });
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [emailInput, setEmailInput] = useState("");

    useEffect(() => {
        if (state.success && emailInput) {
            setSubmittedEmail(emailInput);
        }
    }, [state.success, emailInput]);

    if (state.success) {
        return (
            <div className="flex flex-col gap-5 text-center py-8">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-2.5">
                    <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">Verification Sent</h1>
                    <p className="text-base text-black/60 dark:text-white/60 leading-relaxed max-w-sm mx-auto">{state.message}</p>
                </div>

                {submittedEmail && (
                    <form action={resendAction} className="flex flex-col gap-2.5 max-w-sm mx-auto w-full pt-3">
                        <input type="hidden" name="email" value={submittedEmail} />
                        <button
                            type="submit"
                            className="flex h-11 w-full items-center justify-center rounded-[10px] border border-black/25 bg-white text-sm sm:text-base font-medium text-black transition-colors hover:bg-black/[0.03] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                            Resend Verification Email
                        </button>
                        {resendState.message && (
                            <p className={cn("text-xs font-medium pt-1.5", resendState.success ? "text-emerald-500" : "text-red-500")}>
                                {resendState.message}
                            </p>
                        )}
                    </form>
                )}
            </div>
        );
    }

    const termsText = (
        <>
            By creating an account, you agree to our{" "}
            <a href="/terms" className="font-medium text-black dark:text-white underline underline-offset-2 hover:opacity-80 transition-opacity">
                Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-black dark:text-white underline underline-offset-2 hover:opacity-80 transition-opacity">
                Privacy Policy
            </a>.
        </>
    );

    return (
        <form action={formAction} autoComplete="on" className="space-y-5">
            <div>
                <h1 className="whitespace-nowrap text-2xl font-medium tracking-tight sm:text-3xl xl:text-4xl text-black dark:text-white">
                    Create an account
                </h1>
                <p className="mt-1.5 sm:mt-2 whitespace-nowrap text-[15px] leading-snug text-black/60 dark:text-white/55 sm:text-base xl:text-lg">
                    Deploy zero-trust static form architecture
                </p>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 pt-1">
                <SocialButton icon={<GoogleIcon />} label="Sign up with Google" onClick={() => window.location.href = "/api/auth/google"} />
                <SocialButton icon={<GithubIcon />} label="Sign up with GitHub" onClick={() => window.location.href = "/api/auth/github"} />
            </div>

            <div className="my-4 sm:my-6 text-center text-base sm:text-lg font-medium text-black/40 dark:text-white/30">
                or
            </div>

            <div className="space-y-3 sm:space-y-4">
                <div className="grid gap-3 sm:gap-4">
                    <FieldBox label="Full Name" name="name" type="text" required autoComplete="name" error={state.errors?.name?.[0]} />
                    <FieldBox label="Email Address" name="email" type="email" required autoComplete="email" error={state.errors?.email?.[0]} defaultValue={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                    <PasswordFieldBox label="Password" name="password" required autoComplete="new-password" error={state.errors?.password?.[0]} />
                    <PasswordFieldBox label="Confirm Password" name="confirmPassword" required autoComplete="new-password" error={state.errors?.confirmPassword?.[0]} />
                </div>

                {state.message && (
                    <div className={cn("p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2", state.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400")}>
                        {state.message}
                    </div>
                )}

                <div className="space-y-3 pt-2 pb-1 text-[12px] sm:text-[13px] leading-relaxed">
                    <CheckboxLine name="terms" required>{termsText}</CheckboxLine>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-4 sm:mt-6 flex h-11 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-base sm:text-lg font-medium text-white transition-all hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                    {isPending ? <div className="scale-75 flex items-center justify-center"><Loader /></div> : "Create Account"}
                </button>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-black/60 dark:text-white/60">
                Already have an account?{" "}
                <button type="button" className="font-medium text-black dark:text-white hover:underline underline-offset-2" onClick={() => setView("signin")}>
                    Sign in
                </button>
            </div>
        </form>
    );
}

function ForgotPasswordForm({ setView }: { setView: (v: "signin" | "signup" | "forgot") => void }) {
    const [state, formAction, isPending] = useActionState(forgotPassword, { success: false, message: "" });

    return (
        <form action={formAction} autoComplete="on" className="space-y-5">
            <div>
                <h1 className="whitespace-nowrap text-2xl font-medium tracking-tight sm:text-3xl xl:text-4xl text-black dark:text-white">
                    Reset Password
                </h1>
                <p className="mt-1.5 sm:mt-2 text-[15px] leading-snug text-black/60 dark:text-white/55 sm:text-base xl:text-lg">
                    Enter your email to receive a recovery link
                </p>
            </div>

            <div className="space-y-3 sm:space-y-4 pt-3">
                <FieldBox
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                />

                {state.message && (
                    <div className={cn("p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2", state.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400")}>
                        {state.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-4 sm:mt-6 flex h-11 w-full items-center justify-center rounded-[10px] border border-black/40 bg-black text-base sm:text-lg font-medium text-white transition-all hover:bg-black/85 dark:border-white/40 dark:bg-white dark:text-black dark:hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                    {isPending ? <div className="scale-75 flex items-center justify-center"><Loader /></div> : "Send Reset Link"}
                </button>
            </div>

            <div className="text-center pt-2">
                <button type="button" onClick={() => setView("signin")} className="text-xs sm:text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                    ← Back to login
                </button>
            </div>
        </form>
    );
}

// ----------------------------------------------------------------------
// Main Export Component (The Page Wrapper)
// ----------------------------------------------------------------------

export function AuthUI() {
    const [view, setView] = useState<"signin" | "signup" | "forgot">("signin");

    return (
        <section className="relative min-h-screen bg-white pt-20 sm:pt-24 pb-8 px-3 sm:px-6 lg:px-8 text-black antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white flex flex-col justify-center overflow-hidden">
            {/* Animated Vector Grid Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <style>{`
                    @keyframes pan-grid {
                        0% { background-position: 0 0; }
                        100% { background-position: -32px -32px; }
                    }
                    .bg-vector-grid {
                        background-size: 32px 32px;
                        animation: pan-grid 20s linear infinite;
                    }
                    .dark .bg-vector-grid {
                        background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
                    }
                    :not(.dark) .bg-vector-grid {
                        background-image: linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
                    }
                `}</style>
                <div className="absolute inset-0 bg-vector-grid" />
                {/* Radial mask to fade grid edges */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#fff_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_20%,#050505_100%)]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[1100px] grid gap-4 lg:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                
                {/* Left Side (Forms) */}
                <div className="flex min-h-[460px] items-center justify-center rounded-[16px] sm:rounded-2xl border border-black/10 bg-white px-5 sm:px-8 py-8 dark:border-white/10 dark:bg-[#0a0a0a] relative overflow-hidden shadow-sm">
                    <div className="w-full max-w-[380px]">
                        {view === "signin" && <SignInForm setView={setView} />}
                        {view === "signup" && <SignUpForm setView={setView} />}
                        {view === "forgot" && <ForgotPasswordForm setView={setView} />}
                    </div>
                </div>

                {/* Right Side (Glassmorphic Grain Showcase) */}
                <div className="relative hidden lg:flex min-h-[460px] overflow-hidden rounded-2xl p-8 text-white sm:p-10 bg-[#09090b] border border-white/5 shadow-2xl">
                    
                    {/* CSS-only Glassmorphic Grain Background (No WebGL/Lag) */}
                    <div className="absolute inset-0 z-0">
                        {/* Gradient base layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b] via-[#09090b] to-[#000000]" />
                        
                        {/* Orange glow highlights to match the aesthetic */}
                        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FC7819]/30 via-transparent to-transparent opacity-60 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#FC7819]/20 via-transparent to-transparent opacity-60 blur-3xl" />
                        
                        {/* Static CSS/SVG Noise Overlay - Increased opacity and overlay blending for highly visible grain */}
                        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-80 mix-blend-overlay">
                            <filter id="noise">
                                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#noise)" />
                        </svg>
                    </div>

                    {/* Content inside the glass panel */}
                    <div className="relative z-10 flex h-full w-full flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-5 opacity-90">
                                <div className="w-1.5 h-1.5 rotate-45 bg-[#FC7819]" />
                                <span className="text-[11px] font-medium tracking-[0.2em] text-white/60 uppercase">
                                    Zero-Trust Data Ingest
                                </span>
                            </div>
                            
                            <h2 className="max-w-[460px] text-3xl font-medium tracking-tight text-white xl:text-4xl xl:leading-[1.05]">
                                Scale fast,
                                <br />
                                Serve faster
                            </h2>
                            <p className="mt-3 text-base text-white/60 font-light max-w-xs leading-relaxed">
                                Deploy secure, serverless form ingest pipelines in seconds without writing backend logic.
                            </p>
                        </div>

                        {/* Code glass panel */}
                        <div className="mb-0 max-w-[90%] rounded-[12px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-2xl">
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                                <div className="w-2 h-2 rounded-full bg-green-500/80" />
                            </div>
                            <pre className="font-mono text-[11px] text-white/80 leading-relaxed overflow-x-auto">
<span className="text-[#FC7819]">import</span> {'{ Postpipe }'} <span className="text-[#FC7819]">from</span> '@postpipe/client';{'\n\n'}
<span className="text-white/40">// Zero-trust static form submission</span>{'\n'}
<span className="text-[#FC7819]">await</span> Postpipe.submit('contact_form', {'{\n'}
  email: 'user@company.com',{'\n'}
  message: 'Hello, World!'{'\n'}
{'}'});
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
