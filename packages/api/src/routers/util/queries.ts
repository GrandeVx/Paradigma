import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const queries = {
  // Get user's posts
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    return {
      status: "ok",
      timestamp: new Date(),
    };
  }),
};
