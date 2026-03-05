"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Database, RefreshCw, Key, Link as LinkIcon, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

import { AlertTriangle, ShieldAlert } from "lucide-react";

interface SubmissionsClientProps {
    id: string;
    formName: string;
    schema: any[];
    endpoint: string;
    token: string;
}

export default function SubmissionsClient({ id, formName, schema = [], endpoint, token }: SubmissionsClientProps) {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [authError, setAuthError] = useState(false);

    const fetchSubmissions = async () => {
        setLoading(true);
        setFetchError(null);
        setAuthError(false);
        try {
            const res = await fetch(`/api/submissions?formId=${id}`);
            const data = await res.json();

            if (res.status === 401 || res.status === 403 || data.error?.includes("Auth")) {
                setAuthError(true);
                setFetchError(data.error || "Authentication Failed: Check your connector secret.");
            } else if (data.status === 'success') {
                setSubmissions(data.records || []);
            } else {
                setFetchError(data.error || "Failed to fetch submissions");
            }
        } catch (e: any) {
            setFetchError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const renderCell = (type: string, value: any) => {
        if (value === undefined || value === null || value === '') return <span className="text-muted-foreground opacity-50">-</span>;

        if (type === 'image') {
            return <a href={value} target="_blank" rel="noreferrer"><img src={value} alt="upload" className="max-w-[100px] max-h-[100px] object-cover rounded-md border border-white/10 hover:opacity-80 transition-opacity" /></a>;
        }
        if (type === 'boolean' || type === 'checkbox') {
            const boolVal = typeof value === 'string' ? value.toLowerCase() === 'true' : !!value;
            return <Badge variant={boolVal ? 'default' : 'secondary'} className={boolVal ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>{boolVal ? 'Yes' : 'No'}</Badge>;
        }
        if (typeof value === 'object') {
            return <pre className="text-[10px] bg-black/40 p-2 rounded-md border border-white/5 overflow-x-auto max-w-[200px] max-h-[100px] scrollbar-thin scrollbar-thumb-white/10">{JSON.stringify(value, null, 2)}</pre>;
        }
        return <span className="text-sm truncate max-w-[200px] block" title={String(value)}>{String(value)}</span>;
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: `${label} copied to clipboard.` });
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/forms">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Form Submissions</h1>
                    <p className="text-muted-foreground text-sm">Viewing data for <span className="font-semibold">{formName}</span> ({id})</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={fetchSubmissions} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
                    </Button>
                </div>
            </div>

            {fetchError && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription className="flex flex-col gap-2">
                        <span>{fetchError}</span>
                        {authError && (
                            <div className="mt-2">
                                <Link href="/dashboard/connectors">
                                    <Button variant="secondary" size="sm">
                                        <ShieldAlert className="mr-2 h-3 w-3" />
                                        Manage Connector Secrets
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {!authError && (
                            <p className="text-xs opacity-80 mt-1">Please ensure your Connector is deployed and running.</p>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            GET Endpoint
                        </CardTitle>
                        <CardDescription>Retrieve submissions via API</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input value={endpoint} readOnly className="font-mono text-xs" />
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(endpoint, "Endpoint")}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            API Token
                        </CardTitle>
                        <CardDescription>Bearer token for authentication</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Input value={token} readOnly className="font-mono text-xs" type="password" />
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(token, "Token")}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!fetchError && (
                <Alert variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <Database className="h-4 w-4" />
                    <AlertTitle>Data Source Info</AlertTitle>
                    <AlertDescription>
                        Data is fetched directly from your active connector.
                    </AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5">
                            <TableHead className="w-[180px] text-xs font-semibold tracking-wider text-neutral-400">Submission ID</TableHead>
                            <TableHead className="w-[180px] text-xs font-semibold tracking-wider text-neutral-400">Timestamp</TableHead>
                            {schema.map((col, idx) => (
                                <TableHead key={col.id || col.label || idx} className="text-xs font-semibold tracking-wider text-neutral-400 whitespace-nowrap">
                                    {col.label}
                                </TableHead>
                            ))}
                            {schema.length === 0 && <TableHead>Payload Data</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={schema.length + 2} className="h-32 text-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500/50" />
                                    Loading submissions...
                                </TableCell>
                            </TableRow>
                        ) : submissions.map((sub: any) => (
                            <TableRow key={sub.submissionId || sub.id} className="border-white/5 hover:bg-white/[0.02]">
                                <TableCell className="w-[180px] align-top">
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="font-mono text-xs text-muted-foreground break-all">
                                            {sub.submissionId || sub.id}
                                        </div>
                                        {sub._dbType && (
                                            <div className="mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[9px] px-1.5 py-0 font-medium tracking-tight flex items-center gap-1 w-fit border-white/10 bg-white/5 text-neutral-300`}
                                                >
                                                    <Database className="h-[9px] w-[9px]" />
                                                    <span className="truncate max-w-[120px]">
                                                        {sub._sourceDb || sub._dbType}
                                                    </span>
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="w-[180px] align-top">
                                    <div className="text-xs mt-1.5 text-neutral-300">
                                        {sub.timestamp || sub.submittedAt ? new Date(sub.timestamp || sub.submittedAt).toLocaleString() : '-'}
                                    </div>
                                </TableCell>
                                {schema.map((col, idx) => {
                                    // Smart key matching: forms could save under exact label, ID, name, or lowercase version 
                                    const dataObj = sub.data || sub || {};
                                    let val = undefined;

                                    const possibleKeys = [
                                        col.label,
                                        col.id,
                                        col.name,
                                        (col.label || '').toLowerCase(),
                                        (col.name || '').toLowerCase(),
                                        (col.id || '').toLowerCase()
                                    ];

                                    const matchingKey = Object.keys(dataObj).find(k =>
                                        possibleKeys.includes(k) || possibleKeys.includes(k.toLowerCase())
                                    );

                                    if (matchingKey) {
                                        val = dataObj[matchingKey];
                                    }

                                    return (
                                        <TableCell key={col.id || col.label || idx} className="align-top py-4">
                                            {renderCell(col.type, val)}
                                        </TableCell>
                                    );
                                })}
                                {schema.length === 0 && (
                                    <TableCell className="align-top py-4">
                                        <pre className="text-[10px] bg-black/40 p-2 rounded-md border border-white/5 overflow-x-auto max-w-[300px] scrollbar-thin">
                                            {JSON.stringify(sub.data || sub, null, 2)}
                                        </pre>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                        {!loading && submissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={schema.length + 2 > 2 ? schema.length + 2 : 3} className="h-32 text-center text-muted-foreground">
                                    {fetchError ? (
                                        <span className="text-destructive flex items-center justify-center gap-2">
                                            <AlertTriangle className="h-4 w-4" /> Unable to load submissions.
                                        </span>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                            <Database className="h-6 w-6" />
                                            <span>No submissions found.</span>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
