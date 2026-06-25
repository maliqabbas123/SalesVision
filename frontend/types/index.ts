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
