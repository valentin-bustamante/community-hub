import { SidebarProvider } from "@/components/blocks/sidebar"
import { Home } from "@/components/home"

export default function Page() {
  return (
    <SidebarProvider>
      <Home />
    </SidebarProvider>
  )
}
