'use client'

import { useState, useMemo } from 'react'

interface UseSearchProps<T> {
  items: T[]
  searchFields: (keyof T)[]
  caseSensitive?: boolean
  searchDelay?: number
}

export function useSearch<T>({
  items,
  searchFields,
  caseSensitive = false
}: UseSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items

    const query = caseSensitive ? searchQuery : searchQuery.toLowerCase()

    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        if (value == null) return false
        
        const stringValue = caseSensitive ? String(value) : String(value).toLowerCase()
        return stringValue.includes(query)
      })
    )
  }, [items, searchQuery, searchFields, caseSensitive])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const hasSearchQuery = searchQuery.trim().length > 0
  const resultCount = filteredItems.length

  return {
    // State
    searchQuery,
    
    // Computed
    filteredItems,
    hasSearchQuery,
    resultCount,
    
    // Actions
    setSearchQuery,
    clearSearch
  }
}

interface UseAdvancedSearchProps<T> extends UseSearchProps<T> {
  filters?: Record<string, any>
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
}

export function useAdvancedSearch<T>({
  items,
  searchFields,
  caseSensitive = false,
  filters = {},
  sortBy,
  sortOrder = 'asc'
}: UseAdvancedSearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(filters)
  const [currentSortBy, setCurrentSortBy] = useState<keyof T | undefined>(sortBy)
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(sortOrder)

  const processedItems = useMemo(() => {
    let result = [...items]

    // Apply search
    if (searchQuery.trim()) {
      const query = caseSensitive ? searchQuery : searchQuery.toLowerCase()
      result = result.filter(item => 
        searchFields.some(field => {
          const value = item[field]
          if (value == null) return false
          
          const stringValue = caseSensitive ? String(value) : String(value).toLowerCase()
          return stringValue.includes(query)
        })
      )
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        result = result.filter(item => {
          const itemValue = (item as any)[filterKey]
          
          if (typeof filterValue === 'boolean') {
            return itemValue === filterValue
          }
          
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue)
          }
          
          return itemValue === filterValue
        })
      }
    })

    // Apply sorting
    if (currentSortBy) {
      result.sort((a, b) => {
        const aValue = a[currentSortBy]
        const bValue = b[currentSortBy]
        
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return 1
        if (bValue == null) return -1
        
        let comparison = 0
        if (aValue < bValue) comparison = -1
        else if (aValue > bValue) comparison = 1
        
        return currentSortOrder === 'desc' ? -comparison : comparison
      })
    }

    return result
  }, [items, searchQuery, searchFields, caseSensitive, activeFilters, currentSortBy, currentSortOrder])

  const updateFilter = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
  }

  const removeFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
  }

  const toggleSort = (field: keyof T) => {
    if (currentSortBy === field) {
      setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setCurrentSortBy(field)
      setCurrentSortOrder('asc')
    }
  }

  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length

  return {
    // State
    searchQuery,
    activeFilters,
    currentSortBy,
    currentSortOrder,
    
    // Computed
    filteredItems: processedItems,
    hasSearchQuery: searchQuery.trim().length > 0,
    resultCount: processedItems.length,
    activeFilterCount,
    
    // Actions
    setSearchQuery,
    updateFilter,
    removeFilter,
    clearAllFilters,
    toggleSort,
    
    // Utilities
    clearSearch: () => setSearchQuery('')
  }
}