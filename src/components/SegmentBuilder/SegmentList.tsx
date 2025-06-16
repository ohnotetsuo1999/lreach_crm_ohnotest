'use client'

import { useState } from 'react'
import { Segment, Tag, Status, User, SegmentFolder } from '@/types'
import { Target, Edit2, Copy, Trash2 } from 'lucide-react'
import { createCommonMenuItems } from '@/components/Common/ActionMenu'
import { ManagementLayout } from '@/components/Common/ManagementLayout'
import { FolderTreeView } from '@/components/Common/FolderTreeView'
import { DraggableFolderTree } from '@/components/Common/DraggableFolderTree'
import { DataTable, TableColumn } from '@/components/Common/DataTable'

interface SegmentListProps {
  segments: Segment[]
  segmentFolders: SegmentFolder[]
  tags: Tag[]
  statuses: Status[]
  users?: User[]
  onCreateSegment: () => void
  onEditSegment: (segment: Segment) => void
  onDuplicateSegment: (segment: Segment) => void
  onDeleteSegment: (segmentId: string) => void
  onCreateFolder: (folder: Omit<SegmentFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<SegmentFolder>) => void
  onDeleteFolder: (folderId: string) => void
  onReorderSegments?: (segments: Segment[]) => void
  onReorderFolders?: (folders: SegmentFolder[]) => void
  onMoveSegment?: (segmentId: string, targetFolderId: string | null) => void
}

export function SegmentList({
  segments,
  segmentFolders,
  tags,
  statuses,
  users = [],
  onCreateSegment,
  onEditSegment,
  onDuplicateSegment,
  onDeleteSegment,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onReorderSegments,
  onReorderFolders,
  onMoveSegment
}: SegmentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<SegmentFolder | null>(null)

  // 該当ユーザー数を計算（簡略版）
  const calculateMatchingUsers = (segment: Segment): number => {
    try {
      const parsedFilter = JSON.parse(segment.filterJson)
      const conditions = parsedFilter.conditions || []
      
      if (conditions.length === 0) return 0
      
      // 簡単な条件マッチングの実装（実際のプロダクションではより複雑な処理が必要）
      const matchingUsers = users.filter(user => {
        return conditions.some((condition: any) => {
          if (condition.field === 'tags' && condition.operator === 'in') {
            return user.tags.some(tag => 
              Array.isArray(condition.value) 
                ? condition.value.includes(tag.id)
                : condition.value === tag.id
            )
          }
          if (condition.field === 'createdAt' && condition.operator === 'greater_than') {
            const conditionDate = new Date(condition.value)
            return user.createdAt > conditionDate
          }
          // 他の条件も必要に応じて追加
          return false
        })
      })
      
      return matchingUsers.length
    } catch {
      return 0
    }
  }

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: SegmentFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(segmentFolders)

  // Filter segments based on search and folder
  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (segment.memo && segment.memo.toLowerCase().includes(searchQuery.toLowerCase()))
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !segment.folderId
    } else if (selectedFolder) {
      matchesFolder = segment.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const handleDelete = (segmentId: string, segmentName: string) => {
    if (confirm(`セグメント「${segmentName}」を削除しますか？`)) {
      onDeleteSegment(segmentId)
    }
  }

  // テーブル列の定義
  const columns: TableColumn[] = [
    { key: 'name', label: 'セグメント名', minWidth: 'min-w-[250px]' },
    { key: 'memo', label: 'メモ', minWidth: 'min-w-[200px]' },
    { key: 'createdAt', label: '作成日', minWidth: 'min-w-[120px]' },
    { key: 'actions', label: 'アクション', minWidth: 'min-w-[120px]' }
  ]

  // テーブル行のレンダリング
  const renderSegmentRow = (segment: Segment, index: number, isDragging?: boolean) => (
    <>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-gray-900">
          <div className="truncate max-w-[200px]" title={segment.name}>
            {segment.name}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          <div className="truncate max-w-[200px]" title={`ID: ${segment.id}`}>
            ID: {segment.id}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        <div className="max-w-[180px] truncate" title={segment.memo}>
          {segment.memo || (
            <span className="text-gray-400 italic">メモなし</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
        {segment.createdAt.toLocaleDateString('ja-JP')}
      </td>
      <td className="px-4 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditSegment(segment)}
            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDuplicateSegment(segment)}
            className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
            title="複製"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(segment.id, segment.name)}
            className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </>
  )

  // 空の状態
  const emptyState = (
    <div className="text-center py-12 text-gray-500">
      <div className="text-gray-400 mb-4">
        <Target className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery ? 'セグメントが見つかりません' : 'セグメントがまだありません'}
      </h3>
      <p className="text-gray-600">
        {searchQuery 
          ? '検索条件に一致するセグメントがありません。'
          : '新しいセグメントを作成して、ユーザーを効果的にグループ化しましょう。'
        }
      </p>
    </div>
  )

  return (
    <ManagementLayout
      title="セグメント"
      description="ユーザーをグループ化してターゲティング配信を効率化"
      headerActions={createCommonMenuItems({
        onCreateNew: onCreateSegment,
        onCreateFolder: () => setShowCreateFolder(true),
        entityName: 'セグメント',
        selectedFolder: selectedFolder && selectedFolder !== 'null' ? segmentFolders.find(f => f.id === selectedFolder) : null,
        onEditFolder: selectedFolder && selectedFolder !== 'null' ? () => {
          const folder = segmentFolders.find(f => f.id === selectedFolder)
          if (folder) setEditingFolder(folder)
        } : undefined,
        onDeleteFolder: selectedFolder && selectedFolder !== 'null' ? () => {
          const folder = segmentFolders.find(f => f.id === selectedFolder)
          if (folder && confirm(`フォルダ「${folder.name}」を削除しますか？フォルダ内のセグメントは未分類になります。`)) {
            onDeleteFolder(selectedFolder)
          }
        } : undefined
      })}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="セグメントを検索"
      folderTree={
        onReorderFolders && onMoveSegment ? (
          <DraggableFolderTree
            folders={segmentFolders}
            items={segments}
            expandedFolders={expandedFolders}
            selectedFolder={selectedFolder}
            onToggleFolder={toggleFolder}
            onSelectFolder={setSelectedFolder}
            onReorderFolders={onReorderFolders}
            onReorderItems={onReorderSegments || (() => {})}
            onMoveItem={onMoveSegment}
            showAllFolder={true}
            showUncategorizedFolder={true}
            allFolderLabel="すべてのセグメント"
            uncategorizedFolderLabel="未分類"
          />
        ) : (
          <FolderTreeView
            folders={segmentFolders}
            items={segments}
            expandedFolders={expandedFolders}
            selectedFolder={selectedFolder}
            onToggleFolder={toggleFolder}
            onSelectFolder={setSelectedFolder}
            showAllFolder={true}
            showUncategorizedFolder={true}
            allFolderLabel="すべてのセグメント"
            uncategorizedFolderLabel="未分類"
          />
        )
      }
      content={
        <DataTable
          columns={columns}
          data={filteredSegments}
          renderRow={renderSegmentRow}
          emptyState={emptyState}
          onReorderItems={onReorderSegments}
          onMoveItem={onMoveSegment}
          currentFolderId={selectedFolder}
          showDragHandle={true}
        />
      }
      modals={
        <>
          {/* フォルダ作成モーダル */}
          {showCreateFolder && (
            <CreateFolderModal 
              onClose={() => setShowCreateFolder(false)} 
              onSubmit={(folder) => {
                onCreateFolder(folder)
                setShowCreateFolder(false)
              }} 
            />
          )}
          
          {/* フォルダ編集モーダル */}
          {editingFolder && (
            <EditFolderModal 
              folder={editingFolder} 
              onClose={() => setEditingFolder(null)} 
              onSubmit={(folderId, updates) => {
                onUpdateFolder(folderId, updates)
                setEditingFolder(null)
              }}
            />
          )}
        </>
      }
    />
  )
}

// フォルダ作成モーダル
function CreateFolderModal({ onClose, onSubmit }: { 
  onClose: () => void, 
  onSubmit: (folder: Omit<SegmentFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined
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

// フォルダ編集モーダル
function EditFolderModal({ folder, onClose, onSubmit }: { 
  folder: SegmentFolder, 
  onClose: () => void, 
  onSubmit: (folderId: string, updates: Partial<SegmentFolder>) => void
}) {
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit(folder.id, {
      name: name.trim(),
      description: description.trim() || undefined
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
