import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
)

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
