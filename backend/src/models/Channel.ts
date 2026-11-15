import { Schema, model } from 'mongoose';

export type ChannelType = 'text' | 'voice';

export interface IChannel {
    name: string;
    /** Conservé en String pour rester compatible avec les salons déjà en base */
    serverId: string;
    /** Les salons créés avant l'arrivée du vocal n'ont pas ce champ : ils sont textuels */
    type: ChannelType;
    roleIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>({
    name: { type: String, required: true, trim: true, maxlength: 24 },
    serverId: { type: String, required: true, index: true },
    type: { type: String, enum: ['text', 'voice'], default: 'text' },
    roleIds: { type: [String], default: [] },
}, { timestamps: true });

export const Channel = model<IChannel>('Channel', ChannelSchema);
