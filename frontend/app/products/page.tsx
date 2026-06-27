"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { productsApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { Product, ProductCreate, ProductCategory } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const CATEGORIES: ProductCategory[] = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports"]

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "bg-blue-50 text-blue-700 border-blue-100",
  Clothing: "bg-pink-50 text-pink-700 border-pink-100",
  Books: "bg-amber-50 text-amber-700 border-amber-100",
  "Home & Garden": "bg-green-50 text-green-700 border-green-100",
  Sports: "bg-orange-50 text-orange-700 border-orange-100",
}

const PAGE_SIZE = 15
const BLANK: ProductCreate = { name: "", sku: "", category: "Electronics", price: 0 }

export default function ProductsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductCreate>(BLANK)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, debouncedSearch, categoryFilter],
    queryFn: () =>
      productsApi.list({
        page,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (body: ProductCreate) => productsApi.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); closeDialog() },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      setFormError(e.response?.data?.detail ?? "Failed to save"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductCreate }) =>
      productsApi.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); closeDialog() },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      setFormError(e.response?.data?.detail ?? "Failed to save"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setDeleteId(null) },
  })

  function openCreate() {
    setEditing(null); setForm(BLANK); setFormError(""); setDialogOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, sku: p.sku, category: p.category, price: Number(p.price) })
    setFormError("")
    setDialogOpen(true)
  }

  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(BLANK) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.sku || !form.price) { setFormError("All fields are required"); return }
    if (editing) updateMutation.mutate({ id: editing.id, body: form })
    else createMutation.mutate(form)
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} products across {CATEGORIES.length} categories
          </p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-8 h-9 bg-white border-gray-200 text-sm"
          />
        </div>
        <Select value={categoryFilter || "all"} onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : v); setPage(1) }}>
          <SelectTrigger className="w-44 h-9 bg-white border-gray-200 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 pl-5">Product</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">SKU</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Category</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Price</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Added</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : (data?.data ?? []).map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 font-mono">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={CATEGORY_COLORS[product.category] ?? ""}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 text-right">
                      {format(new Date(product.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={() => openEdit(product)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* Pagination */}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>{editing ? "Update product details." : "Fill in the details to add a new product."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="px-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wireless Headphones" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-ELE-0001" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" min="0.01" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} placeholder="29.99" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ProductCategory })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {isPending ? "Saving…" : editing ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>This will permanently delete the product. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
