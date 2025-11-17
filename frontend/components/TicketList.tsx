/**
 * List of tickets grouped by category
 */
import { Ticket } from '@/lib/types'
import TicketCard from './TicketCard'

interface TicketListProps {
  title: string
  tickets: Ticket[]
  color: 'red' | 'purple' | 'blue' | 'green'
  onArchive?: (ticketId: string) => void
  onDelete?: (ticketId: string) => void
  onStatusChange?: (ticketId: string, newStatus: Ticket['status']) => Promise<void>
}

export default function TicketList({ title, tickets, color, onArchive, onDelete, onStatusChange }: TicketListProps) {
  if (tickets.length === 0) return null

  return (
    <div className="space-y-5">
      <div className="px-6 py-4 neumorphic-raised rounded-3xl">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-900)' }}>{title}</h2>
        <p className="text-xs mt-1.5 font-medium uppercase tracking-wide" style={{ color: 'var(--text-600)' }}>
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
            onArchive={onArchive} 
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  )
}

