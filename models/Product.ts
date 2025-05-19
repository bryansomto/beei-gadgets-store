import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  properties: Record<string, string>;
  isNewProduct?: boolean;  // Changed from 'isNew' to 'isNewProduct'
  discount?: number;
  rating?: number;
  reviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    properties: { type: Object },
    isNewProduct: { type: Boolean, default: false },  // Updated here too
    discount: { type: Number, min: 0, max: 100 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        return ret;
      },
    },
  }
);

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export { Product };
