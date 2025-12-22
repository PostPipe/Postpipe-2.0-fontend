'use client';

import { useFormState } from 'react-dom';
import { resetPassword } from '../actions';
import { useSearchParams } from 'next/navigation';

const initialState = {
    message: '',
    success: false,
};

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [state, action] = useFormState(resetPassword, initialState);

    if (!token) {
        return <div>Invalid token</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
            <h1>Reset Password</h1>
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="hidden" name="token" value={token} />
                <input
                    name="password"
                    type="password"
                    placeholder="New Password"
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    required
                    style={{ padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', border: 'none' }}>
                    Reset Password
                </button>
            </form>
            {state?.message && (
                <p style={{ color: state.success ? 'green' : 'red', marginTop: '10px' }}>
                    {state.message}
                </p>
            )}
            {state?.success && (
                <a href="/auth/login" style={{ display: 'block', marginTop: '10px' }}>Go to Login</a>
            )}
        </div>
    );
}
