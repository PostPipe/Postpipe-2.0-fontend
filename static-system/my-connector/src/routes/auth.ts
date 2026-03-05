import { Router } from 'express';
import { registerWithEmail, loginWithEmail, handleOAuthInitiation, handleOAuthCallback, logout } from '../controllers/authController';

const router = Router();

// Standard Email/Password Auth
router.post('/register', registerWithEmail);
router.post('/login', loginWithEmail);
router.post('/logout', logout);

// OAuth flows
router.get('/:provider', handleOAuthInitiation);
router.get('/callback/:provider', handleOAuthCallback);

export default router;
