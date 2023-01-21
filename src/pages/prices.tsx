import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ResponsiveContainer,
  Label,
  ComposedChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useEffect, useState } from "react";
import axios from "axios";
import type { HourlyPrice } from "@/utils/schemas";
import { hourlyPriceSchema } from "@/utils/schemas";
import { transformHourlyPrice } from "@/utils/prices";
import type { ErrorWithMessage } from "@/utils/error";
import { isErrorWithMessage } from "@/utils/error";
import Button from "@/components/Button";
import { api } from "@/utils/api";
import Head from "next/head";

const PricesPage = () => {
  const [region, setRegion] = useState("NO1");
  const [date, setDate] = useState(new Date());
  const [electricityPrices, setElectricityPrices] = useState<
    | Array<{
        hour: string;
        price: number;
        consumption: number | null | undefined;
      }>
    | ErrorWithMessage
  >([]);

  const { data: consumption } = api.energy.getConsumptionByDay.useQuery({
    date: date,
  });

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      const year = format(date, "yyyy");
      const month = format(date, "MM");
      const day = format(date, "dd");

      const { data, status } = await axios.get<Array<HourlyPrice>>(
        `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`,
        {
          validateStatus: (status) => status < 500,
        }
      );

      switch (status) {
        case 200:
          const parsedHourlyPrice = hourlyPriceSchema.array().safeParse(data);

          if (!parsedHourlyPrice.success) {
            setElectricityPrices({
              message: "Noe gikk feil.",
            });
            return;
          }

          const prices = transformHourlyPrice(
            parsedHourlyPrice.data,
            consumption
          );
          setElectricityPrices(prices);
          break;
        case 404:
          setElectricityPrices({
            message: "Ingen priser for denne dagen.",
          });
          break;
        default:
          setElectricityPrices({
            message: "Noe gikk feil.",
          });
          break;
      }
    };

    void fetchElectricityPrices();
  }, [consumption, date, region]);

  const handleBack = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
  };

  const handleForward = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  };

  return (
    <>
      <Head>
        <title>Strømsta — Sammenligne</title>
      </Head>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <p className="text-xl font-bold">Vis priser for:</p>
          <select
            className="mx-2 rounded-md py-1"
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="NO1">Øst-Norge</option>
            <option value="NO2">Sør-Norge</option>
            <option value="NO3">Midt-Norge</option>
            <option value="NO4">Nord-Norge</option>
            <option value="NO5">Vest-Norge</option>
          </select>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="flex flex-1 gap-2">
            <Button onClick={handleBack}>Forrige dag</Button>
            <Button onClick={() => setDate(new Date())}>I dag</Button>
            <Button onClick={handleForward}>Neste dag</Button>
          </div>
          <div>
            <p>
              Dato:{" "}
              <span className="font-bold">
                {format(date, "dd MMM yyyy", { locale: nb })}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="my-10 mx-auto">
        {isErrorWithMessage(electricityPrices) ? (
          <p>{electricityPrices.message}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={electricityPrices}>
              <CartesianGrid strokeDasharray="3 3 1" />

              <YAxis yAxisId="right" orientation="right">
                <Label value="Forbruk" angle={90} />
              </YAxis>
              <YAxis yAxisId="left" orientation="left">
                <Label value="Pris" angle={-90} position="insideLeft" />
              </YAxis>

              <XAxis dataKey="hour" interval="preserveStartEnd" />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "Pris") {
                    return `${value.toString()} øre/kWh`;
                  }

                  if (name === "Forbruk") {
                    return `${value.toString()} kWh`;
                  }

                  return value;
                }}
              />

              <Bar
                yAxisId="right"
                dataKey="consumption"
                name="Forbruk"
                fill="#8884d8"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Pris"
                stroke="#4ADE80"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
};

export default PricesPage;
