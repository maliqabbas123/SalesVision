"use client"

import { useState } from "react"
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { KPICard } from "@/components/dashboard/KPICard"
import { Filters } from "@/components/dashboard/Filters"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable"
import { NLQueryBar } from "@/components/query/NLQueryBar"
import { useKPIs } from "@/hooks/useDashboard"
import { formatCurrency, formatNumber } from "@/lib/utils"
import type { DashboardFilters } from "@/types"
import { subYears, formatISO } from "date-fns"

const now = new Date()
const DEFAULT_FILTERS: DashboardFilters = {
  date_from: formatISO(subYears(now, 1), { representation: "date" }),
  date_to: formatISO(now, { representation: "date" }),
}

function KPISection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading } = useKPIs(filters)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Total Revenue" value={data ? formatCurrency(data.total_revenue) : "—"} changePct={data?.revenue_change_pct} icon={DollarSign} isLoading={isLoading} />
      <KPICard title="Total Orders" value={data ? formatNumber(data.total_orders) : "—"} changePct={data?.orders_change_pct} icon={ShoppingCart} isLoading={isLoading} />
      <KPICard title="Avg Order Value" value={data ? formatCurrency(data.avg_order_value) : "—"} icon={TrendingUp} isLoading={isLoading} />
      <KPICard title="Active Customers" value={data ? formatNumber(data.total_customers) : "—"} icon={Users} isLoading={isLoading} />
    </div>
  )
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS)
  const [activePreset, setActivePreset] = useState("1yr")

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SalesVision</h1>
            <p className="text-sm text-muted-foreground">Sales Analytics Dashboard</p>
          </div>
          <Filters filters={filters} onFiltersChange={setFilters} activePreset={activePreset} onPresetChange={setActivePreset} />
        </div>
        <KPISection filters={filters} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RevenueChart filters={filters} />
          <CategoryChart filters={filters} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsChart filters={filters} />
          <RecentOrdersTable filters={filters} />
        </div>
        <NLQueryBar />
      </div>
    </div>
  )
}
