import { Router } from 'express';
import ServerController from '../controllers/ServerController.ts';
import { requireAuth } from '../middleware/authHandlers.ts';
import { handleValidationErrors } from '../middleware/validationHandlers.ts';
import { validateCreateServer, validateServerIdParam } from '../validators/serverValidator.ts';

const router = Router();

router.use(requireAuth);

router.post('/', validateCreateServer, handleValidationErrors, ServerController.create);
router.get('/user', ServerController.getByUserId);
router.get('/:serverId', validateServerIdParam, handleValidationErrors, ServerController.getById);

export default router;
