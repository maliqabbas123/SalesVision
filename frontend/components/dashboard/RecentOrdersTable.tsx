"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRecentOrders } from "@/hooks/useDashboard"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import type { DashboardFilters } from "@/types"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-100 hover:bg-red-50",
  },
}

interface RecentOrdersTableProps {
  filters?: DashboardFilters
}

export function RecentOrdersTable({ filters }: RecentOrdersTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const PAGE_SIZE = 10

  const { data, isLoading } = useRecentOrders({ ...filters, page, page_size: PAGE_SIZE })

  const rows = data?.data ?? []
  const filtered = search.trim()
    ? rows.filter((o) =>
        o.customer_name.toLowerCase().includes(search.toLowerCase())
      )
    : rows

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const from = (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, data?.total ?? 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-gray-800">Recent Orders</CardTitle>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-gray-50 border-gray-200 focus-visible:ring-indigo-400"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-6 py-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-16 text-xs font-semibold text-gray-500 pl-6">#</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Customer</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-center">Items</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 text-right pr-6">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-400 py-8">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => {
                      const status = STATUS_CONFIG[order.status]
                      return (
                        <TableRow
                          key={order.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="text-xs text-gray-400 pl-6">
                            #{order.id}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={status?.className ?? ""}
                            >
                              {status?.label ?? order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 text-center">
                            {order.items_count}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs text-gray-400 text-right pr-6">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing <span className="font-medium text-gray-600">{from}–{to}</span> of{" "}
                <span className="font-medium text-gray-600">{data?.total ?? 0}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-gray-200"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-gray-500 px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-gray-200"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
