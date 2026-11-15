import { Schema, model, type Types } from 'mongoose';

export interface IInvitation {
    code: string;
    serverId: Types.ObjectId;
    createdBy: Types.ObjectId;
    isActive: boolean;
    expiredAt?: Date | null;
    /** null = nombre d'utilisations illimité */
    maxUsage?: number | null;
    currentUsage: number;
    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
    code: { type: String, required: true, unique: true },
    serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    expiredAt: { type: Date },
    maxUsage: { type: Number, default: null },
    currentUsage: { type: Number, default: 0 },
}, { timestamps: true });

export const Invitation = model<IInvitation>('Invitation', InvitationSchema);
