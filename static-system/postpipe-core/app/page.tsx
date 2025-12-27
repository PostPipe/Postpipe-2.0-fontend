"use client";

import { Button } from "@postpipe/ui";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <nav className="w-full p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-50">
                <div className="text-xl font-bold tracking-tighter">PostPipe Platform</div>
                <div className="flex gap-4 text-sm font-medium text-gray-600">
                    <Link href="http://localhost:3001" className="hover:text-black">Hub</Link>
                    <Link href="http://localhost:3002" className="hover:text-black">Builder</Link>
                    <Button onClick={() => { }}>Login</Button>
                </div>
            </nav>

            {/* Hero Split */}
            <div className="flex-1 flex flex-col md:flex-row">

                {/* Left: Dynamic (Code) */}
                <div className="flex-1 bg-white p-12 flex flex-col justify-center items-start border-r border-gray-100 transition-colors hover:bg-gray-50 group">
                    <div className="max-w-md">
                        <div className="text-blue-600 font-mono text-sm mb-4 bg-blue-50 inline-block px-2 py-1 rounded">apps/dynamic</div>
                        <h2 className="text-5xl font-bold mb-6 tracking-tight text-gray-900">
                            For Developers.
                        </h2>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                            Use our robust CLI tools to scaffold full-stack applications. Connect to your database with zero friction.
                        </p>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-8 shadow-sm group-hover:shadow-md transition-all">
                            npx create-postpipe-ecommerce
                        </div>
                        <Link href="http://localhost:3001">
                            <Button>Go to Hub &rarr;</Button>
                        </Link>
                    </div>
                </div>

                {/* Right: Static (No Code) */}
                <div className="flex-1 bg-gray-50 p-12 flex flex-col justify-center items-start transition-colors hover:bg-gray-100 group">
                    <div className="max-w-md">
                        <div className="text-orange-600 font-mono text-sm mb-4 bg-orange-100 inline-block px-2 py-1 rounded">apps/static</div>
                        <h2 className="text-5xl font-bold mb-6 tracking-tight text-gray-900">
                            For Makers.
                        </h2>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                            Build forms visually. Generate embed code. Connect to your database without writing a single line of backend server code.
                        </p>
                        <div className="bg-white border border-gray-200 text-gray-600 p-4 rounded-lg font-mono text-sm mb-8 shadow-sm group-hover:shadow-md transition-all">
                            &lt;form action="..." method="POST"&gt;
                        </div>
                        <Link href="http://localhost:3002">
                            {/* We can use a variant here if we add it to UI package */}
                            <Button>Open Builder &rarr;</Button>
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}
