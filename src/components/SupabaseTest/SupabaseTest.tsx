'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { getUsers, createUser, updateUser, deleteUser, SupabaseConfigError } from '@/lib/database'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Users, Plus, Edit, Trash2, Phone, MapPin, Calendar, Database, RefreshCw, AlertCircle } from 'lucide-react'

export function SupabaseTest() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConfigError, setIsConfigError] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    lineUid: '',
    address: '',
    phone: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsConfigError(false)
      const fetchedUsers = await getUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      if (err instanceof SupabaseConfigError) {
        setIsConfigError(true)
      }
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      const created = await createUser({
        name: newUser.name,
        lineUid: newUser.lineUid || undefined,
        address: newUser.address || undefined,
        phone: newUser.phone || undefined,
        reservations: []
      })
      setUsers([created, ...users])
      setNewUser({ name: '', lineUid: '', address: '', phone: '' })
      setShowCreateForm(false)
    } catch (err) {
      if (err instanceof SupabaseConfigError) {
        setIsConfigError(true)
      }
      setError(err instanceof Error ? err.message : 'ユーザーの作成に失敗しました')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('このユーザーを削除しますか？')) return
    
    try {
      setError(null)
      await deleteUser(id)
      setUsers(users.filter(user => user.id !== id))
    } catch (err) {
      if (err instanceof SupabaseConfigError) {
        setIsConfigError(true)
      }
      setError(err instanceof Error ? err.message : 'ユーザーの削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Supabaseからデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supabase データテスト</h1>
            <p className="text-gray-600">リアルタイムデータベース接続確認</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            更新
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={isConfigError}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isConfigError
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            新規ユーザー
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`p-4 border rounded-md ${
          isConfigError 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${
              isConfigError ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <p className={`font-medium ${
              isConfigError ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {isConfigError ? 'Supabase設定が必要です' : 'エラーが発生しました'}
            </p>
          </div>
          <p className={`mt-1 ${
            isConfigError ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {error}
          </p>
          {isConfigError && (
            <div className="mt-3 p-3 bg-yellow-100 rounded text-sm text-yellow-700">
              <p className="font-medium mb-2">設定手順:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Supabaseダッシュボードで API キーを取得</li>
                <li>プロジェクトルートの .env.local ファイルに以下を追加:</li>
              </ol>
              <pre className="mt-2 p-2 bg-yellow-200 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://lnzwgycthszxfqxwcpvh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
              </pre>
              <p className="mt-1 text-xs">設定後、開発サーバーを再起動してください。</p>
            </div>
          )}
          <button
            onClick={loadUsers}
            className={`mt-2 px-3 py-1 rounded text-sm ${
              isConfigError
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            再試行
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && !isConfigError && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium mb-4">新しいユーザーを作成</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前 *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LINE UID
              </label>
              <input
                type="text"
                value={newUser.lineUid}
                onChange={(e) => setNewUser({...newUser, lineUid: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="例: U1234567890abcdef"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                type="text"
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="例: 東京都渋谷区"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="例: 090-1234-5678"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{users.length}</div>
              <div className="text-blue-600">総ユーザー数</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-green-700">
                {users.filter(u => u.lineUid).length}
              </div>
              <div className="text-green-600">LINE連携済み</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {users.filter(u => u.phone).length}
              </div>
              <div className="text-purple-600">電話番号登録済み</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">ユーザー一覧 ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>ユーザーが見つかりません</p>
            <p className="text-sm">新しいユーザーを作成するか、Supabaseの設定を確認してください</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                        {user.id}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {user.lineUid && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          LINE: {user.lineUid}
                        </span>
                      )}
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </span>
                      )}
                      {user.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.address}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      作成: {user.createdAt.toLocaleString('ja-JP')}
                      {user.updatedAt.getTime() !== user.createdAt.getTime() && (
                        <span>| 更新: {user.updatedAt.toLocaleString('ja-JP')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => console.log('Edit user:', user)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}