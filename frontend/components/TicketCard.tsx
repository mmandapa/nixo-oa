/**
 * Individual Ticket Card
 * 
 * Displays:
 * - Ticket title and category
 * - All messages in the ticket
 * - Channel name and timestamps
 * - User names
 */
import { Ticket } from '@/lib/types'
import MessageBubble from './MessageBubble'
import CategoryBadge from './CategoryBadge'
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
      <div className="group bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300/60 transition-all duration-300 overflow-hidden backdrop-blur-sm relative card-hover ticket-enter">
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View history"
          >
            <History className="h-4 w-4" />
          </button>
          {onArchive && !showDeleteConfirm && (
            <button
              onClick={() => onArchive(ticket.id)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Archive ticket"
            >
              <Archive className="h-4 w-4" />
            </button>
          )}
          {onDelete && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete ticket permanently"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {showDeleteConfirm && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-xs text-red-700 font-medium">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-1.5 py-0.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded transition-colors disabled:opacity-50"
              >
                No
              </button>
            </div>
          )}
        </div>
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <CategoryBadge category={ticket.category} />
              {onStatusChange && (
                <StatusSelector ticket={ticket} onStatusChange={onStatusChange} />
              )}
              {!onStatusChange && <StatusBadge status={ticket.status} size="sm" />}
              <span className="text-xs text-slate-500 font-medium">
                {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
              {ticket.title}
            </h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-600">
              {ticket.channel_name || ticket.channel_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">{formatTimeAgo(ticket.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-6 py-5 space-y-3 max-h-96 overflow-y-auto bg-white">
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

