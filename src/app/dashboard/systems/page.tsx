import { Metadata } from 'next';
import SystemsClient from '@/components/dashboard/systems-client';
import { getSystems } from '@/lib/actions/systems';

export const metadata: Metadata = {
    title: 'Backend Systems',
};

export const dynamic = 'force-dynamic';

export default async function SystemsPage() {
    const initialSystems = await getSystems();
    return <SystemsClient initialSystems={initialSystems} />;
}
