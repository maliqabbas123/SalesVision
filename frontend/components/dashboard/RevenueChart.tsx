"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRevenueOverTime } from "@/hooks/useDashboard"
import { formatCurrency } from "@/lib/utils"
import type { DashboardFilters } from "@/types"

const GRANULARITIES = ["daily", "weekly", "monthly"] as const
type Granularity = (typeof GRANULARITIES)[number]

interface RevenueChartProps {
  filters?: DashboardFilters
}

export function RevenueChart({ filters }: RevenueChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("monthly")
  const { data, isLoading } = useRevenueOverTime({ ...filters, granularity })

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">Revenue Over Time</CardTitle>
        <div className="flex gap-1">
          {GRANULARITIES.map((g) => (
            <Button
              key={g}
              size="sm"
              variant={granularity === g ? "default" : "ghost"}
              onClick={() => setGranularity(g)}
              className="capitalize text-xs h-7 px-2"
            >
              {g}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.data ?? []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
