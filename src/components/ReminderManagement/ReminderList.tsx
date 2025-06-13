'use client'

import { useState } from 'react'
import { ReservationReminder, User, ReminderFolder } from '@/types'
import { 
  Plus, 
  Search, 
  Calendar, 
  Bell, 
  Users, 
  Clock, 
  Edit, 
  Copy, 
  Trash2, 
  Play, 
  Pause,
  BarChart3, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  CheckCircle, 
  XCircle,
  Folder,
  FolderOpen,
  Target,
  Edit2
} from 'lucide-react'

interface ReminderListProps {
  reminders: ReservationReminder[]
  reminderFolders: ReminderFolder[]
  users: User[]
  onCreateReminder: () => void
  onEditReminder: (reminder: ReservationReminder) => void
  onDuplicateReminder: (reminder: ReservationReminder) => void
  onDeleteReminder: (reminderId: string) => void
  onToggleActive: (reminderId: string, isActive: boolean) => void
  onViewAnalytics: (reminderId: string) => void
  onCreateFolder: (folder: Omit<ReminderFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<ReminderFolder>) => void
  onDeleteFolder: (folderId: string) => void
}

export function ReminderList({
  reminders,
  reminderFolders,
  users,
  onCreateReminder,
  onEditReminder,
  onDuplicateReminder,
  onDeleteReminder,
  onToggleActive,
  onViewAnalytics,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}: ReminderListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<ReminderFolder | null>(null)

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: ReminderFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(reminderFolders)

  // Filter reminders based on search and folder
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !reminder.folderId
    } else if (selectedFolder) {
      matchesFolder = reminder.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const handleDelete = (reminderId: string, reminderName: string) => {
    if (confirm(`リマインダー「${reminderName}」を削除しますか？`)) {
      onDeleteReminder(reminderId)
    }
  }

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'reservation': return '予約日時基準'
      case 'user_field': return 'ユーザー日付基準'
      case 'custom_date': return 'カスタム日付基準'
      default: return type
    }
  }


  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">リマインダー</h2>
          <p className="mt-1 text-sm text-gray-600">
            自動リマインダーを管理してタイムリーな顧客コミュニケーションを実現
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
            onClick={onCreateReminder}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            リマインダーを作成
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
              <ReminderFolderTreeView 
                rootFolders={rootFolders}
                expandedFolders={expandedFolders}
                selectedFolder={selectedFolder}
                onToggleFolder={toggleFolder}
                onSelectFolder={setSelectedFolder}
                onEditFolder={setEditingFolder}
                onDeleteFolder={onDeleteFolder}
                reminders={reminders}
              />
            </div>
          </div>
        </div>

        {/* 右カラム: リマインダー表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのリマインダー' 
                    : selectedFolder === 'null'
                    ? '未分類のリマインダー'
                    : reminderFolders.find(f => f.id === selectedFolder)?.name || 'リマインダー'}
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
                        onClick={onCreateReminder}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        リマインダー追加
                      </button>
                    </>
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="リマインダーを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ReminderContentView 
                reminders={filteredReminders}
                searchQuery={searchQuery}
                onEditReminder={onEditReminder}
                onDuplicateReminder={onDuplicateReminder}
                onDeleteReminder={handleDelete}
                onToggleActive={onToggleActive}
                onViewAnalytics={onViewAnalytics}
                getReminderTypeLabel={getReminderTypeLabel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* フォルダ作成モーダル */}
      {showCreateFolder && (
        <CreateReminderFolderModal 
          onClose={() => setShowCreateFolder(false)} 
          onSubmit={(folder) => {
            onCreateFolder(folder)
            setShowCreateFolder(false)
          }} 
        />
      )}
      
      {/* フォルダ編集モーダル */}
      {editingFolder && (
        <EditReminderFolderModal 
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

// リマインダーフォルダツリー表示コンポーネント
function ReminderFolderTreeView({ 
  rootFolders, 
  expandedFolders, 
  selectedFolder,
  onToggleFolder, 
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  reminders
}: {
  rootFolders: any[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: ReminderFolder) => void
  onDeleteFolder: (folderId: string) => void
  reminders: ReservationReminder[]
}) {
  const getReminderCount = (folderId: string): number => {
    return reminders.filter(reminder => reminder.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const reminderCount = getReminderCount(folder.id)
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
                if (hasChildren || reminderCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || reminderCount > 0 ? (
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
            <span className="text-xs text-gray-500">{reminderCount}</span>
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
                  if (confirm(`フォルダ「${folder.name}」を削除しますか？フォルダ内のリマインダーは未分類になります。`)) {
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
      {/* すべてのリマインダー */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのリマインダー</span>
        </div>
        <span className="text-xs text-gray-500">{reminders.length}</span>
      </div>

      {/* 未分類リマインダー */}
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
        <span className="text-xs text-gray-500">{reminders.filter(reminder => !reminder.folderId).length}</span>
      </div>

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}

// リマインダーコンテンツ表示コンポーネント
function ReminderContentView({
  reminders,
  searchQuery,
  onEditReminder,
  onDuplicateReminder,
  onDeleteReminder,
  onToggleActive,
  onViewAnalytics,
  getReminderTypeLabel
}: {
  reminders: ReservationReminder[]
  searchQuery: string
  onEditReminder: (reminder: ReservationReminder) => void
  onDuplicateReminder: (reminder: ReservationReminder) => void
  onDeleteReminder: (reminderId: string, reminderName: string) => void
  onToggleActive: (reminderId: string, isActive: boolean) => void
  onViewAnalytics: (reminderId: string) => void
  getReminderTypeLabel: (type: string) => string
}) {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-gray-400 mb-4">
          <Bell className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'リマインダーが見つかりません' : 'リマインダーがまだありません'}
        </h3>
        <p className="text-gray-600">
          {searchQuery 
            ? '検索条件に一致するリマインダーがありません。'
            : '新しいリマインダーを作成して、自動配信を設定しましょう。'
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
                リマインダー名
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reminders.map((reminder) => {
              return (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          <div className="truncate max-w-[200px]" title={reminder.name}>
                            {reminder.name}
                          </div>
                        </div>
                        {reminder.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="truncate max-w-[200px]" title={reminder.description}>
                              {reminder.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {getReminderTypeLabel(reminder.reminderType)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => onToggleActive(reminder.id, !reminder.isActive)}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        reminder.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {reminder.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          アクティブ
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          停止中
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(reminder.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewAnalytics(reminder.id)}
                        className="text-purple-600 hover:text-purple-900 inline-flex items-center p-1 rounded hover:bg-purple-100"
                        title="分析"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditReminder(reminder)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateReminder(reminder)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
                        title="複製"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteReminder(reminder.id, reminder.name)}
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

// リマインダーフォルダ作成モーダル
function CreateReminderFolderModal({ onClose, onSubmit }: { 
  onClose: () => void, 
  onSubmit: (folder: Omit<ReminderFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
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

// リマインダーフォルダ編集モーダル
function EditReminderFolderModal({ folder, onClose, onSubmit }: { 
  folder: ReminderFolder, 
  onClose: () => void, 
  onSubmit: (folderId: string, updates: Partial<ReminderFolder>) => void
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