'use client'

import { Scenario, TriggerType } from '@/types'
import { StatusBadge } from './StatusBadge'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  Users, 
  Zap, 
  Tag, 
  BarChart3, 
  Play, 
  Pause, 
  Edit2, 
  Copy, 
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'

interface ScenarioCardProps {
  scenario: Scenario
  onEdit: (scenario: Scenario) => void
  onDuplicate: (scenario: Scenario) => void
  onDelete: (scenarioId: string) => void
  onToggleActive: (scenarioId: string, isActive: boolean) => void
  onViewAnalytics: (scenarioId: string) => void
}

const getTriggerIcon = (trigger: TriggerType) => {
  switch (trigger) {
    case 'MANUAL':
      return <Play className="w-4 h-4" />
    case 'SCHEDULE':
      return <Calendar className="w-4 h-4" />
    case 'USER_ACTION':
      return <Users className="w-4 h-4" />
    case 'TAG_ADDED':
      return <Tag className="w-4 h-4" />
    case 'STATUS_CHANGED':
      return <BarChart3 className="w-4 h-4" />
    case 'TIME_BASED':
      return <Clock className="w-4 h-4" />
    default:
      return <Zap className="w-4 h-4" />
  }
}

const getTriggerLabel = (trigger: TriggerType) => {
  switch (trigger) {
    case 'MANUAL':
      return '手動実行'
    case 'SCHEDULE':
      return 'スケジュール'
    case 'USER_ACTION':
      return 'ユーザーアクション'
    case 'TAG_ADDED':
      return 'タグ追加'
    case 'STATUS_CHANGED':
      return 'ステータス変更'
    case 'TIME_BASED':
      return '時間ベース'
    default:
      return trigger
  }
}

const getTriggerColor = (trigger: TriggerType) => {
  switch (trigger) {
    case 'MANUAL':
      return 'bg-gray-100 text-gray-800'
    case 'SCHEDULE':
      return 'bg-blue-100 text-blue-800'
    case 'USER_ACTION':
      return 'bg-green-100 text-green-800'
    case 'TAG_ADDED':
      return 'bg-purple-100 text-purple-800'
    case 'STATUS_CHANGED':
      return 'bg-orange-100 text-orange-800'
    case 'TIME_BASED':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ScenarioCard({
  scenario,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onViewAnalytics
}: ScenarioCardProps) {
  const [showActions, setShowActions] = useState(false)

  const totalPacks = (scenario as any).packs?.length || 0
  const totalTemplates = (scenario as any).packs?.reduce((sum: number, pack: any) => sum + (pack.templates?.length || 0), 0) || 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {scenario.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              作成日: {formatDistanceToNow(new Date(scenario.createdAt), { addSuffix: true, locale: ja })}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <StatusBadge isActive={scenario.isActive} />
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(scenario)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      編集
                    </button>
                    
                    <button
                      onClick={() => {
                        onDuplicate(scenario)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      複製
                    </button>
                    
                    <button
                      onClick={() => {
                        onViewAnalytics(scenario.id)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      分析
                    </button>
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <button
                      onClick={() => {
                        onToggleActive(scenario.id, !scenario.isActive)
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      {scenario.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          停止
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          開始
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('このシナリオを削除しますか？')) {
                          onDelete(scenario.id)
                        }
                        setShowActions(false)
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* トリガー情報 */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTriggerColor(scenario.trigger)}`}>
            {getTriggerIcon(scenario.trigger)}
            <span className="ml-1">{getTriggerLabel(scenario.trigger)}</span>
          </span>
          
          {scenario.triggerValue && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {scenario.triggerValue}
            </span>
          )}
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{totalPacks}</div>
            <div className="text-xs text-gray-500">Pack数</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{totalTemplates}</div>
            <div className="text-xs text-gray-500">メッセージ数</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">-</div>
            <div className="text-xs text-gray-500">実行回数</div>
          </div>
        </div>

        {/* Pack一覧（簡易表示） */}
        {(scenario as any).packs && (scenario as any).packs.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pack構成</h4>
            <div className="space-y-2">
              {(scenario as any).packs.slice(0, 3).map((pack: any, index: number) => (
                <div key={pack.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {pack.order}
                    </div>
                    <span className="text-gray-600">
                      {pack.templates?.length || 0}件のメッセージ
                    </span>
                  </div>
                  {pack.offsetMinutes > 0 && (
                    <span className="text-xs text-gray-500">
                      +{pack.offsetMinutes}分
                    </span>
                  )}
                </div>
              ))}
              
              {(scenario as any).packs.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  他{(scenario as any).packs.length - 3}個のPack...
                </div>
              )}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2 mt-4 pt-4 border-t">
          <button
            onClick={() => onEdit(scenario)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
          >
            編集
          </button>
          
          <button
            onClick={() => onToggleActive(scenario.id, !scenario.isActive)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
              scenario.isActive
                ? 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                : 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'
            }`}
          >
            {scenario.isActive ? '停止' : '開始'}
          </button>
        </div>
      </div>
    </div>
  )
}