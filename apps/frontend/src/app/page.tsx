import { AuthGuard } from "@/components/auth-guard"
import { Home } from "@/components/home"

export default function Page() {
  return (
    <AuthGuard>
      <Home />
    </AuthGuard>
  )
}
