'use client'

import { useState } from 'react'
import { Search, Folder, FolderOpen, ChevronRight, ChevronDown, X } from 'lucide-react'
import { BaseFolder } from '@/types/common'

export interface EntitySelectorProps<T extends { id: string; name: string; folderId?: string | null }> {
  entities: T[]
  folders: BaseFolder[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  multiple?: boolean
  searchPlaceholder?: string
  renderEntity?: (entity: T, isSelected: boolean) => React.ReactNode
  entityTypeName?: string
  className?: string
}

interface FolderHierarchy extends BaseFolder {
  children: FolderHierarchy[]
}

export function EntitySelector<T extends { id: string; name: string; folderId?: string | null }>({
  entities,
  folders,
  selectedIds,
  onChange,
  multiple = true,
  searchPlaceholder = '検索...',
  renderEntity,
  entityTypeName = 'アイテム',
  className = ''
}: EntitySelectorProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Build folder hierarchy
  const buildFolderHierarchy = (folders: BaseFolder[], parentId: string | null = null): FolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  // Get entities in a specific folder
  const getEntitiesInFolder = (folderId: string | null): T[] => {
    if (!entities || !Array.isArray(entities)) return []
    return entities.filter(entity => entity.folderId === folderId)
  }

  // Get filtered entities based on search
  const getFilteredEntities = (): T[] => {
    if (!searchQuery) {
      if (selectedFolderId !== null) {
        return getEntitiesInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
      }
      return entities || []
    }
    return (entities || []).filter(entity => 
      entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  // Handle entity selection
  const handleEntityToggle = (entityId: string) => {
    if (multiple) {
      if (selectedIds.includes(entityId)) {
        onChange(selectedIds.filter(id => id !== entityId))
      } else {
        onChange([...selectedIds, entityId])
      }
    } else {
      onChange([entityId])
    }
  }

  // Render folder tree recursively
  const renderFolder = (folder: FolderHierarchy, level: number = 0) => {
    const entitiesInFolder = getEntitiesInFolder(folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 cursor-pointer rounded ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${(level * 16) + 8}px` }}
          onClick={() => {
            toggleFolder(folder.id)
            setSelectedFolderId(folder.id)
          }}
        >
          <div className="flex items-center space-x-2">
            {folder.children.length > 0 || entitiesInFolder.length > 0 ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )
            ) : (
              <div className="w-4" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-gray-500" />
            ) : (
              <Folder className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">{entitiesInFolder.length}</span>
        </div>

        {isExpanded && (
          <div>
            {/* Render entities in this folder */}
            {entitiesInFolder.map(entity => {
              const isSelected = selectedIds.includes(entity.id)
              return (
                <label
                  key={entity.id}
                  className="flex items-center py-1.5 px-2 hover:bg-gray-50 cursor-pointer rounded"
                  style={{ paddingLeft: `${((level + 1) * 16) + 8}px` }}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={multiple ? undefined : "entity-selector"}
                    checked={isSelected}
                    onChange={() => handleEntityToggle(entity.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  />
                  {renderEntity ? (
                    renderEntity(entity, isSelected)
                  ) : (
                    <span className="text-sm text-gray-700">{entity.name}</span>
                  )}
                </label>
              )
            })}

            {/* Render subfolders */}
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const folderHierarchy = buildFolderHierarchy(folders)
  const uncategorizedEntities = getEntitiesInFolder(null)
  const filteredEntities = getFilteredEntities()
  const selectedEntities = entities.filter(entity => selectedIds.includes(entity.id))

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {searchQuery ? (
          // Show search results
          filteredEntities.length > 0 ? (
            <div className="space-y-1">
              {filteredEntities.map(entity => {
                const isSelected = selectedIds.includes(entity.id)
                return (
                  <label
                    key={entity.id}
                    className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "entity-selector"}
                      checked={isSelected}
                      onChange={() => handleEntityToggle(entity.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    {renderEntity ? (
                      renderEntity(entity, isSelected)
                    ) : (
                      <span className="text-sm text-gray-700">{entity.name}</span>
                    )}
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">検索結果がありません</p>
            </div>
          )
        ) : (
          // Show folder hierarchy
          <div className="space-y-1">
            {/* All items option */}
            <div
              className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
                selectedFolderId === null ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">すべて</span>
              </div>
              <span className="text-xs text-gray-500">{entities.length}</span>
            </div>

            {/* Folder hierarchy */}
            {folderHierarchy.map(folder => renderFolder(folder))}

            {/* Uncategorized items */}
            {uncategorizedEntities.length > 0 && (
              <div className="mt-2">
                <div
                  className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
                    selectedFolderId === 'uncategorized' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedFolderId('uncategorized')}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">未分類</span>
                  </div>
                  <span className="text-xs text-gray-500">{uncategorizedEntities.length}</span>
                </div>

                {selectedFolderId === 'uncategorized' && (
                  <div className="mt-1">
                    {uncategorizedEntities.map(entity => {
                      const isSelected = selectedIds.includes(entity.id)
                      return (
                        <label
                          key={entity.id}
                          className="flex items-center py-1.5 px-2 hover:bg-gray-50 cursor-pointer rounded ml-6"
                        >
                          <input
                            type={multiple ? "checkbox" : "radio"}
                            name={multiple ? undefined : "entity-selector"}
                            checked={isSelected}
                            onChange={() => handleEntityToggle(entity.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          />
                          {renderEntity ? (
                            renderEntity(entity, isSelected)
                          ) : (
                            <span className="text-sm text-gray-700">{entity.name}</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Items Summary */}
      {selectedIds.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              選択中: {selectedIds.length}個
            </span>
            {multiple && (
              <button
                onClick={() => onChange([])}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                すべて解除
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {selectedEntities.slice(0, 5).map(entity => (
              <span
                key={entity.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {entity.name}
                {multiple && (
                  <button
                    onClick={() => handleEntityToggle(entity.id)}
                    className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-blue-200"
                  >
                    <X className="w-2 h-2" />
                  </button>
                )}
              </span>
            ))}
            {selectedEntities.length > 5 && (
              <span className="text-xs text-gray-500">
                ...他{selectedEntities.length - 5}個
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}