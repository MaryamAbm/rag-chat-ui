import { clsx } from 'clsx'

export function Button({ children, variant = 'primary', size = 'md', disabled, onClick, className, type = 'button' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
        variant === 'ghost' && 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        variant === 'outline' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        size === 'sm' && 'text-sm px-3 py-1.5 gap-1.5',
        size === 'md' && 'text-sm px-4 py-2 gap-2',
        size === 'icon' && 'p-2',
        className
      )}
    >
      {children}
    </button>
  )
}
