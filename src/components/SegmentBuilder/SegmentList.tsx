'use client'

import { useState } from 'react'
import { Segment, Tag, Status, User, SegmentFolder } from '@/types'
import { 
  Plus, 
  Target, 
  Users, 
  Edit2, 
  Copy, 
  Trash2,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

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
  onDeleteFolder
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">セグメント</h2>
          <p className="mt-1 text-sm text-gray-600">
            ユーザーをグループ化してターゲティング配信を効率化
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Folder className="w-4 h-4 mr-2 text-green-600" />
            新しいフォルダ
          </button>
          <button
            onClick={onCreateSegment}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            セグメントを作成
          </button>
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
              <FolderTreeView 
                rootFolders={rootFolders}
                expandedFolders={expandedFolders}
                selectedFolder={selectedFolder}
                onToggleFolder={toggleFolder}
                onSelectFolder={setSelectedFolder}
                onEditFolder={setEditingFolder}
                onDeleteFolder={onDeleteFolder}
                segments={segments}
              />
            </div>
          </div>
        </div>

        {/* 右カラム: セグメント表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのセグメント' 
                    : selectedFolder === 'null'
                    ? '未分類のセグメント'
                    : segmentFolders.find(f => f.id === selectedFolder)?.name || 'セグメント'}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* フォルダ内アクションボタン */}
                  {selectedFolder && selectedFolder !== 'null' && (
                    <>
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        フォルダ追加
                      </button>
                      <button
                        onClick={onCreateSegment}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        セグメント追加
                      </button>
                    </>
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="セグメントを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SegmentContentView 
                selectedFolder={selectedFolder}
                segmentFolders={segmentFolders}
                segments={filteredSegments}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onEditSegment={onEditSegment}
                onDuplicateSegment={onDuplicateSegment}
                onDeleteSegment={handleDelete}
                users={users}
                tags={tags}
                statuses={statuses}
                calculateMatchingUsers={calculateMatchingUsers}
              />
            </div>
          </div>
        </div>
      </div>

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

    </div>
  )
}

// フォルダツリー表示コンポーネント
function FolderTreeView({ 
  rootFolders, 
  expandedFolders, 
  selectedFolder,
  onToggleFolder, 
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  segments
}: {
  rootFolders: any[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: SegmentFolder) => void
  onDeleteFolder: (folderId: string) => void
  segments: Segment[]
}) {
  const getSegmentCount = (folderId: string): number => {
    return segments.filter(segment => segment.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const segmentCount = getSegmentCount(folder.id)
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
                if (hasChildren || segmentCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || segmentCount > 0 ? (
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
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{segmentCount}</span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditFolder(folder)
                }}
                className="p-1 hover:bg-gray-200 rounded transition-all"
                title="フォルダ編集"
              >
                <Edit2 className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`フォルダ「${folder.name}」を削除しますか？フォルダ内のセグメントは未分類になります。`)) {
                    onDeleteFolder(folder.id)
                  }
                }}
                className="p-1 hover:bg-red-200 rounded transition-all"
                title="フォルダ削除"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>
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
      {/* すべてのセグメント */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのセグメント</span>
        </div>
        <span className="text-xs text-gray-500">{segments.length}</span>
      </div>

      {/* 未分類セグメント */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder('null')}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">未分類</span>
        </div>
        <span className="text-xs text-gray-500">{segments.filter(segment => !segment.folderId).length}</span>
      </div>

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}

// セグメントコンテンツ表示コンポーネント
function SegmentContentView({
  selectedFolder,
  segmentFolders,
  segments,
  searchQuery,
  setSearchQuery,
  onEditSegment,
  onDuplicateSegment,
  onDeleteSegment,
  users,
  tags,
  statuses,
  calculateMatchingUsers
}: {
  selectedFolder: string | null
  segmentFolders: SegmentFolder[]
  segments: Segment[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  onEditSegment: (segment: Segment) => void
  onDuplicateSegment: (segment: Segment) => void
  onDeleteSegment: (segmentId: string, segmentName: string) => void
  users: User[]
  tags: Tag[]
  statuses: Status[]
  calculateMatchingUsers: (segment: Segment) => number
}) {
  const getFolderName = () => {
    if (selectedFolder === null) return 'すべてのセグメント'
    if (selectedFolder === 'null') return '未分類のセグメント'
    const folder = segmentFolders.find(f => f.id === selectedFolder)
    return folder?.name || 'セグメント'
  }

  if (segments.length === 0) {
    return (
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
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[250px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                セグメント名
              </th>
              <th className="min-w-[200px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メモ
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {segments.map((segment) => {
              return (
                <tr key={segment.id} className="hover:bg-gray-50">
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
                        onClick={() => onDeleteSegment(segment.id, segment.name)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
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
