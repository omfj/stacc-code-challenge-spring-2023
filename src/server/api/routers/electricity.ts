import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { HourlyPrice } from "@/utils/schemas";
import { PriceRegion } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { z } from "zod";

export const electricityRouter = createTRPCRouter({
  /**
   * Get the electricity prices for a specific day. If the prices are not in the database, they will be fetched from the API, and then cached in the database.
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

      const electricityInfo = await ctx.prisma.electrictyInfo.findFirst({
        where: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDay() + 1,
          region,
        },
        include: {
          prices: true,
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
        return {
          message: "Det er ikke størmpriser for denne datoen",
        };
      }

      const newElectricityInfo = await ctx.prisma.electrictyInfo.create({
        data: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDay() + 1,
          region,
          prices: { create: transformElectricityPrice(data) },
        },
        include: {
          prices: true,
        },
      });

      return newElectricityInfo.prices;
    }),
});

const transformElectricityPrice = (prices: Array<HourlyPrice>) => {
  return prices.map((price) => {
    return {
      price: price.NOK_per_kWh,
      timeStart: new Date(price.time_start),
      timeEnd: new Date(price.time_end),
    };
  });
};
