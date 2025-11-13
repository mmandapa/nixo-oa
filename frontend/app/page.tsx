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
import { Archive, X, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function Dashboard() {
  const { tickets, loading, error, archiveAllTickets, archiveTicket, archivedCount, clearArchived, deleteAllTickets, deleteTicket, updateTicketStatus } = useRealtimeTickets()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50">
      {/* Header */}
      <header className="glass border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                FDE Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 font-medium">
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
              <div className="flex items-center gap-3">
                {archivedCount > 0 && (
                  <button
                    onClick={clearArchived}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Clear archived tickets"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Clear {archivedCount} archived</span>
                  </button>
                )}
                {totalTickets > 0 && (
                  <>
                    {!showArchiveConfirm && !showDeleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowArchiveConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all shadow-sm"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          <span>Archive All</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg border border-red-700 transition-all shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete All</span>
                        </button>
                      </div>
                    ) : showArchiveConfirm ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="text-xs font-medium text-amber-700">Archive all tickets?</span>
                        <button
                          onClick={() => {
                            archiveAllTickets()
                            setShowArchiveConfirm(false)
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowArchiveConfirm(false)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : showDeleteConfirm ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-xs font-medium text-red-700">⚠️ Delete ALL tickets permanently?</span>
                        <button
                          onClick={async () => {
                            setIsDeleting(true)
                            try {
                              await deleteAllTickets()
                              setShowDeleteConfirm(false)
                            } catch (err) {
                              alert('Error deleting tickets. Please try again.')
                              console.error(err)
                            } finally {
                              setIsDeleting(false)
                            }
                          }}
                          disabled={isDeleting}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, Delete All'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/80 rounded-full border border-emerald-200/60 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm"></div>
                  <span className="text-xs font-semibold text-emerald-700 tracking-wide">LIVE</span>
                </div>
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
                onArchive={archiveTicket}
                onDelete={deleteTicket}
                onStatusChange={updateTicketStatus}
              />
            )}

            {/* Features */}
            {groupedTickets.feature.length > 0 && (
              <TicketList
                title="✨ Feature Requests"
                tickets={groupedTickets.feature}
                color="purple"
                onArchive={archiveTicket}
                onDelete={deleteTicket}
                onStatusChange={updateTicketStatus}
              />
            )}

            {/* Support */}
            {groupedTickets.support.length > 0 && (
              <TicketList
                title="🆘 Support Questions"
                tickets={groupedTickets.support}
                color="blue"
                onArchive={archiveTicket}
                onDelete={deleteTicket}
                onStatusChange={updateTicketStatus}
              />
            )}

            {/* Questions */}
            {groupedTickets.question.length > 0 && (
              <TicketList
                title="❓ General Questions"
                tickets={groupedTickets.question}
                color="green"
                onArchive={archiveTicket}
                onDelete={deleteTicket}
                onStatusChange={updateTicketStatus}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

