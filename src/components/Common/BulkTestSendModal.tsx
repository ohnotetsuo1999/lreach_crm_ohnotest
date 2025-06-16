'use client'

import { useState } from 'react'
import { User, Scenario, Template, ReservationReminder } from '@/types'
import { UserSelector } from './UserSelector'
import { Send, X, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'

interface BulkTestSendItem {
  id: string
  name: string
  type: 'scenario' | 'template' | 'reminder'
  content?: string
  description?: string
}

interface BulkTestSendModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  scenarios: Scenario[]
  templates: Template[]
  reminders: ReservationReminder[]
  onSend: (userIds: string[], items: BulkTestSendItem[], message?: string) => Promise<void>
  isLoading?: boolean
}

export function BulkTestSendModal({
  isOpen,
  onClose,
  users,
  scenarios,
  templates,
  reminders,
  onSend,
  isLoading = false
}: BulkTestSendModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['scenarios', 'templates', 'reminders'])

  if (!isOpen) return null

  // アイテムを統合
  const allItems: BulkTestSendItem[] = [
    ...scenarios.map(s => ({ 
      id: s.id, 
      name: s.name, 
      type: 'scenario' as const,
      description: s.description 
    })),
    ...templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      type: 'template' as const,
      content: t.content 
    })),
    ...reminders.map(r => ({ 
      id: r.id, 
      name: r.name, 
      type: 'reminder' as const,
      description: r.description 
    }))
  ]

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAllItems = (type: string) => {
    const typeItems = allItems.filter(item => item.type === type)
    const typeItemIds = typeItems.map(item => item.id)
    const allSelected = typeItemIds.every(id => selectedItems.includes(id))
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !typeItemIds.includes(id)))
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...typeItemIds])])
    }
  }

  const handleSend = async () => {
    if (selectedUsers.length === 0 || selectedItems.length === 0) return

    try {
      setSending(true)
      const itemsToSend = allItems.filter(item => selectedItems.includes(item.id))
      await onSend(selectedUsers, itemsToSend, message.trim() || undefined)
      onClose()
      setSelectedUsers([])
      setSelectedItems([])
      setMessage('')
    } catch (error) {
      console.error('一括テスト送信エラー:', error)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onClose()
      setSelectedUsers([])
      setSelectedItems([])
      setMessage('')
    }
  }

  const renderItemSection = (type: 'scenario' | 'template' | 'reminder', title: string, items: BulkTestSendItem[]) => {
    const isExpanded = expandedSections.includes(type)
    const selectedCount = items.filter(item => selectedItems.includes(item.id)).length
    
    return (
      <div className="border border-gray-200 rounded-lg">
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-900">{title}</span>
            <span className="text-sm text-gray-500">
              ({selectedCount}/{items.length})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleSelectAllItems(type)
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedCount === items.length ? '選択解除' : '全て選択'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-200 max-h-40 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {title}がありません
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleItemToggle(item.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        selectedItems.includes(item.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedItems.includes(item.id) && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </div>
                      {(item.description || item.content) && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {item.description || (item.content && item.content.length > 50 
                            ? item.content.substring(0, 50) + '...' 
                            : item.content)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">一括テスト送信</h3>
            <p className="text-sm text-gray-600 mt-1">
              複数のコンテンツを選択したユーザーに一括送信します
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={sending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* 左側: コンテンツ選択 */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-900 mb-4">送信コンテンツ選択</h4>
            <div className="space-y-3">
              {renderItemSection(
                'scenario',
                'シナリオ',
                allItems.filter(item => item.type === 'scenario')
              )}
              {renderItemSection(
                'template',
                'テンプレート',
                allItems.filter(item => item.type === 'template')
              )}
              {renderItemSection(
                'reminder',
                'リマインダー',
                allItems.filter(item => item.type === 'reminder')
              )}
            </div>

            {/* 選択サマリー */}
            {selectedItems.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900">
                  選択中: {selectedItems.length} 件
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  シナリオ: {selectedItems.filter(id => allItems.find(item => item.id === id)?.type === 'scenario').length} |
                  テンプレート: {selectedItems.filter(id => allItems.find(item => item.id === id)?.type === 'template').length} |
                  リマインダー: {selectedItems.filter(id => allItems.find(item => item.id === id)?.type === 'reminder').length}
                </div>
              </div>
            )}
          </div>

          {/* 右側: ユーザー選択 */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* メッセージ入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  追加メッセージ（任意）
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="一括送信時に追加するメッセージを入力..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* ユーザー選択 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  送信先ユーザー選択
                </h4>
                <UserSelector
                  users={users}
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                  maxHeight="max-h-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 警告と送信ボタン */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {selectedUsers.length > 0 && selectedItems.length > 0 && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <div className="font-medium">一括テスト送信について</div>
                <div className="mt-1">
                  {selectedUsers.length} 名のユーザーに {selectedItems.length} 件のコンテンツが送信されます。
                  合計 {selectedUsers.length * selectedItems.length} 件のメッセージが送信されます。
                  送信は取り消すことができませんのでご注意ください。
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={sending}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSend}
              disabled={selectedUsers.length === 0 || selectedItems.length === 0 || sending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>一括送信 ({selectedUsers.length} × {selectedItems.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}