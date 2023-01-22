import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Set random consumption range
const DAYS_TO_GENERATE = 50;
const HOURS_IN_DAY = 24;
const MIN_CONSUMPTION = 2.0;
const MAX_CONSUMPTION = 14.0;

/**
 * Generates a random number from MIN_CONSUMPTION to MAX_CONSUMPTION
 * with two decimal points
 */
const generateHourConsumption = () => {
  const consumption =
    Math.random() * (MAX_CONSUMPTION - MIN_CONSUMPTION) + MIN_CONSUMPTION;
  return Math.round(consumption * 100) / 100;
};

export const userRouter = createTRPCRouter({
  /**
   * Generate a random energy usage for the last 50 days. The energy
   * consumption will be random values.
   */
  generateRandomEnergy: protectedProcedure.mutation(async ({ ctx }) => {
    const startDate = new Date(
      Date.now() - DAYS_TO_GENERATE * 24 * 60 * 60 * 1000
    ).setHours(24, 0, 0, 0);

    await ctx.prisma.consumption.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    const items = [];
    for (let i = 0; i < DAYS_TO_GENERATE; i++) {
      for (let j = 0; j < HOURS_IN_DAY; j++) {
        items.push({
          userId: ctx.session.user.id,
          from: new Date(
            startDate + i * 24 * 60 * 60 * 1000 + j * 60 * 60 * 1000
          ),
          to: new Date(
            startDate + i * 24 * 60 * 60 * 1000 + (j + 1) * 60 * 60 * 1000
          ),
          consumption: generateHourConsumption(),
          unit: "kWh",
        });
      }
    }

    await ctx.prisma.consumption.createMany({
      data: items,
      skipDuplicates: true,
    });
  }),
  /**
   * Get the users consumption by date.
   */
  getConsumptionByDay: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.consumption.findMany({
        where: {
          userId: ctx.session.user.id,
          from: {
            gte: new Date(
              new Date(input.date).setHours(0, 0, 0, 0)
            ).toISOString(),
          },
          to: {
            lte: new Date(
              new Date(input.date).setHours(24, 0, 0, 0)
            ).toISOString(),
          },
        },
      });
    }),
  /**
   * Get the amount of hours of consumption a user has
   */
  getHoursOfConsumption: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.consumption.count({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
