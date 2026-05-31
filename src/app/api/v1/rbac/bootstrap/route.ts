import { NextRequest, NextResponse } from 'next/server';
import { getConnectorBySecret, getRBACState } from '../../../../../lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const secret = authHeader.split('Bearer ')[1];
    
    // Find the connector by secret
    const result = await getConnectorBySecret(secret);
    if (!result) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    const { connector, userId } = result;

    // Fetch the RBAC state
    const state = await getRBACState(userId, connector.id);

    return NextResponse.json({
      success: true,
      data: state || { roles: [], permissions: [], users: [] }
    });
  } catch (error: any) {
    console.error("[RBAC Bootstrap] Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
