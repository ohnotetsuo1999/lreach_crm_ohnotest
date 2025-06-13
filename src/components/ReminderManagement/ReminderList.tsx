'use client'

import { useState } from 'react'
import { ReservationReminder, User, ReminderFolder } from '@/types'
import { 
  Plus, Search, Calendar, Bell, Users, Clock, 
  MoreHorizontal, Edit, Copy, Trash2, Play, Pause,
  BarChart3, Eye, Filter, ChevronDown, CheckCircle, XCircle,
  Folder, FolderOpen, ChevronRight, Settings
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'reservation' | 'user_field' | 'custom_date'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedReminders, setSelectedReminders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<ReminderFolder | null>(null)
  const [folderFormData, setFolderFormData] = useState({ name: '', description: '', parentId: '' })

  const filteredReminders = reminders.filter(reminder => {
    // Folder filter
    if (selectedFolderId !== null) {
      if (selectedFolderId === 'uncategorized' && reminder.folderId) return false
      if (selectedFolderId !== 'uncategorized' && reminder.folderId !== selectedFolderId) return false
    }

    // Search filter
    if (searchQuery && !reminder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !reminder.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Status filter
    if (statusFilter === 'active' && !reminder.isActive) return false
    if (statusFilter === 'inactive' && reminder.isActive) return false

    // Type filter
    if (typeFilter !== 'all' && reminder.reminderType !== typeFilter) return false

    return true
  })

  const stats = {
    total: reminders.length,
    active: reminders.filter(r => r.isActive).length,
    inactive: reminders.filter(r => !r.isActive).length,
    totalTemplates: reminders.reduce((sum, r) => sum + r.templates.length, 0)
  }

  const handleSelectReminder = (reminderId: string, selected: boolean) => {
    const newSelection = new Set(selectedReminders)
    if (selected) {
      newSelection.add(reminderId)
    } else {
      newSelection.delete(reminderId)
    }
    setSelectedReminders(newSelection)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedReminders(new Set(filteredReminders.map(r => r.id)))
    } else {
      setSelectedReminders(new Set())
    }
  }

  const handleBulkToggleActive = (isActive: boolean) => {
    selectedReminders.forEach(reminderId => {
      onToggleActive(reminderId, isActive)
    })
    setSelectedReminders(new Set())
  }

  const handleBulkDelete = () => {
    if (confirm(`選択した${selectedReminders.size}件のリマインダーを削除しますか？`)) {
      selectedReminders.forEach(reminderId => {
        onDeleteReminder(reminderId)
      })
      setSelectedReminders(new Set())
    }
  }

  // Folder management functions
  const buildFolderHierarchy = (folders: ReminderFolder[], parentId: string | null = null): any[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
      }))
  }

  const getRemindersInFolder = (folderId: string | null): ReservationReminder[] => {
    return reminders.filter(reminder => reminder.folderId === folderId)
  }

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setFolderFormData({ name: '', description: '', parentId: selectedFolderId || '' })
    setShowFolderModal(true)
  }

  const handleEditFolder = (folder: ReminderFolder) => {
    setEditingFolder(folder)
    setFolderFormData({
      name: folder.name,
      description: folder.description || '',
      parentId: folder.parentId || ''
    })
    setShowFolderModal(true)
  }

  const handleSaveFolder = () => {
    if (!folderFormData.name.trim()) return

    if (editingFolder) {
      onUpdateFolder(editingFolder.id, {
        name: folderFormData.name,
        description: folderFormData.description || undefined,
        parentId: folderFormData.parentId || undefined
      })
    } else {
      onCreateFolder({
        name: folderFormData.name,
        description: folderFormData.description || undefined,
        parentId: folderFormData.parentId || undefined
      })
    }
    setShowFolderModal(false)
    setEditingFolder(null)
  }

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'reservation': return '予約日時基準'
      case 'user_field': return 'ユーザー日付基準'
      case 'custom_date': return 'カスタム日付基準'
      default: return type
    }
  }

  const formatTemplateTimingDisplay = (reminder: ReservationReminder) => {
    if (reminder.templates.length === 0) return '未設定'
    
    const timings = reminder.templates.map(template => {
      const config = template.timingConfig
      return `${config.delayValue}${config.delayUnit === 'hours' ? '時間' : config.delayUnit === 'days' ? '日' : '分'}${config.delayDirection === 'after' ? '後' : '前'}`
    })
    
    return timings.join(', ')
  }

  // Folder rendering function
  const renderFolder = (folder: any, level: number = 0) => (
    <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
      <div
        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded group ${
          selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : ''
        }`}
        onClick={() => {
          setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)
          toggleFolderExpansion(folder.id)
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
          <span className="text-sm font-medium">{folder.name}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">
            {getRemindersInFolder(folder.id).length}
          </span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEditFolder(folder)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-3 h-3" />
            </button>
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
          </div>
        </div>
      </div>
      {expandedFolders.has(folder.id) && folder.children.map((child: any) => renderFolder(child, level + 1))}
    </div>
  )

  const folderHierarchy = buildFolderHierarchy(reminderFolders)
  const uncategorizedReminders = getRemindersInFolder(null)

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Folders */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">リマインダー</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateFolder}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="フォルダを作成"
              >
                <Folder className="w-4 h-4" />
              </button>
              <button
                onClick={onCreateReminder}
                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                title="リマインダーを作成"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">{stats.total}</div>
              <div className="text-blue-600">総数</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-700">{stats.active}</div>
              <div className="text-green-600">アクティブ</div>
            </div>
          </div>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <div
              className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
                selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <Folder className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">すべて</span>
              <span className="ml-auto text-xs text-gray-500">{reminders.length}</span>
            </div>
            
            {folderHierarchy.map(folder => renderFolder(folder))}
            
            {uncategorizedReminders.length > 0 && (
              <div
                className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
                  selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setSelectedFolderId('uncategorized')}
              >
                <Folder className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">未分類</span>
                <span className="ml-auto text-xs text-gray-500">{uncategorizedReminders.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Content - Reminder List */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedFolderId === null ? 'すべてのリマインダー' :
                 selectedFolderId === 'uncategorized' ? '未分類のリマインダー' :
                 reminderFolders.find(f => f.id === selectedFolderId)?.name || 'フォルダ'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredReminders.length}件のリマインダー
              </p>
            </div>
            <button
              onClick={onCreateReminder}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="リマインダーを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              フィルター
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
            </button>

            {selectedReminders.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedReminders.size}件選択中</span>
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  アクティブ化
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                >
                  非アクティブ化
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                >
                  削除
                </button>
              </div>
            )}
          </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">アクティブ</option>
                <option value="inactive">非アクティブ</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">リマインダータイプ</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="reservation">予約日時基準</option>
                <option value="user_field">ユーザー日付基準</option>
                <option value="custom_date">カスタム日付基準</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                フィルターをクリア
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Reminder List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredReminders.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedReminders.size === filteredReminders.length && filteredReminders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="col-span-3">リマインダー名</div>
                <div className="col-span-2">タイプ</div>
                <div className="col-span-2">設定時間</div>
                <div className="col-span-1">テンプレート数</div>
                <div className="col-span-1">ステータス</div>
                <div className="col-span-1">作成日</div>
                <div className="col-span-1">操作</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredReminders.map(reminder => (
                <div key={reminder.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedReminders.has(reminder.id)}
                        onChange={(e) => handleSelectReminder(reminder.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{reminder.name}</div>
                          {reminder.description && (
                            <div className="text-sm text-gray-500">{reminder.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getReminderTypeLabel(reminder.reminderType)}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{formatTemplateTimingDisplay(reminder)}</div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="text-sm text-gray-900">{reminder.templates.length}</div>
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => onToggleActive(reminder.id, !reminder.isActive)}
                        className="flex items-center"
                      >
                        {reminder.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            アクティブ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            停止中
                          </span>
                        )}
                      </button>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="text-sm text-gray-500">
                        {new Date(reminder.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditReminder(reminder)}
                          className="text-blue-600 hover:text-blue-800"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateReminder(reminder)}
                          className="text-gray-600 hover:text-gray-800"
                          title="複製"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewAnalytics(reminder.id)}
                          className="text-green-600 hover:text-green-800"
                          title="分析"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('このリマインダーを削除しますか？')) {
                              onDeleteReminder(reminder.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">リマインダーが見つかりません</h3>
            <p className="text-gray-500 mb-6">
              {reminders.length === 0 
                ? '最初のリマインダーを作成してください' 
                : '検索条件に一致するリマインダーがありません'}
            </p>
            {reminders.length === 0 && (
              <button
                onClick={onCreateReminder}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規リマインダー作成
              </button>
            )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFolder ? 'フォルダを編集' : '新規フォルダ作成'}
              </h3>
              <button
                onClick={() => setShowFolderModal(false)}
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
                  value={folderFormData.name}
                  onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="フォルダ名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={folderFormData.description}
                  onChange={(e) => setFolderFormData({ ...folderFormData, description: e.target.value })}
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
                  value={folderFormData.parentId}
                  onChange={(e) => setFolderFormData({ ...folderFormData, parentId: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">なし（ルートフォルダ）</option>
                  {reminderFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveFolder}
                disabled={!folderFormData.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFolder ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}