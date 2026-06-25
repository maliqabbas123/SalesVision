"use client"

import { useState } from "react"
import { Send, Loader2, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNLQuery } from "@/hooks/useDashboard"

export function NLQueryBar() {
  const [question, setQuestion] = useState("")
  const { mutate, data, isPending, reset } = useNLQuery()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    mutate({ question: question.trim() })
  }

  const columns = data?.results?.[0] ? Object.keys(data.results[0]) : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Ask a Question</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder='e.g. "Top 5 customers by total spend" or "Monthly revenue for Electronics"'
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              reset()
            }}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !question.trim()}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {data && !data.configured && (
          <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              NL query requires <code className="font-mono text-xs">OPENAI_API_KEY</code> — set it
              in <code className="font-mono text-xs">backend/.env</code> to enable this feature.
            </span>
          </div>
        )}

        {data?.configured && data.sql && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Generated SQL</p>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">{data.sql}</pre>
          </div>
        )}

        {data?.error && data.configured && (
          <p className="text-sm text-red-500 bg-red-50 rounded-md p-3">{data.error}</p>
        )}

        {data?.results && data.results.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="text-xs">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.slice(0, 20).map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col} className="text-xs">
                        {String(row[col] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.results.length > 20 && (
              <p className="text-xs text-muted-foreground p-2">
                Showing first 20 of {data.results.length} results
              </p>
            )}
          </div>
        )}

        {data?.results && data.results.length === 0 && data.configured && (
          <p className="text-sm text-muted-foreground">No results found.</p>
        )}
      </CardContent>
    </Card>
  )
}
