'use client'

import { useState } from 'react'
import { User, Tag } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MoreHorizontal, Edit2, Trash2, MapPin, Phone, Plus, X, History } from 'lucide-react'

interface UserTableProps {
  users: User[]
  tags: Tag[]
  selectedUsers: string[]
  onSelectUser: (userId: string) => void
  onSelectAll: (selected: boolean) => void
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onAddTag: (userId: string, tagId: string) => void
  onRemoveTag: (userId: string, tagId: string) => void
}

export function UserTable({
  users,
  tags,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onDeleteUser,
  onAddTag,
  onRemoveTag
}: UserTableProps) {
  const [showActions, setShowActions] = useState<string | null>(null)
  const [addingTag, setAddingTag] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState<string | null>(null)

  const allSelected = users.length > 0 && selectedUsers.length === users.length
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  const getTagColor = (tagType: string) => {
    switch (tagType) {
      case 'MANUAL':
        return 'bg-blue-100 text-blue-800'
      case 'AUTOMATIC':
        return 'bg-green-100 text-green-800'
      case 'BEHAVIORAL':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (statusId: string) => {
    const statusMap: { [key: string]: string } = {
      '1': 'リード',
      '2': '見込み客', 
      '3': '顧客',
      '4': '離脱'
    }
    return statusMap[statusId] || 'Unknown'
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">ユーザー一覧</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
              </th>
              <th className="min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="min-w-[180px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                住所・連絡先
              </th>
              <th className="min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タグ
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="min-w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最終ステータス更新
              </th>
              <th className="px-6 py-3 relative">
                <span className="sr-only">アクション</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[150px]" title={user.name}>
                          {user.name}
                        </div>
                      </div>
                      {user.lineUid && (
                        <div className="text-sm text-gray-500">
                          <div className="truncate max-w-[150px]" title={`LINE: ${user.lineUid}`}>
                            LINE: {user.lineUid.slice(-8)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 min-w-0">
                    {user.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[140px]" title={user.address}>{user.address}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[140px]" title={user.phone}>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {user.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium max-w-[120px] ${getTagColor(tag.type)}`}
                        title={tag.name}
                      >
                        <span className="truncate">
                          {tag.name.length > 10 ? tag.name.substring(0, 10) + '...' : tag.name}
                        </span>
                        <button
                          onClick={() => onRemoveTag(user.id, tag.id)}
                          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-current hover:bg-black hover:bg-opacity-10 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {user.tags.length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{user.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ja })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.statusHistory.length > 0
                    ? formatDistanceToNow(new Date(user.statusHistory[0].changedAt), { addSuffix: true, locale: ja })
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Tag Add Button */}
                    <button
                      onClick={() => setAddingTag(addingTag === user.id ? null : user.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="タグを追加"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    {/* History Button */}
                    <button
                      onClick={() => setShowHistory(showHistory === user.id ? null : user.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="履歴を表示"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    
                    {/* More Actions Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {showActions === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                onEditUser(user)
                                setShowActions(null)
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              編集
                            </button>
                            <button
                              onClick={() => {
                                onDeleteUser(user.id)
                                setShowActions(null)
                              }}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              削除
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Tag Add Modal */}
                    {addingTag === user.id && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">タグを追加</h4>
                            <button
                              onClick={() => setAddingTag(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {tags
                              .filter(tag => !user.tags.some(userTag => userTag.id === tag.id))
                              .map(tag => (
                                <button
                                  key={tag.id}
                                  onClick={() => {
                                    onAddTag(user.id, tag.id)
                                    setAddingTag(null)
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 border ${getTagColor(tag.type)}`}
                                >
                                  {tag.name}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* History Modal */}
                    {showHistory === user.id && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">ユーザー履歴</h4>
                            <button
                              onClick={() => setShowHistory(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {/* Status history */}
                            {user.statusHistory.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                  ステータス履歴
                                </h5>
                                <div className="space-y-2">
                                  {user.statusHistory.map((history) => (
                                    <div key={history.id} className="flex items-center text-xs">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                      <div className="flex-1">
                                        <span className="font-medium">{getStatusLabel(history.statusId)}</span>
                                        <span className="text-gray-500 ml-2">{formatDate(history.changedAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Activity history (mock data) */}
                            <div>
                              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                アクティビティ履歴
                              </h5>
                              <div className="space-y-2">
                                <div className="flex items-center text-xs">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                  <div className="flex-1">
                                    <span className="font-medium">メッセージ開封</span>
                                    <span className="text-gray-500 ml-2">2時間前</span>
                                  </div>
                                </div>
                                <div className="flex items-center text-xs">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                                  <div className="flex-1">
                                    <span className="font-medium">プロフィール更新</span>
                                    <span className="text-gray-500 ml-2">1日前</span>
                                  </div>
                                </div>
                                <div className="flex items-center text-xs">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                                  <div className="flex-1">
                                    <span className="font-medium">新規登録</span>
                                    <span className="text-gray-500 ml-2">{formatDate(user.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            ユーザーが見つかりません
          </div>
        )}
      </div>
    </div>
  )
}