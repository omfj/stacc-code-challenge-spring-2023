import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
   * Creates a provider
   */
  // createProvider:
});
