// lib/productSchema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Each image must be a valid URL")),
  description: z.string().min(1, "Description is required"),
  price: z
  .coerce
    .number()
    .min(0, "Price is required"),
  properties: z.array(
    z.object({
      name: z.string().min(1, "Property name is required"),
      values: z.string().min(1, "Property values are required"),
    })
  ).default([]).optional(),  // Default to an empty array if not provided
});

export type ProductFormData = z.infer<typeof productSchema>;