import { randomBytes } from 'node:crypto';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.ts';
import InvitationRepository, { type InvitationLean } from '../repositories/InvitationRepository.ts';
import ServerRepository, { type ServerWithMembers } from '../repositories/ServerRepository.ts';
import { addUserToServer } from '../socket/index.ts';
import type { AuthUser } from '../types/auth.ts';
import AccessService from './AccessService.ts';

const MAX_CODE_ATTEMPTS = 10;

class InvitationService {

    /**
     * Génère un code d'invitation aléatoire
     * @returns Code de 8 caractères hexadécimaux, ex: A1B2C3D4
     */
    generateInvitationCode(): string {
        return randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Crée une nouvelle invitation pour un serveur (réservé aux membres du serveur)
     * @param options - Date d'expiration et nombre maximum d'utilisations
     */
    async createInvitation(
        serverId: string,
        createdBy: string,
        options: { expiredAt?: Date | null; maxUsage?: number | null } = {}
    ): Promise<InvitationLean> {
        await AccessService.assertServerMember(serverId, createdBy);

        const expiredAt = options.expiredAt ?? null;
        if (expiredAt && expiredAt <= new Date()) {
            throw new BadRequestError("La date d'expiration doit être dans le futur", 'INVALID_EXPIRATION');
        }

        for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            const code = this.generateInvitationCode();
            if (await InvitationRepository.findByCode(code)) continue;

            return await InvitationRepository.create({
                code,
                serverId,
                createdBy,
                expiredAt,
                maxUsage: options.maxUsage ?? null,
            });
        }

        throw new Error('Impossible de générer un code unique');
    }

    /**
     * Récupère toutes les invitations d'un serveur (réservé aux membres du serveur :
     * connaître un code suffit pour rejoindre)
     */
    async getInvitationsByServerId(serverId: string, userId: string): Promise<InvitationLean[]> {
        await AccessService.assertServerMember(serverId, userId);

        return await InvitationRepository.findByServerId(serverId);
    }

    /**
     * Supprime une invitation - réservé à son créateur et au propriétaire du serveur
     */
    async deleteInvitation(code: string, userId: string): Promise<InvitationLean> {
        const invitation = await InvitationRepository.findByCode(code);
        if (!invitation) {
            throw new NotFoundError('Invitation introuvable', 'INVITATION_NOT_FOUND');
        }

        const server = await ServerRepository.findById(invitation.serverId);
        const isCreator = invitation.createdBy.equals(userId);
        const isOwner = server?.ownerId.equals(userId) ?? false;

        if (!isCreator && !isOwner) {
            throw new ForbiddenError("Vous n'avez pas l'autorisation de supprimer cette invitation", 'NOT_ALLOWED');
        }

        await InvitationRepository.deleteByCode(code);

        return invitation;
    }

    /**
     * Rejoint un serveur via une invitation
     * @returns Le serveur rejoint, avec ses membres
     */
    async joinByInvitation(code: string, user: AuthUser): Promise<{ server: ServerWithMembers }> {
        const { userId } = user;
        const invitation = await InvitationRepository.findByCode(code);
        if (!invitation) {
            throw new NotFoundError('Invitation introuvable', 'INVITATION_NOT_FOUND');
        }

        if (!invitation.isActive) {
            throw new BadRequestError("Cette invitation n'est plus active", 'INVITATION_INACTIVE');
        }

        if (invitation.expiredAt && invitation.expiredAt <= new Date()) {
            throw new BadRequestError('Cette invitation a expiré', 'INVITATION_EXPIRED');
        }

        const server = await ServerRepository.findById(invitation.serverId);
        if (!server) {
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        if (server.bannedIds.some((bannedId) => bannedId.equals(userId))) {
            throw new ForbiddenError('Vous avez été banni de ce serveur', 'BANNED');
        }

        if (server.memberIds.some((memberId) => memberId.equals(userId))) {
            throw new ConflictError('Vous êtes déjà membre de ce serveur', 'ALREADY_MEMBER');
        }

        const claimed = await InvitationRepository.claimUsage(invitation._id);
        if (!claimed) {
            throw new BadRequestError("Cette invitation a atteint son nombre maximum d'utilisations", 'INVITATION_EXHAUSTED');
        }

        let updatedServer: ServerWithMembers | null;
        try {
            updatedServer = await ServerRepository.addMember(server._id, userId);
        }
        catch (err) {
            await InvitationRepository.releaseUsage(invitation._id);
            throw err;
        }

        if (!updatedServer) {
            await InvitationRepository.releaseUsage(invitation._id);
            throw new NotFoundError('Serveur introuvable', 'SERVER_NOT_FOUND');
        }

        addUserToServer(userId, user.username, server._id.toString());

        return { server: updatedServer };
    }
}

export default new InvitationService();
