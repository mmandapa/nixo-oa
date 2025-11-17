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
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-600)' }} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-20 neumorphic-raised rounded-2xl py-2 min-w-[180px]">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isChanging}
                className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between rounded-xl"
                style={{
                  background: ticket.status === status ? 'var(--primary-100)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (ticket.status !== status) {
                    e.currentTarget.style.background = 'var(--primary-100)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (ticket.status !== status) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <StatusBadge status={status} size="sm" showIcon={false} />
                {ticket.status === status && (
                  <Check className="h-4 w-4" style={{ color: 'var(--primary-500)' }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

