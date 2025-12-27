import { cookies } from 'next/headers';
import AdminLogin from './AdminLogin';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    const secret = process.env.ADMIN_SECRET;

    const isAuthenticated = token && token.value === secret;

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <nav className="border-b bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <Link href="/admin" className="text-xl font-bold text-blue-600">
                                    PostPipe Admin
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/admin"
                                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                >
                                    Templates
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {/* Logout could go here but skipping for simplicity as requests just ask for "Login" gate */}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
}
