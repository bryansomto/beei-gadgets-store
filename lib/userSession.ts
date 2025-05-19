import { useSession } from "next-auth/react"

export default function useUser() {
  const { data: session, status } = useSession()
  const user = session?.user
  return {
    session,
    user: session?.user,
    isAdmin: user?.isAdmin ?? false,
    image: user?.image || "",
    initials: user?.initials || "",
    status,
    loading: status === "loading",
    authenticated: status === "authenticated",
  }
}
