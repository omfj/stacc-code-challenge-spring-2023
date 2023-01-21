import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Set random consumption range
const DAYS_TO_GENERATE = 50;
const HOURS_IN_DAY = 24;
const MIN_CONSUMPTION = 2.0;
const MAX_CONSUMPTION = 14.0;

export const energyRouter = createTRPCRouter({
  generateRandomEnergy: protectedProcedure
    .input(z.string().nullish())
    .mutation(async ({ ctx }) => {
      const startDate = new Date(
        Date.now() - DAYS_TO_GENERATE * 24 * 60 * 60 * 1000
      ).setHours(24, 0, 0, 0);

      for (let i = 0; i < DAYS_TO_GENERATE; i++) {
        for (let j = 0; j < HOURS_IN_DAY; j++) {
          const item = {
            userId: ctx.session.user.id,
            from: new Date(
              startDate + i * 24 * 60 * 60 * 1000 + j * 60 * 60 * 1000
            ),
            to: new Date(
              startDate + i * 24 * 60 * 60 * 1000 + (j + 1) * 60 * 60 * 1000
            ),
            consumption:
              Math.random() * (MAX_CONSUMPTION - MIN_CONSUMPTION) +
              MIN_CONSUMPTION,
            unit: "kWh",
          };

          /**
           * If the timeseries exist, update it. If not, create it.
           *
           * This way the user can generate new random data.
           */
          await ctx.prisma.consumption.upsert({
            create: item,
            update: item,
            where: {
              from_to: {
                from: item.from,
                to: item.to,
              },
            },
          });
        }
      }

      return true;
    }),
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
});
