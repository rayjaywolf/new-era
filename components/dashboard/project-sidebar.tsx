import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  Settings,
  Clock,
  Hammer,
  Truck,
  ArrowLeft,
} from "lucide-react";

interface ProjectSidebarProps {
  projectId: string;
}

const projectRoutes = (projectId: string) => [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: `/projects/${projectId}`,
  },
  {
    label: "Attendance",
    icon: Clock,
    href: `/projects/${projectId}/attendance`,
  },
  {
    label: "Workers",
    icon: Users,
    href: `/projects/${projectId}/workers`,
  },
  {
    label: "Materials",
    icon: Truck,
    href: `/projects/${projectId}/material`,
  },
  {
    label: "Machinery",
    icon: Hammer,
    href: `/projects/${projectId}/machinery`,
  },
  {
    label: "Settings",
    icon: Settings,
    href: `/projects/${projectId}/settings`,
  },
];

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const routes = projectRoutes(projectId);

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6">
        <Link
          href="/projects"
          className="flex items-center gap-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
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
      </ScrollArea>
      <div className="p-4 mt-auto border-t">
        <div className="flex items-center gap-x-3 px-4 py-3 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span>Project Settings</span>
        </div>
      </div>
    </div>
  );
}
