import { DashboardSidebar } from "@/components/layout/navbar/dashboardNav/sideBar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8">{children}</div>
    </div>
  )
}
