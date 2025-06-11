'use client'

import { useState } from 'react'
import { FilterCondition, SegmentFilter, Tag, Status } from '@/types'
import { Plus, Trash2, Move, Filter } from 'lucide-react'

interface ConditionBuilderProps {
  filter: SegmentFilter
  tags: Tag[]
  statuses: Status[]
  onChange: (filter: SegmentFilter) => void
}

const FIELD_OPTIONS = [
  { value: 'name', label: 'ユーザー名' },
  { value: 'address', label: '住所' },
  { value: 'phone', label: '電話番号' },
  { value: 'createdAt', label: '登録日' },
  { value: 'updatedAt', label: '最終更新日' },
  { value: 'tags', label: 'タグ' },
  { value: 'status', label: 'ステータス' },
  { value: 'lastActivity', label: '最終アクティビティ' },
  { value: 'deliveryCount', label: '配信回数' },
  { value: 'openRate', label: '開封率' },
  { value: 'clickRate', label: 'クリック率' }
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: '等しい' },
  { value: 'not_equals', label: '等しくない' },
  { value: 'contains', label: '含む' },
  { value: 'not_contains', label: '含まない' },
  { value: 'greater_than', label: 'より大きい' },
  { value: 'less_than', label: 'より小さい' },
  { value: 'greater_equal', label: '以上' },
  { value: 'less_equal', label: '以下' },
  { value: 'in', label: 'いずれかに該当' },
  { value: 'not_in', label: 'いずれにも該当しない' },
  { value: 'exists', label: '存在する' },
  { value: 'not_exists', label: '存在しない' }
]

export function ConditionBuilder({ filter, tags, statuses, onChange }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: 'name',
      operator: 'equals',
      value: '',
      logic: filter.conditions.length > 0 ? 'AND' : undefined
    }

    onChange({
      ...filter,
      conditions: [...filter.conditions, newCondition]
    })
  }

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...filter.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    
    onChange({
      ...filter,
      conditions: newConditions
    })
  }

  const removeCondition = (index: number) => {
    const newConditions = filter.conditions.filter((_, i) => i !== index)
    
    // 最初の条件のlogicを削除
    if (newConditions.length > 0 && newConditions[0].logic) {
      newConditions[0] = { ...newConditions[0], logic: undefined }
    }
    
    onChange({
      ...filter,
      conditions: newConditions
    })
  }

  const getOperatorOptions = (field: string) => {
    switch (field) {
      case 'createdAt':
      case 'updatedAt':
      case 'lastActivity':
      case 'deliveryCount':
      case 'openRate':
      case 'clickRate':
        return OPERATOR_OPTIONS.filter(op => 
          ['equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'].includes(op.value)
        )
      case 'tags':
      case 'status':
        return OPERATOR_OPTIONS.filter(op => 
          ['in', 'not_in', 'exists', 'not_exists'].includes(op.value)
        )
      default:
        return OPERATOR_OPTIONS.filter(op => 
          ['equals', 'not_equals', 'contains', 'not_contains'].includes(op.value)
        )
    }
  }

  const [showTagModal, setShowTagModal] = useState<number | null>(null)
  const [showStatusModal, setShowStatusModal] = useState<number | null>(null)
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [statusSearchQuery, setStatusSearchQuery] = useState('')

  const renderValueInput = (condition: FilterCondition, index: number) => {
    if (['exists', 'not_exists'].includes(condition.operator)) {
      return null
    }

    if (condition.field === 'tags') {
      const selectedTags = Array.isArray(condition.value) ? condition.value : []
      const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id))

      return (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTagModal(index)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
          >
            {selectedTags.length === 0 ? (
              <span className="text-gray-500">タグを選択してください</span>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {selectedTagObjects.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {tag.name}
                    </span>
                  ))}
                  {selectedTags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      +{selectedTags.length - 3}個
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedTags.length}個のタグが選択されています
                </div>
              </div>
            )}
          </button>

          {/* Tag Selection Modal */}
          {showTagModal === index && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTagModal(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">タグを選択</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="タグを検索..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tags
                      .filter(tag => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                      .map((tag) => {
                        const isSelected = selectedTags.includes(tag.id)
                        const getTagColor = (tagType: string) => {
                          switch (tagType) {
                            case 'MANUAL': return 'bg-blue-100 text-blue-800 border-blue-200'
                            case 'AUTOMATIC': return 'bg-green-100 text-green-800 border-green-200'
                            case 'BEHAVIORAL': return 'bg-purple-100 text-purple-800 border-purple-200'
                            default: return 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        }
                        
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              const newValues = isSelected
                                ? selectedTags.filter(id => id !== tag.id)
                                : [...selectedTags, tag.id]
                              updateCondition(index, { value: newValues })
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : `${getTagColor(tag.type)} hover:shadow-sm`
                            }`}
                          >
                            <span className="font-medium">{tag.name}</span>
                            <span className="text-xs opacity-75">{tag.type}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedTags.length}個のタグが選択されています
                  </div>
                  <button
                    onClick={() => setShowTagModal(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    完了
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (condition.field === 'status') {
      const selectedStatuses = Array.isArray(condition.value) ? condition.value : []
      const selectedStatusObjects = statuses.filter(status => selectedStatuses.includes(status.id))

      return (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowStatusModal(index)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
          >
            {selectedStatuses.length === 0 ? (
              <span className="text-gray-500">ステータスを選択してください</span>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {selectedStatusObjects.slice(0, 3).map((status) => (
                    <span key={status.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      {status.label}
                    </span>
                  ))}
                  {selectedStatuses.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      +{selectedStatuses.length - 3}個
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedStatuses.length}個のステータスが選択されています
                </div>
              </div>
            )}
          </button>

          {/* Status Selection Modal */}
          {showStatusModal === index && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowStatusModal(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータスを選択</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ステータスを検索..."
                      value={statusSearchQuery}
                      onChange={(e) => setStatusSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {statuses
                      .filter(status => status.label.toLowerCase().includes(statusSearchQuery.toLowerCase()))
                      .map((status) => {
                        const isSelected = selectedStatuses.includes(status.id)
                        
                        return (
                          <button
                            key={status.id}
                            type="button"
                            onClick={() => {
                              const newValues = isSelected
                                ? selectedStatuses.filter(id => id !== status.id)
                                : [...selectedStatuses, status.id]
                              updateCondition(index, { value: newValues })
                            }}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected 
                                ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <span className="font-medium">{status.label}</span>
                            <span className="text-xs opacity-75">{status.code}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedStatuses.length}個のステータスが選択されています
                  </div>
                  <button
                    onClick={() => setShowStatusModal(null)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    完了
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (['createdAt', 'updatedAt', 'lastActivity'].includes(condition.field)) {
      return (
        <input
          type="datetime-local"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      )
    }

    if (['deliveryCount', 'openRate', 'clickRate'].includes(condition.field)) {
      return (
        <input
          type="number"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          placeholder={condition.field.includes('Rate') ? '0-100' : '0'}
        />
      )
    }

    return (
      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        placeholder="値を入力"
      />
    )
  }

  const formatConditionSummary = (condition: FilterCondition) => {
    const fieldLabel = FIELD_OPTIONS.find(f => f.value === condition.field)?.label || condition.field
    const operatorLabel = getOperatorOptions(condition.field).find(o => o.value === condition.operator)?.label || condition.operator
    
    if (condition.field === 'tags') {
      const tagNames = tags.filter(tag => 
        Array.isArray(condition.value) 
          ? condition.value.includes(tag.id)
          : condition.value === tag.id
      ).map(tag => tag.name).join(', ')
      return `${fieldLabel} ${operatorLabel} ${tagNames ? `"${tagNames}"` : '(未選択)'}`
    }
    
    if (condition.field === 'status') {
      const statusNames = statuses.filter(status => 
        Array.isArray(condition.value)
          ? condition.value.includes(status.id)
          : condition.value === status.id
      ).map(status => status.label).join(', ')
      return `${fieldLabel} ${operatorLabel} ${statusNames ? `"${statusNames}"` : '(未選択)'}`
    }
    
    if (['exists', 'not_exists'].includes(condition.operator)) {
      return `${fieldLabel} ${operatorLabel}`
    }
    
    return `${fieldLabel} ${operatorLabel} "${condition.value || '(未入力)'}"`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">条件設定</h3>
        <button
          onClick={addCondition}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          条件追加
        </button>
      </div>

      {/* Current Conditions Summary */}
      {filter.conditions.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            現在の条件
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {filter.conditions.map((condition, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                    {condition.logic || 'AND'}
                  </span>
                )}
                <div className="inline-flex items-center px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm text-gray-700 shadow-sm">
                  {formatConditionSummary(condition)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-blue-600">
            {filter.conditions.length}個の条件でフィルタリング
          </div>
        </div>
      )}

      {filter.conditions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>条件を追加してセグメントを定義してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filter.conditions.map((condition, index) => (
            <div key={index} className="relative bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors shadow-sm">
              {/* Condition Number Badge */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {index + 1}
              </div>

              {/* Logic Operator for non-first conditions */}
              {index > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">条件の組み合わせ</label>
                  <select
                    value={condition.logic || 'AND'}
                    onChange={(e) => updateCondition(index, { logic: e.target.value as 'AND' | 'OR' })}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AND">かつ (AND)</option>
                    <option value="OR">または (OR)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">項目</label>
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(index, { field: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {FIELD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">条件</label>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {getOperatorOptions(condition.field).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">値</label>
                  <div className="relative">
                    {renderValueInput(condition, index)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => removeCondition(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="この条件を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}