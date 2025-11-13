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
import { formatTimeAgo } from '@/lib/utils'
import { Hash, Clock } from 'lucide-react'

interface TicketCardProps {
  ticket: Ticket
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const sortedMessages = (ticket.messages || []).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <CategoryBadge category={ticket.category} />
              <span className="text-xs text-slate-500 font-medium">
                {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
              {ticket.title}
            </h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-5 text-xs text-slate-500">
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
  )
}

