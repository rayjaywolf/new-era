import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, FileText, Users, Settings } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Projects",
    icon: FileText,
    href: "/projects",
  },
  {
    label: "Workers",
    icon: Users,
    href: "/workers",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">New Era</h2>
      </div>
      <div className="flex-1 px-4">
        <nav className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-accent/50",
                pathname === route.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 mt-auto border-t">
        <div className="flex items-center gap-x-3 px-4 py-3 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
