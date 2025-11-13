/**
 * Individual message bubble component
 */
import { Message } from '@/lib/types'
import { formatTimeAgo } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Generate consistent color based on user name
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-violet-500 to-purple-600',
  ]
  const colorIndex = message.user_name.charCodeAt(0) % colors.length
  const avatarGradient = colors[colorIndex]

  return (
    <div className="flex gap-3 py-2.5 group/message">
      <div className="flex-shrink-0">
        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-white`}>
          {message.user_name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <span className="font-semibold text-slate-900 text-sm">
            {message.user_name}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {formatTimeAgo(message.created_at)}
          </span>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    </div>
  )
}

