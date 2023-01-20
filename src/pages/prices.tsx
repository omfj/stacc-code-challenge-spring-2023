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

const PricesPage = () => {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<
    | Array<{ hour: string; price: number; consumption: number }>
    | ErrorWithMessage
  >([]);

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      const { year, month, day } = {
        year: format(date, "yyyy"),
        month: format(date, "MM"),
        day: format(date, "dd"),
      };
      const location = "NO5";

      const { data, status } = await axios.get<Array<HourlyPrice>>(
        `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${location}.json`,
        {
          validateStatus: (status) => status < 500,
        }
      );

      switch (status) {
        case 200:
          const parsedData = hourlyPriceSchema.array().safeParse(data);

          if (!parsedData.success) {
            setData({
              message: "Noe gikk feil.",
            });
            return;
          }

          const prices = transformHourlyPrice(parsedData.data);

          setData(prices);
          break;
        case 404:
          setData({
            message: "Ingen priser for denne dagen.",
          });
          break;
        default:
          setData({
            message: "Noe gikk feil.",
          });
          break;
      }
    };

    void fetchElectricityPrices();
  }, [date]);

  const handleBack = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
  };

  const handleForward = () => {
    setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Sammenligne-side</h1>

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
        {isErrorWithMessage(data) ? (
          <p>{data.message}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="10 3" />

              <YAxis yAxisId="right" orientation="right">
                <Label value="Forbruk" angle={90} />
              </YAxis>
              <YAxis yAxisId="left" orientation="left">
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
                name="Forbruk"
                dataKey="consumption"
                yAxisId="right"
                fill="#8b5cf6"
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
