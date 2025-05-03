import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';

export interface ICartItem extends Document {
  productId: mongoose.Types.ObjectId | IProduct;
  quantity: number;
  price: number;
  name?: string; // optional but included if cached
  image?: string;
}

const CartItemSchema: Schema = new Schema({
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export const CartItem =
  mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);
