import { Metadata } from 'next';
// Force TS refresh
import ApiClient from '@/components/dashboard/api-client';

export const metadata: Metadata = {
    title: 'API & Piko AI',
};

export default function ApiPage() {
    return <ApiClient />;
}
