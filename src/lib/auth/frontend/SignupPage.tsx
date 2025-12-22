'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { signup, type AuthState } from '../actions'; // Update path after moving

const initialState: AuthState = {
    message: '',
    success: false,
};

export default function SignupPage() {
    const [state, action] = useFormState(signup, initialState);

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Sign Up</h2>
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    required
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
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
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    required
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button
                    type="submit"
                    style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Sign Up
                </button>
            </form>
            {state?.message && (
                <p style={{ color: state.success ? 'green' : 'red', marginTop: '10px', textAlign: 'center' }}>
                    {state.message}
                </p>
            )}
            {state?.errors && (
                <div style={{ color: 'red', fontSize: '0.8em', marginTop: '10px' }}>
                    <pre>{JSON.stringify(state.errors, null, 2)}</pre>
                </div>
            )}
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Already have an account? <Link href="/auth/login" style={{ color: '#0070f3' }}>Login</Link>
            </p>
        </div>
    );
}
