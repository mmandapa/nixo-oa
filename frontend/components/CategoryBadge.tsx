/**
 * Category badge component
 */
import { getCategoryColor, getCategoryIcon } from '@/lib/utils'

interface CategoryBadgeProps {
  category: string
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = getCategoryColor(category)
  const icon = getCategoryIcon(category)

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${colorClass}`}
    >
      <span className="text-xs">{icon}</span>
      <span className="capitalize tracking-wide">{category}</span>
    </span>
  )
}

