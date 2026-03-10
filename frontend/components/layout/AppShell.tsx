"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "@/lib/api/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LogOut, User, LayoutDashboard, Store, Package, Repeat, Activity } from "lucide-react"

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
  ]

  const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          {(!isMobile) && (
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

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded transition ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-3 border-t">
        {user && (
          <div className="mb-3 flex items-center gap-3 p-2 rounded bg-gray-50">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            {!isMobile && (
              <div className="flex flex-col min-w-0 text-xs">
                <span className="font-medium text-gray-900 truncate">{user.email}</span>
                <span className="text-gray-500">{user.role}</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 h-9"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-white font-[family-name:var(--font-geist-sans)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-white border-r w-64 sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900">outLoop</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5 text-gray-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}