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

const statusConfig: Record<Status, { label: string; color: string; icon: any }> = {
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: AlertCircle
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: PlayCircle
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2
  },
  closed: {
    label: 'Closed',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
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
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </span>
  )
}

