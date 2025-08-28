import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phoneNumber?: string;
  image?: string;
  initials?: string;
  isAdmin: boolean;
  emailVerified?: Date;
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
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
    phoneNumber: { 
      type: String,
      default: "",
      trim: true,
    },
     initials: { 
      type: String, 
      trim: true,
    },
    isAdmin: { 
      type: Boolean, 
      default: false,
    },
    emailVerified: { 
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        delete ret.password;
        return ret;
      },
    }
  }
)

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);