import React from "react";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2, Webhook, Link as LinkIcon, Cloud, Database, Zap, ShieldCheck, ImageIcon } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Connectors - PostPipe Docs",
    description: "Learn how Postpipe static connectors work and how to deploy your own.",
};

export default function ConnectorsPage() {
    return (
        <div className="space-y-12 pb-20">
            <div className="border-b pb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="border-blue-500 text-blue-500">Integration</Badge>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Connectors</h1>
                <p className="text-xl text-muted-foreground max-w-3xl">
                    A Postpipe <strong>Connector</strong> is a lightweight Node.js service you deploy to any cloud (Vercel, Azure, Railway, etc.).
                    It acts as the secure bridge between the Postpipe dashboard and your private database — Postpipe never touches your data directly.
                </p>
            </div>

            {/* How it works */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
                <p className="text-muted-foreground">
                    Every form submission flows through three hops: <strong>Browser → Postpipe API → Your Connector → Your Database</strong>.
                    Your connector is the only component that ever touches your raw data.
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <Webhook className="h-6 w-6 mb-2 text-pink-500" />
                            <CardTitle>Event Driven</CardTitle>
                            <CardDescription>
                                Postpipe forwards each verified submission to your connector&apos;s <code>/postpipe/submit</code> endpoint in real time.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Share2 className="h-6 w-6 mb-2 text-indigo-500" />
                            <CardTitle>Distributed & Isolated</CardTitle>
                            <CardDescription>
                                Each connector runs as its own microservice. Multiple connectors can be registered per account for different projects.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <LinkIcon className="h-6 w-6 mb-2 text-cyan-500" />
                            <CardTitle>Self-Registering</CardTitle>
                            <CardDescription>
                                After deploying, the connector registers itself with Postpipe using its <code>CONNECTOR_ID</code> and <code>CONNECTOR_SECRET</code>, and appears in your dashboard automatically.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            {/* Deployment guide */}
            <div className="space-y-6 pt-8 border-t">
                <h2 className="text-2xl font-bold tracking-tight">Deploy a Connector (3 Steps)</h2>
                <p className="text-muted-foreground">
                    Head to the <Link href="/static" className="text-blue-500 underline underline-offset-2 hover:text-blue-400">/static setup wizard</Link> for a
                    guided walkthrough, or follow these steps manually:
                </p>

                <ol className="space-y-6 list-none">
                    {[
                        {
                            step: "1",
                            icon: <Zap className="h-5 w-5" />,
                            title: "Generate Credentials",
                            color: "text-violet-400",
                            bg: "bg-violet-500/10 border-violet-500/20",
                            body: <>
                                Give your connector a name in the setup wizard and click <strong>Generate Credentials</strong>.
                                You will receive a <code>POSTPIPE_CONNECTOR_ID</code> and <code>POSTPIPE_CONNECTOR_SECRET</code>.
                                Copy both immediately — the secret is shown only once.
                            </>
                        },
                        {
                            step: "2",
                            icon: <Cloud className="h-5 w-5" />,
                            title: "Fork & Deploy",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10 border-blue-500/20",
                            body: <>
                                Fork the official connector template:
                                <a href="https://github.com/Sourodip-1/postpipe-connector-template" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 underline underline-offset-2 hover:text-blue-400">
                                    github.com/Sourodip-1/postpipe-connector-template
                                </a>.
                                Deploy the fork to <strong>Vercel</strong> or <strong>Azure</strong>, adding the following environment variables during setup:
                                <pre className="mt-3 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-300 leading-relaxed overflow-x-auto">
                                    {`POSTPIPE_CONNECTOR_ID=your_connector_id
POSTPIPE_CONNECTOR_SECRET=your_connector_secret

# Your database connection string (at least one required)
MONGODB_URI=mongodb+srv://...          # for MongoDB Atlas
POSTGRES_URL=postgresql://...         # for PostgreSQL / Neon

# Required for image upload fields
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://key:secret@cloud_name`}
                                </pre>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Also set the Vercel install command to <code>npm install</code>.
                                </p>
                            </>
                        },
                        {
                            step: "3",
                            icon: <Database className="h-5 w-5" />,
                            title: "Connect the Instance",
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10 border-emerald-500/20",
                            body: <>
                                Once deployed, paste your cloud deployment URL (e.g. <code>https://my-connector.vercel.app</code>) into the final step
                                of the setup wizard and click <strong>Connect Instance</strong>. Your connector will appear in the dashboard immediately.
                            </>
                        },
                    ].map(({ step, icon, title, color, bg, body }) => (
                        <li key={step} className={`flex gap-4 rounded-xl border p-5 ${bg}`}>
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${bg} ${color} font-bold text-sm`}>
                                {icon}
                            </div>
                            <div>
                                <h3 className={`font-semibold text-base mb-1 ${color}`}>Step {step}: {title}</h3>
                                <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Image uploads */}
            <div className="space-y-4 pt-8 border-t">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-amber-400" /> Image Upload Fields
                </h2>
                <p className="text-muted-foreground">
                    If your form includes an <strong>Image Upload</strong> field type, your connector must have the four <code>CLOUDINARY_*</code> environment variables set
                    (see Step 2 above). The connector will upload the file to Cloudinary and store the resulting URL in your database instead of the raw binary.
                </p>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-4 text-sm text-amber-300/80">
                    <ShieldCheck className="inline h-4 w-4 mr-1.5 text-amber-400" />
                    The Postpipe form builder will show a prominent warning in the Fields panel as soon as you add an image field, reminding you to configure Cloudinary on your connector before deploying.
                </div>
            </div>

            {/* Zero retention note */}
            <div className="space-y-3 pt-8 border-t">
                <h2 className="text-2xl font-bold tracking-tight">Zero Data Retention</h2>
                <p className="text-muted-foreground">
                    Postpipe operates on a strict zero data retention policy. All submission data is proxied <em>through</em> our servers to your connector and is never persisted on Postpipe infrastructure. You own your data — entirely.
                </p>
            </div>
        </div>
    );
}
