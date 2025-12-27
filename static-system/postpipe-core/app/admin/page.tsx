import connectToDatabase from '@/lib/mongoose';
import Template from '@/models/Template';
import TemplateList from './TemplateList';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    await connectToDatabase();
    // Fetch only necessary fields for the list
    const templates = await Template.find({})
        .sort({ createdAt: -1 })
        .lean();

    // Mongoose lean returns objects with `_id` as ObjectId, handle serialization
    const serializedTemplates = templates.map((t: any) => ({
        ...t,
        _id: t._id.toString(),
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
    }));

    return <TemplateList initialTemplates={serializedTemplates} />;
}
