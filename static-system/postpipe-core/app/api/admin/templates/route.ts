import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Template from '@/models/Template';
import { isAuthorized } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const templates = await Template.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    // Basic validation is handled by Mongoose schema, but we can catch duplicates here
    try {
      const newTemplate = await Template.create(body);
      return NextResponse.json({ template: newTemplate }, { status: 201 });
    } catch (validationError: any) {
      if (validationError.code === 11000) {
        return NextResponse.json(
          { error: 'Slug must be unique' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: validationError.message || 'Validation failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
