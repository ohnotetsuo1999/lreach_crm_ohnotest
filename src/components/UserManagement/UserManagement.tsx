'use client'

import { useState } from 'react'
import { UserTable } from './UserTable'
import { TagFilterPanel } from './TagFilterPanel'
import { BulkActionBar } from './BulkActionBar'
import { User, Tag, Status } from '@/types'
import { Plus, Search, Filter } from 'lucide-react'

interface UserManagementProps {
  users: User[]
  tags: Tag[]
  statuses: Status[]
  onCreateUser: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onAddTag: (userId: string, tagId: string) => void
  onRemoveTag: (userId: string, tagId: string) => void
  onCreateTag: () => void
  onBulkActions: {
    addTags: (userIds: string[], tagIds: string[]) => void
    removeTags: (userIds: string[], tagIds: string[]) => void
    changeStatus: (userIds: string[], statusId: string) => void
  }
}

export function UserManagement({
  users,
  tags,
  statuses,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onBulkActions
}: UserManagementProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // フィルタリング処理
  const filteredUsers = users.filter(user => {
    // 検索クエリによるフィルタ
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)

    // タグによるフィルタ
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => user.tags.some(tag => tag.id === tagId))

    // ステータスによるフィルタ
    const matchesStatuses = selectedStatuses.length === 0 ||
      (user.statusHistory.length > 0 && selectedStatuses.includes(user.statusHistory[0].statusId))

    return matchesSearch && matchesTags && matchesStatuses
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
    setSelectedStatuses([])
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
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* 検索窓 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ユーザーを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
            />
          </div>
          
          {/* フィルターボタン */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
              showFilters || selectedTags.length > 0 || selectedStatuses.length > 0
                ? 'border-blue-300 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            フィルター
            {(selectedTags.length > 0 || selectedStatuses.length > 0) && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedTags.length + selectedStatuses.length}
              </span>
            )}
          </button>
          
          {/* 新規ユーザーボタン */}
          <button
            onClick={onCreateUser}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規ユーザー
          </button>
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <TagFilterPanel
            tags={tags}
            statuses={statuses}
            selectedTags={selectedTags}
            selectedStatuses={selectedStatuses}
            onTagsChange={setSelectedTags}
            onStatusesChange={setSelectedStatuses}
            onCreateTag={onCreateTag}
          />
        </div>
      )}

      {/* ユーザーテーブル */}
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

      {/* バルクアクションバー */}
      <BulkActionBar
        selectedCount={selectedUsers.length}
        tags={tags}
        statuses={statuses}
        onAddTagsBulk={handleBulkAddTags}
        onRemoveTagsBulk={handleBulkRemoveTags}
        onChangeStatusBulk={handleBulkChangeStatus}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}