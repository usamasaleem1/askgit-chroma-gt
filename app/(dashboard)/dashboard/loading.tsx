import { CardSkeleton } from "@/components/shared/card-skeleton"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="divide-border-200 divide-y rounded-md border" style={{
        margin: "2em"
      }}>
        <CardSkeleton />
      </div>
    </DashboardShell>
  )
}
