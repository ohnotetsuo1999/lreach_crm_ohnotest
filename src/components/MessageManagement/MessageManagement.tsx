'use client'

import { useState } from 'react'
import { Send, Search, Clock, User, MessageCircle, X } from 'lucide-react'

type TabType = 'new' | 'history'

interface MessageHistory {
  id: string
  userId: string
  userName: string
  lineUserName: string
  message: string
  sentAt: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

interface UserProfile {
  id: string
  name: string
  lineName: string
  email: string
  phone: string
}

export function MessageManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('new')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [lineUserName, setLineUserName] = useState('')
  const [message, setMessage] = useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ダミーデータ
  const messageHistory: MessageHistory[] = [
    {
      id: '1',
      userId: 'U001',
      userName: '田中太郎',
      lineUserName: 'Tanaka Taro',
      message: 'お世話になっております。面談の日程についてご連絡させていただきました。',
      sentAt: '2024-01-18 14:30',
      status: 'read'
    },
    {
      id: '2',
      userId: 'U002',
      userName: '佐藤花子',
      lineUserName: 'Sato Hanako',
      message: '求人情報を更新しました。ご確認ください。',
      sentAt: '2024-01-17 10:15',
      status: 'delivered'
    },
    {
      id: '3',
      userId: 'U003',
      userName: '鈴木一郎',
      lineUserName: 'Suzuki Ichiro',
      message: '本日はありがとうございました。次回もよろしくお願いします。',
      sentAt: '2024-01-16 16:45',
      status: 'sent'
    }
  ]

  const userProfiles: UserProfile[] = [
    {
      id: 'U001',
      name: '田中太郎',
      lineName: 'Tanaka Taro',
      email: 'tanaka@example.com',
      phone: '090-1234-5678'
    },
    {
      id: 'U002',
      name: '佐藤花子',
      lineName: 'Sato Hanako',
      email: 'sato@example.com',
      phone: '080-2345-6789'
    },
    {
      id: 'U003',
      name: '鈴木一郎',
      lineName: 'Suzuki Ichiro',
      email: 'suzuki@example.com',
      phone: '070-3456-7890'
    }
  ]

  const filteredUserProfiles = userProfiles.filter(
    (profile) =>
      profile.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.lineName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectUser = (profile: UserProfile) => {
    setUserId(profile.id)
    setUserName(profile.name)
    setLineUserName(profile.lineName)
    setIsSearchModalOpen(false)
    setSearchQuery('')
  }

  const handleReuse = (history: MessageHistory) => {
    setActiveTab('new')
    setUserId(history.userId)
    setUserName(history.userName)
    setLineUserName(history.lineUserName)
    setMessage(history.message)
  }

  const handleSendMessage = () => {
    if (!userId || !message) {
      alert('ユーザーIDとメッセージを入力してください')
      return
    }
    
    alert('メッセージを送信しました')
    // Reset form
    setUserId('')
    setUserName('')
    setLineUserName('')
    setMessage('')
  }

  const getStatusBadge = (status: MessageHistory['status']) => {
    switch (status) {
      case 'read':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">既読</span>
      case 'delivered':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">配信済</span>
      case 'sent':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">送信済</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">失敗</span>
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>
        <p className="text-gray-600 mt-1">個別メッセージの送信と履歴管理</p>
      </div>

      {/* タブ */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            新規作成
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            送信履歴
          </button>
        </nav>
      </div>

      {/* コンテンツ */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {activeTab === 'new' ? (
          <div className="max-w-2xl">
            {/* ユーザー選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送信先ユーザー
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="ユーザーIDを入力"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  検索
                </button>
              </div>
              {userName && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">名前:</span> {userName} ({lineUserName})
                </div>
              )}
            </div>

            {/* メッセージ入力 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="メッセージを入力してください..."
              />
            </div>

            {/* 送信ボタン */}
            <button
              onClick={handleSendMessage}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              メッセージを送信
            </button>
          </div>
        ) : (
          <div>
            {/* 送信履歴 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      送信日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      宛先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メッセージ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messageHistory.map((history) => (
                    <tr key={history.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {history.sentAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{history.userName}</div>
                        <div className="text-sm text-gray-500">{history.userId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{history.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(history.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleReuse(history)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          再利用
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ユーザー検索モーダル */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ユーザー検索</h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID、名前、LINE名で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LINE名
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUserProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{profile.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{profile.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{profile.lineName}</td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => handleSelectUser(profile)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          選択
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}