import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface Session {
  user?: {
    name?: string;
    image?: string;
  };
}

export default async function HomeHeader({ session }: { session: Session }) {
  return (
    <div className="flex justify-between">
      <div>
        {/* <div className="hidden sm:flex gap-2 ring-offset-2 ring ring-primary/60 rounded-lg overflow-hidden"> */}
        <Avatar className="hidden sm:flex ring-2 ring-primary/70 ring-offset-2">
          <AvatarImage
            src={session?.user?.image || ""}
            alt={`@${session?.user?.name}`}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
