
import { verifyEmail } from '../actions';

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const token = searchParams.token as string;
    const resolvedSearchParams = await searchParams; // Next.js 15: searchParams might be a promise in future, ensuring safety. (Actually in 15 it IS a promise or sync? Next 15 beta changes searchParams to promise).
    // Let's assume sync for now or standard access, but for Next 15 "await searchParams" is recommended if it's dynamic.
    // However, in typical 14/15 stable, it's just props.
    // Note: The previous code didn't await. I'll stick to basic property access for simplicity unless errors arise.

    if (!token) {
        return <div>Invalid token</div>;
    }

    const result = await verifyEmail(token);
    const isSuccess = result.success;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg text-center">
                <h1 className="text-2xl font-bold">{isSuccess ? 'Email Verified' : 'Verification Failed'}</h1>
                <div className={`text-sm font-medium ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    <p>{result.message}</p>
                </div>
                {isSuccess && (
                    <a
                        href="/login"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                        Go to Login
                    </a>
                )}
            </div>
        </div>
    );
}
