'use client'

import { ReactNode } from 'react'
import { DraggableTableBody } from './DraggableTableBody'

export interface TableColumn {
  key: string
  label: string
  width?: string
  minWidth?: string
}

export interface DataTableProps<T extends { id: string; folderId?: string }> {
  columns: TableColumn[]
  data: T[]
  renderRow: (item: T, index: number, isDragging?: boolean) => ReactNode
  emptyState?: ReactNode
  onReorderItems?: (items: T[]) => void
  onMoveItem?: (itemId: string, targetFolderId: string | null) => void
  currentFolderId?: string | null | undefined
  showDragHandle?: boolean
  className?: string
}

export function DataTable<T extends { id: string; folderId?: string }>({
  columns,
  data,
  renderRow,
  emptyState,
  onReorderItems,
  onMoveItem,
  currentFolderId,
  showDragHandle = false,
  className = ''
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className="p-8">{emptyState}</div>
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onReorderItems && showDragHandle && (
                <th className="w-10 px-2"></th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.minWidth ? column.minWidth : ''
                  }`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          {onReorderItems && onMoveItem ? (
            <DraggableTableBody
              items={data}
              currentFolderId={currentFolderId}
              onReorderItems={onReorderItems}
              onMoveItem={onMoveItem}
              showDragHandle={showDragHandle}
              renderRow={renderRow}
            />
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {renderRow(item, index)}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}