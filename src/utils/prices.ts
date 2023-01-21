import type { Consumption } from "@prisma/client";
import { format } from "date-fns";
import type { HourlyPrice } from "@/utils/schemas";

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
