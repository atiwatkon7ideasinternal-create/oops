import { Schema, model, InferSchemaType } from 'mongoose';
import { randomInt } from 'node:crypto';

const gpuSchema = new Schema(
  {
    gid: { type: Number, required: true, unique: true, index: true },
    gpuName: { type: String, required: true, maxlength: 100 },
    brand: { type: String, required: true, maxlength: 50 },
    scryptHashrate: { type: Number, required: true },
    memory: { type: Number, required: true },
  },
  { timestamps: true },
);

gpuSchema.pre('validate', function () {
  if (this.gid == null) {
    this.gid = randomInt(1, 2_147_483_647);
  }
});

export type GpuDoc = InferSchemaType<typeof gpuSchema> & { _id: any };
export const Gpu = model('Gpu', gpuSchema, 'Gpu');
