import type { Session } from "next-auth";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { api } from "../utils/api";
import Button from "./Button";

interface Props {
  session: Session;
}

const Profile = ({ session }: Props) => {
  const generateEnergyMutation = api.energy.generateRandomEnergy.useMutation();

  const handleGenerateRandomUsage = () => {
    generateEnergyMutation.mutate();
    toast.success("Du har nå et forbruk!");
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex justify-center">
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
            <p className="text-lg">{session.user?.email}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-md flex-col justify-center gap-3">
        <Button onClick={handleGenerateRandomUsage}>Gi meg strøm ⚡</Button>
        <p className="italic text-neutral-800">
          Siden jeg ikke faktisk kan vite hvor mye strøm du bruker må du trykke
          her for å generere en et tilfeldig forbruk.
        </p>
      </section>
    </div>
  );
};

export default Profile;
