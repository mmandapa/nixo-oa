/**
 * Empty state when no tickets exist
 */
import { MessageSquare } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No tickets yet
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        When customers send relevant messages in Slack, they'll appear here in real-time.
      </p>
    </div>
  )
}

