
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITemplate } from './Template';

export interface ISystem extends Document {
  userId: string;
  template: ITemplate;
  name: string;
  status: 'Active' | 'Disabled';
  type: string;
  environment: 'Dev' | 'Prod';
  lastUsed: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSchema: Schema<ISystem> = new Schema(
  {
    userId: { type: String, required: true },
    template: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    name: { type: String, required: true }, // Defaults to template name
    status: { type: String, default: 'Active', enum: ['Active', 'Disabled'] },
    type: { type: String, default: 'Custom' }, // e.g., 'Auth', 'Ecommerce'
    environment: { type: String, default: 'Dev', enum: ['Dev', 'Prod'] },
    lastUsed: { type: Date, default: Date.now },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const System: Model<ISystem> =
  mongoose.models.System || mongoose.model<ISystem>('System', SystemSchema);

export default System;
