import { clsx } from 'clsx'

export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-brand-100 text-brand-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-600',
        variant === 'success' && 'bg-green-100 text-green-700',
        className
      )}
    >
      {children}
    </span>
  )
}
