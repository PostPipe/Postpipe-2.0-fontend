import { Metadata } from 'next';
import ConnectorsClient from '@/components/dashboard/connectors-client';

export const metadata: Metadata = {
    title: 'Connectors',
};

import { getDashboardData } from '@/app/actions/dashboard';

export default async function ConnectorsPage() {
    const { connectors } = await getDashboardData();
    // @ts-ignore
    return <ConnectorsClient initialConnectors={connectors} />;
}
