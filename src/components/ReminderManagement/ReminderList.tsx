'use client'

import { useState } from 'react'
import { ReservationReminder, User, ReminderFolder } from '@/types'
import { 
  Plus, Search, Calendar, Bell, Users, Clock, 
  Edit, Copy, Trash2, Play, Pause,
  BarChart3, Filter, ChevronDown, CheckCircle, XCircle
} from 'lucide-react'
import { 
  SidebarLayout, 
  SidebarHeader, 
  ContentHeader, 
  ContentBody,
  FolderTree,
  FolderModal,
  Button,
  IconButton,
  Table,
  type FolderItem
} from '@/components/Common'
import { useFolder, useSelection, useAdvancedSearch, useConfirmDialog } from '@/hooks'

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
  const [showFilters, setShowFilters] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<ReminderFolder | null>(null)

  // Use custom hooks
  const folderHook = useFolder({
    folders: reminderFolders,
    items: reminders,
    getItemFolderId: (reminder) => reminder.folderId
  })

  const selectionHook = useSelection({
    items: reminders,
    getItemId: (reminder) => reminder.id as string | number
  })

  const searchHook = useAdvancedSearch({
    items: reminders,
    searchFields: ['name', 'description'],
    filters: {
      folderId: folderHook.selectedFolderId,
      isActive: undefined,
      reminderType: undefined
    }
  })

  const { confirmDelete, confirmBulkDelete } = useConfirmDialog()

  // Apply folder filter to search results
  const filteredReminders = searchHook.filteredItems.filter(reminder => {
    if (folderHook.selectedFolderId === null) return true
    if (folderHook.selectedFolderId === 'uncategorized') return !reminder.folderId
    return reminder.folderId === folderHook.selectedFolderId
  })

  const stats = {
    total: reminders.length,
    active: reminders.filter(r => r.isActive).length,
    inactive: reminders.filter(r => !r.isActive).length,
    totalTemplates: reminders.reduce((sum, r) => sum + r.templates.length, 0)
  }

  // Update selection hook to work with filtered items
  const filteredSelectionHook = useSelection({
    items: filteredReminders,
    getItemId: (reminder) => reminder.id as string | number
  })

  const handleBulkToggleActive = (isActive: boolean) => {
    filteredSelectionHook.selectedItems.forEach(reminderId => {
      onToggleActive(String(reminderId), isActive)
    })
    filteredSelectionHook.clearSelection()
  }

  const handleBulkDelete = () => {
    confirmBulkDelete(
      filteredSelectionHook.selectedCount,
      () => {
        filteredSelectionHook.selectedItems.forEach(reminderId => {
          onDeleteReminder(String(reminderId))
        })
        filteredSelectionHook.clearSelection()
      },
      { entityType: 'リマインダー' }
    )
  }

  // Transform folders for FolderTree component
  const folderItems = reminderFolders.map(folder => ({
    ...folder,
    itemCount: reminders.filter(r => r.folderId === folder.id).length
  }))

  const handleCreateFolder = () => {
    setEditingFolder(null)
    setShowFolderModal(true)
  }

  const handleEditFolder = (folder: FolderItem) => {
    setEditingFolder(folder as ReminderFolder)
    setShowFolderModal(true)
  }

  const handleSaveFolder = (folderData: Omit<ReminderFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingFolder) {
      onUpdateFolder(editingFolder.id, folderData)
    } else {
      onCreateFolder(folderData)
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

  // テーブルのカラム定義
  const columns = [
    {
      key: 'name',
      header: 'リマインダー名',
      render: (reminder: ReservationReminder) => (
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
      )
    },
    {
      key: 'reminderType',
      header: 'タイプ',
      render: (reminder: ReservationReminder) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getReminderTypeLabel(reminder.reminderType)}
        </span>
      )
    },
    {
      key: 'timing',
      header: '設定時間',
      render: (reminder: ReservationReminder) => (
        <div className="text-sm text-gray-900">{formatTemplateTimingDisplay(reminder)}</div>
      )
    },
    {
      key: 'templateCount',
      header: 'テンプレート数',
      render: (reminder: ReservationReminder) => (
        <div className="text-sm text-gray-900">{reminder.templates.length}</div>
      )
    },
    {
      key: 'status',
      header: 'ステータス',
      render: (reminder: ReservationReminder) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleActive(reminder.id, !reminder.isActive)
          }}
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
      )
    },
    {
      key: 'createdAt',
      header: '作成日',
      render: (reminder: ReservationReminder) => (
        <div className="text-sm text-gray-500">
          {new Date(reminder.createdAt).toLocaleDateString('ja-JP')}
        </div>
      )
    },
    {
      key: 'actions',
      header: '操作',
      render: (reminder: ReservationReminder) => (
        <div className="flex items-center space-x-2">
          <IconButton
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation()
              onEditReminder(reminder)
            }}
            tooltip="編集"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={Copy}
            onClick={(e) => {
              e.stopPropagation()
              onDuplicateReminder(reminder)
            }}
            tooltip="複製"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={BarChart3}
            onClick={(e) => {
              e.stopPropagation()
              onViewAnalytics(reminder.id)
            }}
            tooltip="分析"
            variant="ghost"
            size="sm"
          />
          <IconButton
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation()
              confirmDelete(
                reminder.name,
                () => onDeleteReminder(reminder.id),
                { entityType: 'リマインダー' }
              )
            }}
            tooltip="削除"
            variant="ghost"
            size="sm"
          />
        </div>
      )
    }
  ]

  return (
    <SidebarLayout
      sidebar={
        <>
          <SidebarHeader
            title="リマインダー"
            actions={
              <>
                <IconButton
                  icon={Plus}
                  onClick={handleCreateFolder}
                  tooltip="フォルダを作成"
                  variant="ghost"
                  size="sm"
                />
                <IconButton
                  icon={Plus}
                  onClick={onCreateReminder}
                  tooltip="リマインダーを作成"
                  variant="ghost"
                  size="sm"
                />
              </>
            }
            stats={[
              { label: '総数', value: stats.total, color: 'bg-blue-50' },
              { label: 'アクティブ', value: stats.active, color: 'bg-green-50' }
            ]}
          />
          <div className="flex-1 overflow-y-auto p-4">
            <FolderTree
              folders={folderItems}
              selectedFolderId={folderHook.selectedFolderId}
              expandedFolders={folderHook.expandedFolders}
              onSelectFolder={folderHook.setSelectedFolderId}
              onToggleExpand={folderHook.toggleExpand}
              onCreateFolder={handleCreateFolder}
              onEditFolder={handleEditFolder}
              onDeleteFolder={onDeleteFolder}
              uncategorizedCount={folderHook.uncategorizedCount}
            />
          </div>
        </>
      }
    >
      <ContentHeader
        title={
          folderHook.selectedFolderId === null ? 'すべてのリマインダー' :
          folderHook.selectedFolderId === 'uncategorized' ? '未分類のリマインダー' :
          reminderFolders.find(f => f.id === folderHook.selectedFolderId)?.name || 'フォルダ'
        }
        subtitle={`${filteredReminders.length}件のリマインダー`}
        actions={
          <Button icon={Plus} onClick={onCreateReminder}>
            新規作成
          </Button>
        }
      />

      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="リマインダーを検索..."
              value={searchHook.searchQuery}
              onChange={(e) => searchHook.setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <Button
            variant="outline"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            フィルター
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
          </Button>

          {filteredSelectionHook.selectedCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{filteredSelectionHook.selectedCount}件選択中</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkToggleActive(true)}>
                アクティブ化
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkToggleActive(false)}>
                非アクティブ化
              </Button>
              <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                削除
              </Button>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={searchHook.activeFilters.isActive || 'all'}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'all') {
                    searchHook.removeFilter('isActive')
                  } else {
                    searchHook.updateFilter('isActive', value === 'active')
                  }
                }}
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
                value={searchHook.activeFilters.reminderType || 'all'}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === 'all') {
                    searchHook.removeFilter('reminderType')
                  } else {
                    searchHook.updateFilter('reminderType', value)
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="reservation">予約日時基準</option>
                <option value="user_field">ユーザー日付基準</option>
                <option value="custom_date">カスタム日付基準</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={searchHook.clearAllFilters}
              >
                フィルターをクリア
              </Button>
            </div>
          </div>
        )}
      </div>

      <ContentBody>
        <Table
          data={filteredReminders}
          columns={columns}
          selectedItems={filteredSelectionHook.selectedItems}
          onSelectItem={filteredSelectionHook.handleSelectItem}
          onSelectAll={filteredSelectionHook.handleSelectAll}
          getItemId={(reminder) => reminder.id}
          emptyMessage={
            reminders.length === 0 
              ? '最初のリマインダーを作成してください' 
              : '検索条件に一致するリマインダーがありません'
          }
        />
      </ContentBody>

      <FolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSave={handleSaveFolder}
        folders={reminderFolders}
        editingFolder={editingFolder}
        title={editingFolder ? 'フォルダを編集' : '新規フォルダ作成'}
      />
    </SidebarLayout>
  )
}