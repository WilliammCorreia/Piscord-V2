import { Router } from 'express';
import AuthController from '../controllers/AuthController.ts';
import { authLimiter } from '../middleware/rateLimiters.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateSignin, validateSignup } from '../validators/userValidator.ts';

const router = Router();

router.post('/signup', authLimiter, validateSignup, handleValidationErrors, AuthController.signup);
router.post('/signin', authLimiter, validateSignin, handleValidationErrors, AuthController.signin);
// POST et non GET : ces routes changent l'état de la session
router.post('/refresh', AuthController.refresh);
router.post('/disconnect', AuthController.disconnect);

export default router;
