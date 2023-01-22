import Head from "next/head";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Strømsta — Hjem</title>
      </Head>
      <div className="flex flex-col gap-2 text-xl font-extralight">
        <div className="flex flex-col">
          <p className="text-4xl">
            Velkommen til <span className="font-semibold">Strømsta</span>!
          </p>
          <p className="font-normal italic">
            Nettsiden som hjelper deg å spare penger på strømregningen!
          </p>
        </div>

        <p>
          Vi tilbyr deg muligheten til å sammenligne ulike strømleverandører og
          tilbud, slik at du kan velge det som passer best for deg. Vi gir deg
          også verdifull innsikt i ditt strømforbruk sånn at du kan redusere
          strømforbruket ditt og spare penger på strømregningen. Besøk oss i dag
          for å se hvor mye du kan spare!
        </p>
        <p className="mt-5 text-sm font-normal italic">
          ❗Dette er en fiktiv nettside laget som en del av en kodeoppgave.
        </p>
      </div>
    </>
  );
};

export default HomePage;
