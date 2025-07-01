import { publicProcedure } from "../../trpc";
import { addToWhitelistSchema } from "../../schemas/util";
import { emailService } from "../../utils/email";
import WhitelistWelcomeEmail from "../../templates/whitelist-welcome";
import * as React from "react";

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

        // Send welcome email
        console.log(`📧 [Whitelist] Attempting to send welcome email to: ${input.email}`);
        try {
          const emailJsx = React.createElement(WhitelistWelcomeEmail, {
            userEmail: input.email,
          });

          const emailSent = await emailService.renderAndSendEmail(
            emailJsx,
            {
              to: input.email,
              subject: "🎉 Benvenuto in Balance - Iscrizione confermata!",
            }
          );

          if (emailSent) {
            console.log(`✅ [Whitelist] Welcome email sent successfully to: ${input.email}`);
          } else {
            console.log(`⚠️ [Whitelist] Failed to send welcome email to: ${input.email}, but user was added to whitelist`);
          }
        } catch (emailError) {
          console.error(`❌ [Whitelist] Error sending welcome email:`, emailError);
          // Don't throw here - we still want to return the whitelist entry even if email fails
        }

        return whitelist;
      } catch (error) {
        console.error(`❌ [Whitelist] Error in addToWhitelist:`, error);
        throw error;
      }
    })
}