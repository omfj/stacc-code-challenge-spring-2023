import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const providerRouter = createTRPCRouter({
  /**
   * Get all the energy providers
   */
  getProviders: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.provider.findMany({
      include: {
        plans: true,
      },
    });
  }),

  /**
   * Creates a new provider
   */
  createProvider: adminProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.provider.create({
        data: {
          name: input.name,
        },
      });
    }),
});
