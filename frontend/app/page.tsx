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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                FDE Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time customer message tracking
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {totalTickets}
                </p>
                <p className="text-sm text-gray-500">Active Tickets</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

