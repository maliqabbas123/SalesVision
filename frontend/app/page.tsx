"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { subDays, subMonths, subYears, formatISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable"
import { NLQueryBar } from "@/components/query/NLQueryBar"
import { useKPIs } from "@/hooks/useDashboard"
import { formatCurrency, formatNumber, formatPct, cn } from "@/lib/utils"
import type { DashboardFilters } from "@/types"

const PERIODS = [
  { value: "30d", label: "Last 30 days", getFrom: () => subDays(new Date(), 30) },
  { value: "90d", label: "Last 90 days", getFrom: () => subDays(new Date(), 90) },
  { value: "6mo", label: "Last 6 months", getFrom: () => subMonths(new Date(), 6) },
  { value: "1yr", label: "Last 12 months", getFrom: () => subYears(new Date(), 1) },
  { value: "2yr", label: "Last 2 years", getFrom: () => subYears(new Date(), 2) },
]

function makeFilters(period: string): DashboardFilters {
  const preset = PERIODS.find((p) => p.value === period) ?? PERIODS[3]
  return {
    date_from: formatISO(preset.getFrom(), { representation: "date" }),
    date_to: formatISO(new Date(), { representation: "date" }),
  }
}

interface StatRowProps {
  label: string
  value: string
  changePct?: number | null
  isLoading?: boolean
  divider?: boolean
}

function StatRow({ label, value, changePct, isLoading, divider }: StatRowProps) {
  const isPositive = changePct != null && changePct > 0
  const isNegative = changePct != null && changePct < 0

  return (
    <div className={cn("py-4", divider && "border-t border-gray-100")}>
      {isLoading ? (
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-[1.35rem] font-bold text-gray-900 leading-tight">{value}</p>
          {changePct != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium mt-1",
                isPositive && "text-emerald-600",
                isNegative && "text-red-500",
                !isPositive && !isNegative && "text-gray-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {formatPct(changePct)}
              <span className="text-gray-400 font-normal">vs prev period</span>
            </span>
          )}
        </>
      )}
    </div>
  )
}

function KPIPanel({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading } = useKPIs(filters)
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-semibold text-gray-700">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <StatRow
          label="Total Revenue"
          value={data ? formatCurrency(data.total_revenue) : "—"}
          changePct={data?.revenue_change_pct}
          isLoading={isLoading}
        />
        <StatRow
          label="Total Orders"
          value={data ? formatNumber(data.total_orders) : "—"}
          changePct={data?.orders_change_pct}
          isLoading={isLoading}
          divider
        />
        <StatRow
          label="Avg. Order Value"
          value={data ? formatCurrency(data.avg_order_value) : "—"}
          isLoading={isLoading}
          divider
        />
        <StatRow
          label="Active Customers"
          value={data ? formatNumber(data.total_customers) : "—"}
          isLoading={isLoading}
          divider
        />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("1yr")
  const filters = makeFilters(period)

  return (
    <div className="space-y-5">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track revenue, orders, and customer activity
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44 h-9 bg-white border-gray-200 text-sm shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue chart + KPI stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RevenueChart filters={filters} />
        </div>
        <KPIPanel filters={filters} />
      </div>

      {/* Secondary charts */}
      <div className="grid grid-cols-2 gap-4">
        <CategoryChart filters={filters} />
        <TopProductsChart filters={filters} />
      </div>

      {/* Orders table — full width */}
      <RecentOrdersTable filters={filters} />

      {/* NL Query */}
      <NLQueryBar />
    </div>
  )
}
