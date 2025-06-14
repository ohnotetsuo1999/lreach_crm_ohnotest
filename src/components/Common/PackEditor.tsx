'use client'

import { useState } from 'react'
import { 
  Pack, 
  PackTemplate, 
  Template, 
  ConditionalLogic, 
  ConditionalBranch, 
  ConditionalExpression,
  BroadcastAction,
  ActionTrigger,
  EventIntegration,
  Tag,
  Status
} from '@/types'
import { 
  Plus, 
  Trash2, 
  Edit, 
  ChevronDown, 
  ChevronRight, 
  GitBranch, 
  Clock, 
  Target, 
  Zap,
  Settings,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react'

interface PackEditorProps {
  pack: Pack | null
  templates: Template[]
  tags: Tag[]
  statuses: Status[]
  onSave: (pack: Pack) => void
  onCancel: () => void
}

export function PackEditor({
  pack,
  templates,
  tags,
  statuses,
  onSave,
  onCancel
}: PackEditorProps) {
  const [packData, setPackData] = useState<Partial<Pack>>({
    scenarioId: pack?.scenarioId || '',
    order: pack?.order || 0,
    offsetMinutes: pack?.offsetMinutes || 0,
    packType: pack?.packType || 'normal',
    executionMode: pack?.executionMode || 'sequential',
    conditionalLogic: pack?.conditionalLogic,
    actionTriggers: pack?.actionTriggers || [],
    packActions: pack?.packActions || []
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'conditions' | 'actions' | 'triggers'>('basic')
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())

  const handleSave = () => {
    if (!packData.scenarioId) return
    
    const newPack: Pack = {
      id: pack?.id || `pack_${Date.now()}`,
      scenarioId: packData.scenarioId,
      order: packData.order || 0,
      offsetMinutes: packData.offsetMinutes || 0,
      packType: packData.packType || 'normal',
      executionMode: packData.executionMode || 'sequential',
      conditionalLogic: packData.conditionalLogic,
      actionTriggers: packData.actionTriggers || [],
      packActions: packData.packActions || [],
      createdAt: pack?.createdAt || new Date(),
      reminderSettings: packData.reminderSettings
    }
    
    onSave(newPack)
  }

  const addConditionalBranch = () => {
    const newBranch: ConditionalBranch = {
      id: `branch_${Date.now()}`,
      name: `分岐 ${(packData.conditionalLogic?.conditions.length || 0) + 1}`,
      condition: {
        type: 'simple',
        comparison: 'equals',
        field: 'tag'
      },
      actions: [],
      isActive: true
    }

    setPackData(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic,
        id: prev.conditionalLogic?.id || `logic_${Date.now()}`,
        type: prev.conditionalLogic?.type || 'if_then_else',
        conditions: [...(prev.conditionalLogic?.conditions || []), newBranch],
        evaluationOrder: prev.conditionalLogic?.evaluationOrder || 'first_match'
      }
    }))
  }

  const updateConditionalBranch = (branchId: string, updates: Partial<ConditionalBranch>) => {
    setPackData(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic!,
        conditions: prev.conditionalLogic!.conditions.map(branch =>
          branch.id === branchId ? { ...branch, ...updates } : branch
        )
      }
    }))
  }

  const removeConditionalBranch = (branchId: string) => {
    setPackData(prev => ({
      ...prev,
      conditionalLogic: {
        ...prev.conditionalLogic!,
        conditions: prev.conditionalLogic!.conditions.filter(branch => branch.id !== branchId)
      }
    }))
  }

  const addActionTrigger = () => {
    const newTrigger: ActionTrigger = {
      type: 'IMMEDIATE',
      delayMinutes: 0
    }

    setPackData(prev => ({
      ...prev,
      actionTriggers: [...(prev.actionTriggers || []), newTrigger]
    }))
  }

  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            実行順序
          </label>
          <input
            type="number"
            value={packData.order}
            onChange={(e) => setPackData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            遅延時間（分）
          </label>
          <input
            type="number"
            value={packData.offsetMinutes}
            onChange={(e) => setPackData(prev => ({ ...prev, offsetMinutes: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Packタイプ
          </label>
          <select
            value={packData.packType}
            onChange={(e) => setPackData(prev => ({ ...prev, packType: e.target.value as Pack['packType'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="normal">通常</option>
            <option value="reminder">リマインダー</option>
            <option value="conditional">条件分岐</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            実行モード
          </label>
          <select
            value={packData.executionMode}
            onChange={(e) => setPackData(prev => ({ ...prev, executionMode: e.target.value as Pack['executionMode'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="sequential">順次実行</option>
            <option value="parallel">並列実行</option>
            <option value="conditional">条件分岐</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderConditionalLogic = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">条件分岐設定</h3>
        <button
          onClick={addConditionalBranch}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          分岐を追加
        </button>
      </div>

      {packData.conditionalLogic?.conditions.map((branch, index) => (
        <div key={branch.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedBranches)
                  if (expandedBranches.has(branch.id)) {
                    newExpanded.delete(branch.id)
                  } else {
                    newExpanded.add(branch.id)
                  }
                  setExpandedBranches(newExpanded)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedBranches.has(branch.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <GitBranch className="w-4 h-4 text-blue-500" />
              <input
                type="text"
                value={branch.name}
                onChange={(e) => updateConditionalBranch(branch.id, { name: e.target.value })}
                className="font-medium bg-transparent border-none outline-none"
              />
            </div>
            <button
              onClick={() => removeConditionalBranch(branch.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {expandedBranches.has(branch.id) && (
            <div className="space-y-4 ml-6">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    条件フィールド
                  </label>
                  <select
                    value={branch.condition.field || ''}
                    onChange={(e) => updateConditionalBranch(branch.id, {
                      condition: { ...branch.condition, field: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">選択してください</option>
                    <option value="tag">タグ</option>
                    <option value="status">ステータス</option>
                    <option value="user_field">ユーザーフィールド</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    比較演算子
                  </label>
                  <select
                    value={branch.condition.comparison}
                    onChange={(e) => updateConditionalBranch(branch.id, {
                      condition: { ...branch.condition, comparison: e.target.value as ConditionalExpression['comparison'] }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="equals">等しい</option>
                    <option value="not_equals">等しくない</option>
                    <option value="exists">存在する</option>
                    <option value="not_exists">存在しない</option>
                    <option value="contains">含む</option>
                    <option value="not_contains">含まない</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    値
                  </label>
                  {branch.condition.field === 'tag' ? (
                    <select
                      value={branch.condition.tagId || ''}
                      onChange={(e) => updateConditionalBranch(branch.id, {
                        condition: { ...branch.condition, tagId: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">タグを選択</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                      ))}
                    </select>
                  ) : branch.condition.field === 'status' ? (
                    <select
                      value={branch.condition.statusId || ''}
                      onChange={(e) => updateConditionalBranch(branch.id, {
                        condition: { ...branch.condition, statusId: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">ステータスを選択</option>
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={branch.condition.value?.toString() || ''}
                      onChange={(e) => updateConditionalBranch(branch.id, {
                        condition: { ...branch.condition, value: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="値を入力"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderActionTriggers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">アクショントリガー</h3>
        <button
          onClick={addActionTrigger}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          トリガーを追加
        </button>
      </div>

      {packData.actionTriggers?.map((trigger, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                トリガータイプ
              </label>
              <select
                value={trigger.type}
                onChange={(e) => {
                  const newTriggers = [...(packData.actionTriggers || [])]
                  newTriggers[index] = { ...newTriggers[index], type: e.target.value as ActionTrigger['type'] }
                  setPackData(prev => ({ ...prev, actionTriggers: newTriggers }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="IMMEDIATE">即座に実行</option>
                <option value="TIME_DELAY">時間遅延</option>
                <option value="URL_CLICK">URLクリック</option>
                <option value="BUTTON_CLICK">ボタンクリック</option>
                <option value="FRIEND_ADDED">友達追加時</option>
                <option value="TAG_ADDED">タグ追加時</option>
                <option value="RESERVATION_MADE">予約作成時</option>
                <option value="EVENT_TRIGGER">カスタムイベント</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                遅延時間（分）
              </label>
              <input
                type="number"
                value={trigger.delayMinutes || 0}
                onChange={(e) => {
                  const newTriggers = [...(packData.actionTriggers || [])]
                  newTriggers[index] = { ...newTriggers[index], delayMinutes: parseInt(e.target.value) }
                  setPackData(prev => ({ ...prev, actionTriggers: newTriggers }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {pack ? 'Packを編集' : '新しいPackを作成'}
        </h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'basic', name: '基本設定', icon: Settings },
            { id: 'conditions', name: '条件分岐', icon: GitBranch },
            { id: 'triggers', name: 'トリガー', icon: Zap },
            { id: 'actions', name: 'アクション', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'basic' && renderBasicSettings()}
        {activeTab === 'conditions' && renderConditionalLogic()}
        {activeTab === 'triggers' && renderActionTriggers()}
        {activeTab === 'actions' && (
          <div className="text-center py-8 text-gray-500">
            アクション設定は開発中です
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </div>
  )
}