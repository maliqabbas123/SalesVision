// ── Dashboard ────────────────────────────────────────────────────────────────

export interface KPIResponse {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  total_customers: number
  revenue_change_pct: number | null
  orders_change_pct: number | null
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface RevenueOverTimeResponse {
  data: RevenueDataPoint[]
  granularity: string
}

export interface CategoryBreakdown {
  category: string
  revenue: number
  percentage: number
}

export interface CategoryBreakdownResponse {
  data: CategoryBreakdown[]
}

export interface TopProduct {
  product_id: number
  name: string
  category: string
  total_revenue: number
  units_sold: number
}

export interface TopProductsResponse {
  data: TopProduct[]
}

export interface RecentOrder {
  id: number
  customer_name: string
  status: "completed" | "pending" | "cancelled"
  total_amount: number
  items_count: number
  created_at: string
}

export interface RecentOrdersResponse {
  data: RecentOrder[]
  total: number
  page: number
  page_size: number
}

export interface NLQueryRequest {
  question: string
}

export interface NLQueryResponse {
  question: string
  sql: string | null
  results: Record<string, unknown>[] | null
  error: string | null
  configured: boolean
}

export interface DashboardFilters {
  date_from?: string
  date_to?: string
  category?: string
}

// ── Products ─────────────────────────────────────────────────────────────────

export type ProductCategory = "Electronics" | "Clothing" | "Books" | "Home & Garden" | "Sports"

export interface Product {
  id: number
  name: string
  sku: string
  category: ProductCategory
  price: number
  created_at: string
}

export interface ProductListResponse {
  data: Product[]
  total: number
  page: number
  page_size: number
}

export interface ProductCreate {
  name: string
  sku: string
  category: ProductCategory
  price: number
}

export type ProductUpdate = Partial<ProductCreate>

// ── Customers ────────────────────────────────────────────────────────────────

export interface Customer {
  id: number
  name: string
  email: string
  city: string
  country: string
  created_at: string
}

export interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  page_size: number
}

export interface CustomerCreate {
  name: string
  email: string
  city: string
  country: string
}

export type CustomerUpdate = Partial<CustomerCreate>

// ── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "completed" | "pending" | "cancelled"

export interface OrderOut {
  id: number
  customer_id: number
  customer_name: string
  status: OrderStatus
  total_amount: number
  items_count: number
  created_at: string
  updated_at: string
}

export interface OrderItemOut {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface OrderDetailOut extends OrderOut {
  items: OrderItemOut[]
}

export interface OrderListResponse {
  data: OrderOut[]
  total: number
  page: number
  page_size: number
}

export interface OrderItemCreate {
  product_id: number
  quantity: number
}

export interface OrderCreate {
  customer_id: number
  status: OrderStatus
  items: OrderItemCreate[]
}
