'use client'

import { useState } from 'react'
import { ActionRule, ScenarioActionRule, ActionType, Tag, Status, TagAction } from '@/types'
import { ActionRulePresets } from '../QuickActionRules/ActionRulePresets'
import { ActionRuleGroupDisplay } from '../ActionRules/ActionRuleGroupDisplay'
import { Plus, Trash2, Save, X, Zap, Target, Sparkles } from 'lucide-react'

interface InlineActionRuleEditorProps {
  packId: string
  templateId?: string
  existingRules: ScenarioActionRule[]
  tags: Tag[]
  statuses: Status[]
  onCreateRule: (rule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateRule: (ruleId: string, rule: Partial<ScenarioActionRule>) => void
  onDeleteRule: (ruleId: string) => void
}

export function InlineActionRuleEditor({
  packId,
  templateId,
  existingRules,
  tags,
  statuses,
  onCreateRule,
  onUpdateRule,
  onDeleteRule
}: InlineActionRuleEditorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [newRule, setNewRule] = useState({
    description: '',
    actionType: 'URL_CLICK' as ActionType,
    condition: {
      operator: 'contains' as 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'any',
      value: ''
    },
    tagActions: [] as TagAction[]
  })

  // このPackまたはTemplateに関連するルールを取得
  const relevantRules = existingRules.filter(rule => 
    rule.packTemplateId.includes(packId) || (templateId && rule.packTemplateId.includes(templateId))
  )

  const actionTypes = [
    { value: 'URL_CLICK', label: 'URLクリック' },
    { value: 'BUTTON_CLICK', label: 'ボタンクリック' },
    { value: 'REPLY', label: '返信' },
    { value: 'POSTBACK', label: 'ポストバック' },
    { value: 'REACTION', label: 'リアクション' }
  ]

  const operators = [
    { value: 'any', label: 'すべて' },
    { value: 'equals', label: '完全一致' },
    { value: 'contains', label: '含む' },
    { value: 'starts_with', label: '前方一致' },
    { value: 'ends_with', label: '後方一致' }
  ]

  const handleSaveNewRule = () => {
    if (!newRule.description.trim()) return

    const rule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      packTemplateId: templateId ? `${packId}-${templateId}` : packId,
      description: newRule.description,
      actionType: newRule.actionType,
      actionCondition: {
        operator: newRule.condition.operator,
        value: newRule.condition.value,
        regex: undefined
      },
      tagActions: newRule.tagActions,
      isActive: true,
      priority: 5
    }

    onCreateRule(rule)
    setNewRule({
      description: '',
      actionType: 'URL_CLICK',
      condition: { operator: 'contains', value: '' },
      tagActions: []
    })
    setIsCreating(false)
  }

  const addTagAction = () => {
    setNewRule({
      ...newRule,
      tagActions: [
        ...newRule.tagActions,
        {
          type: 'ADD_TAG',
          tagId: tags[0]?.id || ''
        }
      ]
    })
  }

  const updateTagAction = (index: number, action: TagAction) => {
    const newActions = [...newRule.tagActions]
    newActions[index] = action
    setNewRule({ ...newRule, tagActions: newActions })
  }

  const removeTagAction = (index: number) => {
    setNewRule({
      ...newRule,
      tagActions: newRule.tagActions.filter((_, i) => i !== index)
    })
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-orange-500" />
          アクションルール ({relevantRules.length})
        </h4>
        {!isCreating && !showPresets && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPresets(true)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              プリセット
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
            >
              <Plus className="w-3 h-3 mr-1" />
              カスタム
            </button>
          </div>
        )}
      </div>

      {/* 既存ルール一覧 */}
      {relevantRules.length > 0 && (
        <div className="mb-4">
          <ActionRuleGroupDisplay
            rules={relevantRules}
            tags={tags}
            statuses={statuses}
            title={templateId ? "テンプレート専用ルール" : "Pack共通ルール"}
            context={templateId ? "template" : "pack"}
            onDeleteRule={onDeleteRule}
            showContext={false}
          />
        </div>
      )}

      {/* プリセット選択 */}
      {showPresets && (
        <div className="mb-4">
          <ActionRulePresets
            templateId={templateId}
            packId={packId}
            tags={tags}
            statuses={statuses}
            onCreateRule={(rule) => {
              const scenarioRule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
                packTemplateId: templateId ? `${packId}-${templateId}` : packId,
                actionType: rule.actionType,
                actionCondition: rule.actionCondition,
                tagActions: rule.tagActions,
                isActive: rule.isActive,
                priority: rule.priority,
                description: rule.description
              }
              onCreateRule(scenarioRule)
              setShowPresets(false)
            }}
          />
          <button
            onClick={() => setShowPresets(false)}
            className="mt-2 text-xs text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
        </div>
      )}

      {/* 新規ルール作成フォーム */}
      {isCreating && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ルール名 *
              </label>
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="例: 商品ページクリック者にVIPタグ付与"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  アクション種別
                </label>
                <select
                  value={newRule.actionType}
                  onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value as ActionType })}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                >
                  {actionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  条件
                </label>
                <select
                  value={newRule.condition.operator}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    condition: { ...newRule.condition, operator: e.target.value as any }
                  })}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {newRule.condition.operator !== 'any' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  条件値
                </label>
                <input
                  type="text"
                  value={newRule.condition.value}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    condition: { ...newRule.condition, value: e.target.value }
                  })}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="例: https://shop.example.com"
                />
              </div>
            )}

            {/* タグアクション */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  実行アクション
                </label>
                <button
                  onClick={addTagAction}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  アクション追加
                </button>
              </div>
              
              {newRule.tagActions.length > 0 ? (
                <div className="space-y-2">
                  {newRule.tagActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={action.type}
                        onChange={(e) => updateTagAction(index, {
                          ...action,
                          type: e.target.value as 'ADD_TAG' | 'REMOVE_TAG' | 'SET_STATUS'
                        })}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="ADD_TAG">タグ追加</option>
                        <option value="REMOVE_TAG">タグ削除</option>
                        <option value="SET_STATUS">ステータス変更</option>
                      </select>
                      
                      {(action.type === 'ADD_TAG' || action.type === 'REMOVE_TAG') && (
                        <select
                          value={action.tagId || ''}
                          onChange={(e) => updateTagAction(index, {
                            ...action,
                            tagId: e.target.value
                          })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">タグを選択</option>
                          {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {action.type === 'SET_STATUS' && (
                        <select
                          value={action.statusId || ''}
                          onChange={(e) => updateTagAction(index, {
                            ...action,
                            statusId: e.target.value
                          })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="">ステータスを選択</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      <button
                        onClick={() => removeTagAction(index)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  実行アクションを追加してください
                </p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveNewRule}
                disabled={!newRule.description.trim() || newRule.tagActions.length === 0}
                className="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3 mr-1 inline" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {relevantRules.length === 0 && !isCreating && !showPresets && (
        <div className="text-center py-4 text-gray-500">
          <Target className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-xs">このPackに関連するアクションルールはありません</p>
          <div className="mt-3 flex space-x-2 justify-center">
            <button
              onClick={() => setShowPresets(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              プリセットから選択
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
            >
              <Plus className="w-3 h-3 mr-1" />
              カスタムルール
            </button>
          </div>
        </div>
      )}
    </div>
  )
}