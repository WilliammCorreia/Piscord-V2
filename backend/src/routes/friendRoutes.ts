import { Router } from 'express';
import FriendController from '../controllers/FriendController.ts';
import { requireAuth } from '../middleware/authHandlers.ts';
import { friendRequestLimiter } from '../middleware/rateLimiters.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateFriendRequest, validateFriendshipIdParam } from '../validators/friendValidator.ts';

const router = Router();

router.use(requireAuth);

router.get('/', FriendController.list);
// Limité en débit : la réponse dit si un pseudo existe
router.post('/request', friendRequestLimiter, validateFriendRequest, handleValidationErrors, FriendController.sendRequest);
router.post('/:friendshipId/accept', validateFriendshipIdParam, handleValidationErrors, FriendController.accept);
router.delete('/:friendshipId', validateFriendshipIdParam, handleValidationErrors, FriendController.remove);

export default router;
