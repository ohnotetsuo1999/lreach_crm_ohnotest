'use client'

import { useState } from 'react'
import { FilterCondition, SegmentFilter, Tag, Status } from '@/types'
import { Plus, Trash2, Move } from 'lucide-react'

interface ConditionBuilderProps {
  filter: SegmentFilter
  tags: Tag[]
  statuses: Status[]
  onChange: (filter: SegmentFilter) => void
}

const FIELD_OPTIONS = [
  { value: 'name', label: 'ユーザー名' },
  { value: 'email', label: 'メールアドレス' },
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

  const renderValueInput = (condition: FilterCondition, index: number) => {
    if (['exists', 'not_exists'].includes(condition.operator)) {
      return null
    }

    if (condition.field === 'tags') {
      return (
        <select
          multiple
          value={Array.isArray(condition.value) ? condition.value : []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value)
            updateCondition(index, { value: values })
          }}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      )
    }

    if (condition.field === 'status') {
      return (
        <select
          multiple
          value={Array.isArray(condition.value) ? condition.value : []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value)
            updateCondition(index, { value: values })
          }}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>
      )
    }

    if (['createdAt', 'updatedAt', 'lastActivity'].includes(condition.field)) {
      return (
        <input
          type="datetime-local"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      )
    }

    if (['deliveryCount', 'openRate', 'clickRate'].includes(condition.field)) {
      return (
        <input
          type="number"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={condition.field.includes('Rate') ? '0-100' : '0'}
        />
      )
    }

    return (
      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="値を入力"
      />
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">条件設定</h3>
        <button
          onClick={addCondition}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          条件追加
        </button>
      </div>

      {filter.conditions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>条件を追加してセグメントを定義してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filter.conditions.map((condition, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              {/* Logic Operator */}
              {index > 0 && (
                <div className="flex-shrink-0">
                  <select
                    value={condition.logic || 'AND'}
                    onChange={(e) => updateCondition(index, { logic: e.target.value as 'AND' | 'OR' })}
                    className="block w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              )}

              {/* Field */}
              <div className="flex-1">
                <select
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {FIELD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operator */}
              <div className="flex-1">
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {getOperatorOptions(condition.field).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value */}
              <div className="flex-1">
                {renderValueInput(condition, index)}
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => removeCondition(index)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filter.conditions.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">条件の組み合わせ</h4>
          <div className="text-sm text-blue-700">
            <p>
              {filter.conditions.map((condition, index) => (
                <span key={index}>
                  {index > 0 && (
                    <span className="font-medium mx-2">
                      {condition.logic}
                    </span>
                  )}
                  <span className="bg-white px-2 py-1 rounded border">
                    {FIELD_OPTIONS.find(f => f.value === condition.field)?.label} {' '}
                    {getOperatorOptions(condition.field).find(o => o.value === condition.operator)?.label}
                    {!['exists', 'not_exists'].includes(condition.operator) && (
                      <span> "{Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}"</span>
                    )}
                  </span>
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}