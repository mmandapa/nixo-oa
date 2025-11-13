/**
 * Empty state when no tickets exist
 */
import { MessageSquare } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
        <MessageSquare className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        No tickets yet
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm font-medium">
        When customers send relevant messages in Slack, they'll appear here in real-time.
      </p>
    </div>
  )
}

