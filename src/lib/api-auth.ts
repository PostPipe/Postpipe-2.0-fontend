
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default-secret-do-not-use-in-prod';

export interface ApiTokenPayload {
    userId: string;
    connectorId: string;
}

export function generateApiToken(userId: string, connectorId: string, expiresIn = '30d'): string {
    if (!userId || !connectorId) throw new Error("userId and connectorId required");
    return jwt.sign({ userId, connectorId }, SECRET, { expiresIn } as jwt.SignOptions);
}

import User from './auth/User';
import dbConnect from './auth/mongodb';

export function verifyApiToken(token: string): ApiTokenPayload | null {
    try {
        const decoded = jwt.verify(token, SECRET) as ApiTokenPayload;
        if (decoded && decoded.userId && decoded.connectorId) {
            return decoded;
        }
        return null;
    } catch (e) {
        return null;
    }
}

export async function verifyPikoApiKey(apiKey: string): Promise<string | null> {
    if (!apiKey) return null;
    try {
        await dbConnect();
        const user = await User.findOne({ pikoApiKey: apiKey });
        return user ? user._id.toString() : null;
    } catch (e) {
        console.error("Piko API Key verification error:", e);
        return null;
    }
}

export async function getPikoUserByApiKey(apiKey: string) {
    if (!apiKey) return null;
    try {
        await dbConnect();
        const user = await User.findOne({ pikoApiKey: apiKey }).select('name email image');
        return user;
    } catch (e) {
        console.error("Piko API User retrieval error:", e);
        return null;
    }
}

