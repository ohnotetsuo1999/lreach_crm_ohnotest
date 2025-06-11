'use client'

import { useState } from 'react'
import { Segment, Tag, Status } from '@/types'
import { 
  Plus, 
  Target, 
  Users, 
  Calendar, 
  Filter, 
  Edit2, 
  Copy, 
  Trash2,
  Search,
  ChevronRight
} from 'lucide-react'

interface SegmentListProps {
  segments: Segment[]
  tags: Tag[]
  statuses: Status[]
  onCreateSegment: () => void
  onEditSegment: (segment: Segment) => void
  onDuplicateSegment: (segment: Segment) => void
  onDeleteSegment: (segmentId: string) => void
}

export function SegmentList({
  segments,
  tags,
  statuses,
  onCreateSegment,
  onEditSegment,
  onDuplicateSegment,
  onDeleteSegment
}: SegmentListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Format condition for display
  const formatCondition = (condition: any) => {
    const fieldLabels: { [key: string]: string } = {
      'name': 'ユーザー名',
      'address': '住所',
      'phone': '電話番号',
      'createdAt': '登録日',
      'updatedAt': '最終更新日',
      'tags': 'タグ',
      'status': 'ステータス',
      'lastActivity': '最終アクティビティ',
      'deliveryCount': '配信回数',
      'openRate': '開封率',
      'clickRate': 'クリック率'
    }
    
    const operatorLabels: { [key: string]: string } = {
      'equals': '等しい',
      'not_equals': '等しくない',
      'contains': '含む',
      'not_contains': '含まない',
      'greater_than': 'より大きい',
      'less_than': 'より小さい',
      'greater_equal': '以上',
      'less_equal': '以下',
      'in': '含む',
      'not_in': '含まない',
      'exists': '存在する',
      'not_exists': '存在しない'
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
    
    if (['exists', 'not_exists'].includes(condition.operator)) {
      return `${field} ${operator}`
    }
    
    return `${field} ${operator} "${condition.value || '(未設定)'}"`
  }

  // Filter segments based on search
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDuplicate = (segment: Segment) => {
    onDuplicateSegment(segment)
  }

  const handleDelete = (segmentId: string, segmentName: string) => {
    if (confirm(`セグメント「${segmentName}」を削除しますか？`)) {
      onDeleteSegment(segmentId)
    }
  }

  return (
    <div>
      {/* シンプルなヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">セグメント一覧</h1>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>全{segments.length}件</span>
          </div>
        </div>
        
        <button
          onClick={onCreateSegment}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規セグメント
        </button>
      </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="セグメント名で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{filteredSegments.length}</span> 個のセグメント
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* セグメント一覧 */}
        {filteredSegments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Target className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'セグメントが見つかりません' : 'セグメントがまだありません'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? '検索条件に一致するセグメントがありません。キーワードを変更してお試しください。'
                  : '新しいセグメントを作成して、ユーザーを効果的にグループ化しましょう。'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={onCreateSegment}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  最初のセグメントを作成
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSegments.map((segment) => {
              let conditions = []
              let logic = 'AND'
              
              try {
                const parsedFilter = JSON.parse(segment.filterJson)
                conditions = parsedFilter.conditions || []
                logic = parsedFilter.logic || 'AND'
              } catch (error) {
                conditions = []
              }

              return (
                <div
                  key={segment.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => onEditSegment(segment)}
                >
                  <div className="p-6">
                    {/* ヘッダー */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {segment.name}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {segment.updatedAt.toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(segment)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="複製"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(segment.id, segment.name)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 条件プレビュー */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Filter className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">条件</span>
                        {conditions.length > 1 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {logic}
                          </span>
                        )}
                      </div>
                      
                      {conditions.length > 0 ? (
                        <div className="space-y-2">
                          {conditions.slice(0, 2).map((condition: any, index: number) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border">
                              {formatCondition(condition)}
                            </div>
                          ))}
                          {conditions.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              他 {conditions.length - 2} 件の条件...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded border">
                          条件が設定されていません
                        </div>
                      )}
                    </div>

                    {/* フッター */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{conditions.length}個の条件</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                        <Edit2 className="w-4 h-4 mr-1" />
                        編集
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}