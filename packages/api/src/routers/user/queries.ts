import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { formatCacheKeyParams } from "../../utils/cache";

export const queries = {
  // Get user's posts
  checkUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      return user !== null;
    }),

  // Get User Information
  getUserInfo: protectedProcedure.query(async ({ ctx }) => {

    const userId = ctx.session.user.id;
    const cacheKey = ctx.db.getKey(
      {
        params: formatCacheKeyParams(
          {
            prisma: 'User',
            operation: 'getUserInfo',
            userId
          }
        )
      }
    );
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      cache: {
        ttl: 300,
        key: cacheKey
      }
    });

    return user;
  }),
};
