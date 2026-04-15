import { NextRequest, NextResponse } from 'next/server';
import { getPikoUserByApiKey } from '@/lib/api-auth';

/**
 * @api {get} /api/piko/v1/loginVerify Verify Piko API login and return user info
 * @apiHeader {String} x-piko-api-key Piko AI integration key
 */
export async function GET(req: NextRequest) {
    const apiKey = req.headers.get('x-piko-api-key');
    
    if (!apiKey) {
        return NextResponse.json({ 
            success: false,
            error: 'Missing Piko API key' 
        }, { status: 401 });
    }

    try {
        const user = await getPikoUserByApiKey(apiKey);
        
        if (!user) {
            return NextResponse.json({ 
                success: false,
                error: 'Invalid or unauthorized API key' 
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image
            }
        });

    } catch (e: any) {
        console.error('Piko Login Verification Error:', e);
        return NextResponse.json({ 
            success: false,
            error: 'Internal server error during verification',
            details: e.message 
        }, { status: 500 });
    }
}

// Enable CORS for Piko AI
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-piko-api-key',
        },
    });
}
