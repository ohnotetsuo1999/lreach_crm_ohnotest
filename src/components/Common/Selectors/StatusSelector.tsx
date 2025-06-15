'use client'

import { Status, StatusFolder } from '@/types'
import { EntitySelector } from './EntitySelector'
import { Users } from 'lucide-react'

interface StatusSelectorProps {
  statuses: Status[]
  statusFolders: StatusFolder[]
  selectedStatusIds: string[]
  onChange: (statusIds: string[]) => void
  multiple?: boolean
  className?: string
}

export function StatusSelector({
  statuses,
  statusFolders,
  selectedStatusIds,
  onChange,
  multiple = true,
  className = ''
}: StatusSelectorProps) {
  // Convert Status to entity format with name property
  const statusEntities = statuses.map(status => ({
    ...status,
    name: status.label // Map label to name for EntitySelector
  }))

  const renderStatus = (status: Status & { name: string }, isSelected: boolean) => (
    <div className="flex items-center justify-between flex-1">
      <div>
        <span className="text-sm font-medium text-gray-900">{status.label}</span>
        <span className="text-xs text-gray-500 ml-2">({status.code})</span>
      </div>
    </div>
  )

  return (
    <EntitySelector
      entities={statusEntities}
      folders={statusFolders}
      selectedIds={selectedStatusIds}
      onChange={onChange}
      multiple={multiple}
      searchPlaceholder="ステータスを検索..."
      renderEntity={renderStatus}
      entityTypeName="ステータス"
      className={className}
    />
  )
}