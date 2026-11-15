import { Router } from 'express';
import MessageController from '../controllers/MessageController.ts';
import { requireAuth } from '../middleware/authHandlers.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateCreateMessage, validateGetMessages, validateMessageIdParam } from '../validators/messageValidator.ts';

const router = Router();

router.use(requireAuth);

router.post('/', validateCreateMessage, handleValidationErrors, MessageController.create);
router.get('/reference/:referenceId', validateGetMessages, handleValidationErrors, MessageController.getMessagesByReference);
router.delete('/soft/:messageId', validateMessageIdParam, handleValidationErrors, MessageController.deleteMessage);

export default router;
