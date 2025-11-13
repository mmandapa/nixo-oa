/**
 * Main Dashboard Page
 * 
 * Displays all tickets grouped by category
 * Updates in real-time via Supabase subscriptions
 */
'use client'

import { useRealtimeTickets } from '@/hooks/useRealtimeTickets'
import TicketList from '@/components/TicketList'
import EmptyState from '@/components/EmptyState'

export default function Dashboard() {
  const { tickets, loading, error } = useRealtimeTickets()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 max-w-md px-4">
          <p className="text-xl font-semibold mb-2">Error loading tickets</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Make sure your Supabase credentials are correct in .env.local
          </p>
        </div>
      </div>
    )
  }

  // Group tickets by category
  const groupedTickets = {
    bug: tickets.filter(t => t.category === 'bug'),
    feature: tickets.filter(t => t.category === 'feature'),
    support: tickets.filter(t => t.category === 'support'),
    question: tickets.filter(t => t.category === 'question'),
  }

  const totalTickets = tickets.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                FDE Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 font-medium">
                Real-time customer message tracking
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">
                  {totalTickets}
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">Active Tickets</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/80 rounded-full border border-emerald-200/60 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm"></div>
                <span className="text-xs font-semibold text-emerald-700 tracking-wide">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {totalTickets === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Bugs */}
            {groupedTickets.bug.length > 0 && (
              <TicketList
                title="🐛 Bug Reports"
                tickets={groupedTickets.bug}
                color="red"
              />
            )}

            {/* Features */}
            {groupedTickets.feature.length > 0 && (
              <TicketList
                title="✨ Feature Requests"
                tickets={groupedTickets.feature}
                color="purple"
              />
            )}

            {/* Support */}
            {groupedTickets.support.length > 0 && (
              <TicketList
                title="🆘 Support Questions"
                tickets={groupedTickets.support}
                color="blue"
              />
            )}

            {/* Questions */}
            {groupedTickets.question.length > 0 && (
              <TicketList
                title="❓ General Questions"
                tickets={groupedTickets.question}
                color="green"
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

