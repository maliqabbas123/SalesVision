"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DashboardFilters } from "@/types"
import { subDays, subMonths, subYears, formatISO } from "date-fns"

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports"]

const DATE_PRESETS = [
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "6mo", months: 6 },
  { label: "1yr", years: 1 },
  { label: "2yr", years: 2 },
]

interface FiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  activePreset: string
  onPresetChange: (preset: string) => void
}

export function Filters({ filters, onFiltersChange, activePreset, onPresetChange }: FiltersProps) {
  const now = new Date()

  function applyPreset(preset: (typeof DATE_PRESETS)[number]) {
    let from: Date
    if ("months" in preset) {
      from = subMonths(now, preset.months)
    } else if ("years" in preset) {
      from = subYears(now, preset.years)
    } else {
      from = subDays(now, preset.days)
    }
    onPresetChange(preset.label)
    onFiltersChange({
      ...filters,
      date_from: formatISO(from, { representation: "date" }),
      date_to: formatISO(now, { representation: "date" }),
    })
  }

  function handleCategoryChange(value: string) {
    onFiltersChange({ ...filters, category: value === "all" ? undefined : value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {DATE_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset === preset.label ? "default" : "outline"}
            size="sm"
            onClick={() => applyPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Select onValueChange={handleCategoryChange} defaultValue="all">
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
