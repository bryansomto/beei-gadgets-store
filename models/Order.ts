import { Schema, model, models, Document, Model } from 'mongoose';

// Interface for Order Items
interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Interface for Address
interface IAddress {
  name: string;
  email: string;
  city: string;
  state: string;
  postalCode: string;
  streetAddress: string;
  country: string;
}

// Interface for the Order Document
interface IOrder extends Document {
  userEmail: string;
  items: IOrderItem[];
  total: number;
  address: IAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paid: boolean;
  createdAt: Date;
}

// Order Schema
const OrderSchema = new Schema<IOrder>({
  userEmail: { 
    type: String, 
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  items: [{
    productId: { 
      type: String, 
      required: [true, 'Product ID is required'] 
    },
    name: { 
      type: String, 
      required: [true, 'Product name is required'],
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    image: { 
      type: String,
      trim: true
    },
    quantity: { 
      type: Number, 
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    }
  }],
  total: { 
    type: Number, 
    required: [true, 'Total amount is required'],
    min: [0, 'Total must be positive']
  },
  address: {
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
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    
    city: { 
      type: String, 
      required: [true, 'City is required'],
      trim: true
    },
    state: { 
      type: String, 
      trim: true
    },
    postalCode: { 
      type: String, 
      required: [true, 'Postal code is required'],
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
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    trim: true
  },
  paid: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
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

// Virtual for formatted createdAt date
OrderSchema.virtual('createdAtFormatted').get(function(this: IOrder) {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Indexes for better query performance
OrderSchema.index({ userEmail: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save hook to calculate total if not provided
OrderSchema.pre<IOrder>('save', function(next) {
  if (this.isModified('items') && !this.isModified('total')) {
    this.total = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
  }
  next();
});

// Type for Order Model
interface IOrderModel extends Model<IOrder> {}

// Export the model
export const Order: IOrderModel = 
  models?.Order as IOrderModel || model<IOrder, IOrderModel>('Order', OrderSchema);

// Helper Types for Frontend Usage
export type OrderDocument = IOrder;
export type OrderItem = IOrderItem;
export type OrderAddress = IAddress;
export type OrderStatus = IOrder['status'];