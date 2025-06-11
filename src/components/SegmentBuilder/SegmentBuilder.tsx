'use client'

import { useState, useEffect } from 'react'
import { ConditionBuilder } from './ConditionBuilder'
import { PreviewCount } from './PreviewCount'
import { SegmentFilter, Segment, User, Tag, Status } from '@/types'
import { Save, Filter, Plus } from 'lucide-react'

interface SegmentBuilderProps {
  segments: Segment[]
  users: User[]
  tags: Tag[]
  statuses: Status[]
  onSaveSegment: (segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onLoadSegment: (segment: Segment) => void
  editingSegment?: Segment | null
}

export function SegmentBuilder({
  segments,
  users,
  tags,
  statuses,
  onSaveSegment,
  onLoadSegment,
  editingSegment
}: SegmentBuilderProps) {
  const [segmentName, setSegmentName] = useState('')
  const [segmentMemo, setSegmentMemo] = useState('')
  const [filter, setFilter] = useState<SegmentFilter>({
    conditions: [],
    logic: 'AND'
  })
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)

  // Load editing segment data
  useEffect(() => {
    if (editingSegment) {
      try {
        const loadedFilter = JSON.parse(editingSegment.filterJson) as SegmentFilter
        setFilter(loadedFilter)
        setSegmentName(editingSegment.name)
        setSegmentMemo(editingSegment.memo || '')
        setSelectedSegment(editingSegment)
      } catch (error) {
        console.error('Failed to load editing segment:', error)
        // Reset to empty state if loading fails
        setFilter({ conditions: [], logic: 'AND' })
        setSegmentName('')
        setSegmentMemo('')
        setSelectedSegment(null)
      }
    } else {
      // Reset to empty state when not editing
      setFilter({ conditions: [], logic: 'AND' })
      setSegmentName('')
      setSegmentMemo('')
      setSelectedSegment(null)
    }
  }, [editingSegment])

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
      memo: segmentMemo.trim() || undefined,
      filterJson: JSON.stringify(filter)
    })

    // Don't reset state here - let the parent component handle navigation
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


  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">セグメントビルダー</h1>
          <p className="text-gray-600 mt-1">条件を設定してユーザーセグメントを作成</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* 左サイドバー: プレビュー */}
        <div className="xl:col-span-1">
          <PreviewCount 
            filter={filter} 
            users={users}
            onRefresh={() => {
              // リフレッシュロジック
              setFilter({ ...filter })
            }}
          />
        </div>

          {/* メインエリア: 条件ビルダー */}
          <div className="xl:col-span-3">
            <div className="space-y-8">
              {/* セグメント名入力 */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* セグメント名 */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-blue-600" />
                        セグメント名
                      </label>
                      <input
                        type="text"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        className="block w-full px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="例: アクティブユーザー、新規登録者、VIPカスタマーなど"
                      />
                      <p className="mt-2 text-sm text-gray-600">
                        わかりやすい名前をつけて、後で簡単に見つけられるようにしましょう
                      </p>
                    </div>

                    {/* メモ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        メモ（任意）
                      </label>
                      <textarea
                        value={segmentMemo}
                        onChange={(e) => setSegmentMemo(e.target.value)}
                        rows={3}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="このセグメントの用途や特徴などを記録できます（例: 月次キャンペーン用、リテンション対象者など）"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        セグメントの目的や使用場面をメモしておくと後で便利です
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 条件ビルダー - より広いスペース */}
              <div className="min-h-[600px]">
                <ConditionBuilder
                  filter={filter}
                  tags={tags}
                  statuses={statuses}
                  onChange={setFilter}
                />
              </div>


              {/* アクションバー */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky bottom-0">
                <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      {filter.conditions.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {filter.conditions.length}個の条件
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const newCondition = {
                          field: 'lineFriendAddedAt',
                          operator: 'after' as const,
                          value: '',
                          logic: filter.conditions.length > 0 ? 'AND' as const : undefined,
                          title: ''
                        }
                        setFilter({
                          ...filter,
                          conditions: [...filter.conditions, newCondition]
                        })
                      }}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新しい条件を追加
                    </button>
                    
                    <button
                      onClick={handleSaveSegment}
                      disabled={!segmentName.trim() || filter.conditions.length === 0}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingSegment ? 'セグメント更新' : 'セグメント保存'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}