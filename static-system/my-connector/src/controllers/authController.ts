import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAdapter } from '../lib/db';
import crypto from 'crypto';

const CONNECTOR_SECRET = process.env.POSTPIPE_CONNECTOR_SECRET || 'fallback_secret';

// Helper to generate JWT
const generateToken = (user: any) => {
    return jwt.sign(
        { id: user.id, email: user.email, provider: user.provider },
        CONNECTOR_SECRET,
        { expiresIn: '7d' }
    );
};

export const registerWithEmail = async (req: Request, res: Response) => {
    try {
        const { name, email, password, projectId, targetDatabase } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const resolvedType = process.env.DB_TYPE || 'postgres';
        const adapter = getAdapter(resolvedType);
        
        await adapter.connect({ targetDatabase });

        // Check if user already exists
        const existingUser = await adapter.findUserByEmail(email, { targetDatabase });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: crypto.randomUUID(),
            email,
            name,
            password_hash,
            provider: 'email',
            provider_id: null,
            avatar: null,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
        };

        await adapter.insertUser(newUser, { targetDatabase });

        const token = generateToken(newUser);

        // Remove sensitive data before sending
        const { password_hash: _, ...safeUser } = newUser;

        return res.status(201).json({ 
            message: 'User created successfully', 
            user: safeUser, 
            token 
        });
    } catch (error) {
        console.error('[Auth] Registration Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const loginWithEmail = async (req: Request, res: Response) => {
    try {
        const { email, password, projectId, targetDatabase } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const resolvedType = process.env.DB_TYPE || 'postgres';
        const adapter = getAdapter(resolvedType);
        
        await adapter.connect({ targetDatabase });

        const user = await adapter.findUserByEmail(email, { targetDatabase });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (user.provider !== 'email' || !user.password_hash) {
            return res.status(400).json({ message: `Please login using your ${user.provider} account.` });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        
        // Update last login
        await adapter.updateUserLastLogin(user.id, { targetDatabase });

        const { password_hash: _, ...safeUser } = user;

        return res.status(200).json({ 
            message: 'Login successful', 
            user: safeUser, 
            token 
        });
    } catch (error) {
        console.error('[Auth] Login Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const handleOAuthInitiation = async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { projectId, redirect, targetDatabase } = req.query;
    
    // Store routing state in cookie
    const stateObj = { 
        redirect: redirect || 'http://localhost:3000', 
        targetDatabase: targetDatabase || 'default' 
    };
    
    // Encode state to pass to Google/GitHub
    const encodedState = Buffer.from(JSON.stringify(stateObj)).toString('base64');
    
    // Ensure we have a dynamic callback URL based on where the connector is hosted
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/callback/${provider}`;
    
    if (provider === 'google') {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID in connector environment." });
        }
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
            `response_type=code&` +
            `scope=email%20profile&` +
            `state=${encodedState}`;
            
        return res.redirect(googleAuthUrl);
    }
    
    if (provider === 'github') {
        const clientId = process.env.GITHUB_CLIENT_ID;
        if (!clientId) {
            return res.status(500).json({ error: "Missing GITHUB_CLIENT_ID in connector environment." });
        }
        
        const githubAuthUrl = `https://github.com/login/oauth/authorize?` + 
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
            `scope=user:email&` +
            `state=${encodedState}`;
            
        return res.redirect(githubAuthUrl);
    }

    return res.status(400).json({ error: "Unsupported OAuth Provider" });
};

export const handleOAuthCallback = async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { code, state, error } = req.query;
    
    if (error) {
        return res.status(400).send(`OAuth Error: ${error}`);
    }
    
    if (!code) {
        return res.status(400).send("No authorization code provided.");
    }

    let decodedState: any = {};
    try {
        if (state) {
            decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
        }
    } catch (e) {
        console.warn("[Auth] Failed to decode OAuth state");
    }
    
    const uiRedirect = decodedState.redirect || 'http://localhost:3000';
    const targetDatabase = decodedState.targetDatabase || 'default';
    
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/callback/${provider}`;
    let oauthProfile: any = null;

    try {
        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            
            // 1. Exchange Code for Token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId!,
                    client_secret: clientSecret!,
                    code: code as string,
                    grant_type: 'authorization_code',
                    redirect_uri: callbackUrl
                })
            });
            const tokenData = await tokenResponse.json();
            
            if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
            
            // 2. Fetch User Profile
            const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            const profileData = await profileResponse.json();
            
            oauthProfile = {
                id: profileData.id,
                email: profileData.email,
                name: profileData.name,
                avatar: profileData.picture
            };
        } else if (provider === 'github') {
            const clientId = process.env.GITHUB_CLIENT_ID;
            const clientSecret = process.env.GITHUB_CLIENT_SECRET;
            
            // 1. Exchange Code for Token
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code as string,
                    redirect_uri: callbackUrl
                })
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
            
            // 2. Fetch User Profile
            const profileResponse = await fetch('https://api.github.com/user', {
                headers: { 
                    Authorization: `Bearer ${tokenData.access_token}`,
                    Accept: 'application/json'
                }
            });
            const profileData = await profileResponse.json();
            
            // Github emails might be private, fetch separately if needed
            let email = profileData.email;
            if (!email) {
                const emailsResp = await fetch('https://api.github.com/user/emails', {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` }
                });
                const emails = await emailsResp.json();
                email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
            }
            
            oauthProfile = {
                id: profileData.id.toString(),
                email: email,
                name: profileData.name || profileData.login,
                avatar: profileData.avatar_url
            };
        }
        
        if (!oauthProfile || !oauthProfile.email) {
            throw new Error("Could not retrieve email from OAuth provider");
        }

        // --- Database Sync ---
        const resolvedType = process.env.DB_TYPE || 'postgres';
        const adapter = getAdapter(resolvedType);
        
        let user = await adapter.findUserByEmail(oauthProfile.email, { targetDatabase });
        
        if (!user) {
            // New User Registration via OAuth
            user = {
                id: crypto.randomUUID(),
                email: oauthProfile.email,
                name: oauthProfile.name,
                password_hash: null, // No password for OAuth users
                provider: provider,
                provider_id: oauthProfile.id,
                avatar: oauthProfile.avatar,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            await adapter.insertUser(user, { targetDatabase });
        } else {
            // Existing User Login
            await adapter.updateUserLastLogin(user.id, { targetDatabase });
            
            // If they previously logged in with email, but now are using OAuth
            if (!user.provider) {
                console.log(`[Auth] Existing email user linked to ${provider} OAuth.`);
                // Ideally, would update DB record with provider info here if we had an updateUser method.
            }
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, provider },
            CONNECTOR_SECRET,
            { expiresIn: '7d' }
        );

        // Send back to the client UI with a token
        return res.redirect(`${uiRedirect}?pp_token=${token}`);

    } catch (e: any) {
        console.error(`[Auth] OAuth Callback Error for ${provider}:`, e);
        return res.redirect(`${uiRedirect}?error=${encodeURIComponent(e.message || "OAuth Error")}`);
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('oauth_redirect');
    return res.status(200).json({ message: 'Logged out successfully' });
};
