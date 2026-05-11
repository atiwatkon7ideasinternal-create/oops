import { Schema, model, InferSchemaType } from 'mongoose';

export const ROLES = ['member', 'admin', 'superadmin'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    role: { type: String, enum: ROLES, default: 'member', required: true },
    passwordHash: { type: String }, // only for admin/superadmin
    totpSecret: { type: String }, // Google Authenticator base32 secret
    totpVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: any };
export const User = model('User', userSchema);
