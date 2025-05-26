import { protectedProcedure } from "../../trpc";
import { listCategoriesSchema } from "../../schemas/category";

export const queries = {
  list: protectedProcedure
    .input(listCategoriesSchema)
    .query(async ({ ctx, input }) => {
      // Fetch all macro categories with their subcategories
      const macroCategories = await ctx.db.macroCategory.findMany({
        include: {
          subCategories: true,
        },
        where: {
          type: input.type,
        },
        orderBy: {
          name: "asc",
        },
      });
      
      return macroCategories;
    }),
}; 