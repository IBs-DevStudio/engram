import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ensureSignupCredits } from "@/lib/credits";

export const userRouter = createTRPCRouter({
  balance: protectedProcedure.query(async ({ ctx }) => {
    return ensureSignupCredits(ctx.db, ctx.userId);
  }),
});
