'use client'

import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'

export interface BaseFolder {
  id: string
  name: string
  parentId?: string | null
  children?: BaseFolder[]
}

export interface BaseItem {
  id: string
  folderId?: string
}

interface FolderTreeViewProps<F extends BaseFolder, I extends BaseItem> {
  folders: F[]
  items: I[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  showAllFolder?: boolean
  showUncategorizedFolder?: boolean
  allFolderLabel?: string
  uncategorizedFolderLabel?: string
  getItemCount?: (folderId: string) => number
  onEditFolder?: (folder: F) => void
  onDeleteFolder?: (folderId: string) => void
}

export function FolderTreeView<F extends BaseFolder, I extends BaseItem>({
  folders,
  items,
  expandedFolders,
  selectedFolder,
  onToggleFolder,
  onSelectFolder,
  showAllFolder = true,
  showUncategorizedFolder = true,
  allFolderLabel = 'すべて',
  uncategorizedFolderLabel = '未分類',
  getItemCount,
  onEditFolder,
  onDeleteFolder
}: FolderTreeViewProps<F, I>) {
  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: F[], parentId: string | null = null): F[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(folders)

  const getDefaultItemCount = (folderId: string): number => {
    return items.filter(item => item.folderId === folderId).length
  }

  const getCount = getItemCount || getDefaultItemCount

  const renderFolder = (folder: F, level: number = 0) => {
    const itemCount = getCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || itemCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || itemCount > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <div className="w-3 h-3" />
              )}
            </button>
            <Folder className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">{itemCount}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children?.map((child) => renderFolder(child as F, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* すべてのアイテム */}
      {showAllFolder && (
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2" />
            <Folder className="w-4 h-4 mr-2 text-green-500" />
            <span className="font-medium">{allFolderLabel}</span>
          </div>
          <span className="text-xs text-gray-500">{items.length}</span>
        </div>
      )}

      {/* 未分類アイテム */}
      {showUncategorizedFolder && (
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          onClick={() => onSelectFolder('null')}
        >
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2" />
            <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
            <span className="font-medium">{uncategorizedFolderLabel}</span>
          </div>
          <span className="text-xs text-gray-500">{items.filter(item => !item.folderId).length}</span>
        </div>
      )}

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}