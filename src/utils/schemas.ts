import { z } from "zod";

export const hourlyPriceSchema = z.object({
  NOK_per_kWh: z.number(),
  EUR_per_kWh: z.number(),
  EXR: z.number(),
  time_start: z.string(),
  time_end: z.string(),
});

export type HourlyPrice = z.infer<typeof hourlyPriceSchema>;

export const RegionNames = {
  NO1: "Øst-Norge",
  NO2: "Sør-Norge",
  NO3: "Midt-Norge",
  NO4: "Nord-Norge",
  NO5: "Vest-Norge",
};
