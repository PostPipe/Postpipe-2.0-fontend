'use server';

import dbConnect from '@/lib/auth/mongodb';
import User from '@/lib/auth/User';
import { getSession } from '@/lib/auth/actions';

export async function generatePikoApiKeyAction() {
    try {
        const session = await getSession();
        if (!session) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        // Generate a secure random key
        const crypto = require('crypto');
        const newKey = `pp_piko_${crypto.randomBytes(24).toString('hex')}`;

        await User.findByIdAndUpdate(session.userId, {
            pikoApiKey: newKey
        });

        return { success: true, key: newKey };
    } catch (error) {
        console.error('Error generating Piko API key:', error);
        return { success: false, message: 'Failed to generate key' };
    }
}

export async function revokePikoApiKeyAction() {
    try {
        const session = await getSession();
        if (!session) {
            throw new Error('Unauthorized');
        }

        await dbConnect();

        await User.findByIdAndUpdate(session.userId, {
            $unset: { pikoApiKey: 1 }
        });

        return { success: true };
    } catch (error) {
        console.error('Error revoking Piko API key:', error);
        return { success: false, message: 'Failed to revoke key' };
    }
}

export async function getPikoApiKeyAction() {
    try {
        const session = await getSession();
        if (!session) {
            return null;
        }

        await dbConnect();
        const user = await User.findById(session.userId);
        return user?.pikoApiKey || null;
    } catch (error) {
        return null;
    }
}
