import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-white via-blue-50/30 to-white text-gray-900">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-blue-200/50 bg-white/80 px-6 backdrop-blur-xl">
            <SidebarTrigger />
            <ShimmerButton
              onClick={handleLogout}
              shimmerColor="#dbeafe"
              background="linear-gradient(135deg, rgba(37,99,235,1), rgba(59,130,246,1))"
              className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Déconnexion
            </ShimmerButton>
          </header>
          <main className="flex-1 p-6 lg:p-8 bg-white">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
