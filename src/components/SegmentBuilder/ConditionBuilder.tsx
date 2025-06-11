'use client'

import { useState } from 'react'
import { FilterCondition, SegmentFilter, Tag, Status } from '@/types'
import { Plus, Trash2, Move, Filter, Eye } from 'lucide-react'

interface ConditionBuilderProps {
  filter: SegmentFilter
  tags: Tag[]
  statuses: Status[]
  onChange: (filter: SegmentFilter) => void
}

const FIELD_OPTIONS = [
  { value: 'lineFriendAddedAt', label: 'LINE友達追加日' },
  { value: 'lastReactionAt', label: '最終反応日' },
  { value: 'lastInflowAt', label: '最終流入日' },
  { value: 'status', label: 'ステータス' },
  { value: 'tags', label: 'タグ' },
  { value: 'name', label: 'ユーザー名' },
  { value: 'address', label: '地域' },
  { value: 'age', label: '年齢' },
  { value: 'calendarReservation', label: 'カレンダー予約' }
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
  { value: 'between', label: '期間内' },
  { value: 'before', label: 'それ以前' },
  { value: 'after', label: 'それ以降' },
  { value: 'in', label: 'いずれかに該当' },
  { value: 'not_in', label: 'いずれにも該当しない' },
  { value: 'exists', label: '存在する' },
  { value: 'not_exists', label: '存在しない' }
]

export function ConditionBuilder({ filter, tags, statuses, onChange }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: 'lineFriendAddedAt',
      operator: 'after',
      value: '',
      logic: filter.conditions.length > 0 ? 'AND' : undefined,
      title: ''
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
      case 'lineFriendAddedAt':
      case 'lastReactionAt':
      case 'lastInflowAt':
        return [
          { value: 'before', label: 'それ以前' },
          { value: 'after', label: 'それ以降' },
          { value: 'equals', label: '同日' },
          { value: 'between', label: '期間内' }
        ]
      case 'tags':
        return [
          { value: 'contains_all', label: '含む（すべて）' },
          { value: 'contains_any', label: 'いずれかを含む' },
          { value: 'not_contains', label: '含まない' }
        ]
      case 'status':
        return [
          { value: 'contains_all', label: '含む（すべて）' },
          { value: 'contains_any', label: 'いずれかを含む' },
          { value: 'not_contains', label: '含まない' }
        ]
      case 'age':
        return [
          { value: 'equals', label: '等しい' },
          { value: 'greater_equal', label: 'それ以上' },
          { value: 'less_equal', label: 'それ以下' },
          { value: 'between', label: '範囲内' }
        ]
      case 'calendarReservation':
        return [
          { value: 'exists', label: 'これから存在する' },
          { value: 'not_exists', label: 'これから存在しない' }
        ]
      case 'address':
        return [
          { value: 'contains_all', label: '含む（すべて）' },
          { value: 'contains_any', label: 'いずれかを含む' },
          { value: 'not_contains', label: '含まない' }
        ]
      case 'name':
        return OPERATOR_OPTIONS.filter(op => 
          ['equals', 'not_equals', 'contains', 'not_contains'].includes(op.value)
        )
      default:
        return OPERATOR_OPTIONS.filter(op => 
          ['equals', 'not_equals', 'contains', 'not_contains'].includes(op.value)
        )
    }
  }

  const [showTagModal, setShowTagModal] = useState<number | null>(null)
  const [showStatusModal, setShowStatusModal] = useState<number | null>(null)
  const [showAddressModal, setShowAddressModal] = useState<number | null>(null)
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [statusSearchQuery, setStatusSearchQuery] = useState('')
  const [addressSearchQuery, setAddressSearchQuery] = useState('')

  const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ]

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
            className="w-full p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
          >
            {selectedTags.length === 0 ? (
              <span className="text-gray-500">タグを選択してください</span>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedTagObjects.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {tag.name}
                    </span>
                  ))}
                  {selectedTags.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                      +{selectedTags.length - 3}個
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedTags.length}個のタグが選択されています
                </div>
              </div>
            )}
          </button>

          {/* Tag Selection Modal */}
          {showTagModal === index && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTagModal(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">タグを選択</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="タグを検索..."
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
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
                
                <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedTags.length}個のタグが選択されています
                  </div>
                  <button
                    onClick={() => setShowTagModal(null)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className="w-full p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
          >
            {selectedStatuses.length === 0 ? (
              <span className="text-gray-500">ステータスを選択してください</span>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedStatusObjects.slice(0, 3).map((status) => (
                    <span key={status.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {status.label}
                    </span>
                  ))}
                  {selectedStatuses.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                      +{selectedStatuses.length - 3}個
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedStatuses.length}個のステータスが選択されています
                </div>
              </div>
            )}
          </button>

          {/* Status Selection Modal */}
          {showStatusModal === index && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowStatusModal(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">ステータスを選択</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ステータスを検索..."
                      value={statusSearchQuery}
                      onChange={(e) => setStatusSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
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
                
                <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedStatuses.length}個のステータスが選択されています
                  </div>
                  <button
                    onClick={() => setShowStatusModal(null)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

    if (condition.field === 'address') {
      const selectedAddresses = Array.isArray(condition.value) ? condition.value : []

      return (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowAddressModal(index)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
          >
            {selectedAddresses.length === 0 ? (
              <span className="text-gray-500">都道府県を選択してください</span>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedAddresses.slice(0, 5).map((prefecture) => (
                    <span key={prefecture} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                      {prefecture}
                    </span>
                  ))}
                  {selectedAddresses.length > 5 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                      +{selectedAddresses.length - 5}個
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedAddresses.length}個の都道府県が選択されています
                </div>
              </div>
            )}
          </button>

          {/* Address Selection Modal */}
          {showAddressModal === index && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddressModal(null)}>
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">都道府県を選択</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="都道府県を検索..."
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-96">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PREFECTURES
                      .filter(prefecture => prefecture.toLowerCase().includes(addressSearchQuery.toLowerCase()))
                      .map((prefecture) => {
                        const isSelected = selectedAddresses.includes(prefecture)
                        
                        return (
                          <button
                            key={prefecture}
                            type="button"
                            onClick={() => {
                              const newValues = isSelected
                                ? selectedAddresses.filter(addr => addr !== prefecture)
                                : [...selectedAddresses, prefecture]
                              updateCondition(index, { value: newValues })
                            }}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              isSelected 
                                ? 'bg-orange-600 text-white border-orange-600 shadow-sm' 
                                : 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 hover:shadow-sm'
                            }`}
                          >
                            <span className="font-medium">{prefecture}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {selectedAddresses.length}個の都道府県が選択されています
                  </div>
                  <button
                    onClick={() => setShowAddressModal(null)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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

    if (['lineFriendAddedAt', 'lastReactionAt', 'lastInflowAt'].includes(condition.field)) {
      if (condition.operator === 'between') {
        // 期間指定の場合
        const dateRange = typeof condition.value === 'object' && condition.value ? condition.value : { from: '', to: '' }
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">開始日</label>
              <input
                type="datetime-local"
                value={dateRange.from || ''}
                onChange={(e) => updateCondition(index, { 
                  value: { ...dateRange, from: e.target.value }
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">終了日</label>
              <input
                type="datetime-local"
                value={dateRange.to || ''}
                onChange={(e) => updateCondition(index, { 
                  value: { ...dateRange, to: e.target.value }
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              {!dateRange.from && !dateRange.to && '開始日と終了日を指定してください'}
              {!dateRange.from && dateRange.to && '開始日が未指定の場合、その日以前のデータが対象'}
              {dateRange.from && !dateRange.to && '終了日が未指定の場合、その日以降のデータが対象'}
              {dateRange.from && dateRange.to && '指定した期間内のデータが対象'}
            </p>
          </div>
        )
      } else if (['before', 'after'].includes(condition.operator)) {
        // それ以前/それ以降の場合
        return (
          <div className="space-y-2">
            <input
              type="datetime-local"
              value={condition.value || ''}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            />
            <p className="text-xs text-gray-500">
              {condition.operator === 'before' ? 'この日時より前のデータが対象' : 'この日時より後のデータが対象'}
            </p>
          </div>
        )
      } else {
        // 通常の日時指定
        return (
          <input
            type="datetime-local"
            value={condition.value}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
          />
        )
      }
    }

    if (condition.field === 'age') {
      if (condition.operator === 'between') {
        // 年齢範囲指定の場合
        const ageRange = typeof condition.value === 'object' && condition.value ? condition.value : { from: '', to: '' }
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">最小年齢</label>
              <input
                type="number"
                min="0"
                max="120"
                value={ageRange.from || ''}
                onChange={(e) => updateCondition(index, { 
                  value: { ...ageRange, from: e.target.value }
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                placeholder="例: 20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大年齢</label>
              <input
                type="number"
                min="0"
                max="120"
                value={ageRange.to || ''}
                onChange={(e) => updateCondition(index, { 
                  value: { ...ageRange, to: e.target.value }
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                placeholder="例: 30"
              />
            </div>
            <p className="text-xs text-gray-500">
              {!ageRange.from && !ageRange.to && '最小年齢と最大年齢を指定してください'}
              {!ageRange.from && ageRange.to && `${ageRange.to}歳以下のユーザーが対象`}
              {ageRange.from && !ageRange.to && `${ageRange.from}歳以上のユーザーが対象`}
              {ageRange.from && ageRange.to && `${ageRange.from}歳〜${ageRange.to}歳のユーザーが対象`}
            </p>
          </div>
        )
      } else {
        // 通常の年齢指定
        return (
          <input
            type="number"
            min="0"
            max="120"
            value={condition.value || ''}
            onChange={(e) => updateCondition(index, { value: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            placeholder="年齢を入力"
          />
        )
      }
    }

    return (
      <input
        type="text"
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="w-6 h-6 mr-3 text-blue-600" />
              条件設定
            </h3>
            <p className="mt-1 text-sm text-gray-600">ユーザーを絞り込むための条件を設定しましょう</p>
          </div>
          <button
            onClick={addCondition}
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しい条件を追加
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Current Conditions Summary */}
        {filter.conditions.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              現在の条件プレビュー
            </h4>
            
            {/* Conditions List */}
            <div className="space-y-3 mb-6">
              {filter.conditions.map((condition, index) => (
                <div key={index} className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Condition Number, Logic, and Title */}
                      <div className="flex items-center mb-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-3">
                          {index + 1}
                        </span>
                        {index > 0 && (
                          <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mr-3">
                            {condition.logic || 'AND'}
                          </span>
                        )}
                        <div className="flex-1">
                          {condition.title ? (
                            <div className="text-sm font-medium text-gray-900">{condition.title}</div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              {index === 0 ? '条件' : `${condition.logic || 'AND'} 条件`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Condition Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 block">項目</span>
                          <span className="font-medium text-gray-900">
                            {FIELD_OPTIONS.find(f => f.value === condition.field)?.label || condition.field}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">条件</span>
                          <span className="font-medium text-gray-900">
                            {(condition.field === 'tags' || condition.field === 'status') && condition.operator === 'contains_all' ? '含む（すべて）' :
                             (condition.field === 'tags' || condition.field === 'status') && condition.operator === 'contains_any' ? 'いずれかを含む' :
                             (condition.field === 'tags' || condition.field === 'status') && condition.operator === 'not_contains' ? '含まない' :
                             getOperatorOptions(condition.field).find(o => o.value === condition.operator)?.label || condition.operator}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">値</span>
                          <div className="font-medium text-gray-900">
                            {['exists', 'not_exists'].includes(condition.operator) ? (
                              <span className="text-gray-400 italic">値なし</span>
                            ) : condition.field === 'tags' ? (
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(condition.value) ? condition.value : [condition.value]).map((tagId: string) => {
                                  const tag = tags.find(t => t.id === tagId)
                                  return tag ? (
                                    <span key={tagId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                      {tag.name}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            ) : condition.field === 'status' ? (
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(condition.value) ? condition.value : [condition.value]).map((statusId: string) => {
                                  const status = statuses.find(s => s.id === statusId)
                                  return status ? (
                                    <span key={statusId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      {status.label}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            ) : condition.field === 'address' ? (
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(condition.value) ? condition.value : [condition.value]).map((prefecture: string) => (
                                  <span key={prefecture} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                    {prefecture}
                                  </span>
                                ))}
                              </div>
                            ) : condition.operator === 'between' && typeof condition.value === 'object' ? (
                              <div className="text-xs">
                                {condition.field === 'age' ? (
                                  // 年齢範囲の表示
                                  condition.value.from && condition.value.to ? (
                                    <>{condition.value.from}歳〜{condition.value.to}歳</>
                                  ) : condition.value.from ? (
                                    <>{condition.value.from}歳以上</>
                                  ) : condition.value.to ? (
                                    <>{condition.value.to}歳以下</>
                                  ) : (
                                    '年齢未設定'
                                  )
                                ) : (
                                  // 日付範囲の表示
                                  condition.value.from && condition.value.to ? (
                                    <>
                                      {new Date(condition.value.from).toLocaleString('ja-JP')} ～ <br />
                                      {new Date(condition.value.to).toLocaleString('ja-JP')}
                                    </>
                                  ) : condition.value.from ? (
                                    <>{new Date(condition.value.from).toLocaleString('ja-JP')} 以降</>
                                  ) : condition.value.to ? (
                                    <>{new Date(condition.value.to).toLocaleString('ja-JP')} 以前</>
                                  ) : (
                                    '期間未設定'
                                  )
                                )}
                              </div>
                            ) : ['before', 'after'].includes(condition.operator) && condition.value ? (
                              <div className="text-xs">
                                {new Date(condition.value).toLocaleString('ja-JP')} 
                                {condition.operator === 'before' ? ' 以前' : ' 以降'}
                              </div>
                            ) : (
                              <span>{condition.value || '(未設定)'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-200">
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                  {filter.conditions.length}個の条件
                </span>
                <span className="text-sm text-blue-700">
                  これらの条件でユーザーを絞り込みます
                </span>
              </div>
              <div className="text-xs text-blue-600">
                {filter.conditions.length > 1 && (
                  <>
                    {filter.conditions.filter(c => c.logic === 'OR').length > 0 ? 'AND/OR' : 'AND'} 結合
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {filter.conditions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">条件を追加して始めましょう</h4>
            <p className="text-gray-600 mb-6">セグメントを定義するための条件を設定してください</p>
            <button
              onClick={addCondition}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              最初の条件を追加
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filter.conditions.map((condition, index) => (
              <div key={index} className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                {/* Condition Number Badge */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">
                  {index + 1}
                </div>

                {/* Logic Operator for non-first conditions */}
                {index > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">前の条件との組み合わせ</label>
                    <div className="flex space-x-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`logic-${index}`}
                          value="AND"
                          checked={(condition.logic || 'AND') === 'AND'}
                          onChange={(e) => updateCondition(index, { logic: 'AND' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">かつ (AND)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`logic-${index}`}
                          value="OR"
                          checked={condition.logic === 'OR'}
                          onChange={(e) => updateCondition(index, { logic: 'OR' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">または (OR)</span>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      AND: 両方の条件を満たすユーザー、OR: どちらかの条件を満たすユーザー
                    </p>
                  </div>
                )}

                {/* Custom Title Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    条件タイトル（任意）
                  </label>
                  <input
                    type="text"
                    value={condition.title || ''}
                    onChange={(e) => updateCondition(index, { title: e.target.value })}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    placeholder="例: VIPユーザー、新規登録者、アクティブユーザーなど"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    条件に分かりやすい名前をつけることで、プレビューが見やすくなります
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">フィルター項目</label>
                    <select
                      value={condition.field}
                      onChange={(e) => {
                        const newField = e.target.value
                        const defaultOperator = newField === 'tags' ? 'contains_any' : 
                                              newField === 'status' ? 'contains_any' :
                                              newField === 'address' ? 'contains_any' :
                                              ['lineFriendAddedAt', 'lastReactionAt', 'lastInflowAt'].includes(newField) ? 'after' :
                                              newField === 'age' ? 'equals' :
                                              newField === 'calendarReservation' ? 'exists' :
                                              'equals'
                        updateCondition(index, { field: newField, operator: defaultOperator, value: '' })
                      }}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">条件</label>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">値</label>
                    <div className="relative">
                      {renderValueInput(condition, index)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => removeCondition(index)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                    title="この条件を削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}