import { LayoutDashboard, Building2, Users, Bell, FileText } from "lucide-react";
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
  { title: "Chantiers", url: "/chantiers", icon: Building2 },
  { title: "Prestataires", url: "/prestataires", icon: Users },
  { title: "Relances", url: "/relances", icon: Bell },
  { title: "Documents", url: "/documents", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-red-900/40 bg-black/95 text-white">
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="flex flex-col items-start gap-3">
            <div className="flex h-10 w-24 items-center justify-center overflow-hidden rounded-xl border border-red-200/40 bg-black/70 shadow-[0_0_25px_rgba(248,113,113,0.45)]">
              <img
                src="https://media.licdn.com/dms/image/v2/D4D0BAQGWSozeUxWAIA/company-logo_200_200/B4DZbyPbPoGYAI-/0/1747820855073?e=1764806400&v=beta&t=udXEer9_yiMYDEi1x8nhZbawo-CtxsWZFgdoOPWzxfE"
                alt="Logo Nougarede Peinture"
                className="h-9 w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold tracking-tight text-white">LORD BÂTIMENT</h2>
              <p className="text-xs text-red-100/80">L&apos;Excellence Appart</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs font-bold uppercase tracking-wider text-red-100/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-red-900/40">
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-6 py-3 text-red-100/80"
                      activeClassName="bg-red-900/60 text-red-50 font-semibold"
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

      <SidebarFooter className="border-t border-red-900/40 p-6">
        <p className="text-center text-xs text-red-100/60">
          Prototype réalisé par<br />
          <span className="font-semibold text-red-100">Adimi Agency</span>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
