'use client'

import { useState } from 'react'
import { Tag, Status } from '@/types'
import { Filter, X, Plus } from 'lucide-react'

interface TagFilterPanelProps {
  tags: Tag[]
  statuses: Status[]
  selectedTags: string[]
  selectedStatuses: string[]
  onTagsChange: (tagIds: string[]) => void
  onStatusesChange: (statusIds: string[]) => void
  onCreateTag: () => void
}

export function TagFilterPanel({
  tags,
  statuses,
  selectedTags,
  selectedStatuses,
  onTagsChange,
  onStatusesChange,
  onCreateTag
}: TagFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTagColor = (tagType: string) => {
    switch (tagType) {
      case 'MANUAL':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'AUTOMATIC':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'BEHAVIORAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTagTypeLabel = (tagType: string) => {
    switch (tagType) {
      case 'MANUAL':
        return '手動'
      case 'AUTOMATIC':
        return '自動'
      case 'BEHAVIORAL':
        return '行動'
      default:
        return tagType
    }
  }

  const handleTagSelect = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]
    onTagsChange(newTags)
  }

  const handleStatusSelect = (statusId: string) => {
    const newStatuses = selectedStatuses.includes(statusId)
      ? selectedStatuses.filter(id => id !== statusId)
      : [...selectedStatuses, statusId]
    onStatusesChange(newStatuses)
  }

  const handleClearFilters = () => {
    onTagsChange([])
    onStatusesChange([])
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">フィルター</h3>
        <div className="flex items-center space-x-2">
          {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              クリア
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>


      {isExpanded && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">タグで絞り込み</h4>
            <button
              onClick={onCreateTag}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新規作成
            </button>
          </div>

          <div className="space-y-3">
            {['MANUAL', 'AUTOMATIC', 'BEHAVIORAL'].map((type) => {
              const typeTags = tags.filter(tag => tag.type === type)
              if (typeTags.length === 0) return null

              return (
                <div key={type}>
                  <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    {getTagTypeLabel(type)}タグ
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {typeTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagSelect(tag.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : getTagColor(tag.type)
                        }`}
                      >
                        {tag.name}
                        {selectedTags.includes(tag.id) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          
          {/* Status filters */}
          <div>
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              ステータス
            </h5>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleStatusSelect(status.id)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    selectedStatuses.includes(status.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {status.label}
                  {selectedStatuses.includes(status.id) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">選択中のフィルター</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null

              return (
                <span
                  key={tagId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag.name}
                  <button
                    onClick={() => handleTagSelect(tagId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            {selectedStatuses.map((statusId) => {
              const status = statuses.find(s => s.id === statusId)
              if (!status) return null

              return (
                <span
                  key={statusId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {status.label}
                  <button
                    onClick={() => handleStatusSelect(statusId)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}