'use client'

import { useState } from 'react'
import { Tag, TagFolder } from '@/types'
import { Plus, Search, Folder, Edit2, Trash2, ChevronDown, ChevronRight, Move, Grid3X3, List, FolderOpen, Eye, EyeOff, Filter, Copy } from 'lucide-react'
import { ActionMenu, createCommonMenuItems } from '@/components/Common/ActionMenu'
import { DraggableFolderTree } from '@/components/Common/DraggableFolderTree'
import { DraggableTableBody } from '@/components/Common/DraggableTableBody'

interface TagManagementProps {
  tags: Tag[]
  tagFolders: TagFolder[]
  onCreateTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void
  onUpdateTag: (tagId: string, updates: Partial<Tag>) => void
  onDeleteTag: (tagId: string) => void
  onCreateFolder: (folder: Omit<TagFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<TagFolder>) => void
  onDeleteFolder: (folderId: string) => void
  onMoveTag: (tagId: string, folderId: string | null) => void
  onReorderTags?: (tags: Tag[]) => void
  onReorderFolders?: (folders: TagFolder[]) => void
}

export function TagManagement({
  tags,
  tagFolders,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onMoveTag,
  onReorderTags,
  onReorderFolders
}: TagManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '4']) // プロジェクトと個人フォルダを展開
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingFolder, setEditingFolder] = useState<TagFolder | null>(null)
  const [draggedTag, setDraggedTag] = useState<string | null>(null)
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showEmptyFolders, setShowEmptyFolders] = useState(true)
  const [selectedTagType, setSelectedTagType] = useState<'ALL' | 'MANUAL' | 'AUTOMATIC' | 'BEHAVIORAL'>('ALL')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, folderId: string | null} | null>(null)
  const [newTagInFolder, setNewTagInFolder] = useState<string | null>(null)
  const [newFolderInFolder, setNewFolderInFolder] = useState<string | null>(null)

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フィルタリング
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedTagType === 'ALL' || tag.type === selectedTagType
    
    // フォルダによるフィルタリング
    let matchesFolder = true
    if (selectedFolder === 'null') {
      // 未分類のみ
      matchesFolder = !tag.folderId
    } else if (selectedFolder) {
      // 特定のフォルダ
      matchesFolder = tag.folderId === selectedFolder
    }
    // selectedFolder === null の場合はすべてのタグ表示
    
    return matchesSearch && matchesType && matchesFolder
  })

  // 統計情報
  const stats = {
    totalTags: tags.length,
    manualTags: tags.filter(t => t.type === 'MANUAL').length,
    automaticTags: tags.filter(t => t.type === 'AUTOMATIC').length,
    behavioralTags: tags.filter(t => t.type === 'BEHAVIORAL').length,
    uncategorizedTags: tags.filter(t => !t.folderId).length,
    totalFolders: tagFolders.length
  }

  const getTagColor = (tagType: string) => {
    switch (tagType) {
      case 'MANUAL': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'AUTOMATIC': return 'bg-green-100 text-green-800 border-green-200'
      case 'BEHAVIORAL': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // タグ名に応じた色を取得する関数を追加
  const getTagColorByName = (tagName: string) => {
    const colorMap: {[key: string]: string} = {
      'JavaScript': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'React': 'bg-blue-100 text-blue-800 border-blue-200',
      'Vue.js': 'bg-green-100 text-green-800 border-green-200',
      'Swift': 'bg-red-100 text-red-800 border-red-200',
      'Kotlin': 'bg-purple-100 text-purple-800 border-purple-200',
      '写真': 'bg-teal-100 text-teal-800 border-teal-200',
      '旅行': 'bg-pink-100 text-pink-800 border-pink-200',
      'その他': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colorMap[tagName] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: TagFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(tagFolders)
  
  // フォルダ選択用のフラットリスト（階層表示付き）
  const getFolderDisplayName = (folder: TagFolder): string => {
    const parents: string[] = []
    let current = folder
    while (current.parentId) {
      const parent = tagFolders.find(f => f.id === current.parentId)
      if (parent) {
        parents.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return parents.length > 0 ? `${parents.join(' > ')} > ${folder.name}` : folder.name
  }

  // ドラッグ&ドロップ
  const handleDragStart = (tagId: string) => {
    setDraggedTag(tagId)
    setDraggedFolder(null)
  }

  const handleFolderDragStart = (folderId: string) => {
    setDraggedFolder(folderId)
    setDraggedTag(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetFolderId: string | null) => {
    if (draggedTag) {
      onMoveTag(draggedTag, targetFolderId)
      setDraggedTag(null)
    } else if (draggedFolder) {
      // フォルダを移動（循環参照チェック）
      if (!isDescendantFolder(draggedFolder, targetFolderId)) {
        onUpdateFolder(draggedFolder, { parentId: targetFolderId || undefined })
      }
      setDraggedFolder(null)
    }
  }

  // 循環参照チェック
  const isDescendantFolder = (ancestorId: string, descendantId: string | null): boolean => {
    if (!descendantId) return false
    if (ancestorId === descendantId) return true
    
    const descendant = tagFolders.find(f => f.id === descendantId)
    if (!descendant?.parentId) return false
    
    return isDescendantFolder(ancestorId, descendant.parentId || null)
  }

  // 右クリックメニューの処理
  const handleContextMenu = (e: React.MouseEvent, folderId: string | null) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId
    })
  }

  // コンテキストメニューを閉じる
  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // フォルダ内に新規タグ作成
  const handleCreateTagInFolder = (folderId: string | null) => {
    setNewTagInFolder(folderId)
    setShowCreateTag(true)
    closeContextMenu()
  }

  // フォルダ内に新規フォルダ作成
  const handleCreateFolderInFolder = (folderId: string | null) => {
    setNewFolderInFolder(folderId)
    setShowCreateFolder(true)
    closeContextMenu()
  }

  // モーダルを閉じるときのリセット
  const handleCloseCreateTag = () => {
    setShowCreateTag(false)
    setNewTagInFolder(null)
  }

  const handleCloseCreateFolder = () => {
    setShowCreateFolder(false)
    setNewFolderInFolder(null)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">タグ管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            タグをフォルダで整理して効率的に管理
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {/* 表示モード切り替え */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="グリッド表示"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="リスト表示"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左カラム: フォルダツリー */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">フォルダ</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {onReorderFolders && onMoveTag ? (
                <DraggableFolderTree
                  folders={tagFolders}
                  items={tags}
                  expandedFolders={expandedFolders}
                  selectedFolder={selectedFolder}
                  onToggleFolder={toggleFolder}
                  onSelectFolder={setSelectedFolder}
                  onReorderFolders={onReorderFolders}
                  onReorderItems={onReorderTags || (() => {})}
                  onMoveItem={onMoveTag}
                  onContextMenu={handleContextMenu}
                  showAllFolder={true}
                  showUncategorizedFolder={true}
                  allFolderLabel="すべてのタグ"
                  uncategorizedFolderLabel="未分類"
                />
              ) : (
                <FolderTreeView 
                  rootFolders={rootFolders}
                  expandedFolders={expandedFolders}
                  selectedFolder={selectedFolder}
                  onToggleFolder={toggleFolder}
                  onSelectFolder={setSelectedFolder}
                  onEditFolder={setEditingFolder}
                  onDeleteFolder={onDeleteFolder}
                  onContextMenu={handleContextMenu}
                  onCreateFolderInFolder={handleCreateFolderInFolder}
                  onCreateTagInFolder={handleCreateTagInFolder}
                  tags={tags}
                  showEmptyFolders={showEmptyFolders}
                />
              )}
            </div>
          </div>
        </div>

        {/* 右カラム: タグ表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのタグ' 
                    : selectedFolder === 'null'
                    ? '未分類のタグ'
                    : tagFolders.find(f => f.id === selectedFolder)?.name || 'タグ'}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* アクションメニュー */}
                  <ActionMenu
                    items={createCommonMenuItems({
                      onCreateNew: () => handleCreateTagInFolder(selectedFolder),
                      onCreateFolder: () => handleCreateFolderInFolder(selectedFolder),
                      entityName: 'タグ',
                      selectedFolder: selectedFolder && selectedFolder !== 'null' ? tagFolders.find(f => f.id === selectedFolder) : null,
                      onEditFolder: selectedFolder && selectedFolder !== 'null' ? () => {
                        const folder = tagFolders.find(f => f.id === selectedFolder)
                        if (folder) setEditingFolder(folder)
                      } : undefined,
                      onDeleteFolder: selectedFolder && selectedFolder !== 'null' ? () => {
                        const folder = tagFolders.find(f => f.id === selectedFolder)
                        if (folder && confirm(`フォルダ「${folder.name}」を削除しますか？`)) {
                          onDeleteFolder(selectedFolder)
                        }
                      } : undefined
                    })}
                  />
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="タグを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                  {/* タイプフィルター */}
                  <select
                    value={selectedTagType}
                    onChange={(e) => setSelectedTagType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="ALL">すべて</option>
                    <option value="MANUAL">手動</option>
                    <option value="AUTOMATIC">自動</option>
                    <option value="BEHAVIORAL">行動</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === 'grid' ? (
                <TagGridView 
                  tags={filteredTags}
                  onEditTag={setEditingTag}
                  getTagColor={getTagColorByName}
                />
              ) : (
                <TagListView 
                  tags={filteredTags}
                  tagFolders={tagFolders}
                  selectedFolder={selectedFolder}
                  onEditTag={setEditingTag}
                  onDeleteTag={onDeleteTag}
                  getTagColor={getTagColorByName}
                  onReorderTags={onReorderTags}
                  onMoveTag={onMoveTag}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={closeContextMenu} />
          <div 
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => handleCreateTagInFolder(contextMenu.folderId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規タグ作成
            </button>
            <button
              onClick={() => handleCreateFolderInFolder(contextMenu.folderId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Folder className="w-4 h-4 mr-2" />
              新規フォルダ作成
            </button>
          </div>
        </>
      )}

      {/* 新規タグ作成モーダル */}
      {showCreateTag && (
        <CreateTagModal 
          onClose={handleCloseCreateTag} 
          onSubmit={onCreateTag} 
          folders={tagFolders}
          defaultFolderId={newTagInFolder}
        />
      )}
      
      {/* 新規フォルダ作成モーダル */}
      {showCreateFolder && (
        <CreateFolderModal 
          onClose={handleCloseCreateFolder} 
          onSubmit={onCreateFolder} 
          folders={tagFolders}
          defaultParentId={newFolderInFolder}
        />
      )}
      
      {/* タグ編集モーダル */}
      {editingTag && <EditTagModal tag={editingTag} onClose={() => setEditingTag(null)} onSubmit={onUpdateTag} onDelete={onDeleteTag} folders={tagFolders} />}
      
      {/* フォルダ編集モーダル */}
      {editingFolder && <EditFolderModal folder={editingFolder} onClose={() => setEditingFolder(null)} onSubmit={onUpdateFolder} folders={tagFolders} />}
    </div>
  )
}

// 左カラム: フォルダツリー表示コンポーネント
function FolderTreeView({ 
  rootFolders, 
  expandedFolders, 
  selectedFolder,
  onToggleFolder, 
  onSelectFolder,
  onEditFolder, 
  onDeleteFolder,
  onContextMenu,
  onCreateFolderInFolder,
  onCreateTagInFolder,
  tags,
  showEmptyFolders
}: {
  rootFolders: any[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: TagFolder) => void
  onDeleteFolder: (folderId: string) => void
  onContextMenu: (e: React.MouseEvent, folderId: string | null) => void
  onCreateFolderInFolder: (folderId: string | null) => void
  onCreateTagInFolder: (folderId: string | null) => void
  tags: Tag[]
  showEmptyFolders: boolean
}) {
  const getTagCount = (folderId: string): number => {
    return tags.filter(tag => tag.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const tagCount = getTagCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    if (!showEmptyFolders && tagCount === 0 && !hasChildren) {
      return null
    }

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => onContextMenu(e, folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || tagCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || tagCount > 0 ? (
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
          <span className="text-xs text-gray-500">{tagCount}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child: any) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* すべてのタグ */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
        onContextMenu={(e) => onContextMenu(e, null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのタグ</span>
        </div>
        <span className="text-xs text-gray-500">{tags.length}</span>
      </div>

      {/* 未分類タグ */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder('null')}
        onContextMenu={(e) => onContextMenu(e, 'null')}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">未分類</span>
        </div>
        <span className="text-xs text-gray-500">{tags.filter(tag => !tag.folderId).length}</span>
      </div>

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}

// 右カラム: タググリッド表示コンポーネント
function TagGridView({ 
  tags, 
  onEditTag, 
  getTagColor 
}: {
  tags: Tag[]
  onEditTag: (tag: Tag) => void
  getTagColor: (tagName: string) => string
}) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">タグがありません</div>
        <div className="text-sm">新しいタグを作成してください</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className={`group relative p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getTagColor(tag.name)}`}
          onClick={() => onEditTag(tag)}
        >
          <div className="text-sm font-medium truncate">{tag.name}</div>
          <div className="text-xs opacity-75 mt-1">
            {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
          </div>
          <Edit2 className="w-3 h-3 absolute top-2 right-2 opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
      ))}
    </div>
  )
}

// リスト表示コンポーネント
function TagListView({ 
  tags, 
  tagFolders,
  selectedFolder,
  onEditTag, 
  onDeleteTag,
  getTagColor,
  onReorderTags,
  onMoveTag
}: {
  tags: Tag[]
  tagFolders: TagFolder[]
  selectedFolder: string | null
  onEditTag: (tag: Tag) => void
  onDeleteTag: (tagId: string) => void
  getTagColor: (tagName: string) => string
  onReorderTags?: (tags: Tag[]) => void
  onMoveTag?: (tagId: string, targetFolderId: string | null) => void
}) {
  const handleDelete = (tag: Tag) => {
    if (confirm(`タグ「${tag.name}」を削除しますか？`)) {
      onDeleteTag(tag.id)
    }
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">タグがありません</div>
        <div className="text-sm">新しいタグを作成してください</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onReorderTags && <th className="w-10 px-2"></th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タグ名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                備考
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          {onReorderTags && onMoveTag ? (
            <DraggableTableBody
              items={tags}
              currentFolderId={selectedFolder}
              onReorderItems={onReorderTags}
              onMoveItem={onMoveTag}
              showDragHandle={true}
              renderRow={(tag, index, isDragging) => (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name)}`}>
                        {tag.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                      tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={tag.note}>
                      {tag.note || '備考なし'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tag.createdAt.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditTag(tag)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            />
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.name)}`}>
                        {tag.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                      tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={tag.note}>
                      {tag.note || '備考なし'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tag.createdAt.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditTag(tag)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  )
}


// 新規タグ作成モーダル
function CreateTagModal({ onClose, onSubmit, folders, defaultFolderId }: { 
  onClose: () => void, 
  onSubmit: (tag: Omit<Tag, 'id' | 'createdAt'>) => void, 
  folders: TagFolder[],
  defaultFolderId?: string | null
}) {
  const getFolderDisplayName = (folder: TagFolder): string => {
    const parents: string[] = []
    let current = folder
    while (current.parentId) {
      const parent = folders.find(f => f.id === current.parentId)
      if (parent) {
        parents.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return parents.length > 0 ? `${parents.join(' > ')} > ${folder.name}` : folder.name
  }
  const [name, setName] = useState('')
  const [type, setType] = useState<'MANUAL' | 'AUTOMATIC' | 'BEHAVIORAL'>('MANUAL')
  const [folderId, setFolderId] = useState<string>(
    defaultFolderId && defaultFolderId !== 'null' ? defaultFolderId : ''
  )
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit({
      name: name.trim(),
      type,
      folderId: folderId || undefined,
      note: note.trim() || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新規タグ作成</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タグ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="タグ名を入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MANUAL">手動</option>
                <option value="AUTOMATIC">自動</option>
                <option value="BEHAVIORAL">行動</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">未分類</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{getFolderDisplayName(folder)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考（任意）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="タグの詳細説明や用途など"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// 新規フォルダ作成モーダル
function CreateFolderModal({ onClose, onSubmit, folders, defaultParentId }: { 
  onClose: () => void, 
  onSubmit: (folder: Omit<TagFolder, 'id' | 'createdAt' | 'updatedAt'>) => void, 
  folders?: TagFolder[],
  defaultParentId?: string | null
}) {
  const getFolderDisplayName = (folder: TagFolder): string => {
    const parents: string[] = []
    let current = folder
    while (current.parentId) {
      const parent = folders?.find(f => f.id === current.parentId)
      if (parent) {
        parents.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return parents.length > 0 ? `${parents.join(' > ')} > ${folder.name}` : folder.name
  }
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState<string>(
    defaultParentId && defaultParentId !== 'null' ? defaultParentId : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新規フォルダ作成</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="フォルダ名を入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">親フォルダ（任意）</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                {(() => {
                  if (!parentId) return 'ルートフォルダ'
                  const parentFolder = folders?.find(f => f.id === parentId)
                  return parentFolder ? getFolderDisplayName(parentFolder) : 'ルートフォルダ'
                })()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="フォルダの説明を入力"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// タグ編集モーダル
function EditTagModal({ tag, onClose, onSubmit, onDelete, folders }: { 
  tag: Tag, 
  onClose: () => void, 
  onSubmit: (tagId: string, updates: Partial<Tag>) => void,
  onDelete: (tagId: string) => void,
  folders: TagFolder[]
}) {
  const getFolderDisplayName = (folder: TagFolder): string => {
    const parents: string[] = []
    let current = folder
    while (current.parentId) {
      const parent = folders.find(f => f.id === current.parentId)
      if (parent) {
        parents.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return parents.length > 0 ? `${parents.join(' > ')} > ${folder.name}` : folder.name
  }
  
  const [name, setName] = useState(tag.name)
  const [type, setType] = useState(tag.type)
  const [folderId, setFolderId] = useState(tag.folderId || '')
  const [note, setNote] = useState(tag.note || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit(tag.id, {
      name: name.trim(),
      type,
      folderId: folderId || undefined,
      note: note.trim() || undefined
    })
    onClose()
  }

  const handleDelete = () => {
    if (confirm('このタグを削除しますか？')) {
      onDelete(tag.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">タグ編集</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タグ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MANUAL">手動</option>
                <option value="AUTOMATIC">自動</option>
                <option value="BEHAVIORAL">行動</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">未分類</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考（任意）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="タグの詳細説明や用途など"
                rows={3}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  更新
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// フォルダ編集モーダル
function EditFolderModal({ folder, onClose, onSubmit, folders }: { 
  folder: TagFolder, 
  onClose: () => void, 
  onSubmit: (folderId: string, updates: Partial<TagFolder>) => void,
  folders?: TagFolder[]
}) {
  const getFolderDisplayName = (f: TagFolder): string => {
    const parents: string[] = []
    let current = f
    while (current.parentId) {
      const parent = folders?.find(folder => folder.id === current.parentId)
      if (parent) {
        parents.unshift(parent.name)
        current = parent
      } else {
        break
      }
    }
    return parents.length > 0 ? `${parents.join(' > ')} > ${f.name}` : f.name
  }
  
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description || '')
  const [parentId, setParentId] = useState(folder.parentId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit(folder.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">フォルダ編集</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">親フォルダ（任意）</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">ルートフォルダ</option>
                {folders?.filter(f => f.id !== folder.id).map((f) => (
                  <option key={f.id} value={f.id}>{getFolderDisplayName(f)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                更新
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}