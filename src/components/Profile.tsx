import type { Session } from "next-auth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { api } from "../utils/api";
import Button from "./Button";

interface Props {
  session: Session;
}

const Profile = ({ session }: Props) => {
  const { data: hoursOfConsumption } =
    api.user.getHoursOfConsumption.useQuery();
  const { mutateAsync } = api.user.generateRandomEnergy.useMutation();

  const handleGenerateRandomUsage = () => {
    void toast.promise(mutateAsync(), {
      loading: "Genererer et tilfeldig forbruk...",
      success: "Forbruket er oppdatert.",
      error: "Noe gikk galt.",
    });
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

      <section className=" flex flex-col justify-center gap-3">
        <p className="text-xl">
          <span className="font-bold">Totalt forbruk:</span>{" "}
          {hoursOfConsumption ?? 0} timer
        </p>
        <Button onClick={handleGenerateRandomUsage}>Gi meg strøm ⚡</Button>
        <p className="text-sm italic text-neutral-800">
          Siden jeg ikke faktisk kan vite hvor mye strøm du bruker må du trykke
          her for å generere en et tilfeldig forbruk.
        </p>
      </section>
    </div>
  );
};

export default Profile;
