/**
 * Utility functions
 */
import { formatDistanceToNow } from 'date-fns'

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bug: 'bg-red-100 text-red-800 border-red-200',
    feature: 'bg-purple-100 text-purple-800 border-purple-200',
    support: 'bg-blue-100 text-blue-800 border-blue-200',
    question: 'bg-green-100 text-green-800 border-green-200',
  }
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    bug: '🐛',
    feature: '✨',
    support: '🆘',
    question: '❓',
  }
  return icons[category] || '📋'
}

