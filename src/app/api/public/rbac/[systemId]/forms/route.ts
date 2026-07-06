import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '../../../../../../lib/server-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params;
    const db = await getDB();
    
    // Find the RBAC system
    const userDoc = await db.collection('user_rbac_systems').findOne({
      "systems.id": systemId
    });

    if (!userDoc) {
      return NextResponse.json({ error: 'RBAC system not found' }, { status: 404, headers: corsHeaders });
    }

    const system = userDoc.systems.find((s: any) => s.id === systemId);
    if (!system) {
      return NextResponse.json({ error: 'RBAC system not found' }, { status: 404, headers: corsHeaders });
    }

    const managedFormIds = system.settings?.managedForms || [];
    if (managedFormIds.length === 0) {
      return NextResponse.json({ forms: [] }, { headers: corsHeaders });
    }

    // Fetch details of those forms
    const formsDoc = await db.collection('user_forms').findOne({ userId: userDoc.userId });
    let forms = [];
    if (formsDoc && formsDoc.forms) {
      forms = formsDoc.forms
        .filter((f: any) => managedFormIds.includes(f.id))
        .map((f: any) => ({ id: f.id, name: f.name }));
    }

    return NextResponse.json({ forms }, { headers: corsHeaders });
  } catch (error) {
    console.error("[RBAC Forms API] Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
