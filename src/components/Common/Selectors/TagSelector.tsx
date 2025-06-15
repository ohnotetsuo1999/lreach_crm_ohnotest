'use client'

import { Tag, TagFolder } from '@/types'
import { EntitySelector } from './EntitySelector'
import { TagIcon } from 'lucide-react'

interface TagSelectorProps {
  tags: Tag[]
  tagFolders: TagFolder[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  multiple?: boolean
  className?: string
}

export function TagSelector({
  tags,
  tagFolders,
  selectedTagIds,
  onChange,
  multiple = true,
  className = ''
}: TagSelectorProps) {
  const renderTag = (tag: Tag, isSelected: boolean) => (
    <div className="flex items-center justify-between flex-1">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
        {tag.note && (
          <p className="text-xs text-gray-500 mt-0.5">{tag.note}</p>
        )}
      </div>
      {tag.type && (
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
          tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
          tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {tag.type === 'MANUAL' ? '手動' : 
           tag.type === 'AUTOMATIC' ? '自動' : '行動'}
        </span>
      )}
    </div>
  )

  return (
    <EntitySelector
      entities={tags}
      folders={tagFolders}
      selectedIds={selectedTagIds}
      onChange={onChange}
      multiple={multiple}
      searchPlaceholder="タグを検索..."
      renderEntity={renderTag}
      entityTypeName="タグ"
      className={className}
    />
  )
}