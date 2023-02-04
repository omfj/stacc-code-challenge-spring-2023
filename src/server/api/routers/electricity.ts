import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { HourlyPrice } from "@/utils/schemas";
import type { PrismaClient } from "@prisma/client";
import { PriceRegion } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { format, sub } from "date-fns";
import { z } from "zod";

const getElectricityPrices = async (
  date: Date,
  region: PriceRegion,
  prisma: PrismaClient
) => {
  const electricityInfo = await prisma.electrictyInfo.findFirst({
    where: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDay() + 1,
      region,
    },
    include: {
      prices: {
        orderBy: {
          timeStart: "asc",
        },
      },
    },
  });

  if (electricityInfo) {
    return electricityInfo.prices;
  }

  const year = format(date, "yyyy");
  const month = format(date, "MM");
  const day = format(date, "dd");

  /**
   * API requires the date to be in the format of yyyy/MM-dd_region.json
   * Example: https://www.hvakosterstrommen.no/api/v1/prices/2021/01-03_NO2.json
   */
  const { data, status } = await axios.get<Array<HourlyPrice>>(
    `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`,
    {
      validateStatus: (status) => status < 500,
    }
  );

  if (status !== 200) {
    throw new TRPCError({
      message: "Finner ikke strømpriser for denne datoen",
      code: "NOT_FOUND",
    });
  }

  return (
    await prisma.electrictyInfo.create({
      data: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDay() + 1,
        region,
        prices: { create: transformElectricityPrice(data) },
      },
      include: {
        prices: {
          orderBy: {
            timeStart: "asc",
          },
        },
      },
    })
  ).prices;
};

export const electricityRouter = createTRPCRouter({
  /**
   * Get the electricity prices for a specific day. If the prices are not in the
   * database, they will be fetched from the API, and then cached in the
   * database.
   * @param {Date} date The date to get the prices for
   * @param {PriceRegion} region The region to get the prices for
   * @retruns {Array<HourlyPrice>} An array of hourly prices for the given day
   */
  getByDay: publicProcedure
    .input(
      z.object({
        date: z.date(),
        region: z.nativeEnum(PriceRegion),
      })
    )
    .query(async ({ ctx, input }) => {
      const { date, region } = input;

      return await getElectricityPrices(date, region, ctx.prisma);
    }),

  /**
   * Get the electricity prices for a specific month. If the prices are not in
   * the database, store them in the database.
   */
  getPricesForLastNDays: publicProcedure
    .input(
      z.object({
        days: z.number().min(1),
        region: z.nativeEnum(PriceRegion),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Make functional
      const promiseArray = [];
      for (let i = 0; i < input.days; i++) {
        const date = sub(new Date(), { days: i });
        promiseArray.push(getElectricityPrices(date, input.region, ctx.prisma));
      }

      const prices = await Promise.all(promiseArray);

      return prices.flat();
    }),
});

/**
 * Transform the prices from the API to the format we want to store in the
 * database
 * @param prices you want to transform
 * @returns The transformed prices
 */
const transformElectricityPrice = (prices: Array<HourlyPrice>) => {
  return prices.map((price) => {
    return {
      price: price.NOK_per_kWh,
      timeStart: new Date(price.time_start),
      timeEnd: new Date(price.time_end),
    };
  });
};
