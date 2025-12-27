'use client';

import { useState } from 'react';
import { loginAdmin } from './actions';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const res = await loginAdmin(formData);
        if (res.success) {
            router.refresh(); // Refresh to re-run layout check
        } else {
            setError(res.message || 'Login failed');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Admin Login</h1>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Secret</label>
                        <input
                            type="password"
                            name="secret"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            placeholder="Enter ADMIN_SECRET"
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
