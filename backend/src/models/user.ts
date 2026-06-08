import { Schema, model, InferSchemaType } from 'mongoose';
import { randomBytes } from 'node:crypto';

export const ROLES = ['Member', 'Admin', 'SuperAdmin'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true, maxlength: 100 },
    otpSecret: { type: String, required: true },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ROLES, default: 'Member', required: true },
    disable: { type: Boolean, default: false, required: true },
    motpReady: { type: Boolean, default: true, required: true },
  },
  { timestamps: true },
);

userSchema.pre('validate', function () {
  if (!this.uid) {
    this.uid = randomBytes(4).toString('hex');
  }
});

// Block SuperAdmin deletion at the schema level (any Model.deleteOne/findOneAndDelete path)
userSchema.pre(['deleteOne', 'findOneAndDelete'], { document: false, query: true }, async function () {
  const filter = this.getFilter();
  const target = await this.model.findOne(filter).select('role').lean<{ role?: string }>();
  if (target?.role === 'SuperAdmin') {
    throw new Error('SuperAdmin cannot be deleted');
  }
});

export function assertUserDeletable(user: { role?: string } | null | undefined): void {
  if (user?.role === 'SuperAdmin') {
    throw new Error('SuperAdmin cannot be deleted');
  }
}

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: any };
export const User = model('User', userSchema, 'User');
