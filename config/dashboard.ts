import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "🧑‍💻 Dashboard",
      href: "/dashboard",
    },
    {
      title: "💬 Chat",
      href: `/dashboard/chat/${Math.random().toString(36).slice(2)}`,
    },
  ],
  sidebarNav: [
    {
      title: "Home",
      href: "/dashboard",
      icon: "post",
    },
    {
      title: "Ai chat bot",
      href: `/dashboard/chat/${Math.random().toString(36).slice(2)}`,
      icon: "user",
    },
  ],
}
