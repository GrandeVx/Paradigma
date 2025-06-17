import { z } from "zod";

export const addToWhitelistSchema = z.object({
  email: z.string().email(),
});