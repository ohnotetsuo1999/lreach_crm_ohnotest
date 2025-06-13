'use client'

import { useState } from 'react'
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Settings, Trash2 } from 'lucide-react'

export interface FolderItem {
  id: string
  name: string
  description?: string
  parentId?: string | null
  itemCount?: number
  children?: FolderItem[]
}

interface FolderTreeProps<T extends FolderItem> {
  folders: T[]
  selectedFolderId: string | null
  expandedFolders: Set<string>
  onSelectFolder: (folderId: string | null) => void
  onToggleExpand: (folderId: string) => void
  onCreateFolder?: () => void
  onEditFolder?: (folder: T) => void
  onDeleteFolder?: (folderId: string) => void
  showAllOption?: boolean
  allOptionLabel?: string
  showUncategorized?: boolean
  uncategorizedLabel?: string
  uncategorizedCount?: number
  className?: string
}

export function FolderTree<T extends FolderItem>({
  folders,
  selectedFolderId,
  expandedFolders,
  onSelectFolder,
  onToggleExpand,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  showAllOption = true,
  allOptionLabel = 'すべて',
  showUncategorized = true,
  uncategorizedLabel = '未分類',
  uncategorizedCount = 0,
  className = ''
}: FolderTreeProps<T>) {
  
  const buildFolderHierarchy = (parentId: string | null = null): T[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folder.id) as FolderItem[]
      })) as T[]
  }

  const renderFolder = (folder: T, level: number = 0) => (
    <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
      <div
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded group ${
          selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : ''
        }`}
        onClick={() => {
          onSelectFolder(selectedFolderId === folder.id ? null : folder.id)
          onToggleExpand(folder.id)
        }}
      >
        <div className="flex items-center space-x-2 flex-1">
          {folder.children && folder.children.length > 0 ? (
            expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
          {expandedFolders.has(folder.id) ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
          <span className="text-sm font-medium truncate">{folder.name}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">
            {folder.itemCount || 0}
          </span>
          {(onEditFolder || onDeleteFolder) && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
              {onEditFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditFolder(folder)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
              {onDeleteFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('このフォルダを削除しますか？')) {
                      onDeleteFolder(folder.id)
                    }
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {expandedFolders.has(folder.id) && 
        folder.children && 
        folder.children.map((child) => renderFolder(child as T, level + 1))
      }
    </div>
  )

  const folderHierarchy = buildFolderHierarchy()
  const totalCount = folders.reduce((sum, folder) => sum + (folder.itemCount || 0), 0) + uncategorizedCount

  return (
    <div className={`space-y-1 ${className}`}>
      {showAllOption && (
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
            selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <Folder className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{allOptionLabel}</span>
          <span className="ml-auto text-xs text-gray-500">{totalCount}</span>
        </div>
      )}
      
      {folderHierarchy.map(folder => renderFolder(folder))}
      
      {showUncategorized && uncategorizedCount > 0 && (
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
            selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
          }`}
          onClick={() => onSelectFolder('uncategorized')}
        >
          <Folder className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-600">{uncategorizedLabel}</span>
          <span className="ml-auto text-xs text-gray-500">{uncategorizedCount}</span>
        </div>
      )}

      {onCreateFolder && (
        <button
          onClick={onCreateFolder}
          className="w-full flex items-center py-2 px-3 text-gray-600 hover:bg-gray-50 rounded text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          フォルダを作成
        </button>
      )}
    </div>
  )
}

// フォルダモーダルコンポーネント
interface FolderModalProps<T extends FolderItem> {
  isOpen: boolean
  onClose: () => void
  onSave: (folder: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => void
  folders: T[]
  editingFolder?: T | null
  title?: string
}

export function FolderModal<T extends FolderItem>({
  isOpen,
  onClose,
  onSave,
  folders,
  editingFolder,
  title
}: FolderModalProps<T>) {
  const [formData, setFormData] = useState({
    name: editingFolder?.name || '',
    description: editingFolder?.description || '',
    parentId: editingFolder?.parentId || ''
  })

  const handleSave = () => {
    if (!formData.name.trim()) return

    onSave({
      name: formData.name,
      description: formData.description || undefined,
      parentId: formData.parentId || undefined
    } as Omit<T, 'id' | 'createdAt' | 'updatedAt'>)
    
    onClose()
  }

  const modalTitle = title || (editingFolder ? 'フォルダを編集' : '新規フォルダ作成')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フォルダ名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="フォルダ名を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="フォルダの説明（任意）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              親フォルダ
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">なし（ルートフォルダ）</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingFolder ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  )
}