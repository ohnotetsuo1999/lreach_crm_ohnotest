'use client'

import { useState } from 'react'
import { Tag, Status } from '@/types'
import { Users, Tags, BarChart3 } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  tags: Tag[]
  statuses: Status[]
  onAddTagsBulk: (tagIds: string[]) => void
  onRemoveTagsBulk: (tagIds: string[]) => void
  onChangeStatusBulk: (statusId: string) => void
  onClearSelection: () => void
}

export function BulkActionBar({
  selectedCount,
  tags,
  statuses,
  onAddTagsBulk,
  onRemoveTagsBulk,
  onChangeStatusBulk,
  onClearSelection
}: BulkActionBarProps) {
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [tagAction, setTagAction] = useState<'add' | 'remove'>('add')

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{selectedCount}人選択中</span>
          </div>

          <div className="h-6 border-l border-gray-300" />

          <div className="flex items-center space-x-2">
            {/* タグ操作 */}
            <div className="relative">
              <button
                onClick={() => setShowTagMenu(!showTagMenu)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
              >
                <Tags className="w-4 h-4 mr-2" />
                タグ操作
              </button>

              {showTagMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="p-4">
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => setTagAction('add')}
                        className={`px-3 py-1 text-xs rounded ${
                          tagAction === 'add' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        追加
                      </button>
                      <button
                        onClick={() => setTagAction('remove')}
                        className={`px-3 py-1 text-xs rounded ${
                          tagAction === 'remove' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        削除
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      {tags.map((tag) => (
                        <label key={tag.id} className="flex items-center py-1">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300"
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (tagAction === 'add') {
                                  onAddTagsBulk([tag.id])
                                } else {
                                  onRemoveTagsBulk([tag.id])
                                }
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ステータス変更 */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                ステータス
              </button>

              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {statuses.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => {
                          onChangeStatusBulk(status.id)
                          setShowStatusMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="h-6 border-l border-gray-300" />

          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            選択解除
          </button>
        </div>
      </div>
    </div>
  )
}