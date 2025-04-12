import { auth } from "@/auth";
import Image from "next/image";

export default async function HomeHeader() {
  const session = await auth();
  if (!session?.user) return null;
  return (
    <div className="text-blue-900 flex justify-between">
      <h2 className="mt-0">
        <div className="flex gap-2 items-center">
          <Image
            src={session?.user?.image || ""}
            alt={`An image of ${session.user.name}`}
            width={24}
            height={24}
            className="rounded-md sm:hidden"
          />
          <div>
            Hello, <b>{session.user.name}</b>
          </div>
        </div>
      </h2>
      <div>
        <div className="hidden sm:flex bg-gray-300 gap-1 text-black rounded-lg overflow-hidden">
          <Image
            src={session.user.image || ""}
            alt={`An image of ${session.user.name}`}
            width={24}
            height={24}
          />
          <span className="px-2 hidden sm:block">{session.user.name}</span>
        </div>
      </div>
    </div>
  );
}
