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
        const { ObjectId } = await import('mongodb');
        const user = await User.collection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Explicitly backfill 'plan' field if missing so it shows up in database queries
        if (!user.plan) {
            await User.collection.updateOne(
                { _id: new ObjectId(userId) },
                { $set: { plan: 'starter' } }
            );
            user.plan = 'starter';
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
            image: user.image,
            plan: user.plan || 'starter',
            monthlySubmissions: user.monthlySubmissions || 0,
            usageResetDate: user.usageResetDate,
            hasActiveSubscription: !!user.razorpaySubscriptionId,
            cancelAtPeriodEnd: !!user.cancelAtPeriodEnd,
            currentPeriodEnd: user.currentPeriodEnd
        }, { status: 200 });

    } catch (error) {
        console.error('API /auth/me Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
