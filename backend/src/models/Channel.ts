import { Schema, model } from 'mongoose';

export interface IChannel {
    name: string;
    /** Conservé en String pour rester compatible avec les salons déjà en base */
    serverId: string;
    roleIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ChannelSchema = new Schema<IChannel>({
    name: { type: String, required: true, trim: true, maxlength: 24 },
    serverId: { type: String, required: true, index: true },
    roleIds: { type: [String], default: [] },
}, { timestamps: true });

export const Channel = model<IChannel>('Channel', ChannelSchema);
