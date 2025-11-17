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

  const categoryStyles = {
    bug: { background: 'var(--bug-100)', color: '#C81E5A', shadow: 'var(--shadow-pill)' },
    feature: { background: 'var(--feature-100)', color: '#8B5CF6', shadow: 'var(--shadow-pill)' },
    support: { background: 'var(--support-100)', color: 'var(--primary-500)', shadow: 'var(--shadow-pill)' },
    question: { background: 'var(--question-100)', color: 'var(--success-500)', shadow: 'var(--shadow-pill)' },
  }

  const categoryLabels = {
    bug: '🐛 Bug',
    feature: '✨ Feature',
    support: '🆘 Support',
    question: '❓ Question',
  }

  const categoryStyle = categoryStyles[message.category] || categoryStyles.question
  const categoryLabel = categoryLabels[message.category] || categoryLabels.question

  return (
    <div className="flex gap-3 py-2.5 group/message">
      <div className="flex-shrink-0">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-semibold shadow-[4px_4px_8px_rgba(0,0,0,0.15),-2px_-2px_4px_rgba(255,255,255,0.3)]`}>
          {message.user_name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: 'var(--text-900)' }}>
            {message.user_name}
          </span>
          <span 
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ 
              background: categoryStyle.background, 
              color: categoryStyle.color,
              boxShadow: categoryStyle.shadow
            }}
          >
            {categoryLabel}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-600)' }}>
            {formatTimeAgo(message.created_at)}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--text-900)' }}>
          {message.text}
        </div>
      </div>
    </div>
  )
}

