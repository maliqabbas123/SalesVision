"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSalesByCategory } from "@/hooks/useDashboard"
import { formatCurrency } from "@/lib/utils"
import type { DashboardFilters } from "@/types"

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"]

interface CategoryChartProps {
  filters?: Pick<DashboardFilters, "date_from" | "date_to">
}

export function CategoryChart({ filters }: CategoryChartProps) {
  const { data, isLoading } = useSalesByCategory(filters)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.data ?? []}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {(data?.data ?? []).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Revenue"]}
              />
              <Legend
                formatter={(value, entry: { payload?: { percentage?: number } }) =>
                  `${value} (${entry.payload?.percentage?.toFixed(1)}%)`
                }
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
