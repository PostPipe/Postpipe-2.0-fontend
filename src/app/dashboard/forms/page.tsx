import { Metadata } from 'next';
import FormsClient from '@/components/dashboard/forms-client';

export const metadata: Metadata = {
  title: 'Forms',
};

import { getDashboardData } from '@/app/actions/dashboard';

export default async function FormsPage() {
  const { forms } = await getDashboardData();
  // @ts-ignore
  return <FormsClient initialForms={forms} />;
}
