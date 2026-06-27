"use client"

import { useState } from "react"
import { ChevronDown, BookOpen, MessageSquare, FileText, ExternalLink, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "Why are my dashboard charts empty?",
    a: "Charts require the backend to be running. Start it with `uvicorn app.main:app --reload` from the `backend/` directory, then make sure the database is seeded by running `python -m scripts.seed`.",
  },
  {
    q: "How do I add more products or customers?",
    a: "Use the Products and Customers pages in the sidebar. Both support full CRUD — click the 'Add' button to create, the pencil icon to edit, and the trash icon to delete.",
  },
  {
    q: "What does the Natural Language Query do?",
    a: "It lets you ask questions about your data in plain English (e.g. 'top 5 customers by revenue'). It requires an OpenAI API key set in `backend/.env` as `OPENAI_API_KEY`.",
  },
  {
    q: "How do I change an order's status?",
    a: "Open the Orders page, click the eye icon on any row to view order details, then use the status buttons (Completed / Pending / Cancelled) inside the detail panel.",
  },
  {
    q: "Can I export data to CSV?",
    a: "CSV export is not yet implemented. As a workaround, use the NL Query bar on the dashboard to run custom SQL and copy the results, or query the database directly at localhost:5432.",
  },
  {
    q: "How do I reset the demo data?",
    a: "Run `python -m scripts.seed` from the `backend/` directory. It truncates all tables and re-seeds with ~1,200 realistic orders spanning 2 years.",
  },
]

const QUICK_LINKS = [
  { label: "FastAPI Docs", href: "http://localhost:8000/docs", icon: FileText, description: "Swagger UI for all API endpoints" },
  { label: "GitHub Repo", href: "https://github.com/maliqabbas123/SalesVision", icon: BookOpen, description: "Source code and README" },
  { label: "Report Issue", href: "https://github.com/maliqabbas123/SalesVision/issues", icon: MessageSquare, description: "Open a GitHub issue" },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Support</h2>
        <p className="text-sm text-gray-500 mt-0.5">Help, documentation, and quick links</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
              <link.icon className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-gray-900">{link.label}</p>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-800">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-2">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="flex items-center justify-between py-5 px-6">
          <div>
            <p className="text-sm font-semibold text-gray-900">Still need help?</p>
            <p className="text-xs text-gray-500 mt-0.5">Reach out directly and I&apos;ll get back to you.</p>
          </div>
          <a href="mailto:abbas.ahmad@triplek.tech">
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
              <Mail className="h-4 w-4" /> Email Me
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
