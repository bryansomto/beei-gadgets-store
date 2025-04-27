import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    category: z.string().min(1, "Category is required"),
    images: z.array(z.string().url("Each image must be a valid URL")),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price is required"), // Default price
    priceVariants: z
      .array(
        z.object({
          variantName: z.string().min(1, "Variant name is required"),
          variantValues: z.array(z.string().min(1, "Variant value is required")),
          price: z.coerce.number().min(0, "Price for variant is required"),
        })
      )
      .default([])
      .optional(),
    properties: z
      .array(
        z.object({
          name: z.string().min(1, "Property name is required"),
          values: z.array(z.string().min(1, "Property values are required")),
        })
      )
      .default([])
      .optional(),
  })
  .refine((data) => {
    return data.price > 0 || (data.priceVariants && data.priceVariants.length > 0);
  }, {
    message: "Either a default price or at least one price variant is required.",
    path: ["priceVariants"],
  });

  export type ProductFormData = z.infer<typeof productSchema>;