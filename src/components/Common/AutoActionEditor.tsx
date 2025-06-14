'use client'

import { useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Tag, 
  ToggleLeft, 
  MessageSquare, 
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { BroadcastAction, Tag as TagType, Status, ActionTrigger, EventIntegration } from '@/types'

interface AutoActionEditorProps {
  actions: BroadcastAction[]
  onAddAction: (action: BroadcastAction) => void
  onRemoveAction: (actionId: string) => void
  onUpdateAction: (actionId: string, updates: Partial<BroadcastAction>) => void
  tags: TagType[]
  statuses: Status[]
  className?: string
  // Enhanced features
  supportedTriggers?: ActionTrigger['type'][]
  eventIntegration?: EventIntegration
  showAdvancedFeatures?: boolean
}

export function AutoActionEditor({
  actions,
  onAddAction,
  onRemoveAction,
  onUpdateAction,
  tags,
  statuses,
  className = '',
  supportedTriggers = ['IMMEDIATE', 'TIME_DELAY', 'URL_CLICK', 'BUTTON_CLICK'],
  eventIntegration,
  showAdvancedFeatures = false
}: AutoActionEditorProps) {
  const [showActionModal, setShowActionModal] = useState(false)
  const [editingAction, setEditingAction] = useState<BroadcastAction | null>(null)
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ADD_TAG':
      case 'REMOVE_TAG':
        return Tag
      case 'CHANGE_STATUS':
        return ToggleLeft
      case 'SEND_MESSAGE':
        return MessageSquare
      case 'WAIT':
        return Clock
      default:
        return Plus
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'ADD_TAG':
        return 'border-green-200 bg-green-50'
      case 'REMOVE_TAG':
        return 'border-red-200 bg-red-50'
      case 'CHANGE_STATUS':
        return 'border-blue-200 bg-blue-50'
      case 'SEND_MESSAGE':
        return 'border-purple-200 bg-purple-50'
      case 'WAIT':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getActionDescription = (action: BroadcastAction): string => {
    switch (action.type) {
      case 'ADD_TAG':
        const addTagId = action.payload?.tagIds?.[0]
        const addTag = tags.find(t => t.id === addTagId)
        return `「${addTag?.name || '未選択'}」タグを追加`
      case 'REMOVE_TAG':
        const removeTagId = action.payload?.tagIds?.[0]
        const removeTag = tags.find(t => t.id === removeTagId)
        return `「${removeTag?.name || '未選択'}」タグを削除`
      case 'CHANGE_STATUS':
        const status = statuses.find(s => s.id === action.payload?.statusId)
        return `ステータスを「${status?.label || '未選択'}」に変更`
      case 'SEND_MESSAGE':
        return `メッセージ「${action.payload?.message || '未設定'}」を送信`
      case 'WAIT':
        return `${action.payload?.waitMinutes || 0}分間待機`
      default:
        return 'アクション設定'
    }
  }

  const getTriggerDescription = (action: BroadcastAction): string => {
    if (!action.trigger) return '常に実行'
    
    switch (action.trigger.type) {
      case 'IMMEDIATE':
        return '即座に実行'
      case 'TIME_DELAY':
        return `${action.trigger.delayMinutes || 0}分後に実行`
      case 'URL_CLICK':
        return 'URLクリック時に実行'
      case 'BUTTON_CLICK':
        return 'ボタンクリック時に実行'
      case 'MESSAGE_OPEN':
        return 'メッセージ開封時に実行'
      case 'MESSAGE_REPLY':
        return 'メッセージ返信時に実行'
      case 'FRIEND_ADDED':
        return '友達追加時に実行'
      case 'TAG_ADDED':
        return 'タグ追加時に実行'
      case 'TAG_REMOVED':
        return 'タグ削除時に実行'
      case 'STATUS_CHANGED':
        return 'ステータス変更時に実行'
      case 'RESERVATION_MADE':
        return '予約作成時に実行'
      case 'RESERVATION_CANCELLED':
        return '予約キャンセル時に実行'
      case 'EVENT_TRIGGER':
        return 'カスタムイベント時に実行'
      case 'RECURRING':
        return '定期実行'
      default:
        return '常に実行'
    }
  }

  const toggleActionExpansion = (actionId: string) => {
    const newExpanded = new Set(expandedActions)
    if (expandedActions.has(actionId)) {
      newExpanded.delete(actionId)
    } else {
      newExpanded.add(actionId)
    }
    setExpandedActions(newExpanded)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">自動アクション</h4>
        <button
          onClick={() => setShowActionModal(true)}
          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
        >
          <Plus className="w-3 h-3 mr-1" />
          アクションを追加
        </button>
      </div>

      {actions.length > 0 ? (
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = getActionIcon(action.type)
            const isExpanded = expandedActions.has(action.id)
            
            return (
              <div key={action.id} className="space-y-2">
                <div className={`border rounded-md ${getActionColor(action.type)}`}>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => toggleActionExpansion(action.id)}
                        className="p-1 hover:bg-white/50 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      <Icon className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {action.type === 'ADD_TAG' ? 'タグを追加' :
                           action.type === 'REMOVE_TAG' ? 'タグを削除' :
                           action.type === 'CHANGE_STATUS' ? 'ステータス変更' :
                           action.type === 'SEND_MESSAGE' ? 'メッセージ送信' :
                           action.type === 'WAIT' ? '待機' : 'アクション'}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {getActionDescription(action)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingAction(action)
                          setShowActionModal(true)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="編集"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveAction(action.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                        title="削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 詳細表示 */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-white/50">
                      <div className="space-y-2 mt-2">
                        <div className="text-xs">
                          <span className="font-medium">トリガー: </span>
                          {getTriggerDescription(action)}
                        </div>
                        {action.condition && (
                          <div className="text-xs">
                            <span className="font-medium">条件: </span>
                            条件設定あり
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">自動アクションが設定されていません</p>
          <p className="text-xs mt-1">アクションを追加して自動化を設定しましょう</p>
        </div>
      )}

      {/* アクション設定モーダル */}
      {showActionModal && (
        <ActionSettingModal
          action={editingAction}
          tags={tags}
          statuses={statuses}
          showAdvancedFeatures={showAdvancedFeatures}
          onSave={(action) => {
            if (editingAction) {
              onUpdateAction(editingAction.id, action)
            } else {
              onAddAction({
                ...action,
                id: `action_${Date.now()}`,
                type: action.type!,
                order: actions.length
              } as BroadcastAction)
            }
            setShowActionModal(false)
            setEditingAction(null)
          }}
          onClose={() => {
            setShowActionModal(false)
            setEditingAction(null)
          }}
        />
      )}
    </div>
  )
}

// アクション設定モーダルコンポーネント
interface ActionSettingModalProps {
  action?: BroadcastAction | null
  tags: TagType[]
  statuses: Status[]
  showAdvancedFeatures?: boolean
  onSave: (action: Partial<BroadcastAction>) => void
  onClose: () => void
}

function ActionSettingModal({ action, tags, statuses, showAdvancedFeatures = false, onSave, onClose }: ActionSettingModalProps) {
  const [actionType, setActionType] = useState(action?.type || 'ADD_TAG')
  const [tagId, setTagId] = useState(action?.payload?.tagIds?.[0] || '')
  const [statusId, setStatusId] = useState(action?.payload?.statusId || '')
  const [messageContent, setMessageContent] = useState(action?.payload?.message || '')
  const [waitTime, setWaitTime] = useState(action?.payload?.waitMinutes || 5)
  const [triggerType, setTriggerType] = useState(action?.trigger?.type || 'IMMEDIATE')
  const [triggerDelay, setTriggerDelay] = useState(action?.trigger?.delayMinutes || 0)

  const handleSave = () => {
    const payload: any = {}

    switch (actionType) {
      case 'ADD_TAG':
      case 'REMOVE_TAG':
        payload.tagIds = tagId ? [tagId] : []
        break
      case 'CHANGE_STATUS':
        payload.statusId = statusId
        break
      case 'SEND_MESSAGE':
        payload.message = messageContent
        break
      case 'WAIT':
        payload.waitMinutes = waitTime
        break
    }

    const newAction: Partial<BroadcastAction> = {
      type: actionType as any,
      trigger: {
        type: triggerType as any,
        delayMinutes: triggerDelay
      },
      payload
    }

    onSave(newAction)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {action ? 'アクションを編集' : '新規アクション作成'}
          </h3>
          
          <div className="space-y-4">
            {/* アクションタイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">アクションタイプ</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ADD_TAG">タグを追加</option>
                <option value="REMOVE_TAG">タグを削除</option>
                <option value="CHANGE_STATUS">ステータス変更</option>
                <option value="SEND_MESSAGE">メッセージ送信</option>
                <option value="WAIT">待機</option>
              </select>
            </div>

            {/* アクション設定 */}
            {(actionType === 'ADD_TAG' || actionType === 'REMOVE_TAG') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対象タグ</label>
                <select
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">タグを選択</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </div>
            )}

            {actionType === 'CHANGE_STATUS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">変更先ステータス</label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ステータスを選択</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </div>
            )}

            {actionType === 'SEND_MESSAGE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ内容</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="送信するメッセージを入力してください..."
                />
              </div>
            )}

            {actionType === 'WAIT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">待機時間（分）</label>
                <input
                  type="number"
                  value={waitTime}
                  onChange={(e) => setWaitTime(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* トリガー設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実行タイミング</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="IMMEDIATE">即座に実行</option>
                <option value="TIME_DELAY">遅延実行</option>
                <option value="URL_CLICK">URLクリック時</option>
                <option value="BUTTON_CLICK">ボタンクリック時</option>
                <option value="MESSAGE_OPEN">メッセージ開封時</option>
                <option value="MESSAGE_REPLY">メッセージ返信時</option>
                {showAdvancedFeatures && (
                  <>
                    <option value="FRIEND_ADDED">友達追加時</option>
                    <option value="TAG_ADDED">タグ追加時</option>
                    <option value="TAG_REMOVED">タグ削除時</option>
                    <option value="STATUS_CHANGED">ステータス変更時</option>
                    <option value="RESERVATION_MADE">予約作成時</option>
                    <option value="RESERVATION_CANCELLED">予約キャンセル時</option>
                    <option value="EVENT_TRIGGER">カスタムイベント時</option>
                    <option value="RECURRING">定期実行</option>
                  </>
                )}
              </select>
            </div>

            {triggerType === 'TIME_DELAY' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">遅延時間（分）</label>
                <input
                  type="number"
                  value={triggerDelay}
                  onChange={(e) => setTriggerDelay(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {action ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}