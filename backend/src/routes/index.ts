import { Router } from 'express';
import authRoutes from './authRoutes.ts';
import channelRoutes from './channelRoutes.ts';
import invitationRoutes from './invitationRoutes.ts';
import messageRoutes from './messageRoutes.ts';
import serverRoutes from './serverRoutes.ts';

const router = Router();

router.use('/auth', authRoutes);
router.use('/server', serverRoutes);
router.use('/channel', channelRoutes);
router.use('/message', messageRoutes);
router.use('/invitation', invitationRoutes);

export default router;
