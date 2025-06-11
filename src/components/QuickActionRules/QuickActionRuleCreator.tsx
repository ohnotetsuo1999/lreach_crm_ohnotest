'use client'

import { useState } from 'react'
import { ActionRule, Tag, Status } from '@/types'
import { Zap, Plus, Tag as TagIcon, ArrowRight, X } from 'lucide-react'

interface QuickActionRuleCreatorProps {
  templateId?: string
  packId?: string
  buttonText?: string
  urlPattern?: string
  tags: Tag[]
  statuses: Status[]
  onCreateRule: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose?: () => void
}

export function QuickActionRuleCreator({
  templateId,
  packId,
  buttonText,
  urlPattern,
  tags,
  statuses,
  onCreateRule,
  onClose
}: QuickActionRuleCreatorProps) {
  const [selectedAction, setSelectedAction] = useState<'ADD_TAG' | 'SET_STATUS'>('ADD_TAG')
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || '')
  const [selectedStatusId, setSelectedStatusId] = useState(statuses[0]?.id || '')

  const handleQuickCreate = () => {
    const isButtonClick = !!buttonText
    const actionType = isButtonClick ? 'BUTTON_CLICK' : 'URL_CLICK'
    const conditionValue = isButtonClick ? buttonText : urlPattern || ''

    const tagAction = selectedAction === 'ADD_TAG' 
      ? { type: 'ADD_TAG' as const, tagId: selectedTagId }
      : { type: 'SET_STATUS' as const, statusId: selectedStatusId }

    const rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      description: isButtonClick 
        ? `「${buttonText}」ボタンクリック時の自動処理`
        : `URLクリック時の自動処理`,
      actionType,
      actionCondition: {
        operator: 'equals',
        value: conditionValue,
        regex: ''
      },
      tagActions: [tagAction],
      isActive: true,
      priority: 8,
      templateId,
      packId
    }

    onCreateRule(rule)
    onClose?.()
  }

  const getActionPreview = () => {
    if (selectedAction === 'ADD_TAG') {
      const tag = tags.find(t => t.id === selectedTagId)
      return `${tag?.name}タグを追加`
    } else {
      const status = statuses.find(s => s.id === selectedStatusId)
      return `ステータスを${status?.label}に変更`
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Zap className="w-4 h-4 text-orange-500 mr-2" />
          <h4 className="text-sm font-medium text-gray-900">
            クイックアクション設定
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* トリガー表示 */}
        <div className="bg-white rounded border border-orange-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-1">トリガー</div>
          <div className="text-sm text-gray-900">
            {buttonText ? (
              <span className="inline-flex items-center">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">
                  ボタン
                </span>
                「{buttonText}」をクリック
              </span>
            ) : (
              <span className="inline-flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-2">
                  URL
                </span>
                リンクをクリック
              </span>
            )}
          </div>
        </div>

        {/* アクション選択 */}
        <div className="bg-white rounded border border-orange-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">実行アクション</div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ADD_TAG"
                  checked={selectedAction === 'ADD_TAG'}
                  onChange={(e) => setSelectedAction(e.target.value as 'ADD_TAG')}
                  className="text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <TagIcon className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                <span className="text-sm text-gray-700">タグを追加</span>
              </label>
              
              {selectedAction === 'ADD_TAG' && (
                <select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="SET_STATUS"
                  checked={selectedAction === 'SET_STATUS'}
                  onChange={(e) => setSelectedAction(e.target.value as 'SET_STATUS')}
                  className="text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <ArrowRight className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                <span className="text-sm text-gray-700">ステータス変更</span>
              </label>
              
              {selectedAction === 'SET_STATUS' && (
                <select
                  value={selectedStatusId}
                  onChange={(e) => setSelectedStatusId(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="bg-orange-100 rounded border border-orange-300 p-3">
          <div className="text-xs font-medium text-orange-800 mb-1">設定内容</div>
          <div className="text-sm text-orange-900">
            {buttonText ? `「${buttonText}」ボタン` : 'URLリンク'}をクリックしたユーザーに
            <span className="font-medium mx-1">{getActionPreview()}</span>
            します
          </div>
        </div>

        {/* 作成ボタン */}
        <button
          onClick={handleQuickCreate}
          disabled={!selectedTagId && !selectedStatusId}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          アクションルールを作成
        </button>
      </div>
    </div>
  )
}