'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getDashboardData } from '@/app/actions/dashboard';
import { ensureFullUrl } from '@/lib/utils';

export default function SetupAdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [connectorUrl, setConnectorUrl] = useState<string | null>(null);

    useEffect(() => {
        getDashboardData().then(data => {
            if (data.connectors && data.connectors.length > 0) {
                setConnectorUrl(ensureFullUrl(data.connectors[0].url));
            } else {
                setConnectorUrl('http://localhost:3002');
            }
        }).catch(() => {
            setConnectorUrl('http://localhost:3002'); 
        });
    }, []);

    if (!token || !email) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Shield className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold text-white">Invalid Setup Link</h2>
                    <p className="text-neutral-400">This link is missing required parameters.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="text-center space-y-4 animate-in zoom-in duration-500">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Master Admin Ready!</h2>
                    <p className="text-neutral-400 max-w-sm mx-auto">
                        Your admin account has been successfully created. You can now log into your RBAC Dashboard.
                    </p>
                    <Button 
                        onClick={() => router.push('/dashboard/systems')}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        Go to RBAC Systems
                    </Button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }
        if (password.length < 6) {
            toast({ variant: 'destructive', title: 'Password must be at least 6 characters' });
            return;
        }

        setIsSubmitting(true);
        try {
            const url = connectorUrl || 'http://localhost:3002';
            const res = await fetch(`${url}/api/auth/setup-master-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, targetDatabase: 'default' })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast({ title: 'Success', description: 'Admin account created.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.message || 'Setup failed' });
            }
        } catch (err) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not reach the connector' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Shield className="w-48 h-48 text-violet-500" />
                </div>

                <div className="relative z-10 text-center space-y-2">
                    <Shield className="w-10 h-10 text-violet-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">Setup Master Admin</h1>
                    <p className="text-sm text-neutral-400">
                        Create your password for <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-neutral-300">New Password</Label>
                        <Input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-neutral-300">Confirm Password</Label>
                        <Input 
                            type="password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white" 
                        />
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !connectorUrl} 
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white mt-4"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set Password'}
                    </Button>

                    {!connectorUrl && (
                        <p className="text-xs text-yellow-500 text-center mt-2">Connecting to backend...</p>
                    )}
                </form>
            </div>
        </div>
    );
}
