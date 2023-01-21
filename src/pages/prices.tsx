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
import { hourlyPriceSchema, transformHourlyPrice } from "@/utils/schemas";
import type { ErrorWithMessage } from "@/utils/error";
import { isErrorWithMessage } from "@/utils/error";
import Button from "@/components/Button";
import { api } from "@/utils/api";

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
      const { year, month, day } = {
        year: format(date, "yyyy"),
        month: format(date, "MM"),
        day: format(date, "dd"),
      };

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
      <h1 className="text-2xl font-bold">Sammenligne-side</h1>

      <select
        className="rounded-md"
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="NO1">Øst-Norge</option>
        <option value="NO2">Sør-Norge</option>
        <option value="NO3">Midt-Norge</option>
        <option value="NO4">Nord-Norge</option>
        <option value="NO5">Vest-Norge</option>
      </select>

      <div className="my-8 flex items-center">
        <div className="flex flex-1 gap-2">
          <Button size="small" onClick={handleBack}>
            Forrige dag
          </Button>
          <Button size="small" onClick={() => setDate(new Date())}>
            I dag
          </Button>
          <Button size="small" onClick={handleForward}>
            Neste dag
          </Button>
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

      <div className="my-5 mx-auto">
        {isErrorWithMessage(electricityPrices) ? (
          <p>{electricityPrices.message}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={electricityPrices}>
              <CartesianGrid strokeDasharray="3 3 1" />

              <YAxis yAxisId="right" orientation="right">
                <Label value="Forbruk" angle={90} />
              </YAxis>
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, "dataMax + 20"]}
              >
                <Label value="Pris" angle={-90} position="insideLeft" />
              </YAxis>

              <XAxis dataKey="hour" interval={3} />

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
