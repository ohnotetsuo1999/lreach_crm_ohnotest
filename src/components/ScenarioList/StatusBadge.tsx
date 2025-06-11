'use client'

import { Play, Pause, Clock } from 'lucide-react'

interface StatusBadgeProps {
  isActive: boolean
  isRunning?: boolean
  lastRun?: Date
}

export function StatusBadge({ isActive, isRunning = false, lastRun }: StatusBadgeProps) {
  const getStatusConfig = () => {
    if (isRunning) {
      return {
        icon: <Clock className="w-3 h-3" />,
        text: '実行中',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }
    
    if (isActive) {
      return {
        icon: <Play className="w-3 h-3" />,
        text: 'アクティブ',
        className: 'bg-green-100 text-green-800 border-green-200'
      }
    }
    
    return {
      icon: <Pause className="w-3 h-3" />,
      text: '停止中',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const config = getStatusConfig()

  return (
    <div className="flex flex-col items-end space-y-1">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </span>
      
      {lastRun && (
        <span className="text-xs text-gray-500">
          最終実行: {lastRun.toLocaleDateString('ja-JP')}
        </span>
      )}
    </div>
  )
}