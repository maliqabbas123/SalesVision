"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTopProducts } from "@/hooks/useDashboard"
import { formatCurrency } from "@/lib/utils"
import type { DashboardFilters } from "@/types"

interface TopProductsChartProps {
  filters?: DashboardFilters
}

export function TopProductsChart({ filters }: TopProductsChartProps) {
  const { data, isLoading } = useTopProducts({ ...filters, limit: 8 })

  const chartData = (data?.data ?? []).map((p) => ({
    name: p.name.length > 22 ? p.name.slice(0, 22) + "…" : p.name,
    revenue: Number(p.total_revenue),
    units: p.units_sold,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Products by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip formatter={(value) => [formatCurrency(value as number), "Revenue"]} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
