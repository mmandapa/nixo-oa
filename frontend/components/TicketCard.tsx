/**
 * Individual Ticket Card
 * 
 * Displays:
 * - Ticket title and status
 * - All messages in the ticket (each with its own category tag)
 * - Channel name and timestamps
 * - User names
 */
import { Ticket } from '@/lib/types'
import MessageBubble from './MessageBubble'
import StatusBadge from './StatusBadge'
import StatusSelector from './StatusSelector'
import TicketHistory from './TicketHistory'
import { formatTimeAgo } from '@/lib/utils'
import { Hash, Clock, Archive, Trash2, History } from 'lucide-react'
import { useState } from 'react'

interface TicketCardProps {
  ticket: Ticket
  onArchive?: (ticketId: string) => void
  onDelete?: (ticketId: string) => void
  onStatusChange?: (ticketId: string, newStatus: Ticket['status']) => Promise<void>
}

export default function TicketCard({ ticket, onArchive, onDelete, onStatusChange }: TicketCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  const sortedMessages = (ticket.messages || []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(ticket.id)
    } catch (err) {
      console.error('Error deleting ticket:', err)
      alert('Error deleting ticket. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="group neumorphic-raised overflow-hidden relative card-hover ticket-enter">
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-10">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 neumorphic-button rounded-full transition-all"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-600)'}
              title="View history"
            >
            <History className="h-4 w-4" />
          </button>
          {onArchive && !showDeleteConfirm && (
            <button
              onClick={() => onArchive(ticket.id)}
              className="p-2 neumorphic-button rounded-full transition-all"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-900)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-600)'}
              title="Archive ticket"
            >
              <Archive className="h-4 w-4" />
            </button>
          )}
          {onDelete && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 neumorphic-button rounded-full transition-all"
              style={{ color: 'var(--text-600)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bug-500)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-600)'}
              title="Delete ticket permanently"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {showDeleteConfirm && (
            <div className="flex items-center gap-2 px-3 py-2 neumorphic-inset rounded-2xl">
              <span className="text-xs font-medium" style={{ color: 'var(--text-900)' }}>Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-xs font-semibold text-white rounded-full transition-colors disabled:opacity-50"
                style={{ background: 'var(--bug-500)', boxShadow: 'var(--shadow-pill)' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = '#FF9DB0')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bug-500)')}
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-3 py-1 text-xs font-semibold rounded-full transition-colors disabled:opacity-50"
                style={{ color: 'var(--text-600)' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = 'var(--text-900)')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = 'var(--text-600)')}
              >
                No
              </button>
            </div>
          )}
        </div>
      
      {/* Header */}
      <div className="px-6 py-5 bg-transparent">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {/* Only show status - NO category badges or message count in header */}
              {onStatusChange && (
                <StatusSelector ticket={ticket} onStatusChange={onStatusChange} />
              )}
              {!onStatusChange && <StatusBadge status={ticket.status} size="sm" />}
            </div>
            <h3 className="text-lg font-bold leading-snug line-clamp-2 mb-2" style={{ color: 'var(--text-900)' }}>
              {ticket.title}
            </h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-5 text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 neumorphic-inset rounded-full">
            <Hash className="h-3.5 w-3.5" style={{ color: 'var(--text-600)' }} />
            <span className="font-medium" style={{ color: 'var(--text-900)' }}>
              {ticket.channel_name || ticket.channel_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 neumorphic-inset rounded-full">
            <Clock className="h-3.5 w-3.5" style={{ color: 'var(--text-600)' }} />
            <span style={{ color: 'var(--text-600)' }}>{formatTimeAgo(ticket.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-6 py-5 space-y-3 max-h-96 overflow-y-auto bg-transparent">
        {sortedMessages.length > 0 ? (
          sortedMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        ) : (
          <div className="text-sm text-gray-500 italic py-4">
            No messages yet
          </div>
        )}
      </div>
    </div>

    {/* History Modal */}
    {showHistory && (
      <TicketHistory ticketId={ticket.id} onClose={() => setShowHistory(false)} />
    )}
    </>
  )
}

