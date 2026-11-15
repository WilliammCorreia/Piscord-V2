import { Schema, model, type HydratedDocument } from 'mongoose';

export interface IUser {
    email: string;
    hashPassword: string;
    username: string;
    avatarUrl?: string;
    displayStatus?: boolean;
    lastConnection?: Date;
    /** Incrémenté à la déconnexion : invalide tous les refresh tokens déjà émis */
    tokenVersion: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 64 },
    hashPassword: { type: String, required: true },
    username: { type: String, required: true, trim: true, maxlength: 24 },
    avatarUrl: { type: String },
    displayStatus: { type: Boolean },
    lastConnection: { type: Date },
    tokenVersion: { type: Number, default: 0 },
}, { timestamps: true });

export type UserDocument = HydratedDocument<IUser>;

export const User = model<IUser>('User', UserSchema);
