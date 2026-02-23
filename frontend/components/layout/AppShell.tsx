"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/lib/api/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User, ChevronRight, LayoutDashboard, Store, Package, Repeat, Activity } from "lucide-react"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
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
    { href: "/transactions", label: "Transactions", icon: Repeat },
    { href: "/departments", label: "Departments", icon: Store, adminOnly: true },
    { href: "/audit", label: "Audit Logs", icon: Activity, adminOnly: true },
  ]

  const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      <div className={`p-4 flex items-center gap-3 border-b border-gray-100/50 ${collapsed && !isMobile ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-sm shadow-purple-900/10">
            OL
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-bold text-lg tracking-tight text-purple-900 truncate uppercase">outLoop</span>
          )}
        </div>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 ${!collapsed ? "rotate-180" : ""}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      <nav className="flex flex-col gap-1.5 px-3 py-4 flex-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-900/5"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                } ${collapsed && !isMobile ? "justify-center px-0" : ""}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              {(!collapsed || isMobile) && <span className="text-[13px] font-semibold">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />}
            </Link>
          )
        })}
      </nav>

      {/* Profile Section */}
      <div className={`mt-auto p-3 border-t bg-gray-50/50 ${collapsed && !isMobile ? "items-center" : ""}`}>
        {user && (
          <div className={`mb-3 flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-100 shadow-sm ${collapsed && !isMobile ? "justify-center px-2" : ""}`}>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-gray-900 truncate">{user.email}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded w-fit">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Button
            variant="ghost"
            className={`w-full h-10 rounded-xl justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors ${collapsed && !isMobile ? "justify-center px-0" : "px-3"}`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span className="text-xs font-bold">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ${collapsed ? "w-20" : "w-64"
          } sticky top-0 h-screen overflow-hidden`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            OL
          </div>
          <span className="font-bold text-lg tracking-tight text-purple-900">outLoop</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen ${collapsed ? "md:pl-0" : ""} pt-16 md:pt-0`}>
        {children}
      </main>
    </div>
  )
}