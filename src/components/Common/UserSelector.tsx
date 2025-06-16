'use client'

import { useState } from 'react'
import { User } from '@/types'
import { Check, Search, X } from 'lucide-react'

interface UserSelectorProps {
  users: User[]
  selectedUsers: string[]
  onSelectionChange: (userIds: string[]) => void
  maxHeight?: string
}

export function UserSelector({ 
  users, 
  selectedUsers, 
  onSelectionChange,
  maxHeight = 'max-h-64'
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.lineUid && user.lineUid.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const displayUsers = showAll ? filteredUsers : filteredUsers.slice(0, 20)

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId]
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    onSelectionChange(filteredUsers.map(user => user.id))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-4">
      {/* 検索とアクション */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ユーザーを検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedUsers.length} / {filteredUsers.length} 選択中
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              全て選択
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              選択解除
            </button>
          </div>
        </div>
      </div>

      {/* ユーザーリスト */}
      <div className={`border border-gray-200 rounded-lg ${maxHeight} overflow-y-auto`}>
        {displayUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {displayUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedUsers.includes(user.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </div>
                  {user.lineUid && (
                    <div className="text-xs text-gray-500 truncate">
                      LINE ID: {user.lineUid}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* さらに表示 */}
      {!showAll && filteredUsers.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
        >
          さらに {filteredUsers.length - 20} 件表示
        </button>
      )}
    </div>
  )
}