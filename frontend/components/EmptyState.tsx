/**
 * Empty state when no tickets exist
 */
import { MessageSquare } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="h-20 w-20 rounded-2xl neumorphic-inset flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10" style={{ color: 'var(--text-600)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-900)' }}>
        No tickets yet
      </h3>
      <p className="text-sm text-center max-w-sm font-medium" style={{ color: 'var(--text-600)' }}>
        When customers send relevant messages in Slack, they'll appear here in real-time.
      </p>
    </div>
  )
}

