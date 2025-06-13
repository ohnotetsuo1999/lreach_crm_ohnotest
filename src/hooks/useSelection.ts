'use client'

import { useState, useMemo } from 'react'

interface UseSelectionProps<T> {
  items: T[]
  getItemId: (item: T) => string | number
  multiple?: boolean
}

export function useSelection<T>({
  items,
  getItemId,
  multiple = true
}: UseSelectionProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())

  const handleSelectItem = (itemId: string | number, selected: boolean) => {
    if (multiple) {
      const newSelection = new Set(selectedItems)
      if (selected) {
        newSelection.add(itemId)
      } else {
        newSelection.delete(itemId)
      }
      setSelectedItems(newSelection)
    } else {
      // Single selection mode
      setSelectedItems(selected ? new Set([itemId]) : new Set())
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (!multiple) return // Single selection doesn't support select all
    
    if (selected) {
      setSelectedItems(new Set(items.map(getItemId)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const toggleItem = (itemId: string) => {
    handleSelectItem(itemId, !selectedItems.has(itemId))
  }

  const selectOnly = (itemId: string) => {
    setSelectedItems(new Set([itemId]))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const isSelected = (itemId: string | number): boolean => {
    return selectedItems.has(itemId)
  }

  const getSelectedItems = (): T[] => {
    return items.filter(item => selectedItems.has(getItemId(item)))
  }

  const allSelected = useMemo(() => {
    if (items.length === 0) return false
    return items.every(item => selectedItems.has(getItemId(item)))
  }, [items, selectedItems, getItemId])

  const someSelected = useMemo(() => {
    return selectedItems.size > 0 && selectedItems.size < items.length
  }, [selectedItems.size, items.length])

  const selectedCount = selectedItems.size

  return {
    // State
    selectedItems,
    selectedCount,
    
    // Computed
    allSelected,
    someSelected,
    
    // Actions
    handleSelectItem,
    handleSelectAll,
    toggleItem,
    selectOnly,
    clearSelection,
    
    // Utilities
    isSelected,
    getSelectedItems
  }
}