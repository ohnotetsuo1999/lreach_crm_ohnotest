'use client'

import { useState } from 'react'
import { ConditionBuilder } from './ConditionBuilder'
import { PreviewCount } from './PreviewCount'
import { SegmentFilter, Segment, User, Tag, Status } from '@/types'
import { Save, Eye, Code } from 'lucide-react'

interface SegmentBuilderProps {
  segments: Segment[]
  users: User[]
  tags: Tag[]
  statuses: Status[]
  onSaveSegment: (segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onLoadSegment: (segment: Segment) => void
}

export function SegmentBuilder({
  segments,
  users,
  tags,
  statuses,
  onSaveSegment,
  onLoadSegment
}: SegmentBuilderProps) {
  const [segmentName, setSegmentName] = useState('')
  const [filter, setFilter] = useState<SegmentFilter>({
    conditions: [],
    logic: 'AND'
  })
  const [showSQL, setShowSQL] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)

  const handleSaveSegment = () => {
    if (!segmentName.trim()) {
      alert('セグメント名を入力してください')
      return
    }

    if (filter.conditions.length === 0) {
      alert('条件を追加してください')
      return
    }

    onSaveSegment({
      name: segmentName,
      filterJson: JSON.stringify(filter)
    })

    setSegmentName('')
    setFilter({ conditions: [], logic: 'AND' })
    setSelectedSegment(null)
  }

  const handleLoadSegment = (segment: Segment) => {
    try {
      const loadedFilter = JSON.parse(segment.filterJson) as SegmentFilter
      setFilter(loadedFilter)
      setSegmentName(segment.name)
      setSelectedSegment(segment)
      onLoadSegment(segment)
    } catch (error) {
      console.error('Failed to load segment:', error)
      alert('セグメントの読み込みに失敗しました')
    }
  }

  const generateSQL = (filter: SegmentFilter): string => {
    if (filter.conditions.length === 0) {
      return 'SELECT * FROM users;'
    }

    const conditions = filter.conditions.map((condition, index) => {
      let clause = ''
      
      switch (condition.field) {
        case 'name':
          clause = `users.name ${getOperatorSQL(condition.operator)} '${condition.value}'`
          break
        case 'address':
          clause = `users.address ${getOperatorSQL(condition.operator)} '${condition.value}'`
          break
        case 'phone':
          clause = `users.phone ${getOperatorSQL(condition.operator)} '${condition.value}'`
          break
        case 'createdAt':
          clause = `users.created_at ${getOperatorSQL(condition.operator)} '${condition.value}'`
          break
        case 'tags':
          if (condition.operator === 'in') {
            const tagIds = Array.isArray(condition.value) ? condition.value : [condition.value]
            clause = `users.id IN (SELECT user_id FROM user_tags WHERE tag_id IN (${tagIds.map(id => `'${id}'`).join(', ')}))`
          }
          break
        default:
          clause = `users.${condition.field} ${getOperatorSQL(condition.operator)} '${condition.value}'`
      }

      if (index > 0 && condition.logic) {
        return ` ${condition.logic} ${clause}`
      }
      return clause
    }).join('')

    return `SELECT DISTINCT users.*
FROM users
LEFT JOIN user_tags ON users.id = user_tags.user_id
LEFT JOIN user_status_logs ON users.id = user_status_logs.user_id
WHERE ${conditions};`
  }

  const getOperatorSQL = (operator: string): string => {
    switch (operator) {
      case 'equals': return '='
      case 'not_equals': return '!='
      case 'contains': return 'LIKE'
      case 'not_contains': return 'NOT LIKE'
      case 'greater_than': return '>'
      case 'less_than': return '<'
      case 'greater_equal': return '>='
      case 'less_equal': return '<='
      case 'in': return 'IN'
      case 'not_in': return 'NOT IN'
      default: return '='
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">セグメントビルダー</h2>
          <p className="mt-1 text-sm text-gray-600">
            条件を組み合わせてユーザーセグメントを作成
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowSQL(!showSQL)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Code className="w-4 h-4 mr-2" />
            SQL表示
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* セグメント一覧 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">保存済みセグメント</h3>
            
            {segments.length === 0 ? (
              <p className="text-gray-500 text-sm">保存されたセグメントはありません</p>
            ) : (
              <div className="space-y-2">
                {segments.map((segment) => {
                  let conditions = []
                  try {
                    const parsedFilter = JSON.parse(segment.filterJson)
                    conditions = parsedFilter.conditions || []
                  } catch (error) {
                    conditions = []
                  }
                  
                  const formatCondition = (condition: any) => {
                    const fieldLabels: { [key: string]: string } = {
                      'name': 'ユーザー名',
                      'address': '住所',
                      'phone': '電話番号',
                      'createdAt': '登録日',
                      'updatedAt': '最終更新日',
                      'tags': 'タグ',
                      'status': 'ステータス'
                    }
                    
                    const operatorLabels: { [key: string]: string } = {
                      'equals': '等しい',
                      'contains': '含む',
                      'greater_than': 'より大きい',
                      'less_than': 'より小さい',
                      'in': '含む',
                      'not_in': '含まない'
                    }
                    
                    const field = fieldLabels[condition.field] || condition.field
                    const operator = operatorLabels[condition.operator] || condition.operator
                    
                    if (condition.field === 'tags') {
                      const tagNames = tags.filter(tag => 
                        Array.isArray(condition.value) 
                          ? condition.value.includes(tag.id)
                          : condition.value === tag.id
                      ).map(tag => tag.name).join(', ')
                      return `${field} ${operator} "${tagNames}"`
                    }
                    
                    if (condition.field === 'status') {
                      const statusNames = statuses.filter(status => 
                        Array.isArray(condition.value)
                          ? condition.value.includes(status.id)
                          : condition.value === status.id
                      ).map(status => status.label).join(', ')
                      return `${field} ${operator} "${statusNames}"`
                    }
                    
                    return `${field} ${operator} "${condition.value}"`
                  }
                  
                  return (
                    <button
                      key={segment.id}
                      onClick={() => handleLoadSegment(segment)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedSegment?.id === segment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 mb-2">{segment.name}</div>
                      
                      {conditions.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {conditions.slice(0, 2).map((condition: any, index: number) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {formatCondition(condition)}
                            </div>
                          ))}
                          {conditions.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{conditions.length - 2}件の条件
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {new Date(segment.updatedAt).toLocaleDateString('ja-JP')}
                        </div>
                        {conditions.length > 1 && (
                          <div className="text-xs text-blue-600 font-medium">
                            {JSON.parse(segment.filterJson).logic || 'AND'}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* プレビュー */}
          <div className="mt-6">
            <PreviewCount 
              filter={filter} 
              users={users}
              onRefresh={() => {
                // リフレッシュロジック
                setFilter({ ...filter })
              }}
            />
          </div>
        </div>

        {/* 条件ビルダー */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* セグメント名入力 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                セグメント名
              </label>
              <input
                type="text"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: アクティブユーザー、新規登録者など"
              />
            </div>

            {/* 条件ビルダー */}
            <ConditionBuilder
              filter={filter}
              tags={tags}
              statuses={statuses}
              onChange={setFilter}
            />

            {/* SQL表示 */}
            {showSQL && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">生成されるSQL</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{generateSQL(filter)}</code>
                </pre>
                <p className="mt-2 text-xs text-gray-500">
                  ※ 実際のクエリは最適化される場合があります
                </p>
              </div>
            )}

            {/* アクション */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSegmentName('')
                  setFilter({ conditions: [], logic: 'AND' })
                  setSelectedSegment(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                リセット
              </button>
              
              <button
                onClick={handleSaveSegment}
                disabled={!segmentName.trim() || filter.conditions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                セグメント保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}