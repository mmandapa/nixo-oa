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

  const colorClasses = {
    red: 'border-rose-200/60 bg-rose-50/40',
    purple: 'border-violet-200/60 bg-violet-50/40',
    blue: 'border-blue-200/60 bg-blue-50/40',
    green: 'border-emerald-200/60 bg-emerald-50/40',
  }

  return (
    <div className="space-y-5">
      <div className={`px-5 py-3 rounded-xl border backdrop-blur-sm shadow-sm ${colorClasses[color]}`}>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium uppercase tracking-wide">
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

