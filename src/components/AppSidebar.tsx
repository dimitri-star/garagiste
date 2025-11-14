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
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="px-6 py-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-sidebar-foreground">LORD BÂTIMENT</h2>
            <p className="text-sm text-sidebar-foreground/70">L'Excellence Appart</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 uppercase text-xs font-bold tracking-wider px-6">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground/80"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
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

      <SidebarFooter className="border-t border-sidebar-border p-6">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Prototype réalisé par<br />
          <span className="font-semibold">Adimi Agency</span>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
