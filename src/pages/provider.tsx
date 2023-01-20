import { useSession } from "next-auth/react";

const ProviderPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <h1 className="mb-5 text-center text-3xl font-bold">
        Velg den beste leverandøren for deg
      </h1>
      {session ? (
        <p className="text-center">
          Du er logget inn som {session.user?.email}
        </p>
      ) : (
        <p className="text-center">For å kunne hjelpe deg må du logge inn.</p>
      )}
    </>
  );
};

export default ProviderPage;
