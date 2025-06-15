'use client'

import { useState, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'
import { Modal } from '../Modal'
import { Button } from '../Button'

export interface MultiSelectModalProps<T extends { id: string; name: string }> {
  isOpen: boolean
  onClose: () => void
  title: string
  items: T[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  searchPlaceholder?: string
  displayField?: keyof T
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
  multiple?: boolean
  colorScheme?: {
    primary: string
    secondary: string
  }
}

export function MultiSelectModal<T extends { id: string; name: string }>({
  isOpen,
  onClose,
  title,
  items,
  selectedIds,
  onSelectionChange,
  searchPlaceholder = '検索...',
  displayField = 'name',
  renderItem,
  multiple = true,
  colorScheme = { primary: 'blue', secondary: 'gray' }
}: MultiSelectModalProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)

  useEffect(() => {
    setLocalSelectedIds(selectedIds)
  }, [selectedIds])

  const filteredItems = items.filter(item =>
    String(item[displayField]).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleItem = (itemId: string) => {
    if (multiple) {
      setLocalSelectedIds(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    } else {
      setLocalSelectedIds([itemId])
    }
  }

  const handleConfirm = () => {
    onSelectionChange(localSelectedIds)
    onClose()
  }

  const handleSelectAll = () => {
    setLocalSelectedIds(filteredItems.map(item => item.id))
  }

  const handleClearAll = () => {
    setLocalSelectedIds([])
  }

  const selectedItems = items.filter(item => localSelectedIds.includes(item.id))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="flex flex-col h-[500px]">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          {multiple && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">
                {localSelectedIds.length}個選択中
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  すべて選択
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  選択解除
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map(item => {
                const isSelected = localSelectedIds.includes(item.id)
                
                return (
                  <label
                    key={item.id}
                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? `bg-${colorScheme.primary}-50 border-${colorScheme.primary}-300`
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={multiple ? undefined : "item-selector"}
                        checked={isSelected}
                        onChange={() => handleToggleItem(item.id)}
                        className={`h-4 w-4 text-${colorScheme.primary}-600 border-gray-300 rounded focus:ring-${colorScheme.primary}-500`}
                      />
                      <div className="ml-3 flex-1">
                        {renderItem ? (
                          renderItem(item, isSelected)
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {String(item[displayField])}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className={`w-4 h-4 text-${colorScheme.primary}-600`} />
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">検索結果がありません</p>
            </div>
          )}
        </div>

        {/* Selected Items Preview */}
        {multiple && selectedItems.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                選択済み ({selectedItems.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {selectedItems.map(item => (
                <span
                  key={item.id}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${colorScheme.primary}-100 text-${colorScheme.primary}-800`}
                >
                  {String(item[displayField])}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleToggleItem(item.id)
                    }}
                    className={`ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-${colorScheme.primary}-400 hover:bg-${colorScheme.primary}-200 hover:text-${colorScheme.primary}-600`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>
            確定
          </Button>
        </div>
      </div>
    </Modal>
  )
}