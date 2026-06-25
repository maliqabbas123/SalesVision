"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"
import type { DashboardFilters } from "@/types"

export function useKPIs(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ["kpis", filters],
    queryFn: () => dashboardApi.getKPIs(filters),
  })
}

export function useRevenueOverTime(filters?: DashboardFilters & { granularity?: string }) {
  return useQuery({
    queryKey: ["revenue-over-time", filters],
    queryFn: () => dashboardApi.getRevenueOverTime(filters),
  })
}

export function useSalesByCategory(filters?: Pick<DashboardFilters, "date_from" | "date_to">) {
  return useQuery({
    queryKey: ["sales-by-category", filters],
    queryFn: () => dashboardApi.getSalesByCategory(filters),
  })
}

export function useTopProducts(filters?: DashboardFilters & { limit?: number }) {
  return useQuery({
    queryKey: ["top-products", filters],
    queryFn: () => dashboardApi.getTopProducts(filters),
  })
}

export function useRecentOrders(filters?: DashboardFilters & { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ["recent-orders", filters],
    queryFn: () => dashboardApi.getRecentOrders(filters),
  })
}

export function useNLQuery() {
  return useMutation({ mutationFn: dashboardApi.runNLQuery })
}
