import { DashboardSidebar } from "@/components/layout/navbar/dashboardNav/sideBar"
import { QueryProvider } from "@/providers/QueryProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryProvider>
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar />
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </QueryProvider>
    )
}
