import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expires: Date;
  createdAt: Date;
  used: boolean;
  usedAt?: Date;
}

const PasswordResetTokenSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Auto-delete expired tokens
PasswordResetTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
