import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PriceRegion } from "@prisma/client";

export const userRouter = createTRPCRouter({
  /**
   * Get profile of user
   */
  info: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  /**
   * Update profile of user
   */
  update: protectedProcedure
    .input(
      z.object({
        region: z.nativeEnum(PriceRegion),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          region: input.region,
        },
      });
    }),
});
