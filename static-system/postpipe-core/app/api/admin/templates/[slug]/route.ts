import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Template from '@/models/Template';
import { isAuthorized } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { slug } = params;
    
    const template = await Template.findOne({ slug });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { slug } = params;
    const body = await req.json();

    // Prevent updating slug to something that collides (unless it's the same doc)
    // Mongoose updateOne/findOneAndUpdate runs validation
    const updatedTemplate = await Template.findOneAndUpdate(
      { slug },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template: updatedTemplate });
  } catch (error: any) {
    console.error('Error updating template:', error);
    if (error.code === 11000) {
        return NextResponse.json(
          { error: 'Slug must be unique' },
          { status: 400 }
        );
      }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { slug } = params;

    const deletedTemplate = await Template.findOneAndDelete({ slug });

    if (!deletedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
