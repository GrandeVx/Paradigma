import { protectedProcedure } from "../../trpc";
import { listCategoriesSchema } from "../../schemas/category";

export const queries = {
  list: protectedProcedure
    .input(listCategoriesSchema)
    .query(async ({ ctx, input }) => {
      // Create custom cache key for category list
      const cacheKey = ctx.db.getKey({ 
        params: [{ prisma: 'MacroCategory' }, { operation: 'list' }, { type: input.type || 'all' }] 
      });
      
      // Fetch all macro categories with their subcategories
      const macroCategories = await ctx.db.macroCategory.findMany({
        include: {
          subCategories: true,
        },
        where: input.type ? {
          type: input.type,
        } : {},
        orderBy: {
          name: "asc",
        },
        cache: { 
          ttl: 86400, // 1 day TTL for categories (rarely change)
          key: cacheKey 
        }
      });
      
      return macroCategories;
    }),
}; 