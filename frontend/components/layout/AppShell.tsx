"use client"

import { useState } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-6 font-semibold text-lg tracking-tight">
          {collapsed ? "O" : "outLoop"}
        </div>

        <nav className="flex flex-col gap-2 px-3">
          <NavItem href="/dashboard" label="Dashboard" collapsed={collapsed} />
          <NavItem href="/vendors" label="Vendors" collapsed={collapsed} />
          <NavItem href="/items" label="Items" collapsed={collapsed} />
          <NavItem href="/transactions" label="Transactions" collapsed={collapsed} />
        </nav>

        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className="w-full rounded-xl"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "Collapse"}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden m-4">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="flex flex-col gap-3 mt-10">
            <NavItem href="/dashboard" label="Dashboard" collapsed={false} />
            <NavItem href="/vendors" label="Vendors" collapsed={false} />
            <NavItem href="/items" label="Items" collapsed={false} />
            <NavItem href="/transactions" label="Transactions" collapsed={false} />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

function NavItem({
  href,
  label,
  collapsed,
}: {
  href: string
  label: string
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100 transition"
    >
      {collapsed ? label.charAt(0) : label}
    </Link>
  )
}