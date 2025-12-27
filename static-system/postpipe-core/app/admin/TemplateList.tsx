'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Simplified interface for the client
interface Template {
    _id: string;
    name: string;
    slug: string;
    category?: string;
    version?: string;
    isPublished: boolean;
    author: {
        name?: string;
    };
}

export default function TemplateList({ initialTemplates }: { initialTemplates: Template[] }) {
    const [templates, setTemplates] = useState(initialTemplates);
    const router = useRouter();

    async function handleDelete(slug: string) {
        if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/templates/${slug}`, {
                method: 'DELETE',
                headers: {
                    // In a real browser session, cookies are sent automatically.
                    // If using the header method: 'x-admin-secret': '...'
                }
            });

            if (res.ok) {
                setTemplates((prev) => prev.filter((t) => t.slug !== slug));
                router.refresh();
            } else {
                alert('Failed to delete template');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting template');
        }
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all templates in the database.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/admin/create"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        Add Template
                    </Link>
                </div>
            </div>
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Category
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Version
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Status
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Author
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {templates.map((template) => (
                                        <tr key={template._id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {template.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{template.category || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{template.version || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${template.isPublished
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {template.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {template.author?.name || '-'}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <Link href={`/admin/${template.slug}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(template.slug)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
