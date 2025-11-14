import { Schema, model, models, Document, Model } from 'mongoose';

// Interface for Address Document
interface IAddress extends Document {
  userEmail: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  postalCode?: string;
  streetAddress: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Address Schema
const AddressSchema = new Schema<IAddress>({
  userEmail: { 
    type: String, 
    required: [true, 'User email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  city: { 
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  state: { 
    type: String, 
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: { 
    type: String,
    trim: true
  },
  streetAddress: { 
    type: String, 
    required: [true, 'Street address is required'],
    trim: true
  },
  country: { 
    type: String, 
    required: [true, 'Country is required'],
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Virtual for formatted address
AddressSchema.virtual('formattedAddress').get(function(this: IAddress) {
  return `${this.streetAddress}, ${this.city}, ${this.state || ''} ${this.postalCode}, ${this.country}`.replace(/\s+/g, ' ').trim();
});

// Type for Address Model
interface IAddressModel extends Model<IAddress> {
  findByEmail(email: string): Promise<IAddress | null>;
}

// Static method for finding by email
AddressSchema.statics.findByEmail = async function(email: string): Promise<IAddress | null> {
  return this.findOne({ userEmail: email.toLowerCase().trim() });
};

// Pre-save hook to normalize email
AddressSchema.pre<IAddress>('save', function(next) {
  if (this.isModified('userEmail')) {
    this.userEmail = this.userEmail.toLowerCase().trim();
  }
  next();
});

// Export the model
export const Address: IAddressModel = 
  (models?.Address as IAddressModel) || model<IAddress, IAddressModel>('Address', AddressSchema);

// Helper Types for Frontend Usage
export type AddressDocument = IAddress;