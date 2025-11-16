import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Link } from "react-router-dom";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-black via-black to-red-950/70 text-white">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-red-900/40 bg-black/80 px-6 backdrop-blur-xl">
            <SidebarTrigger />
            <Link to="/login">
              <ShimmerButton
                shimmerColor="#fecaca"
                background="rgba(15,15,15,0.9)"
                className="px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                Déconnexion
              </ShimmerButton>
            </Link>
          </header>
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
