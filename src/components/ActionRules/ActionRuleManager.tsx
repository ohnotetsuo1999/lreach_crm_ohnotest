'use client'

import { useState, useEffect } from 'react'
import { ActionRule, ScenarioActionRule, TagAction, ActionType, UserActionType, Tag, Status, Scenario, Template } from '@/types'
import { Plus, Edit2, Trash2, ToggleLeft, AlertCircle, Target, Zap, Settings } from 'lucide-react'
import { ActionRuleEditor } from './ActionRuleEditor'

interface ActionRuleManagerProps {
  actionRules: ActionRule[]
  tags: Tag[]
  statuses: Status[]
  scenarios: Scenario[]
  templates: Template[]
  onCreateRule: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateRule: (ruleId: string, rule: Partial<ActionRule>) => void
  onDeleteRule: (ruleId: string) => void
  onToggleRule: (ruleId: string, isActive: boolean) => void
}

export function ActionRuleManager({
  actionRules,
  tags,
  statuses,
  scenarios,
  templates,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule
}: ActionRuleManagerProps) {
  const [selectedRule, setSelectedRule] = useState<ActionRule | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateNew = () => {
    setSelectedRule(null)
    setIsEditorOpen(true)
  }

  const handleEdit = (rule: ActionRule) => {
    setSelectedRule(rule)
    setIsEditorOpen(true)
  }

  const handleSave = (ruleData: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    // ScenarioActionRuleからActionRuleに変換
    const actionRuleData: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      templateId: ruleData.packTemplateId,
      scenarioId: undefined,
      packId: undefined,
      actionType: ruleData.actionType,
      actionCondition: ruleData.actionCondition,
      tagActions: ruleData.tagActions,
      isActive: ruleData.isActive,
      priority: ruleData.priority,
      description: ruleData.description
    }
    
    if (selectedRule) {
      onUpdateRule(selectedRule.id, actionRuleData)
    } else {
      onCreateRule(actionRuleData)
    }
    setIsEditorOpen(false)
    setSelectedRule(null)
  }
  
  // ActionRuleをScenarioActionRuleに変換する関数
  const convertToScenarioActionRule = (rule: ActionRule | null): ScenarioActionRule | null => {
    if (!rule) return null
    
    return {
      ...rule,
      packTemplateId: rule.templateId || ''
    } as ScenarioActionRule
  }

  const getActionTypeLabel = (type: UserActionType) => {
    const labels: Record<UserActionType, string> = {
      'URL_CLICK': 'URL クリック',
      'BUTTON_CLICK': 'ボタンクリック',
      'IMAGE_CLICK': '画像クリック',
      'TEXT_SELECT': 'テキスト選択',
      'MESSAGE_SHARE': 'メッセージシェア',
      'REPLY': '返信',
      'REACTION': 'リアクション',
      'POSTBACK': 'ポストバック',
      'LOCATION_SHARE': '位置情報シェア',
      'CONTACT_SHARE': '連絡先シェア',
      'CUSTOM': 'カスタム'
    }
    return labels[type] || type
  }

  const getConditionLabel = (condition: ActionRule['actionCondition']) => {
    const operatorLabels = {
      'equals': '一致',
      'contains': '含む',
      'starts_with': '始まる',
      'ends_with': '終わる',
      'regex': '正規表現',
      'any': 'すべて'
    }
    
    if (condition.operator === 'any') {
      return 'すべてのアクション'
    }
    
    return `${operatorLabels[condition.operator]} "${condition.value || condition.regex}"`
  }

  const getTagActionSummary = (tagActions: TagAction[]) => {
    if (tagActions.length === 0) return 'アクションなし'
    
    const summary = tagActions.map(action => {
      switch (action.type) {
        case 'ADD_TAG':
          const tag = tags.find(t => t.id === action.tagId)
          return `タグ追加: ${tag?.name || '不明'}`
        case 'REMOVE_TAG':
          const removeTag = tags.find(t => t.id === action.tagId)
          return `タグ削除: ${removeTag?.name || '不明'}`
        case 'SET_STATUS':
          const status = statuses.find(s => s.id === action.statusId)
          return `ステータス変更: ${status?.label || '不明'}`
        default:
          return '不明なアクション'
      }
    }).join(', ')
    
    return summary.length > 50 ? summary.substring(0, 50) + '...' : summary
  }

  const filteredRules = actionRules.filter(rule => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && rule.isActive) || 
      (filter === 'inactive' && !rule.isActive)
    
    const matchesSearch = searchTerm === '' || 
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActionTypeLabel(rule.actionType).toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  }).sort((a, b) => b.priority - a.priority)

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">アクションルール管理</h2>
            <p className="text-sm text-gray-600">
              ユーザーアクションに基づく自動タグ付与ルールの設定
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規ルール作成
        </button>
      </div>

      {/* フィルターと検索 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm rounded-md ${
                filter === 'all' 
                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({actionRules.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-2 text-sm rounded-md ${
                filter === 'active' 
                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              有効 ({actionRules.filter(r => r.isActive).length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-3 py-2 text-sm rounded-md ${
                filter === 'inactive' 
                  ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              無効 ({actionRules.filter(r => !r.isActive).length})
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="ルール検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* ルール一覧 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            アクションルール ({filteredRules.length})
          </h3>
        </div>
        
        {filteredRules.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        rule.isActive ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Target className={`w-4 h-4 ${
                          rule.isActive ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {rule.description || `${getActionTypeLabel(rule.actionType)}ルール`}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? '有効' : '無効'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            優先度: {rule.priority}
                          </span>
                        </div>
                        
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">アクション:</span> {getActionTypeLabel(rule.actionType)}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">条件:</span> {getConditionLabel(rule.actionCondition)}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">実行:</span> {getTagActionSummary(rule.tagActions)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleRule(rule.id, !rule.isActive)}
                      className={`p-2 rounded-md ${
                        rule.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={rule.isActive ? '無効にする' : '有効にする'}
                    >
                      <ToggleLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('このルールを削除しますか？')) {
                          onDeleteRule(rule.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '該当するルールが見つかりません' : 'アクションルールがありません'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchTerm 
                ? '検索条件を変更して再度お試しください'
                : 'ユーザーアクションに基づく自動タグ付与ルールを作成しましょう'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                最初のルールを作成
              </button>
            )}
          </div>
        )}
      </div>

      {/* アクションルール作成/編集エディタ */}
      <ActionRuleEditor
        rule={convertToScenarioActionRule(selectedRule)}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setSelectedRule(null)
        }}
        onSave={handleSave}
        tags={tags}
        statuses={statuses}
        scenarios={scenarios}
        templates={templates}
      />
    </div>
  )
}