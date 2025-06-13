'use client'

import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T, index: number) => void
  selectedItems?: Set<string | number>
  onSelectItem?: (id: string | number, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  getItemId?: (item: T) => string | number
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export function Table<T>({
  data,
  columns,
  onRowClick,
  selectedItems,
  onSelectItem,
  onSelectAll,
  getItemId,
  emptyMessage = 'データがありません',
  loading = false,
  className = ''
}: TableProps<T>) {
  const hasSelection = selectedItems && onSelectItem && getItemId
  const allSelected = hasSelection && data.length > 0 && 
    data.every(item => selectedItems.has(getItemId(item)))

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {data.length > 0 || loading ? (
        <>
          {/* Table Header */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className={`grid gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              hasSelection ? `grid-cols-${columns.length + 1}` : `grid-cols-${columns.length}`
            }`}>
              {hasSelection && (
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              )}
              {columns.map((column, index) => (
                <div key={index} className={`col-span-1 ${column.width || ''}`}>
                  {column.header}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  読み込み中...
                </div>
              </div>
            ) : (
              data.map((item, index) => {
                const itemId = getItemId?.(item)
                const isSelected = hasSelection && itemId && selectedItems.has(itemId)
                
                return (
                  <div 
                    key={index} 
                    className={`px-6 py-4 ${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    <div className={`grid gap-4 items-center ${
                      hasSelection ? `grid-cols-${columns.length + 1}` : `grid-cols-${columns.length}`
                    }`}>
                      {hasSelection && itemId && (
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(itemId)}
                            onChange={(e) => {
                              e.stopPropagation()
                              onSelectItem(itemId, e.target.checked)
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      )}
                      {columns.map((column, colIndex) => (
                        <div key={colIndex} className={`col-span-1 ${column.width || ''}`}>
                          {column.render 
                            ? column.render(item, index)
                            : String((item as any)[column.key] || '')
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

interface SimpleTableProps {
  children: ReactNode
  className?: string
}

export function SimpleTable({ children, className = '' }: SimpleTableProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  )
}

interface TableBodyProps {
  children: ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}

interface TableHeaderCellProps {
  children: ReactNode
  className?: string
}

export function TableHeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}