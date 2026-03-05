
import { Metadata } from 'next';
import crypto from 'crypto';
import { notFound, redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import SubmissionsClient from '@/components/dashboard/submissions-client';
import { getForm, getConnector, getUserDatabaseConfig } from '@/lib/server-db';
import { ensureFullUrl } from '@/lib/utils';
import { getSession } from '@/lib/auth/actions';

export const metadata: Metadata = {
    title: 'Submissions',
};

export default async function SubmissionsPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session || !session.userId) {
        redirect('/login');
    }

    const { id } = await params;
    const form = await getForm(id);

    if (!form) {
        notFound();
    }

    // 2. We now offload fetching to the client via /api/submissions
    // This perfectly avoids browser redirects and allows the client to show a loading state cleanly.

    // Generate Secure API Token (Optional depending on how the frontend dashboard is auth'd, but good for display)
    const { generateApiToken } = await import('@/lib/api-auth');
    const token = generateApiToken(session.userId, form.connectorId);

    // Construct Public API Endpoint for display purposes
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const dbName = form.targetDatabase || "default";
    const endpoint = `${appUrl}/api/v1/connectors/${form.connectorId}/databases/${dbName}/forms/${form.id}/submissions`;

    const schema = (() => {
        try {
            return typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields || [];
        } catch (e) {
            return [];
        }
    })();

    return (
        <SubmissionsClient
            id={id}
            formName={form.name}
            schema={schema}
            endpoint={endpoint}
            token={token}
        />
    );
}
