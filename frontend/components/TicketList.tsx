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

