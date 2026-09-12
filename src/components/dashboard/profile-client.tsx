'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useCountry } from '@/components/country-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatUsagePercent } from '@/lib/utils';
import { updateProfile, cancelSubscription } from '@/lib/auth/actions';
import { compressImage } from '@/lib/image-compression';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Lock,
    User,
    Mail,
    Upload,
    Loader2,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    ArrowUpRight,
    Shield,
    Users,
    Infinity as InfinityIcon,
    CalendarDays,
    Key,
    Copy,
    Check,
    CheckCircle,
    SlidersHorizontal,
    ExternalLink,
    Clock,
} from 'lucide-react';
import { PLAN_LIMITS } from '@/config/plans';

const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
};

export default function ProfileClient() {
    const { user, loading, refreshSession } = useAuth();
    const { formatPrice } = useCountry();
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateProfile, { success: false, message: '' });

    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setImage(user.image || '');
            setIsDirty(false);
        }
    }, [user, state.success]);

    useEffect(() => {
        if (user) {
            const hasNameChanged = name !== (user.name || '');
            const hasImageChanged = image !== (user.image || '');
            setIsDirty(hasNameChanged || hasImageChanged);
        }
    }, [name, image, user]);

    const handleSubmit = () => {
        setIsSaving(true);
    };

    useEffect(() => {
        if (state.message) {
            setIsSaving(false);
            if (state.success && refreshSession) refreshSession();
        }
    }, [state, refreshSession]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#subscription') {
            const el = document.getElementById('subscription');
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedFile);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setImage(data.url);
            } else {
                console.error('Upload failed:', data.error);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const res = await cancelSubscription();
            if (res.success) {
                if (refreshSession) refreshSession();
                toast({
                    title: "Subscription Cancelled",
                    description: "Your subscription has been scheduled for cancellation.",
                });
            } else {
                toast({
                    title: "Cancellation Failed",
                    description: res.message || 'Failed to cancel subscription',
                    variant: "destructive",
                });
            }
        } catch {
            toast({
                title: "Error",
                description: 'An unexpected error occurred.',
                variant: "destructive",
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const copyUserId = () => {
        const rawId = user?.id || user?._id || user?.email;
        if (rawId) {
            navigator.clipboard.writeText(rawId.toString());
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';

    const planName = (user?.plan || 'starter').charAt(0).toUpperCase() + (user?.plan || 'starter').slice(1);
    const planLimit = PLAN_LIMITS[user?.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
    const submissionsUsed = user?.monthlySubmissions || 0;
    const isUnlimited = user?.plan === 'enterprise';
    const submissionsMax = planLimit.submissions;
    const submissionsPercent = isUnlimited ? 0 : Math.min(100, (submissionsUsed / submissionsMax) * 100);

    const isStarter = !user?.plan || user.plan === 'starter';
    const isBuilder = user?.plan === 'builder';
    const isEnterprise = user?.plan === 'enterprise';

    const planFeatures: Record<string, { icon: React.ComponentType<{ className?: string }>; text: string }[]> = {
        starter: [
            { icon: Shield, text: '2 Database Connectors' },
            { icon: Lock, text: 'Zero-Trust Signature Verification' },
            { icon: Users, text: 'Community Support & Docs' },
        ],
        builder: [
            { icon: Shield, text: '10 Database Connectors' },
            { icon: ExternalLink, text: 'Custom Webhooks & Triggers' },
            { icon: Users, text: 'Priority Email Support' },
        ],
        enterprise: [
            { icon: InfinityIcon, text: 'Unlimited Database Connectors' },
            { icon: CheckCircle2, text: 'White-labeled Dashboard' },
            { icon: Users, text: '24/7 Slack Support & Dedicated SLA' },
        ],
    };

    const features = planFeatures[user?.plan || 'starter'] || planFeatures.starter;

    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-16">
            
            {/* ─── 1. BREADCRUMBS & SECTION TITLE ─── */}
            <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                    <span>Workspace</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-foreground font-medium">Account & Settings</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Account Profile
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                    Manage your personal identity details, workspace credentials, active subscription tier, and quota allowances.
                </p>
            </div>

            {/* ─── 2. HERO ACCOUNT SUMMARY BANNER ─── */}
            <div className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    
                    {/* User Identity Preview */}
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <Avatar className="h-20 w-20 rounded-2xl border-2 border-border/80 shadow-xs bg-muted">
                                <AvatarImage src={image} alt="Avatar" className="object-cover" />
                                <AvatarFallback className="text-xl font-bold bg-muted text-foreground">
                                    {getInitials(name || user?.name || 'U')}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Change avatar"
                            >
                                <Upload className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                    {name || user?.name || 'Workspace User'}
                                </h2>
                                <Badge variant="secondary" className="gap-1 text-xs font-medium py-0.5">
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                    Verified
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            
                            {/* Account ID */}
                            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                <span>Role: <strong className="text-foreground font-medium">Workspace Owner</strong></span>
                                <span>•</span>
                                <button
                                    onClick={copyUserId}
                                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-mono"
                                    title="Click to copy Account ID"
                                >
                                    <span>ID: {((user?.id || user?._id || user?.email || 'usr_active').toString()).slice(0, 10)}...</span>
                                    {copiedId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tier badge & Quick Actions */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 self-stretch sm:self-auto border-t sm:border-t-0 border-border/60 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                            <span className="text-xs text-muted-foreground block">Active Plan</span>
                            <span className="text-lg font-bold text-foreground flex items-center gap-1.5 sm:justify-end">
                                {planName} Tier
                            </span>
                        </div>
                        {isStarter && (
                            <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold shadow-xs">
                                <Link href="/pricing">
                                    Upgrade Plan <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        )}
                    </div>

                </div>
            </div>

            {/* ─── 3. TWO-COLUMN HIGH-DENSITY CONTENT ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* ── LEFT COLUMN (7 Cols): Profile & Security ── */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    
                    {/* Personal Information Form */}
                    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col flex-1">
                            <div className="px-6 py-5 border-b border-border/60 bg-muted/20">
                                <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Update your public profile name and display photo.
                                </p>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                
                                {/* Avatar URL / File Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-xs font-semibold text-foreground">
                                        Profile Avatar
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="image"
                                                name="image"
                                                type="url"
                                                value={image}
                                                onChange={(e) => setImage(e.target.value)}
                                                placeholder="https://example.com/avatar.png"
                                                className="pl-9 text-sm"
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="shrink-0"
                                            title="Upload image from computer"
                                        >
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Accepts PNG, JPG, GIF or WebP up to 5MB. Auto-compressed for optimal performance.
                                    </p>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                                        Display Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="pl-9 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Address (Read-Only) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                                            Primary Email Address
                                        </Label>
                                        <Badge variant="outline" className="text-[10px] py-0 font-normal">
                                            Verified
                                        </Badge>
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="pl-9 text-sm bg-muted/50 text-muted-foreground cursor-not-allowed"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Your email is associated with your PostPipe login credentials. To change it, please contact{' '}
                                        <a href="mailto:support@postpipe.in" className="text-primary hover:underline">
                                            support@postpipe.in
                                        </a>.
                                    </p>
                                </div>

                            </div>

                            {/* Form Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
                                <div>
                                    {state.message && (
                                        <div className={`flex items-center gap-2 text-xs font-medium ${state.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                            {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            <span>{state.message}</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!isDirty || isSaving}
                                    size="sm"
                                    className="min-w-[120px] shadow-xs"
                                >
                                    {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>

                {/* ── RIGHT COLUMN (5 Cols): Subscription, Quotas & Features ── */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Subscription Tier Overview */}
                    <div id="subscription" className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden scroll-mt-6">
                        <div className="p-6 border-b border-border/60">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground">Plan Status</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <h3 className="text-lg font-bold text-foreground capitalize">{planName}</h3>
                                            {user?.cancelAtPeriodEnd ? (
                                                <Badge variant="destructive" className="text-[10px] py-0">Cancelling</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">Active</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-foreground">
                                        {isEnterprise ? 'Custom' : isBuilder ? formatPrice(399) : formatPrice(0)}
                                        {!isEnterprise && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Plan Action CTA */}
                            <div className="pt-2">
                                {isStarter && (
                                    <Button asChild className="w-full gap-2 shadow-xs">
                                        <Link href="/pricing">
                                            <ArrowUpRight className="h-4 w-4" />
                                            Upgrade to Builder Plan
                                        </Link>
                                    </Button>
                                )}
                                {!isStarter && !user?.cancelAtPeriodEnd && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isCancelling}
                                                className="w-full text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                                            >
                                                {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                                                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    You will retain access to your current {planName} tier features until the end of the current billing cycle. After that, your account will automatically downgrade to Starter.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancelSubscription} className="bg-rose-600 hover:bg-rose-700 text-white border border-rose-700">
                                                    Yes, cancel subscription
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        {/* Cancellation Alert */}
                        {user?.cancelAtPeriodEnd && user?.currentPeriodEnd && (
                            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs flex gap-2.5">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                                    Subscription set to cancel on <strong>{formatDate(user.currentPeriodEnd)}</strong>. After this date, your account will downgrade to Starter.
                                </p>
                            </div>
                        )}

                        {/* Monthly Submissions Meter */}
                        <div className="p-6 space-y-3 bg-muted/20">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">Monthly Submissions</span>
                                <span className="font-medium text-muted-foreground">
                                    {submissionsUsed.toLocaleString()} / {isUnlimited ? 'Unlimited' : submissionsMax.toLocaleString()}
                                </span>
                            </div>
                            {!isUnlimited && (
                                <div className="space-y-1">
                                    <Progress value={submissionsUsed > 0 ? Math.max(submissionsPercent, 0.75) : 0} className="h-2" />
                                    <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                                        <span>{formatUsagePercent(submissionsPercent)} consumed</span>
                                        <span>{Math.max(0, submissionsMax - submissionsUsed).toLocaleString()} remaining</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Cycle resets {user?.usageResetDate ? formatDate(user.usageResetDate) : 'on the 1st of next month'}.</span>
                            </div>
                        </div>

                    </div>

                    {/* Plan Entitlements & Features Card */}
                    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Plan Entitlements
                            </h4>
                            <span className="text-xs font-medium text-primary">{planName}</span>
                        </div>

                        <ul className="space-y-3">
                            {features.map((feature, idx) => {
                                const FeatureIcon = feature.icon;
                                return (
                                    <li key={idx} className="flex items-center gap-3 text-xs text-foreground">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-muted-foreground shrink-0">
                                            <FeatureIcon className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span>{feature.text}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="pt-2 border-t border-border/60">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                                Compare all plan features <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
