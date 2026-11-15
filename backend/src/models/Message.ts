import { Schema, model, type Types } from 'mongoose';

export interface IMessage {
    content: string;
    authorId: Types.ObjectId;
    /** ID du salon (ou, plus tard, d'une conversation privée) */
    referenceId: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/** Message dont l'auteur a été peuplé (username uniquement) */
export interface MessageAuthor {
    _id: Types.ObjectId;
    username: string;
}

export type PopulatedMessage = Omit<IMessage, 'authorId'> & {
    _id: Types.ObjectId;
    authorId: MessageAuthor;
};

const MessageSchema = new Schema<IMessage>({
    content: { type: String, required: true, maxlength: 2000 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referenceId: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Pagination par curseur : derniers messages d'un salon, du plus récent au plus ancien
MessageSchema.index({ referenceId: 1, _id: -1 });

export const Message = model<IMessage>('Message', MessageSchema);
