import { Metadata } from 'next';
import { PricingSection } from '@/components/layout/pricing-section';
import { Suspense } from 'react';
import { getSession } from '@/lib/auth/actions';
import { getUserUsageStats } from '@/lib/server-db';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Pricing & Upgrades',
    description: 'Upgrade your Postpipe plan to unlock more features.',
};

export default async function PricingPage() {
    const session = await getSession();
    
    if (session?.userId) {
        const stats = await getUserUsageStats(session.userId);
        if (stats.plan && stats.plan !== 'starter') {
            redirect('/dashboard');
        }
    }

    return (
        <div className="w-full flex-1 p-0 m-0">
            <Suspense fallback={<div className="p-8 text-center">Loading pricing...</div>}>
                <PricingSection />
            </Suspense>
        </div>
    );
}
