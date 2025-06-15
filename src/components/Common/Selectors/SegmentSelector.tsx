'use client'

import { Segment, SegmentFolder } from '@/types'
import { EntitySelector } from './EntitySelector'
import { Target } from 'lucide-react'

interface SegmentSelectorProps {
  segments: Segment[]
  segmentFolders: SegmentFolder[]
  selectedSegmentIds: string[]
  onChange: (segmentIds: string[]) => void
  multiple?: boolean
  className?: string
}

export function SegmentSelector({
  segments,
  segmentFolders,
  selectedSegmentIds,
  onChange,
  multiple = true,
  className = ''
}: SegmentSelectorProps) {
  const renderSegment = (segment: Segment, isSelected: boolean) => (
    <div className="flex items-center justify-between flex-1">
      <div>
        <span className="text-sm font-medium text-gray-900">{segment.name}</span>
        {segment.memo && (
          <p className="text-xs text-gray-500 mt-0.5">{segment.memo}</p>
        )}
      </div>
    </div>
  )

  return (
    <EntitySelector
      entities={segments}
      folders={segmentFolders}
      selectedIds={selectedSegmentIds}
      onChange={onChange}
      multiple={multiple}
      searchPlaceholder="セグメントを検索..."
      renderEntity={renderSegment}
      entityTypeName="セグメント"
      className={className}
    />
  )
}