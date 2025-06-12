'use client'

import { useState } from 'react'
import { Segment, Tag, Status, User } from '@/types'
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
  users?: User[]
  onCreateSegment: () => void
  onEditSegment: (segment: Segment) => void
  onDuplicateSegment: (segment: Segment) => void
  onDeleteSegment: (segmentId: string) => void
}

export function SegmentList({
  segments,
  tags,
  statuses,
  users = [],
  onCreateSegment,
  onEditSegment,
  onDuplicateSegment,
  onDeleteSegment
}: SegmentListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 該当ユーザー数を計算（簡略版）
  const calculateMatchingUsers = (segment: Segment): number => {
    try {
      const parsedFilter = JSON.parse(segment.filterJson)
      const conditions = parsedFilter.conditions || []
      
      if (conditions.length === 0) return 0
      
      // 簡単な条件マッチングの実装（実際のプロダクションではより複雑な処理が必要）
      const matchingUsers = users.filter(user => {
        return conditions.some((condition: any) => {
          if (condition.field === 'tags' && condition.operator === 'in') {
            return user.tags.some(tag => 
              Array.isArray(condition.value) 
                ? condition.value.includes(tag.id)
                : condition.value === tag.id
            )
          }
          if (condition.field === 'createdAt' && condition.operator === 'greater_than') {
            const conditionDate = new Date(condition.value)
            return user.createdAt > conditionDate
          }
          // 他の条件も必要に応じて追加
          return false
        })
      })
      
      return matchingUsers.length
    } catch {
      return 0
    }
  }

  // Filter segments based on search
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
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (segment.memo && segment.memo.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    placeholder="セグメント名・メモで検索..."
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メモ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    該当ユーザー数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSegments.map((segment) => {
                  const userCount = calculateMatchingUsers(segment)
                  
                  return (
                    <tr 
                      key={segment.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onEditSegment(segment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {segment.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {segment.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {segment.memo ? (
                            <div className="max-w-xs">
                              <p className="truncate" title={segment.memo}>
                                {segment.memo}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">メモなし</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {userCount.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">人</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {segment.createdAt.toLocaleDateString('ja-JP')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {segment.createdAt.toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditSegment(segment)
                            }}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                            title="編集"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicate(segment)
                            }}
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center p-1 rounded hover:bg-gray-100"
                            title="複製"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(segment.id, segment.name)
                            }}
                            className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}