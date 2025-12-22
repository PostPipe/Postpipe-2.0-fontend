'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { login } from '../actions'; // Update path after moving

const initialState = {
    message: '',
    success: false,
};

export default function LoginPage() {
    const [state, action] = useFormState(login, initialState);

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Login</h2>
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Login
                </button>
            </form>
            {state?.message && (
                <p style={{ color: state.success ? 'green' : 'red', marginTop: '10px', textAlign: 'center' }}>
                    {state.message}
                </p>
            )}
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
                <Link href="/auth/signup" style={{ color: '#0070f3', textDecoration: 'none' }}>
                    Don't have an account? Sign up
                </Link>
                <br />
                <Link href="/auth/forgot-password" style={{ color: '#666', textDecoration: 'none', marginTop: '5px', display: 'inline-block' }}>
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
}
