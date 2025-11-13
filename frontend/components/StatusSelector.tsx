/**
 * Status Selector Component
 * Dropdown to change ticket status
 */
import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import type { Ticket } from '@/lib/types'

type Status = Ticket['status']

interface StatusSelectorProps {
  ticket: Ticket
  onStatusChange: (ticketId: string, newStatus: Status) => Promise<void>
}

const statuses: Status[] = ['open', 'pending', 'in_progress', 'resolved', 'closed']

export default function StatusSelector({ ticket, onStatusChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === ticket.status || isChanging) return

    setIsChanging(true)
    try {
      await onStatusChange(ticket.id, newStatus)
      setIsOpen(false)
    } catch (err) {
      console.error('Error changing status:', err)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        <StatusBadge status={ticket.status} size="sm" />
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg border border-slate-200 shadow-lg py-1 min-w-[180px]">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isChanging}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  ticket.status === status ? 'bg-slate-50' : ''
                }`}
              >
                <StatusBadge status={status} size="sm" showIcon={false} />
                {ticket.status === status && (
                  <Check className="h-4 w-4 text-slate-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

