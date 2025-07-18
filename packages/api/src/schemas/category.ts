import { z } from "zod";

// Schema for listing all categories
export const listCategoriesSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
});

// Output types for categories (used for documentation)
export const subCategoryOutput = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string().nullable(),
  icon: z.string(),
  macroCategoryId: z.string(),
  color: z.string(),
});

export const macroCategoryOutput = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string().nullable(),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string(),
  subCategories: z.array(subCategoryOutput),
  icon: z.string(),
}); 