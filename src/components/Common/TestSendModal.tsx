'use client'

import { useState } from 'react'
import { User } from '@/types'
import { UserSelector } from './UserSelector'
import { Send, X, AlertCircle } from 'lucide-react'

interface TestSendModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  title: string
  contentPreview?: React.ReactNode
  onSend: (userIds: string[], message?: string) => Promise<void>
  isLoading?: boolean
}

export function TestSendModal({
  isOpen,
  onClose,
  users,
  title,
  contentPreview,
  onSend,
  isLoading = false
}: TestSendModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (selectedUsers.length === 0) return

    try {
      setSending(true)
      await onSend(selectedUsers, message.trim() || undefined)
      onClose()
      setSelectedUsers([])
      setMessage('')
    } catch (error) {
      console.error('テスト送信エラー:', error)
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onClose()
      setSelectedUsers([])
      setMessage('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              選択したユーザーにテスト送信を行います
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

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* コンテンツプレビュー */}
          {contentPreview && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">プレビュー</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {contentPreview}
              </div>
            </div>
          )}

          {/* メッセージ入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加メッセージ（任意）
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="テスト送信時に追加するメッセージを入力..."
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

          {/* 警告メッセージ */}
          {selectedUsers.length > 0 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">テスト送信について</div>
                <div className="mt-1">
                  選択した {selectedUsers.length} 名のユーザーに実際にメッセージが送信されます。
                  テスト送信は取り消すことができませんのでご注意ください。
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSend}
            disabled={selectedUsers.length === 0 || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>送信中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>テスト送信 ({selectedUsers.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}