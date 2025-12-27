import connectToDatabase from '@/lib/mongoose';
import Template from '@/models/Template';
import TemplateForm from '../TemplateForm';
import { notFound } from 'next/navigation';

export default async function EditTemplatePage({ params }: { params: { slug: string } }) {
    await connectToDatabase();
    const template = await Template.findOne({ slug: params.slug }).lean();

    if (!template) {
        notFound();
    }

    // Serialize props
    const serializedTemplate = {
        ...template,
        _id: template._id.toString(),
        createdAt: template.createdAt?.toISOString(),
        updatedAt: template.updatedAt?.toISOString(),
    };

    return (
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
            <TemplateForm initialData={serializedTemplate} isEdit />
        </div>
    );
}
