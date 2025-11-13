/**
 * Utility functions
 */
import { formatDistanceToNow } from 'date-fns'

export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    bug: 'bg-rose-50 text-rose-700 border-rose-200/60',
    feature: 'bg-violet-50 text-violet-700 border-violet-200/60',
    support: 'bg-blue-50 text-blue-700 border-blue-200/60',
    question: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  }
  return colors[category] || 'bg-slate-100 text-slate-700 border-slate-200/60'
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

