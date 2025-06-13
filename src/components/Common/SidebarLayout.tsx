'use client'

import { ReactNode } from 'react'

interface SidebarLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  sidebarWidth?: string
  className?: string
}

export function SidebarLayout({ 
  sidebar, 
  children, 
  sidebarWidth = 'w-80',
  className = ''
}: SidebarLayoutProps) {
  return (
    <div className={`h-full flex ${className}`}>
      {/* Sidebar */}
      <div className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col`}>
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

interface SidebarHeaderProps {
  title: string
  actions?: ReactNode
  stats?: Array<{
    label: string
    value: number | string
    color?: string
  }>
  className?: string
}

export function SidebarHeader({ 
  title, 
  actions, 
  stats,
  className = ''
}: SidebarHeaderProps) {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      
      {stats && stats.length > 0 && (
        <div className={`grid gap-3 text-sm ${
          stats.length === 2 ? 'grid-cols-2' : 
          stats.length === 3 ? 'grid-cols-3' : 
          stats.length === 4 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center p-2 rounded ${
                stat.color || 'bg-blue-50'
              }`}
            >
              <div className={`font-semibold ${
                stat.color === 'bg-blue-50' ? 'text-blue-700' :
                stat.color === 'bg-green-50' ? 'text-green-700' :
                stat.color === 'bg-yellow-50' ? 'text-yellow-700' :
                stat.color === 'bg-red-50' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {stat.value}
              </div>
              <div className={`${
                stat.color === 'bg-blue-50' ? 'text-blue-600' :
                stat.color === 'bg-green-50' ? 'text-green-600' :
                stat.color === 'bg-yellow-50' ? 'text-yellow-600' :
                stat.color === 'bg-red-50' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ContentHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function ContentHeader({
  title,
  subtitle,
  actions,
  className = ''
}: ContentHeaderProps) {
  return (
    <div className={`p-6 border-b border-gray-200 bg-white ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

interface ContentBodyProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function ContentBody({ 
  children, 
  className = '',
  padding = true
}: ContentBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}