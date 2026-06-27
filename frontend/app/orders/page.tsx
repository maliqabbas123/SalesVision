"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react"
import { ordersApi } from "@/lib/api"
import { formatCurrency, cn } from "@/lib/utils"
import type { OrderOut, OrderDetailOut, OrderStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

const PAGE_SIZE = 15

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-100 hover:bg-red-50" },
}

export default function OrdersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [detailOrder, setDetailOrder] = useState<OrderDetailOut | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, debouncedSearch, statusFilter],
    queryFn: () =>
      ordersApi.list({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  })

  async function openDetail(order: OrderOut) {
    const detail = await ordersApi.get(order.id)
    setDetailOrder(detail)
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      if (detailOrder && detailOrder.id === updated.id) {
        setDetailOrder((prev) => prev ? { ...prev, status: updated.status } : null)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ordersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); setDeleteId(null) },
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search customer…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-8 h-9 bg-white border-gray-200 text-sm"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1) }}>
          <SelectTrigger className="w-40 h-9 bg-white border-gray-200 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 pl-5 w-20">Order</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Status</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-center">Items</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Date</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : (data?.data ?? []).map((order) => {
                  const status = STATUS_CONFIG[order.status]
                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-5 text-xs text-gray-400 font-mono">#{order.id}</TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status?.className ?? ""}>{status?.label ?? order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 text-center">{order.items_count}</TableCell>
                      <TableCell className="text-sm font-semibold text-gray-900 text-right">{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell className="text-xs text-gray-400 text-right">{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={() => openDetail(order)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => setDeleteId(order.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <span className="font-medium text-gray-600">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, data?.total ?? 0)}</span> of{" "}
            <span className="font-medium text-gray-600">{data?.total ?? 0}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7 border-gray-200" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-7 w-7 border-gray-200" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={detailOrder !== null} onOpenChange={(o) => !o && setDetailOrder(null)}>
        <DialogContent className="max-w-2xl">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{detailOrder.id}</DialogTitle>
                <DialogDescription>{detailOrder.customer_name} · {format(new Date(detailOrder.created_at), "MMMM d, yyyy")}</DialogDescription>
              </DialogHeader>
              <div className="px-6 space-y-4">
                {/* Status row */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant="outline" className={STATUS_CONFIG[detailOrder.status]?.className ?? ""}>
                      {STATUS_CONFIG[detailOrder.status]?.label ?? detailOrder.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(detailOrder.total_amount)}</p>
                  </div>
                </div>

                {/* Change status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">Change status:</span>
                  {(["completed", "pending", "cancelled"] as OrderStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={detailOrder.status === s ? "default" : "outline"}
                      className={cn("h-7 text-xs capitalize", detailOrder.status === s && "bg-indigo-600 hover:bg-indigo-700")}
                      disabled={statusMutation.isPending}
                      onClick={() => {
                        statusMutation.mutate({ id: detailOrder.id, status: s })
                        setDetailOrder((prev) => prev ? { ...prev, status: s } : null)
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>

                {/* Items table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-500 pl-4">Product</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500">SKU</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 text-center">Qty</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 text-right">Unit</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 text-right pr-4">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium text-gray-900 pl-4">{item.product_name}</TableCell>
                          <TableCell className="text-xs text-gray-400 font-mono">{item.product_sku}</TableCell>
                          <TableCell className="text-sm text-gray-600 text-center">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-sm font-semibold text-gray-900 text-right pr-4">{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOrder(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>This will permanently delete order #{deleteId} and all its items. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
