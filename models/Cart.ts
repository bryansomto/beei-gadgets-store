import mongoose, { Schema, Document } from 'mongoose';
import { ICartItem } from './CartItem';

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
  calculateTotal: () => number;
}

const CartSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // if enforcing one cart per user
    },
    items: [{
      type: Schema.Types.ObjectId,
      ref: 'CartItem'
    }],
    total: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Calculate cart total before saving
CartSchema.pre<ICart>('save', async function(next) {
  if (this.isModified('items')) {
    await this.populate({ path: 'items' });
    this.total = this.items.reduce(
      (sum, item: ICartItem) => sum + (item.price * item.quantity),
      0
    );
  }
  next();
});

CartSchema.methods.calculateTotal = function (): number {
  return this.items.reduce((sum: number, item: ICartItem) => sum + (item.price * item.quantity), 0);
};


export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
