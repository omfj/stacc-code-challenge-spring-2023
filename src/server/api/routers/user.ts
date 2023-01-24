import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Role, Unit } from "@prisma/client";
import { add, sub } from "date-fns";

// Set random consumption range
const DAYS_TO_GENERATE = 50;
const HOURS_IN_DAY = 24;

/**
 * Generates a random number from MIN_CONSUMPTION to MAX_CONSUMPTION
 * with two decimal points
 *
 * Early: 2 - 5 kWh
 * Daytime: 5 - 12 kWh
 */
const generateHourConsumption = (date: Date) => {
  if (date.getHours() < 22 && date.getHours() > 7) {
    const consumption = Math.random() * (12 - 5) + 5;
    return Math.round(consumption * 100) / 100;
  }

  const consumption = Math.random() * (5 - 2) + 2;
  return Math.round(consumption * 100) / 100;
};

export const userRouter = createTRPCRouter({
  /**
   * Generate a random energy usage for the last 50 days. The energy
   * consumption will be random values.
   *
   * Using `deleteMany` and `createMany` is faster than looping over `upsert`.
   */
  generateRandomEnergy: protectedProcedure.mutation(async ({ ctx }) => {
    const startDate = sub(new Date(), {
      days: DAYS_TO_GENERATE,
    }).setHours(24, 0, 0, 0);

    await ctx.prisma.consumption.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    const consumptionHours = [];
    for (let i = 0; i < DAYS_TO_GENERATE; i++) {
      for (let j = 0; j < HOURS_IN_DAY; j++) {
        consumptionHours.push({
          userId: ctx.session.user.id,
          from: add(startDate, {
            days: i,
            hours: j,
          }),
          to: add(startDate, {
            days: i,
            hours: j + 1,
          }),
          consumption: generateHourConsumption(
            add(startDate, {
              days: i,
              hours: j,
            })
          ),
          unit: Unit.KWH,
        });
      }
    }

    await ctx.prisma.consumption.createMany({
      data: consumptionHours,
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

  /**
   * Check if user is admin or not
   */
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    return user?.role === Role.ADMIN;
  }),
});
