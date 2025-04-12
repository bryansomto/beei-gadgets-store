import HomeStats from "./components/HomeStats";
import HomeHeader from "./components/HomeHeader";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { auth } from "@/auth";
import Nav from "./components/SideNavbar";
import { notFound } from "next/navigation";

export default async function Home() {
  const session = await auth();
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  if (!isAdmin) {
    return notFound();
  }
  return (
    <MaxWidthWrapper>
      <div className="bg-bgGray min-h-screen ">
        <div className="sm:hidden flex items-center justify-center p-2"></div>

        <div className="flex">
          <Nav />
          <div className="flex-grow p-4">
            <HomeHeader />
            <HomeStats />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
