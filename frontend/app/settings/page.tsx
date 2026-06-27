"use client"

import { useState } from "react"
import { Bell, Database, Shield, Palette, Globe, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "database", label: "Database", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
        checked ? "bg-indigo-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-1"
        )}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 gap-8">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState("general")
  const [saved, setSaved] = useState(false)

  // General
  const [orgName, setOrgName] = useState("SalesVision Demo")
  const [timezone, setTimezone] = useState("UTC")
  const [currency, setCurrency] = useState("USD")

  // Notifications
  const [emailReports, setEmailReports] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [lowStockAlerts, setLowStockAlerts] = useState(false)

  // Security
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("30")

  // Appearance
  const [compactMode, setCompactMode] = useState(false)
  const [showChartAnimations, setShowChartAnimations] = useState(true)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your workspace preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  active === s.id
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <s.icon className={cn("h-4 w-4 shrink-0", active === s.id ? "text-indigo-600" : "text-gray-400")} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {active === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">General</CardTitle>
                <CardDescription>Basic workspace configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 divide-y divide-gray-100">
                <SettingRow label="Organisation Name" description="Displayed in reports and exports">
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-52 h-8 text-sm" />
                </SettingRow>
                <SettingRow label="Timezone" description="Used for date grouping in charts">
                  <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-36 h-8 text-sm" placeholder="UTC" />
                </SettingRow>
                <SettingRow label="Currency" description="Display currency across the dashboard">
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-24 h-8 text-sm" placeholder="USD" />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
                <CardDescription>Control what emails and alerts you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 divide-y divide-gray-100">
                <SettingRow label="Email Reports" description="Receive automated daily revenue reports">
                  <Toggle checked={emailReports} onChange={setEmailReports} />
                </SettingRow>
                <SettingRow label="Order Alerts" description="Get notified when new orders are placed">
                  <Toggle checked={orderAlerts} onChange={setOrderAlerts} />
                </SettingRow>
                <SettingRow label="Weekly Digest" description="Summary email every Monday morning">
                  <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
                </SettingRow>
                <SettingRow label="Low Stock Alerts" description="Alert when product inventory runs low">
                  <Toggle checked={lowStockAlerts} onChange={setLowStockAlerts} />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {active === "database" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Database</CardTitle>
                <CardDescription>Connection and data management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Status</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Connected
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Host</span>
                    <span className="text-xs text-gray-700 font-mono">localhost:5432</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Database</span>
                    <span className="text-xs text-gray-700 font-mono">salesvision</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Driver</span>
                    <span className="text-xs text-gray-700 font-mono">asyncpg</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Connection string is configured via <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">backend/.env</code></p>
              </CardContent>
            </Card>
          )}

          {active === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Security</CardTitle>
                <CardDescription>Authentication and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 divide-y divide-gray-100">
                <SettingRow label="Two-Factor Authentication" description="Require 2FA on every login">
                  <Toggle checked={twoFactor} onChange={setTwoFactor} />
                </SettingRow>
                <SettingRow label="Session Timeout (minutes)" description="Auto-logout after inactivity">
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-20 h-8 text-sm"
                    min={5}
                    max={480}
                  />
                </SettingRow>
                <SettingRow label="API Access" description="REST API is enabled for /api/v1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
                <CardDescription>Customise how the dashboard looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 divide-y divide-gray-100">
                <SettingRow label="Compact Mode" description="Reduce spacing for denser data display">
                  <Toggle checked={compactMode} onChange={setCompactMode} />
                </SettingRow>
                <SettingRow label="Chart Animations" description="Smooth entrance animations on charts">
                  <Toggle checked={showChartAnimations} onChange={setShowChartAnimations} />
                </SettingRow>
              </CardContent>
            </Card>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} className={cn("gap-1.5", saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700")}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
