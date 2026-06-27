"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  HelpCircle,
  BarChart2,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_WORK = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/customers", icon: Users, label: "Customers" },
]

const NAV_OTHER = [
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: HelpCircle, label: "Support" },
]

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-indigo-600" : "text-gray-400"
        )}
      />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 shrink-0 min-h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-gray-100">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 shrink-0">
          <BarChart2 className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-sm tracking-tight">
          SalesVision
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg bg-gray-50 border border-gray-200 cursor-text">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 flex-1">Search…</span>
          <kbd className="text-[10px] text-gray-300 font-medium">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-5">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Work
          </p>
          <ul className="space-y-0.5">
            {NAV_WORK.map((item) => (
              <li key={item.href}>
                <NavItem {...item} active={pathname === item.href} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Others
          </p>
          <ul className="space-y-0.5">
            {NAV_OTHER.map((item) => (
              <li key={item.href}>
                <NavItem {...item} active={pathname === item.href} />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-indigo-700">AA</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">Abbas Ahmad</p>
            <p className="text-[10px] text-gray-400 truncate">
              abbas.ahmad@triplek.tech
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
