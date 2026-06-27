"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { customersApi } from "@/lib/api"
import type { Customer, CustomerCreate } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
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
const BLANK: CustomerCreate = { name: "", email: "", city: "", country: "USA" }

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
]

export default function CustomersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerCreate>(BLANK)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, debouncedSearch],
    queryFn: () =>
      customersApi.list({ page, page_size: PAGE_SIZE, search: debouncedSearch || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: (body: CustomerCreate) => customersApi.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); closeDialog() },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      setFormError(e.response?.data?.detail ?? "Failed to save"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: CustomerCreate }) =>
      customersApi.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); closeDialog() },
    onError: (e: { response?: { data?: { detail?: string } } }) =>
      setFormError(e.response?.data?.detail ?? "Failed to save"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setDeleteId(null) },
  })

  function openCreate() {
    setEditing(null); setForm(BLANK); setFormError(""); setDialogOpen(true)
  }

  function openEdit(c: Customer) {
    setEditing(c)
    setForm({ name: c.name, email: c.email, city: c.city, country: c.country })
    setFormError("")
    setDialogOpen(true)
  }

  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(BLANK) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.city) { setFormError("Name, email, and city are required"); return }
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
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} registered customers</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-8 h-9 bg-white border-gray-200 text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 pl-5">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Email</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">Location</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right">Member Since</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : (data?.data ?? []).map((customer) => {
                  const colorClass = AVATAR_COLORS[customer.id % AVATAR_COLORS.length]
                  return (
                    <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${colorClass}`}>
                            {initials(customer.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-[11px] text-gray-400">#{customer.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{customer.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {customer.city}, {customer.country}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 text-right">
                        {format(new Date(customer.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={() => openEdit(customer)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={() => setDeleteId(customer.id)}>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
            <DialogDescription>{editing ? "Update customer details." : "Register a new customer."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="px-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full Name</Label>
                <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-city">City</Label>
                  <Input id="c-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="New York" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-country">Country</Label>
                  <Input id="c-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="USA" />
                </div>
              </div>
              {formError && <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2">{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {isPending ? "Saving…" : editing ? "Save Changes" : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>This will permanently delete the customer and all their orders. This cannot be undone.</DialogDescription>
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
