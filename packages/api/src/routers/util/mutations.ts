import { publicProcedure } from "../../trpc";
import { addToWhitelistSchema } from "../../schemas/util";


export const mutations = {
  addToWhitelist: publicProcedure
    .input(addToWhitelistSchema)
    .mutation(async ({ ctx, input }) => {
      const whitelist = await ctx.db.whitelist.create({
        data: {
          email: input.email,
        },
      });

      return whitelist;
    })
}