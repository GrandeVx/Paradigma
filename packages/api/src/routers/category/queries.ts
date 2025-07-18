import { protectedProcedure } from "../../trpc";
import { listCategoriesSchema } from "../../schemas/category";
import { CacheKeys, CacheTTL, formatCacheKeyParams } from "../../utils/cacheKeys";

export const queries = {
  list: protectedProcedure
    .input(listCategoriesSchema)
    .query(async ({ ctx, input }) => {
      // Create custom cache key for category list
      const cacheKey = ctx.db.getKey({
        params: formatCacheKeyParams(
          CacheKeys.category.list(input.type)
        )
      });

      // Fetch all macro categories with their subcategories
      const macroCategories = await ctx.db.macroCategory.findMany({
        select: {
          id: true,
          key: true,
          name: true,
          type: true,
          color: true,
          icon: true,
          subCategories: {
            select: {
              id: true,
              key: true,
              name: true,
              icon: true,
              macroCategoryId: true,
            }
          }
        },
        where: input.type ? {
          type: input.type,
        } : {},
        orderBy: {
          name: "asc",
        },
        cache: {
          ttl: CacheTTL.categories,
          key: cacheKey
        }
      });

      return macroCategories;
    }),
}; 