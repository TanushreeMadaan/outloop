"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/lib/api/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User, LayoutDashboard, Store, Package, Repeat, Activity, BarChart3 } from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

function SidebarContent({
  filteredNavItems,
  pathname,
  user,
  handleLogout,
  isMobile = false,
}: {
  filteredNavItems: NavItem[]
  pathname: string
  user: Awaited<ReturnType<typeof getMe>> | undefined
  handleLogout: () => void
  isMobile?: boolean
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-center">
          {!isMobile && (
            <Image
              src="/outloop-logo.svg"
              alt="Logo"
              width={180}
              height={49}
              className="rounded"
            />
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[1rem] px-3.5 py-2.5 transition-all duration-200 ${isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_18px_40px_-30px_rgba(31,122,140,0.85)]"
                : "text-sidebar-foreground/78 hover:bg-white/6 hover:text-sidebar-foreground"
                }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"}`} />
              <span className="text-sm font-medium tracking-[-0.01em]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent/20 text-sidebar-accent-foreground">
              <User className="w-4 h-4" />
            </div>
            {!isMobile && (
              <div className="flex min-w-0 flex-col text-xs">
                <span className="truncate font-medium text-sidebar-foreground">{user.email}</span>
                <span className="text-sidebar-foreground/55">{user.role}</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-3 rounded-[1rem] text-sidebar-foreground/72 hover:bg-white/6 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  })

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vendors", label: "Vendors", icon: Store },
    { href: "/items", label: "Items", icon: Package },
    { href: "/departments", label: "Departments", icon: Store, adminOnly: true },
    { href: "/transactions", label: "Transactions", icon: Repeat },
    { href: "/audit", label: "Audit Logs", icon: Activity, adminOnly: true },
    { href: "/users", label: "Users", icon: User, adminOnly: true },
    { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  ]

  const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

  return (
    <div className="relative flex min-h-screen bg-transparent font-[family-name:var(--font-geist-sans)] text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-sidebar md:flex">
        <SidebarContent filteredNavItems={filteredNavItems} pathname={pathname} user={user} handleLogout={handleLogout} />
      </aside>

      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-sidebar px-4 md:hidden">
        <span className="text-sm font-semibold tracking-[-0.02em] text-sidebar-foreground">outLoop</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/10 bg-white/5 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r border-white/10 bg-sidebar p-0">
            <SidebarContent filteredNavItems={filteredNavItems} pathname={pathname} user={user} handleLogout={handleLogout} isMobile />
          </SheetContent>
        </Sheet>
      </div>

      <main className="relative min-h-screen min-w-0 flex-1 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
