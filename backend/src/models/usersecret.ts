import { Schema, model, InferSchemaType } from 'mongoose';
import { nextSeq, formatId } from './counter.js';

const usersecretSchema = new Schema(
  {
    usersecretId: { type: String, required: true, unique: true, index: true },
    uid: { type: String, required: true, index: true },
    systemName: { type: String, required: true, maxlength: 100 },
    secretName: { type: String, required: true, maxlength: 100 },
    secretDescription: { type: String, default: '', maxlength: 500 },
    secretValue: { type: String, required: true },
    picture: { type: String, default: '' },
  },
  { timestamps: true },
);

usersecretSchema.pre('validate', async function () {
  if (!this.usersecretId) {
    const seq = await nextSeq('usersecret');
    this.usersecretId = formatId('US', seq, 5);
  }
});

export type UsersecretDoc = InferSchemaType<typeof usersecretSchema> & { _id: any };
export const Usersecret = model('Usersecret', usersecretSchema);
