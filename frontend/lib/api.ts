import axios from "axios"
import type {
  DashboardFilters,
  KPIResponse,
  RevenueOverTimeResponse,
  CategoryBreakdownResponse,
  TopProductsResponse,
  RecentOrdersResponse,
  NLQueryRequest,
  NLQueryResponse,
  Product,
  ProductListResponse,
  ProductCreate,
  ProductUpdate,
  Customer,
  CustomerListResponse,
  CustomerCreate,
  CustomerUpdate,
  OrderOut,
  OrderDetailOut,
  OrderListResponse,
  OrderCreate,
} from "@/types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
})

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getKPIs: (filters?: DashboardFilters) =>
    api.get<KPIResponse>("/dashboard/kpis", { params: filters }).then((r) => r.data),

  getRevenueOverTime: (filters?: DashboardFilters & { granularity?: string }) =>
    api
      .get<RevenueOverTimeResponse>("/dashboard/revenue-over-time", { params: filters })
      .then((r) => r.data),

  getSalesByCategory: (filters?: Pick<DashboardFilters, "date_from" | "date_to">) =>
    api
      .get<CategoryBreakdownResponse>("/dashboard/sales-by-category", { params: filters })
      .then((r) => r.data),

  getTopProducts: (filters?: DashboardFilters & { limit?: number }) =>
    api
      .get<TopProductsResponse>("/dashboard/top-products", { params: filters })
      .then((r) => r.data),

  getRecentOrders: (filters?: DashboardFilters & { page?: number; page_size?: number }) =>
    api
      .get<RecentOrdersResponse>("/dashboard/recent-orders", { params: filters })
      .then((r) => r.data),

  runNLQuery: (request: NLQueryRequest) =>
    api.post<NLQueryResponse>("/query", request).then((r) => r.data),
}

// ── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: { page?: number; page_size?: number; category?: string; search?: string }) =>
    api.get<ProductListResponse>("/products", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (body: ProductCreate) =>
    api.post<Product>("/products", body).then((r) => r.data),

  update: (id: number, body: ProductUpdate) =>
    api.put<Product>(`/products/${id}`, body).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/products/${id}`),
}

// ── Customers ────────────────────────────────────────────────────────────────

export const customersApi = {
  list: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get<CustomerListResponse>("/customers", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<Customer>(`/customers/${id}`).then((r) => r.data),

  create: (body: CustomerCreate) =>
    api.post<Customer>("/customers", body).then((r) => r.data),

  update: (id: number, body: CustomerUpdate) =>
    api.put<Customer>(`/customers/${id}`, body).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/customers/${id}`),
}

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: (params?: {
    page?: number
    page_size?: number
    status?: string
    search?: string
    customer_id?: number
  }) => api.get<OrderListResponse>("/orders", { params }).then((r) => r.data),

  get: (id: number) =>
    api.get<OrderDetailOut>(`/orders/${id}`).then((r) => r.data),

  create: (body: OrderCreate) =>
    api.post<OrderDetailOut>("/orders", body).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<OrderOut>(`/orders/${id}/status`, { status }).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/orders/${id}`),
}
