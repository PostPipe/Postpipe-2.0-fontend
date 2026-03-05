import { Metadata } from 'next';
import FormsClient from '@/components/dashboard/forms-client';

export const metadata: Metadata = {
  title: 'Forms',
};

import { getDashboardData } from '@/app/actions/dashboard';
import { getAuthPresetsAction } from '@/app/actions/builder';

export default async function FormsPage() {
  const { forms } = await getDashboardData();
  const presets = await getAuthPresetsAction();
  // @ts-ignore
  return <FormsClient initialForms={forms} initialPresets={presets} />;
}
