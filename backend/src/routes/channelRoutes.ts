import { Router } from 'express';
import ChannelController from '../controllers/ChannelController.ts';
import { requireAuth } from '../middleware/authHandlers.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateCreateChannel } from '../validators/channelValidator.ts';
import { validateServerIdParam } from '../validators/serverValidator.ts';

const router = Router();

router.use(requireAuth);

router.post('/', validateCreateChannel, handleValidationErrors, ChannelController.create);
router.get('/server/:serverId', validateServerIdParam, handleValidationErrors, ChannelController.getByServerId);

export default router;
