import HomeStats from "./components/HomeStats";
import HomeHeader from "./components/HomeHeader";
import Layout from "./components/Layout";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/isUserAdmin";
import SideNavbar from "./components/MenuBar";

export default async function Home() {
  const session = await auth();
  if (!session || !isUserAdmin(session.user?.email)) {
    redirect("/");
  }
  return (
    <Layout>
      <p>Home</p>
    </Layout>
  );
}
