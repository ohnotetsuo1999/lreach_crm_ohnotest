'use client'

import { ReactNode } from 'react'

export type StatusVariant = 
  | 'active' 
  | 'inactive' 
  | 'completed' 
  | 'scheduled' 
  | 'sending' 
  | 'failed' 
  | 'draft'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'manual'
  | 'automatic'
  | 'behavioral'

interface StatusBadgeProps {
  variant: StatusVariant
  children: ReactNode
  className?: string
  onClick?: () => void
}

const getStatusClasses = (variant: StatusVariant): string => {
  switch (variant) {
    case 'active':
    case 'completed':
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200'
    
    case 'inactive':
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200'
    
    case 'scheduled':
    case 'info':
    case 'manual':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    
    case 'sending':
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    
    case 'automatic':
      return 'bg-green-100 text-green-800 border-green-200'
    
    case 'behavioral':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function StatusBadge({ 
  variant, 
  children, 
  className = '', 
  onClick 
}: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium border'
  const variantClasses = getStatusClasses(variant)
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
  
  const allClasses = `${baseClasses} ${variantClasses} ${interactiveClasses} ${className}`.trim()

  if (onClick) {
    return (
      <button onClick={onClick} className={allClasses}>
        {children}
      </button>
    )
  }

  return (
    <span className={allClasses}>
      {children}
    </span>
  )
}