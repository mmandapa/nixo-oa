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
  const { tickets, loading, error, archiveAllTickets, archiveTicket, archivedCount, clearArchived, deleteAllTickets, deleteTicket, updateTicketStatus, hasNewUpdate } = useRealtimeTickets()
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

  // Get unique categories present in all tickets (from messages)
  const getTicketCategories = (ticket: typeof tickets[0]) => {
    if (!ticket.messages || ticket.messages.length === 0) {
      return [ticket.category] // Fallback to ticket category if no messages
    }
    const categories = new Set(ticket.messages.map((m: any) => m.category))
    return Array.from(categories) as Array<'bug' | 'feature' | 'support' | 'question'>
  }

  const totalTickets = tickets.length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--surface-0) 0%, var(--surface-1) 100%)' }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                FDE Dashboard
              </h1>
              <p className="mt-1.5 text-sm font-medium" style={{ color: 'var(--text-600)' }}>
                Real-time customer message tracking
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right px-4 py-3 neumorphic-raised rounded-2xl">
                <p className="text-3xl font-bold" style={{ color: 'var(--text-900)' }}>
                  {totalTickets}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-600)' }}>Active Tickets</p>
              </div>
              <div className="flex items-center gap-3">
                {archivedCount > 0 && (
                  <button
                    onClick={clearArchived}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium neumorphic-button rounded-full transition-all"
                    style={{ color: 'var(--text-900)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-900)'}
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
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold neumorphic-button rounded-full transition-all"
                          style={{ color: 'var(--text-900)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-900)'}
                        >
                          <Archive className="h-3.5 w-3.5" />
                          <span>Archive All</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-full transition-all"
                          style={{ background: 'var(--bug-500)', boxShadow: 'var(--shadow-pill)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FF9DB0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bug-500)'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete All</span>
                        </button>
                      </div>
                    ) : showArchiveConfirm ? (
                      <div className="flex items-center gap-2 px-4 py-2 neumorphic-inset rounded-2xl">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-900)' }}>Archive all tickets?</span>
                        <button
                          onClick={() => {
                            archiveAllTickets()
                            setShowArchiveConfirm(false)
                          }}
                          className="px-3 py-1 text-xs font-semibold text-white rounded-full transition-colors"
                          style={{ background: '#F59E0B', boxShadow: 'var(--shadow-pill)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#D97706'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F59E0B'}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowArchiveConfirm(false)}
                          className="px-3 py-1 text-xs font-semibold rounded-full transition-colors"
                          style={{ color: 'var(--text-600)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-900)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-600)'}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : showDeleteConfirm ? (
                      <div className="flex items-center gap-2 px-4 py-2 neumorphic-inset rounded-2xl">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-900)' }}>⚠️ Delete ALL tickets permanently?</span>
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
                          className="px-3 py-1 text-xs font-semibold text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'var(--bug-500)', boxShadow: 'var(--shadow-pill)' }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = '#FF9DB0')}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bug-500)')}
                        >
                          {isDeleting ? 'Deleting...' : 'Yes, Delete All'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
                          style={{ color: 'var(--text-600)' }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = 'var(--text-900)')}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = 'var(--text-600)')}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
                <div className="flex items-center gap-3">
                  {hasNewUpdate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 neumorphic-raised rounded-full animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary-500)' }}></div>
                      <span className="text-xs font-medium" style={{ color: 'var(--primary-500)' }}>New update</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 neumorphic-raised rounded-full">
                    <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--success-500)' }}></div>
                    <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--success-500)' }}>LIVE</span>
                  </div>
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
            {/* All Tickets - Grouped by Relevance */}
            <TicketList
              title="📋 All Tickets"
              tickets={tickets}
              color="indigo"
              onArchive={archiveTicket}
              onDelete={deleteTicket}
              onStatusChange={updateTicketStatus}
            />
          </div>
        )}
      </main>
    </div>
  )
}

