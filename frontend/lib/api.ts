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
} from "@/types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
})

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
