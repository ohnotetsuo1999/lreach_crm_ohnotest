'use client'

import { useState } from 'react'
import { ActionRule, Tag, Status } from '@/types'
import { QuickActionRuleCreator } from './QuickActionRuleCreator'
import { Zap, Settings, ChevronDown, ChevronUp } from 'lucide-react'

interface ButtonActionBindingProps {
  templateId: string
  packId: string
  buttonText: string
  existingRules: ActionRule[]
  tags: Tag[]
  statuses: Status[]
  onCreateRule: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteRule: (ruleId: string) => void
}

export function ButtonActionBinding({
  templateId,
  packId,
  buttonText,
  existingRules,
  tags,
  statuses,
  onCreateRule,
  onDeleteRule
}: ButtonActionBindingProps) {
  const [showCreator, setShowCreator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // このボタンに関連するルールを取得
  const buttonRules = existingRules.filter(rule => 
    rule.templateId === templateId && 
    rule.actionType === 'BUTTON_CLICK' && 
    rule.actionCondition.value === buttonText
  )

  const getTagActionSummary = (rule: ActionRule) => {
    return rule.tagActions.map(action => {
      switch (action.type) {
        case 'ADD_TAG':
          const tag = tags.find(t => t.id === action.tagId)
          return `+${tag?.name || '不明'}`
        case 'REMOVE_TAG':
          const removeTag = tags.find(t => t.id === action.tagId)
          return `-${removeTag?.name || '不明'}`
        case 'SET_STATUS':
          const status = statuses.find(s => s.id === action.statusId)
          return `→${status?.label || '不明'}`
        default:
          return '不明'
      }
    }).join(', ')
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-900">
              「{buttonText}」ボタンのアクション
            </span>
            {buttonRules.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {buttonRules.length}件設定済み
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {!showCreator && buttonRules.length === 0 && (
              <button
                onClick={() => setShowCreator(true)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
              >
                <Zap className="w-3 h-3 mr-1" />
                設定
              </button>
            )}
            
            {buttonRules.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-3">
        {/* 既存ルール一覧 */}
        {buttonRules.length > 0 && isExpanded && (
          <div className="space-y-2 mb-3">
            {buttonRules.map((rule) => (
              <div key={rule.id} className="bg-orange-50 border border-orange-200 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {rule.description}
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">実行:</span> {getTagActionSummary(rule)}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded text-xs"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            
            {!showCreator && (
              <button
                onClick={() => setShowCreator(true)}
                className="w-full py-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 border-dashed rounded hover:bg-orange-100"
              >
                + 追加のアクションを設定
              </button>
            )}
          </div>
        )}

        {/* クイック作成フォーム */}
        {showCreator && (
          <QuickActionRuleCreator
            templateId={templateId}
            packId={packId}
            buttonText={buttonText}
            tags={tags}
            statuses={statuses}
            onCreateRule={(rule) => {
              onCreateRule(rule)
              setShowCreator(false)
              setIsExpanded(true)
            }}
            onClose={() => setShowCreator(false)}
          />
        )}

        {/* 未設定時のメッセージ */}
        {buttonRules.length === 0 && !showCreator && (
          <div className="text-center py-4 text-gray-500">
            <Zap className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-xs mb-2">
              このボタンにアクションが設定されていません
            </p>
            <button
              onClick={() => setShowCreator(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
            >
              <Settings className="w-3 h-3 mr-1" />
              アクションを設定
            </button>
          </div>
        )}

        {/* 簡単な説明 */}
        {buttonRules.length === 0 && !showCreator && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            💡 ユーザーがこのボタンをクリックした時に自動でタグ付けやステータス変更ができます
          </div>
        )}
      </div>
    </div>
  )
}