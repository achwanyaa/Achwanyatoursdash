import { cn } from '@/lib/utils'

interface BadgeProps {
  variant: 'green' | 'orange' | 'red' | 'gray' | 'blue'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-50 text-blue-700',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
