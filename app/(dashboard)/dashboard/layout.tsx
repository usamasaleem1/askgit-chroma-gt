import { notFound } from "next/navigation"
import { DashboardNav } from "@/components/layout/nav"
import { NavBar } from "@/components/layout/navbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { dashboardConfig } from "@/config/dashboard"
import { getCurrentUser } from "@/lib/session"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser()

  return (

    <div className="flex min-h-screen flex-col space-y-0">
      <NavBar user={user} items={dashboardConfig.mainNav} scroll={false} >
        <DashboardNav items={dashboardConfig.sidebarNav} />
      </NavBar>

      {/* <div style={{ marginTop: 0 }} className="p-2 h-screen w-screen grid flex-1 md:grid-cols-[200px_1fr]"> */}
      <div className="flex flex-1">
        <main className="flex w-screen h-screen flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
