'use client'

import { useState, useEffect } from 'react'
import { ActionRule, ScenarioActionRule, TagAction, ActionType, Tag, Status, Scenario, Template } from '@/types'
import { X, Plus, Trash2, AlertCircle, Target, HelpCircle } from 'lucide-react'

interface ActionRuleEditorProps {
  rule: ScenarioActionRule | null
  isOpen: boolean
  onClose: () => void
  onSave: (rule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  tags: Tag[]
  statuses: Status[]
  scenarios: Scenario[]
  templates: Template[]
}

export function ActionRuleEditor({
  rule,
  isOpen,
  onClose,
  onSave,
  tags,
  statuses,
  scenarios,
  templates
}: ActionRuleEditorProps) {
  const [formData, setFormData] = useState({
    description: '',
    actionType: 'URL_CLICK' as ActionType,
    actionCondition: {
      operator: 'contains' as 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'any',
      value: '',
      regex: undefined as string | undefined
    },
    tagActions: [] as TagAction[],
    priority: 1,
    isActive: true,
    templateId: '',
    scenarioId: '',
    packId: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (rule) {
      setFormData({
        description: rule.description || '',
        actionType: rule.actionType,
        actionCondition: {
          operator: rule.actionCondition.operator,
          value: rule.actionCondition.value,
          regex: rule.actionCondition.regex || undefined
        },
        tagActions: rule.tagActions,
        priority: rule.priority,
        isActive: rule.isActive,
        templateId: '',
        scenarioId: '',
        packId: ''
      })
    } else {
      setFormData({
        description: '',
        actionType: 'URL_CLICK',
        actionCondition: {
          operator: 'contains',
          value: '',
          regex: undefined
        },
        tagActions: [],
        priority: 1,
        isActive: true,
        templateId: '',
        scenarioId: '',
        packId: ''
      })
    }
    setErrors({})
  }, [rule])

  const actionTypes: { value: ActionType; label: string; description: string }[] = [
    {
      value: 'URL_CLICK',
      label: 'URLクリック',
      description: 'メッセージ内のURLがクリックされた時'
    },
    {
      value: 'BUTTON_CLICK',
      label: 'ボタンクリック',
      description: 'Flexメッセージのボタンがクリックされた時'
    },
    {
      value: 'POSTBACK',
      label: 'ポストバック',
      description: 'ポストバックアクションが実行された時'
    },
    {
      value: 'REPLY',
      label: '返信',
      description: 'ユーザーが返信メッセージを送信した時'
    },
    {
      value: 'IMAGE_CLICK',
      label: '画像クリック',
      description: 'メッセージ内の画像がクリックされた時'
    },
    {
      value: 'MESSAGE_SHARE',
      label: 'メッセージシェア',
      description: 'メッセージがシェアされた時'
    },
    {
      value: 'REACTION',
      label: 'リアクション',
      description: 'メッセージにリアクションが付けられた時'
    },
    {
      value: 'CUSTOM',
      label: 'カスタム',
      description: 'カスタムアクションが実行された時'
    }
  ]

  const operators = [
    { value: 'any', label: 'すべて', description: 'すべてのアクションに適用' },
    { value: 'equals', label: '完全一致', description: '値が完全に一致する場合' },
    { value: 'contains', label: '含む', description: '値が含まれる場合' },
    { value: 'starts_with', label: '前方一致', description: '値で始まる場合' },
    { value: 'ends_with', label: '後方一致', description: '値で終わる場合' },
    { value: 'regex', label: '正規表現', description: '正規表現パターンに一致する場合' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'ルール名は必須です'
    }

    if (formData.actionCondition.operator !== 'any' && formData.actionCondition.operator !== 'regex' && !formData.actionCondition.value) {
      newErrors.conditionValue = '条件値は必須です'
    }

    if (formData.actionCondition.operator === 'regex' && !formData.actionCondition.regex) {
      newErrors.conditionRegex = '正規表現パターンは必須です'
    }

    if (formData.tagActions.length === 0) {
      newErrors.tagActions = '少なくとも1つのアクションを設定してください'
    }

    // 正規表現の妥当性チェック
    if (formData.actionCondition.operator === 'regex' && formData.actionCondition.regex) {
      try {
        new RegExp(formData.actionCondition.regex)
      } catch (e) {
        newErrors.conditionRegex = '無効な正規表現です'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const ruleData: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      packTemplateId: formData.packId || 'default-pt', // Temporary default value
      description: formData.description,
      actionType: formData.actionType,
      actionCondition: formData.actionCondition,
      tagActions: formData.tagActions,
      priority: formData.priority,
      isActive: formData.isActive
    }

    onSave(ruleData)
  }

  const addTagAction = () => {
    setFormData({
      ...formData,
      tagActions: [
        ...formData.tagActions,
        {
          type: 'ADD_TAG',
          tagId: tags[0]?.id || ''
        }
      ]
    })
  }

  const updateTagAction = (index: number, action: TagAction) => {
    const newActions = [...formData.tagActions]
    newActions[index] = action
    setFormData({ ...formData, tagActions: newActions })
  }

  const removeTagAction = (index: number) => {
    setFormData({
      ...formData,
      tagActions: formData.tagActions.filter((_, i) => i !== index)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {rule ? 'アクションルール編集' : '新規アクションルール作成'}
              </h2>
              <p className="text-sm text-gray-600">
                ユーザーアクションに基づく自動タグ付与ルールを設定
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* 基本設定 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">基本設定</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ルール名 *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="例: 商品ページ閲覧者にVIPタグ付与"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      優先度
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      数値が大きいほど優先されます（1-100）
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">
                      作成後すぐに有効にする
                    </label>
                  </div>
                </div>
              </div>

              {/* アクション設定 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">トリガーアクション</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アクション種別 *
                    </label>
                    <select
                      value={formData.actionType}
                      onChange={(e) => setFormData({ ...formData, actionType: e.target.value as ActionType })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      {actionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {actionTypes.find(t => t.value === formData.actionType)?.description}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      条件設定
                    </label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <select
                        value={formData.actionCondition.operator}
                        onChange={(e) => setFormData({
                          ...formData,
                          actionCondition: {
                            ...formData.actionCondition,
                            operator: e.target.value as any
                          }
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      
                      {formData.actionCondition.operator !== 'any' && (
                        <input
                          type="text"
                          value={formData.actionCondition.operator === 'regex' ? formData.actionCondition.regex : formData.actionCondition.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            actionCondition: {
                              ...formData.actionCondition,
                              [formData.actionCondition.operator === 'regex' ? 'regex' : 'value']: e.target.value
                            }
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder={
                            formData.actionCondition.operator === 'regex' 
                              ? '例: ^https://shop\\.example\\.com/.*' 
                              : '例: https://shop.example.com'
                          }
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {operators.find(op => op.value === formData.actionCondition.operator)?.description}
                    </p>
                    {errors.conditionValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.conditionValue}</p>
                    )}
                    {errors.conditionRegex && (
                      <p className="mt-1 text-sm text-red-600">{errors.conditionRegex}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 実行アクション */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">実行アクション</h3>
                  <button
                    onClick={addTagAction}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    アクション追加
                  </button>
                </div>
                
                {formData.tagActions.length > 0 ? (
                  <div className="space-y-3">
                    {formData.tagActions.map((action, index) => (
                      <div key={index} className="bg-white rounded border border-gray-200 p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <select
                              value={action.type}
                              onChange={(e) => updateTagAction(index, {
                                ...action,
                                type: e.target.value as 'ADD_TAG' | 'REMOVE_TAG' | 'SET_STATUS'
                              })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                              >
                                <option value="">ステータスを選択</option>
                                {statuses.map((status) => (
                                  <option key={status.id} value={status.id}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          
                          <button
                            onClick={() => removeTagAction(index)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">実行アクションが設定されていません</p>
                    <button
                      onClick={addTagAction}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      最初のアクションを追加
                    </button>
                  </div>
                )}
                
                {errors.tagActions && (
                  <p className="mt-2 text-sm text-red-600">{errors.tagActions}</p>
                )}
              </div>

              {/* 適用範囲（オプション） */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  適用範囲 (オプション)
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  特定のシナリオやテンプレートにのみ適用する場合は設定してください。未設定の場合は全体に適用されます。
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対象シナリオ
                    </label>
                    <select
                      value={formData.scenarioId}
                      onChange={(e) => setFormData({ ...formData, scenarioId: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">すべてのシナリオ</option>
                      {scenarios.map((scenario) => (
                        <option key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対象テンプレート
                    </label>
                    <select
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">すべてのテンプレート</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          テンプレート {template.order}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                {rule ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}