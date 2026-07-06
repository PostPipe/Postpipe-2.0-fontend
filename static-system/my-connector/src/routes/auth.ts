import { Router } from 'express';
import { registerWithEmail, loginWithEmail, handleOAuthInitiation, handleOAuthCallback, logout, forgotPassword, resetPassword, verifyEmail, verifyOtp, resendOtp, getMe, initMasterAdmin, setupMasterAdmin } from '../controllers/authController';

const router = Router();

// Standard Email/Password Auth
router.post('/register', registerWithEmail);
router.post('/login', loginWithEmail);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', getMe);

// RBAC Master Admin
router.post('/init-master-admin', initMasterAdmin);
router.post('/setup-master-admin', setupMasterAdmin);

// OAuth flows
router.get('/:provider', handleOAuthInitiation);
router.get('/callback/:provider', handleOAuthCallback);

export default router;
