"use client"

import { usePathname } from "next/navigation"

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/customers": "Customers",
  "/settings": "Settings",
  "/support": "Support",
}

export function TopBar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "SalesVision"
  return (
    <header className="flex items-center px-6 h-14 bg-white border-b border-gray-100 shrink-0">
      <span className="text-sm font-medium text-gray-500">{title}</span>
    </header>
  )
}
