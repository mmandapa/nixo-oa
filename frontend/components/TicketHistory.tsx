/**
 * Ticket History Component
 * Displays timeline of ticket changes
 */
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { TicketHistory as TicketHistoryType } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'
import { 
  Plus, 
  Edit, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  Clock,
  PlayCircle,
  AlertCircle
} from 'lucide-react'

interface TicketHistoryProps {
  ticketId: string
  onClose: () => void
}

const actionIcons = {
  created: Plus,
  status_changed: CheckCircle2,
  title_updated: Edit,
  message_added: MessageSquare,
  deleted: XCircle
}

const statusIcons = {
  open: AlertCircle,
  pending: Clock,
  in_progress: PlayCircle,
  resolved: CheckCircle2,
  closed: XCircle
}

export default function TicketHistory({ ticketId, onClose }: TicketHistoryProps) {
  const [history, setHistory] = useState<TicketHistoryType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [ticketId])

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_history')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (entry: TicketHistoryType) => {
    switch (entry.action) {
      case 'created':
        return 'Ticket created'
      case 'status_changed':
        return `Status changed from "${entry.old_value}" to "${entry.new_value}"`
      case 'title_updated':
        return 'Title updated'
      case 'message_added':
        return `Message added by ${entry.new_value || 'user'}`
      case 'deleted':
        return 'Ticket deleted'
      default:
        return entry.action
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Ticket History</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* History Timeline */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>No history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => {
                const Icon = actionIcons[entry.action] || Clock
                const isStatusChange = entry.action === 'status_changed'
                const StatusIcon = isStatusChange && entry.new_value 
                  ? statusIcons[entry.new_value as keyof typeof statusIcons] 
                  : null

                return (
                  <div key={entry.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-lg ${
                        entry.action === 'created' ? 'bg-blue-100 text-blue-600' :
                        entry.action === 'status_changed' ? 'bg-purple-100 text-purple-600' :
                        entry.action === 'message_added' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {StatusIcon ? (
                          <StatusIcon className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      {index < history.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-slate-900">
                        {getActionLabel(entry)}
                      </p>
                      {entry.metadata && entry.metadata.message_preview && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{entry.metadata.message_preview}"
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTimeAgo(entry.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

