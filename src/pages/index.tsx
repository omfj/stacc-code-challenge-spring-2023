const Home = () => {
  return (
    <>
      <div className="flex flex-col gap-2 text-xl">
        <div className="flex flex-col">
          <p className="text-4xl">
            Velkommen til <span className="font-bold">Strømsta</span>!
          </p>
          <p className="italic">
            Nettsiden som hjelper deg å spare penger på strømregningen!
          </p>
        </div>

        <p>
          Vi tilbyr deg muligheten til å sammenligne ulike strømleverandører og
          tilbud, slik at du kan velge det som passer best for deg og din
          familie. Vi gir deg også verdifulle tips om hvordan du kan redusere
          strømforbruket ditt og spare penger på strømregningen. Besøk oss i dag
          for å se hvor mye du kan spare!
        </p>
        <p className="mt-5 text-sm italic">
          * Dette er en fiktiv nettside laget som en del av en kodeoppgave.
        </p>
      </div>
    </>
  );
};

export default Home;
