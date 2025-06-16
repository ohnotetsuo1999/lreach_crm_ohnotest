'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Folder, FolderOpen, ChevronRight, ChevronDown, Move } from 'lucide-react'

export interface BaseFolder {
  id: string
  name: string
  parentId?: string | null
  order?: number
}

export interface BaseItem {
  id: string
  name: string
  folderId?: string | null
  order?: number
}

interface DraggableFolderTreeProps<F extends BaseFolder, I extends BaseItem> {
  folders: F[]
  items: I[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onReorderFolders: (folders: F[]) => void
  onReorderItems: (items: I[]) => void
  onMoveItem: (itemId: string, targetFolderId: string | null) => void
  onContextMenu?: (e: React.MouseEvent, folderId: string | null) => void
  className?: string
  showAllFolder?: boolean
  showUncategorizedFolder?: boolean
  allFolderLabel?: string
  uncategorizedFolderLabel?: string
  itemCountLabel?: (count: number) => string
}

export function DraggableFolderTree<F extends BaseFolder, I extends BaseItem>({
  folders,
  items,
  expandedFolders,
  selectedFolder,
  onToggleFolder,
  onSelectFolder,
  onReorderFolders,
  onReorderItems,
  onMoveItem,
  onContextMenu,
  className = '',
  showAllFolder = true,
  showUncategorizedFolder = true,
  allFolderLabel = 'すべて',
  uncategorizedFolderLabel = '未分類',
  itemCountLabel = (count) => `(${count})`
}: DraggableFolderTreeProps<F, I>) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null)

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: F[], parentId: string | null = null): any[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
      }))
  }

  const rootFolders = buildFolderHierarchy(folders)

  // アイテム数を取得
  const getItemCount = (folderId: string | null): number => {
    if (folderId === null) return items.length
    if (folderId === 'null') return items.filter(item => !item.folderId).length
    return items.filter(item => item.folderId === folderId).length
  }

  // ドラッグ終了時の処理
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === 'folder') {
      // フォルダの並び替え
      const draggedFolder = folders.find(f => f.id === draggableId)
      if (!draggedFolder) return

      const sourceParentId = source.droppableId === 'root' ? null : source.droppableId.replace('folder-', '')
      const destParentId = destination.droppableId === 'root' ? null : destination.droppableId.replace('folder-', '')

      // 同じ親フォルダ内での並び替え
      if (sourceParentId === destParentId) {
        const siblings = folders.filter(f => f.parentId === sourceParentId)
        const reorderedSiblings = Array.from(siblings)
        const [removed] = reorderedSiblings.splice(source.index, 1)
        reorderedSiblings.splice(destination.index, 0, removed)

        // order を更新
        const updatedFolders = folders.map(folder => {
          const index = reorderedSiblings.findIndex(f => f.id === folder.id)
          if (index !== -1) {
            return { ...folder, order: index }
          }
          return folder
        })

        onReorderFolders(updatedFolders)
      } else {
        // 異なる親フォルダへの移動（循環参照チェック）
        if (!isDescendantFolder(draggableId, destParentId, folders)) {
          const updatedFolders = folders.map(folder => {
            if (folder.id === draggableId) {
              return { ...folder, parentId: destParentId }
            }
            return folder
          })
          onReorderFolders(updatedFolders)
        }
      }
    } else if (type === 'item') {
      // アイテムの移動
      const targetFolderId = destination.droppableId === 'uncategorized' ? null : destination.droppableId
      onMoveItem(draggableId, targetFolderId)
    }
  }

  // 循環参照チェック
  const isDescendantFolder = (ancestorId: string, descendantId: string | null, folders: F[]): boolean => {
    if (!descendantId) return false
    if (ancestorId === descendantId) return true
    
    const descendant = folders.find(f => f.id === descendantId)
    if (!descendant?.parentId) return false
    
    return isDescendantFolder(ancestorId, descendant.parentId, folders)
  }

  // フォルダのレンダリング
  const renderFolder = (folder: any, index: number, level: number = 0) => {
    const itemCount = getItemCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <Draggable key={folder.id} draggableId={folder.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="mb-1"
          >
            <div 
              className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              } ${snapshot.isDragging ? 'shadow-lg bg-white' : ''}`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              onClick={() => onSelectFolder(folder.id)}
              onContextMenu={onContextMenu ? (e) => onContextMenu(e, folder.id) : undefined}
            >
              <div className="flex items-center min-w-0 flex-1">
                <div {...provided.dragHandleProps} className="opacity-0 group-hover:opacity-100 p-1 cursor-move">
                  <Move className="w-3 h-3 text-gray-400" />
                </div>
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
              <span className="text-xs text-gray-500">{itemCountLabel(itemCount)}</span>
            </div>
            
            {isExpanded && hasChildren && (
              <Droppable droppableId={`folder-${folder.id}`} type="folder">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="ml-4"
                  >
                    {folder.children.map((child: any, index: number) => renderFolder(child, index, level + 1))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            
            {/* フォルダ内のアイテムドロップゾーン */}
            {isExpanded && (
              <Droppable droppableId={folder.id} type="item">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`ml-8 min-h-[20px] rounded transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                    }`}
                    style={{ paddingLeft: `${level * 16}px` }}
                  >
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={`space-y-1 ${className}`}>
        {/* すべて */}
        {showAllFolder && (
          <div 
            className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
              selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
            onClick={() => onSelectFolder(null)}
            onContextMenu={onContextMenu ? (e) => onContextMenu(e, null) : undefined}
          >
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" />
              <Folder className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium">{allFolderLabel}</span>
            </div>
            <span className="text-xs text-gray-500">{itemCountLabel(items.length)}</span>
          </div>
        )}

        {/* 未分類 */}
        {showUncategorizedFolder && (
          <Droppable droppableId="uncategorized" type="item">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                } ${snapshot.isDraggingOver ? 'ring-2 ring-blue-300' : ''}`}
                onClick={() => onSelectFolder('null')}
                onContextMenu={onContextMenu ? (e) => onContextMenu(e, 'null') : undefined}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2" />
                  <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">{uncategorizedFolderLabel}</span>
                </div>
                <span className="text-xs text-gray-500">{itemCountLabel(getItemCount('null'))}</span>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        {/* フォルダツリー */}
        <Droppable droppableId="root" type="folder">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {rootFolders.map((folder, index) => renderFolder(folder, index, 0))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}