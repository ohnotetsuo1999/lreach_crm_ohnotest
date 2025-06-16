'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, UserPlus, MessageSquare, Star, Clock, TrendingUp, Users } from 'lucide-react'

type TabType = 'candidate' | 'activity' | 'insight' | 'urgent' | 'chat' | 'selection'

export function ApplicantManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('candidate')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'candidate' as TabType, label: '求職者管理', icon: Users },
    { id: 'activity' as TabType, label: 'アクティビティ', icon: Clock },
    { id: 'insight' as TabType, label: 'インサイト', icon: TrendingUp },
    { id: 'urgent' as TabType, label: '緊急対応', icon: Star },
    { id: 'chat' as TabType, label: 'チャット', icon: MessageSquare },
    { id: 'selection' as TabType, label: '選考管理', icon: UserPlus }
  ]

  // ダミーデータ
  const candidates = [
    {
      id: '1',
      name: '田中太郎',
      age: 28,
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      status: '選考中',
      registeredAt: '2024-01-15',
      lastActivity: '2024-01-18',
      tags: ['エンジニア', '東京']
    },
    {
      id: '2',
      name: '佐藤花子',
      age: 32,
      email: 'sato@example.com',
      phone: '080-2345-6789',
      status: '面接待ち',
      registeredAt: '2024-01-14',
      lastActivity: '2024-01-17',
      tags: ['デザイナー', '大阪']
    },
    {
      id: '3',
      name: '鈴木一郎',
      age: 25,
      email: 'suzuki@example.com',
      phone: '070-3456-7890',
      status: '新規',
      registeredAt: '2024-01-16',
      lastActivity: '2024-01-16',
      tags: ['営業', '名古屋']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case '選考中':
        return 'bg-blue-100 text-blue-800'
      case '面接待ち':
        return 'bg-yellow-100 text-yellow-800'
      case '新規':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'activity':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">アクティビティ履歴</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-gray-600">最近のアクティビティが表示されます</p>
            </div>
          </div>
        )
      case 'insight':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">インサイト分析</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold mb-2">登録者数推移</h3>
                <p className="text-gray-600">グラフ表示エリア</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold mb-2">応募状況</h3>
                <p className="text-gray-600">グラフ表示エリア</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold mb-2">成約率</h3>
                <p className="text-gray-600">グラフ表示エリア</p>
              </div>
            </div>
          </div>
        )
      case 'urgent':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">緊急対応リスト</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-gray-600">緊急対応が必要な求職者リスト</p>
            </div>
          </div>
        )
      case 'chat':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">チャット履歴</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-gray-600">チャット履歴が表示されます</p>
            </div>
          </div>
        )
      case 'selection':
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">選考管理</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-gray-600">選考プロセスの管理画面</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-6">
            {/* 検索・フィルターバー */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="名前、メール、電話番号で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                フィルター
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-5 h-5" />
                エクスポート
              </button>
            </div>

            {/* 求職者リスト */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年齢
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タグ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.age}歳</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.email}</div>
                        <div className="text-sm text-gray-500">{candidate.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.registeredAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {candidate.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">詳細</button>
                        <button className="text-blue-600 hover:text-blue-900">編集</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">求職者管理（CA）</h1>
        <p className="text-gray-600 mt-1">求職者の情報管理と選考プロセスの追跡</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* コンテンツエリア */}
      {renderContent()}
    </div>
  )
}