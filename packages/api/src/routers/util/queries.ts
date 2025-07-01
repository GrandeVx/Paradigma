import { publicProcedure } from "../../trpc";

export const queries = {
  // Get user's posts
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    console.log(ctx.session)
    return {
      status: "ok",
      timestamp: new Date(),
    };
  }),
};
