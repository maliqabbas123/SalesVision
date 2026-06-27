import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { Sidebar } from "@/components/layout/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SalesVision",
  description: "Full-stack sales analytics dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
              {/* Top bar */}
              <header className="flex items-center px-6 h-14 bg-white border-b border-gray-100 shrink-0">
                <span className="text-sm font-medium text-gray-500">Dashboard</span>
              </header>
              <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
