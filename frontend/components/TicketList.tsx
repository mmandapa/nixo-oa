/**
 * List of tickets grouped by category
 */
import { Ticket } from '@/lib/types'
import TicketCard from './TicketCard'

interface TicketListProps {
  title: string
  tickets: Ticket[]
  color: 'red' | 'purple' | 'blue' | 'green'
}

export default function TicketList({ title, tickets, color }: TicketListProps) {
  if (tickets.length === 0) return null

  const colorClasses = {
    red: 'border-red-200 bg-red-50/50',
    purple: 'border-purple-200 bg-purple-50/50',
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
  }

  return (
    <div className="space-y-4">
      <div className={`px-4 py-2 rounded-lg border ${colorClasses[color]}`}>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-0.5">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}

