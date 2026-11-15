import { Router } from 'express';
import InvitationController from '../controllers/InvitationController.ts';
import { requireAuth } from '../middleware/authHandlers.ts';
import { invitationLimiter } from '../middleware/rateLimiters.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateCreateInvitation, validateInvitationCode } from '../validators/invitationValidator.ts';
import { validateServerIdParam } from '../validators/serverValidator.ts';

const router = Router();

router.use(requireAuth);

router.post('/', validateCreateInvitation, handleValidationErrors, InvitationController.create);
router.get('/server/:serverId', validateServerIdParam, handleValidationErrors, InvitationController.getByServerId);
router.delete('/', validateInvitationCode, handleValidationErrors, InvitationController.delete);
// Limité en débit : sans ça, on pourrait deviner des codes par force brute
router.post('/join', invitationLimiter, validateInvitationCode, handleValidationErrors, InvitationController.join);

export default router;
