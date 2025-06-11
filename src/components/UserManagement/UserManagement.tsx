'use client'

import { useState } from 'react'
import { UserTable } from './UserTable'
import { TagFilterPanel } from './TagFilterPanel'
import { BulkActionBar } from './BulkActionBar'
import { User, Tag, Status } from '@/types'
import { Plus, Upload, Download } from 'lucide-react'

interface UserManagementProps {
  users: User[]
  tags: Tag[]
  statuses: Status[]
  onCreateUser: () => void
  onImportUsers: () => void
  onExportUsers: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onAddTag: (userId: string, tagId: string) => void
  onRemoveTag: (userId: string, tagId: string) => void
  onCreateTag: () => void
  onBulkActions: {
    addTags: (userIds: string[], tagIds: string[]) => void
    removeTags: (userIds: string[], tagIds: string[]) => void
    changeStatus: (userIds: string[], statusId: string) => void
    delete: (userIds: string[]) => void
    export: (userIds: string[]) => void
    sendMessage: (userIds: string[]) => void
  }
}

export function UserManagement({
  users,
  tags,
  statuses,
  onCreateUser,
  onImportUsers,
  onExportUsers,
  onEditUser,
  onDeleteUser,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onBulkActions
}: UserManagementProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // フィルタリング処理
  const filteredUsers = users.filter(user => {
    // 検索クエリによるフィルタ
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)

    // タグによるフィルタ
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => user.tags.some(tag => tag.id === tagId))

    return matchesSearch && matchesTags
  })

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedUsers(selected ? filteredUsers.map(user => user.id) : [])
  }

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleClearFilters = () => {
    setSelectedTags([])
    setSearchQuery('')
  }

  const handleBulkAddTags = (tagIds: string[]) => {
    onBulkActions.addTags(selectedUsers, tagIds)
  }

  const handleBulkRemoveTags = (tagIds: string[]) => {
    onBulkActions.removeTags(selectedUsers, tagIds)
  }

  const handleBulkChangeStatus = (statusId: string) => {
    onBulkActions.changeStatus(selectedUsers, statusId)
  }

  const handleBulkDelete = () => {
    if (confirm(`選択した${selectedUsers.length}人のユーザーを削除しますか？`)) {
      onBulkActions.delete(selectedUsers)
      setSelectedUsers([])
    }
  }

  const handleBulkExport = () => {
    onBulkActions.export(selectedUsers)
  }

  const handleBulkSendMessage = () => {
    onBulkActions.sendMessage(selectedUsers)
  }

  const handleClearSelection = () => {
    setSelectedUsers([])
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ユーザー管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            {filteredUsers.length}人のユーザー（全{users.length}人中）
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={onImportUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            インポート
          </button>
          
          <button
            onClick={onExportUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            エクスポート
          </button>
          
          <button
            onClick={onCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規ユーザー
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* フィルターパネル */}
        <div className="lg:col-span-1">
          <TagFilterPanel
            tags={tags}
            selectedTags={selectedTags}
            searchQuery={searchQuery}
            onTagSelect={handleTagSelect}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
            onCreateTag={onCreateTag}
          />
        </div>

        {/* ユーザーテーブル */}
        <div className="lg:col-span-3">
          <UserTable
            users={filteredUsers}
            tags={tags}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />
        </div>
      </div>

      {/* バルクアクションバー */}
      <BulkActionBar
        selectedCount={selectedUsers.length}
        tags={tags}
        statuses={statuses}
        onAddTagsBulk={handleBulkAddTags}
        onRemoveTagsBulk={handleBulkRemoveTags}
        onChangeStatusBulk={handleBulkChangeStatus}
        onDeleteBulk={handleBulkDelete}
        onExportBulk={handleBulkExport}
        onSendMessageBulk={handleBulkSendMessage}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}