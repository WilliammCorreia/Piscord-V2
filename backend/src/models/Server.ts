import { Schema, model, type Types } from 'mongoose';

export interface IServer {
    name: string;
    ownerId: Types.ObjectId;
    /** Source de vérité unique pour l'appartenance à un serveur */
    memberIds: Types.ObjectId[];
    bannedIds: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ServerSchema = new Schema<IServer>({
    name: { type: String, required: true, trim: true, maxlength: 24 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bannedIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// « Les serveurs d'un utilisateur » est la requête la plus fréquente
ServerSchema.index({ memberIds: 1 });

export const Server = model<IServer>('Server', ServerSchema);
