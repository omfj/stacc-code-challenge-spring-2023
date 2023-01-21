import type { Consumption } from "@prisma/client";
import { format } from "date-fns";
import { z } from "zod";

export const hourlyPriceSchema = z.object({
  NOK_per_kWh: z.number(),
  EUR_per_kWh: z.number(),
  EXR: z.number(),
  time_start: z.string(),
  time_end: z.string(),
});

export type HourlyPrice = z.infer<typeof hourlyPriceSchema>;

export const transformHourlyPrice = (
  hourlyPrices: Array<HourlyPrice>,
  consumption?: Array<Consumption>
) => {
  return hourlyPrices.map((hour, i) => ({
    hour: format(new Date(hour.time_start), "'kl' HH:mm"),
    price: Math.trunc(hour.NOK_per_kWh * 100),
    consumption: consumption ? consumption[i]?.consumption : null,
  }));
};
