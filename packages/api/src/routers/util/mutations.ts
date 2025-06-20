import { publicProcedure } from "../../trpc";
import { addToWhitelistSchema } from "../../schemas/util";


export const mutations = {
  addToWhitelist: publicProcedure
    .input(addToWhitelistSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(`📝 [Whitelist] Starting addToWhitelist mutation`);
      console.log(`📥 [Whitelist] Input:`, input);
      
      try {
        console.log(`🔍 [Whitelist] Checking if email already exists: ${input.email}`);
        
        // Check if email already exists
        const existing = await ctx.db.whitelist.findFirst({
          where: { email: input.email }
        });
        
        if (existing) {
          console.log(`⚠️ [Whitelist] Email already exists in whitelist: ${input.email}`);
          return existing;
        }
        
        console.log(`💾 [Whitelist] Creating new whitelist entry for: ${input.email}`);
        const startTime = Date.now();
        
        const whitelist = await ctx.db.whitelist.create({
          data: {
            email: input.email,
          },
        });
        
        const dbTime = Date.now() - startTime;
        console.log(`✅ [Whitelist] Database operation completed in ${dbTime}ms`);
        console.log(`📤 [Whitelist] Created whitelist entry:`, whitelist);

        return whitelist;
      } catch (error) {
        console.error(`❌ [Whitelist] Error in addToWhitelist:`, error);
        throw error;
      }
    })
}