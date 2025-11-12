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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={ticket.category} />
              <span className="text-xs text-gray-500">
                {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {ticket.title}
            </h3>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-medium">
              {ticket.channel_name || ticket.channel_id}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTimeAgo(ticket.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-6 py-4 space-y-1 max-h-96 overflow-y-auto">
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

