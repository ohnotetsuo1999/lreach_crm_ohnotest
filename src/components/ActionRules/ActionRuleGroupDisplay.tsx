'use client'

import { ActionRule, Tag, Status } from '@/types'
import { Zap, Target, Users, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ActionRuleGroupDisplayProps {
  rules: ActionRule[]
  tags: Tag[]
  statuses: Status[]
  title: string
  context: 'pack' | 'template' | 'scenario'
  onDeleteRule?: (ruleId: string) => void
  showContext?: boolean
}

interface GroupedRules {
  [key: string]: {
    rules: ActionRule[]
    actionType: string
    condition?: string
  }
}

export function ActionRuleGroupDisplay({
  rules,
  tags,
  statuses,
  title,
  context,
  onDeleteRule,
  showContext = false
}: ActionRuleGroupDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  if (rules.length === 0) {
    return null
  }

  // ルールをアクションタイプと条件でグループ化
  const groupRules = (): GroupedRules => {
    const groups: GroupedRules = {}
    
    rules.forEach(rule => {
      let groupKey: string = rule.actionType
      let conditionText = ''
      
      // 条件に基づいてより詳細なグループ化
      if (rule.actionCondition.operator !== 'any') {
        conditionText = `${rule.actionCondition.operator}: "${rule.actionCondition.value}"`
        groupKey = `${rule.actionType}_${rule.actionCondition.operator}_${rule.actionCondition.value}`
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          rules: [],
          actionType: rule.actionType,
          condition: conditionText
        }
      }
      
      groups[groupKey].rules.push(rule)
    })
    
    return groups
  }

  const groupedRules = groupRules()

  const getActionTypeLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      'URL_CLICK': 'URLクリック',
      'BUTTON_CLICK': 'ボタンクリック',
      'REPLY': '返信',
      'POSTBACK': 'ポストバック',
      'REACTION': 'リアクション'
    }
    return labels[actionType] || actionType
  }

  const getTagActionSummary = (rule: ActionRule) => {
    return rule.tagActions.map(action => {
      switch (action.type) {
        case 'ADD_TAG':
          const tag = tags.find(t => t.id === action.tagId)
          return { type: 'add', text: `+${tag?.name || '不明'}`, color: 'text-green-700 bg-green-50' }
        case 'REMOVE_TAG':
          const removeTag = tags.find(t => t.id === action.tagId)
          return { type: 'remove', text: `-${removeTag?.name || '不明'}`, color: 'text-red-700 bg-red-50' }
        case 'SET_STATUS':
          const status = statuses.find(s => s.id === action.statusId)
          return { type: 'status', text: `→${status?.label || '不明'}`, color: 'text-blue-700 bg-blue-50' }
        default:
          return { type: 'unknown', text: '不明', color: 'text-gray-700 bg-gray-50' }
      }
    })
  }

  const getConflictWarnings = (groupRules: ActionRule[]) => {
    const warnings: string[] = []
    
    // 同じアクションタイプで異なる結果を持つルールをチェック
    if (groupRules.length > 1) {
      const actions = groupRules.flatMap(rule => rule.tagActions)
      const addTags = actions.filter(a => a.type === 'ADD_TAG').map(a => a.tagId)
      const removeTags = actions.filter(a => a.type === 'REMOVE_TAG').map(a => a.tagId)
      const statuses = actions.filter(a => a.type === 'SET_STATUS').map(a => a.statusId)
      
      // 同じタグの追加と削除が混在
      const conflictingTags = addTags.filter(id => removeTags.includes(id))
      if (conflictingTags.length > 0) {
        warnings.push('同じタグの追加と削除が設定されています')
      }
      
      // 複数のステータス変更
      if (new Set(statuses).size > 1) {
        warnings.push('複数の異なるステータス変更が設定されています')
      }
    }
    
    return warnings
  }

  const toggleGroupExpansion = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-900">{title}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {rules.length}件
            </span>
            {Object.keys(groupedRules).length > 1 && (
              <span className="text-xs text-gray-500">
                {Object.keys(groupedRules).length}種類
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* 内容 */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {Object.entries(groupedRules).map(([groupKey, group]) => {
            const isGroupExpanded = expandedGroups.has(groupKey) || group.rules.length === 1
            const conflicts = getConflictWarnings(group.rules)
            
            return (
              <div key={groupKey} className="p-4">
                {/* グループヘッダー */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {getActionTypeLabel(group.actionType)}
                    </span>
                    {group.condition && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {group.condition}
                      </span>
                    )}
                    {group.rules.length > 1 && (
                      <button
                        onClick={() => toggleGroupExpansion(groupKey)}
                        className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        {group.rules.length}件
                        {isGroupExpanded ? (
                          <ChevronUp className="w-3 h-3 ml-1" />
                        ) : (
                          <ChevronDown className="w-3 h-3 ml-1" />
                        )}
                      </button>
                    )}
                  </div>

                  {conflicts.length > 0 && (
                    <div title={conflicts.join(', ')}>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* 統合アクション表示（複数ルールの場合） */}
                {group.rules.length > 1 && !isGroupExpanded && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2">実行アクション (統合)</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(
                        group.rules.flatMap(rule => 
                          getTagActionSummary(rule).map(action => `${action.type}:${action.text}`)
                        )
                      )).map((uniqueAction, index) => {
                        const [type, text] = uniqueAction.split(':')
                        const colors = type === 'add' ? 'text-green-700 bg-green-50' :
                                     type === 'remove' ? 'text-red-700 bg-red-50' :
                                     type === 'status' ? 'text-blue-700 bg-blue-50' :
                                     'text-gray-700 bg-gray-50'
                        
                        return (
                          <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors}`}>
                            {text}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 詳細ルール表示 */}
                {isGroupExpanded && (
                  <div className="space-y-3">
                    {group.rules.map((rule) => (
                      <div key={rule.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {rule.description}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {rule.isActive ? '有効' : '無効'}
                              </span>
                              {showContext && (
                                <span className="text-xs text-gray-500">
                                  優先度: {rule.priority}
                                </span>
                              )}
                            </div>
                            
                            {/* アクション表示 */}
                            <div className="flex flex-wrap gap-1">
                              {getTagActionSummary(rule).map((action, index) => (
                                <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${action.color}`}>
                                  {action.text}
                                </span>
                              ))}
                            </div>

                            {/* 条件詳細 */}
                            {rule.actionCondition.operator !== 'any' && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">条件:</span> {rule.actionCondition.operator} "{rule.actionCondition.value}"
                              </div>
                            )}
                          </div>

                          {onDeleteRule && (
                            <button
                              onClick={() => onDeleteRule(rule.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="削除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 競合警告 */}
                {conflicts.length > 0 && isGroupExpanded && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <div className="flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span className="font-medium">注意:</span>
                    </div>
                    <ul className="mt-1 list-disc list-inside">
                      {conflicts.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* サマリー（折りたたみ時） */}
      {!isExpanded && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">
          {Object.entries(groupedRules).map(([_, group]) => (
            getActionTypeLabel(group.actionType)
          )).join(', ')} のアクションが設定されています
        </div>
      )}
    </div>
  )
}