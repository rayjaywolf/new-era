"use client"

import { ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProjectSidebar } from "@/components/dashboard/project-sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  
  // Check if we're in a project route and extract the project ID
  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/)
  const projectId = projectMatch ? projectMatch[1] : null
  
  const SidebarComponent = projectId ? 
    () => <ProjectSidebar projectId={projectId} /> : 
    Sidebar

  return (
    <div className="h-full relative">
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <SidebarComponent />
      </div>
      <div className={cn(
        "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 bg-background w-72 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarComponent />
        </div>
      </div>
      <main className="md:pl-72 pt-16 h-full">
        <div className="h-full p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
