/**
 * Status Badge Component
 * Displays ticket status with appropriate styling
 */
import { CheckCircle2, Clock, PlayCircle, XCircle, AlertCircle } from 'lucide-react'

type Status = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const statusConfig: Record<Status, { label: string; background: string; color: string; icon: any }> = {
  open: {
    label: 'Open',
    background: 'var(--support-100)',
    color: 'var(--primary-500)',
    icon: AlertCircle
  },
  pending: {
    label: 'Pending',
    background: '#FFF4E6',
    color: '#F59E0B',
    icon: Clock
  },
  in_progress: {
    label: 'In Progress',
    background: 'var(--feature-100)',
    color: 'var(--feature-500)',
    icon: PlayCircle
  },
  resolved: {
    label: 'Resolved',
    background: 'var(--question-100)',
    color: 'var(--success-500)',
    icon: CheckCircle2
  },
  closed: {
    label: 'Closed',
    background: '#F1F3F5',
    color: 'var(--text-600)',
    icon: XCircle
  }
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses[size]}`}
      style={{
        background: config.background,
        color: config.color,
        boxShadow: 'var(--shadow-pill)'
      }}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  )
}

