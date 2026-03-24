"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  HelpCircle, 
  FileText,
  Settings,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  full_name: string | null
  company: string | null
  avatar_url: string | null
}

interface AdminSidebarProps {
  user: User
  profile: Profile | null
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Projets",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: HelpCircle,
  },
  {
    title: "Factures",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    title: "Statistiques",
    href: "/admin/stats",
    icon: BarChart3,
  },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="font-mono text-xs font-bold text-sidebar-primary-foreground">TS</span>
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight text-sidebar-foreground">
            TS_WEB<span className="text-sidebar-primary">.lab</span>
          </span>
        </Link>
      </div>

      {/* Admin Badge */}
      <div className="border-b border-sidebar-border px-6 py-3">
        <span className="rounded-full bg-sidebar-primary/10 px-3 py-1 text-xs font-medium text-sidebar-primary">
          Administration
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20">
            <span className="text-xs font-medium text-sidebar-primary">
              {profile?.full_name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {profile?.full_name || "Admin"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Administrateur
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
