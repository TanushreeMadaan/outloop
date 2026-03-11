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
    <div className="flex h-full flex-col bg-sidebar/80 text-sidebar-foreground backdrop-blur-xl">
      <div className="border-b border-white/60 px-5 py-5">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Image
              src="/logo-w-name.png"
              alt="Logo"
              width={180}
              height={80}
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
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_18px_40px_-28px_rgba(124,136,214,0.9)] hairline-border"
                : "text-sidebar-foreground/85 hover:bg-white/65 hover:text-foreground"
                }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-sidebar-accent-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span className="text-sm font-medium tracking-[-0.01em]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/60 p-3">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-[1.15rem] border border-white/65 bg-white/70 p-3 backdrop-blur-sm">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(190,220,255,0.9),rgba(220,229,255,0.75))] text-[rgb(96,111,176)]">
              <User className="w-4 h-4" />
            </div>
            {!isMobile && (
              <div className="flex min-w-0 flex-col text-xs">
                <span className="truncate font-medium text-foreground">{user.email}</span>
                <span className="text-muted-foreground">{user.role}</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-3 rounded-[1rem] text-[rgb(181,106,114)] hover:bg-[rgba(238,208,211,0.45)] hover:text-[rgb(154,82,91)]"
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
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(190,220,255,0.8),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,218,204,0.72),transparent_68%)] blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(222,239,229,0.58),transparent_68%)] blur-3xl" />
      </div>

      <aside className="app-shell-surface hairline-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/65 md:flex">
        <SidebarContent filteredNavItems={filteredNavItems} pathname={pathname} user={user} handleLogout={handleLogout} />
      </aside>

      <div className="app-shell-surface hairline-border fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/65 px-4 md:hidden">
        <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">outLoop</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-white/70 bg-white/75">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r border-white/65 p-0">
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
