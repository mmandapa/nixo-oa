/**
 * Individual message bubble component
 */
import { Message } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="flex gap-3 py-2">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
          {message.user_name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {message.user_name}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(message.created_at)}
          </span>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    </div>
  )
}

