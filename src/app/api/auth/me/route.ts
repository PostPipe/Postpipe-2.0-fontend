import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/auth/mongodb';
import User from '@/lib/auth/User';
import { getSession } from '@/lib/auth/actions';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        let userId = null;
        
        // 1. Try to get token from Authorization header
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                userId = decoded.userId;
            } catch (err) {
                // Ignore invalid token, let it fallback or fail
            }
        }

        // 2. Fallback to session cookie
        if (!userId) {
            const session = await getSession();
            if (session) {
                userId = session.userId;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(userId).select('-password -__v -forgotPasswordToken -verifyToken -resetTokenHash');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine provider (simplified logic based on standard schema)
        let provider = 'email';
        if (user.googleId) provider = 'google';
        if (user.githubId) provider = 'github';

        return NextResponse.json({ 
            id: user._id,
            name: user.name,
            email: user.email,
            provider: provider,
            image: user.image
        }, { status: 200 });

    } catch (error) {
        console.error('API /auth/me Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
