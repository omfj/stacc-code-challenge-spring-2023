import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useState } from "react";
import { RegionNames } from "@/utils/schemas";
import Button from "@/components/Button";
import Head from "next/head";
import CompareGraph from "@/components/CompareGraph";

const PricesPage = () => {
  const [region, setRegion] = useState("NO1");
  const [date, setDate] = useState(new Date());

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
            {Object.entries(RegionNames).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
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
        <CompareGraph date={date} region={region} />
        <p className="font-extralight">
          Strømpriser levert av{" "}
          <a
            className="text-[#116530] underline hover:no-underline"
            href="https://www.hvakosterstrommen.no/strompris-api"
          >
            Hva koster strømmen.no
          </a>
          .
        </p>
        <div className="my-5">
          <p className="font-bold">Hvordan lese grafen:</p>
          <div className="flex flex-col gap-2 font-extralight">
            <p>
              Y-aksen til venstre viser prisen per kWh, mens y-aksen til høyre
              viser forbruket per time. En graf viser prisen og forbruket for en
              dag.
            </p>
            <p>
              For å sammenligne priser og forbruk, kan du se på hvor høy prisen
              er sammenlignet med forbruket. Hvis prisen er høy sammenlignet med
              forbruket, er det billigere å bruke strøm på andre tidspunkter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricesPage;
