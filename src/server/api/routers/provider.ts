import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  Consumption,
  Plan,
  PriceModel,
  Prisma,
  Provider,
} from "@prisma/client";

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
   * Calculates the best provider for a user
   */
  getBestPrice: protectedProcedure.query(async ({ ctx }) => {
    const userConsumption = await ctx.prisma.consumption.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    const providers = await ctx.prisma.provider.findMany({
      include: {
        plans: true,
      },
    });
  }),
});

const calulateTotalPlanPrice = (
  plan: Plan,
  consumption: Array<Consumption>
): number => {
  switch (plan.PriceModel) {
    case PriceModel.FIXED:
      return 30 * (plan.price ?? 0);
    case PriceModel.SPOT:
      return 0;
    case PriceModel.VARIABLE:
      return 0;
  }
};
