import { LayoutDashboard, Car, FileText, Bell, Receipt, TrendingUp, UserCheck, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Véhicules", url: "/vehicules", icon: Car },
  { title: "Devis", url: "/devis", icon: FileText },
  { title: "Factures", url: "/factures", icon: Receipt },
  { title: "Catalogue", url: "/catalogue", icon: BookOpen },
  { title: "Clients", url: "/clients", icon: UserCheck },
  { title: "Relances", url: "/relances", icon: Bell },
  { title: "Rapport Financier", url: "/rapport-financier", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-blue-200/50 bg-white/95 text-gray-900">
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-xl border border-blue-500/40 bg-white shadow-[0_0_25px_rgba(59,130,246,0.2)] p-3">
              <img
                src="https://i.ibb.co/RT60KCss/2021-11-21.png"
                alt="Logo Sarl LS MECA"
                className="h-full w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const currentSrc = target.src;
                  if (currentSrc.includes('.png')) {
                    target.src = currentSrc.replace('.png', '.jpg');
                  } else if (currentSrc.includes('.jpg')) {
                    target.src = currentSrc.replace('.jpg', '.jpeg');
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-tight text-gray-900">Sarl LS MECA</h2>
              <p className="text-xs text-gray-600/80">Solution de gestion pour garages</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs font-bold uppercase tracking-wider text-blue-600/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-blue-50">
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-6 py-3 text-gray-700"
                      activeClassName="bg-blue-100 text-blue-700 font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-200/50 p-6">
        <p className="text-center text-xs text-gray-500">
          Prototype réalisé par<br />
          <span className="font-semibold text-blue-600">Adimi Agency</span>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
