import { DashboardSidebar } from "@/components/layout/navbar/dashboardNav/sideBar"
import { QueryProvider } from "@/providers/QueryProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryProvider>
            <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
                <DashboardSidebar />
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>
        </QueryProvider>
    )
}
