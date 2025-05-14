import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 w-full overflow-auto">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}