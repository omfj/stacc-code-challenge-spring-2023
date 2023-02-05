import type { PriceRegion } from "@prisma/client";
import type { Session } from "next-auth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { api } from "../utils/api";
import Button from "./Button";

interface Props {
  session: Session;
}

const Profile = ({ session }: Props) => {
  const { data: hoursOfConsumption, refetch: refetchHours } =
    api.consumption.countHours.useQuery();
  const { data: profile, refetch: refetchProfile } = api.user.info.useQuery();

  const { mutateAsync: mutateAsyncRandomEnergy } =
    api.consumption.generateRandomEnergy.useMutation();
  const { mutateAsync: mutateAsyncUpdateProfile } =
    api.user.update.useMutation();

  const handleGenerateRandomUsage = async () => {
    await toast.promise(mutateAsyncRandomEnergy(), {
      loading: "Genererer et tilfeldig forbruk...",
      success: "Forbruket er oppdatert.",
      error: "Noe gikk galt.",
    });

    await refetchHours();
  };

  const handleUpdateProfile = async (region: PriceRegion) => {
    await toast.promise(mutateAsyncUpdateProfile({ region }), {
      loading: "Oppdaterer profilen din...",
      success: "Profilen din er oppdatert.",
      error: "Noe gikk galt.",
    });

    await refetchProfile();
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-10">
      <section className="mx-auto">
        <div className="flex">
          {session.user?.image && (
            <Image
              src={session.user.image}
              className="rounded-2xl"
              alt="User photo"
              width={150}
              height={150}
            />
          )}
          <div className="ml-5 flex flex-col justify-center">
            <p className="text-xl font-bold">{session.user?.name}</p>
            <p className="text-neutral-600">{session.user?.email}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Min region</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void handleUpdateProfile("NO1")}
            intent={profile?.region === "NO1" ? "primary" : "secondary"}
          >
            Øst-Norge
          </Button>
          <Button
            onClick={() => void handleUpdateProfile("NO2")}
            intent={profile?.region === "NO2" ? "primary" : "secondary"}
          >
            Sør-Norge
          </Button>
          <Button
            onClick={() => void handleUpdateProfile("NO3")}
            intent={profile?.region === "NO3" ? "primary" : "secondary"}
          >
            Midt-Norge
          </Button>
          <Button
            onClick={() => void handleUpdateProfile("NO4")}
            intent={profile?.region === "NO4" ? "primary" : "secondary"}
          >
            Nord-Norge
          </Button>
          <Button
            onClick={() => void handleUpdateProfile("NO5")}
            intent={profile?.region === "NO5" ? "primary" : "secondary"}
          >
            Vest-Norge
          </Button>
        </div>
        <p className="text-sm italic text-neutral-800">
          Velg din region for når du skal sammenligne strømleverandører.
        </p>
      </section>

      <section className=" flex flex-col justify-center gap-3">
        <h2 className="text-xl">
          <span className="font-bold">Totalt forbruk:</span>{" "}
          {hoursOfConsumption ?? 0} timer
        </h2>
        <div>
          <Button onClick={() => void handleGenerateRandomUsage()}>
            Gi meg strøm ⚡
          </Button>
        </div>
        <p className="text-sm italic text-neutral-800">
          Siden jeg ikke faktisk kan vite hvor mye strøm du bruker må du trykke
          her for å generere en et tilfeldig forbruk.
        </p>
      </section>

      {profile?.role === "ADMIN" && (
        <section>
          <h1>You are admin</h1>
        </section>
      )}
    </div>
  );
};

export default Profile;
