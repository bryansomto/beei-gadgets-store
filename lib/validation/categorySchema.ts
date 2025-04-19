import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentCategory: z.string().optional(),
  properties: z
    .array(
      z.object({
        name: z.string().min(1, "Property name is required"),
        values: z.union([
          z.string(),
          z.array(z.string()),
        ]),
      })
    )
    .optional(),
  _id: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
