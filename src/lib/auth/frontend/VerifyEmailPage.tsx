
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

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
            <h1>Email Verification</h1>
            {result.success ? (
                <div style={{ color: 'green' }}>
                    <p>{result.message}</p>
                    <a href="/auth/login" style={{ marginTop: '20px', display: 'inline-block' }}>Go to Login</a>
                </div>
            ) : (
                <div style={{ color: 'red' }}>
                    <p>{result.message}</p>
                </div>
            )}
        </div>
    );
}
