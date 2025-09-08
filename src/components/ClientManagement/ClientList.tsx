'use client'

import React, { useState } from 'react'
import { ChevronDown, Filter, Download, Plus, Search, MessageSquare, Clock, X } from 'lucide-react'

interface Note {
  id: string
  content: string
  createdAt: Date
  createdBy: string
}

interface ClientData {
  id: number
  recrutierBy: string
  freelancer: string
  assignedTo: string
  registrationDate: string
  workDate: string
  clientCompany: string
  seatedYearMonth: string
  status: 'seated' | 'adjustment' | 'pending' | 'cancelled'
  notes: Note[]
}

const statusColors = {
  seated: 'bg-green-100 text-green-800 border-green-300',
  adjustment: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pending: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300'
}

const statusLabels = {
  seated: '着座済（着座）',
  adjustment: '調整中（調整）',
  pending: '面談前',
  cancelled: '面談キャンセル'
}

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [newNote, setNewNote] = useState('')
  
  // 担当者リスト
  const assigneeList = [
    '佐々木',
    '田中',
    '山田',
    '鈴木',
    '高橋',
    '伊藤',
    '渡辺',
    '中村'
  ]

  // ダミーデータ
  const [clients, setClients] = useState<ClientData[]>([
    {
      id: 1,
      recrutierBy: '佐々木奈紀',
      freelancer: 'ひげナース',
      assignedTo: '佐々木',
      registrationDate: '2025/07/30',
      workDate: '13:00',
      clientCompany: '面談有無',
      seatedYearMonth: '2025/7',
      status: 'seated',
      notes: [
        {
          id: '1-1',
          content: '正社員経験済み 名古屋の会社？',
          createdAt: new Date('2025-07-30T10:00:00'),
          createdBy: '管理者'
        }
      ]
    },
    {
      id: 2,
      recrutierBy: '佐藤誠',
      freelancer: 'さくらきょう',
      assignedTo: '田中',
      registrationDate: '2025/08/05',
      workDate: '15:15',
      clientCompany: '面談済（面談）',
      seatedYearMonth: '2025/8',
      status: 'adjustment',
      notes: [
        {
          id: '2-1',
          content: '3社紹介された済み',
          createdAt: new Date('2025-08-05T14:00:00'),
          createdBy: '田中'
        }
      ]
    },
    {
      id: 3,
      recrutierBy: '佐藤夏',
      freelancer: 'サトウショウ',
      assignedTo: '山田',
      registrationDate: '2025/08/07',
      workDate: '20:15',
      clientCompany: '面談済（面談）',
      seatedYearMonth: '2025/8',
      status: 'adjustment',
      notes: [
        {
          id: '3-1',
          content: '自己応募内定あり',
          createdAt: new Date('2025-08-07T16:00:00'),
          createdBy: '山田'
        }
      ]
    },
    {
      id: 4,
      recrutierBy: '丹羽紗結',
      freelancer: 'ニワショウタ',
      assignedTo: '鈴木',
      registrationDate: '2025/08/15',
      workDate: '13:00',
      clientCompany: '面談調整中',
      seatedYearMonth: '',
      status: 'pending',
      notes: []
    },
    {
      id: 5,
      recrutierBy: '松原彩紀',
      freelancer: 'マッパラトンド',
      assignedTo: '高橋',
      registrationDate: '2025/08/15',
      workDate: '21:15',
      clientCompany: '面談キャンセル',
      seatedYearMonth: '',
      status: 'cancelled',
      notes: [
        {
          id: '5-1',
          content: '080631399616 松原様電話番号',
          createdAt: new Date('2025-08-15T11:00:00'),
          createdBy: '高橋'
        }
      ]
    },
    {
      id: 6,
      recrutierBy: '朱谷紀沙乃',
      freelancer: 'スヤヤセナノ',
      assignedTo: '伊藤',
      registrationDate: '2025/08/21',
      workDate: '',
      clientCompany: '気軽に（レッド）',
      seatedYearMonth: '',
      status: 'pending',
      notes: []
    },
    {
      id: 7,
      recrutierBy: '元田裕樹',
      freelancer: 'モトダユウキ',
      assignedTo: '渡辺',
      registrationDate: '2025/08/26',
      workDate: '18:15',
      clientCompany: '面談キャンセル',
      seatedYearMonth: '',
      status: 'cancelled',
      notes: []
    },
    {
      id: 8,
      recrutierBy: '古川翔吾',
      freelancer: 'フルカワショウ',
      assignedTo: '中村',
      registrationDate: '2025/08/26',
      workDate: '19:00',
      clientCompany: '面談キャンセル',
      seatedYearMonth: '',
      status: 'cancelled',
      notes: []
    },
    {
      id: 9,
      recrutierBy: '宮金野翔吾',
      freelancer: 'パシノカパリ',
      assignedTo: '佐々木',
      registrationDate: '2025/08/29',
      workDate: '15:30',
      clientCompany: '面談キャンセル',
      seatedYearMonth: '',
      status: 'cancelled',
      notes: []
    },
    {
      id: 10,
      recrutierBy: '古賀翔利',
      freelancer: 'フルノアツ',
      assignedTo: '田中',
      registrationDate: '2025/09/01',
      workDate: '20:30',
      clientCompany: '面談済（面談）',
      seatedYearMonth: '2025/9',
      status: 'adjustment',
      notes: []
    },
    {
      id: 11,
      recrutierBy: '竹田龍',
      freelancer: 'タケダコウル',
      assignedTo: '山田',
      registrationDate: '2025/09/05',
      workDate: '18:15',
      clientCompany: '面談前',
      seatedYearMonth: '',
      status: 'pending',
      notes: [
        {
          id: '11-1',
          content: 'うつ病、14年調理、動的面売訴え、求件NO',
          createdAt: new Date('2025-09-05T09:00:00'),
          createdBy: '山田'
        }
      ]
    },
    {
      id: 12,
      recrutierBy: '江口雄太',
      freelancer: 'エグチコウタ',
      assignedTo: '鈴木',
      registrationDate: '2025/09/09',
      workDate: '15:15',
      clientCompany: '',
      seatedYearMonth: '',
      status: 'pending',
      notes: []
    }
  ])

  const handleAssigneeChange = (clientId: number, newAssignee: string) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId ? { ...client, assignedTo: newAssignee } : client
      )
    )
  }

  const handleStatusChange = (clientId: number, newStatus: ClientData['status']) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId ? { ...client, status: newStatus } : client
      )
    )
  }

  const handleAddNote = () => {
    if (!selectedClient || !newNote.trim()) return
    
    const note: Note = {
      id: `${selectedClient.id}-${Date.now()}`,
      content: newNote,
      createdAt: new Date(),
      createdBy: '管理者'
    }
    
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === selectedClient.id
          ? { ...client, notes: [...client.notes, note] }
          : client
      )
    )
    
    setNewNote('')
    
    // 更新された client データを selectedClient に反映
    const updatedClient = clients.find(c => c.id === selectedClient.id)
    if (updatedClient) {
      setSelectedClient({ ...updatedClient, notes: [...updatedClient.notes, note] })
    }
  }

  const openNotesModal = (client: ClientData) => {
    setSelectedClient(client)
    setShowNotesModal(true)
    setNewNote('')
  }

  const closeNotesModal = () => {
    setShowNotesModal(false)
    setSelectedClient(null)
    setNewNote('')
  }

  const openDetailPanel = (client: ClientData) => {
    setSelectedClient(client)
    setShowDetailPanel(true)
  }

  const closeDetailPanel = () => {
    setShowDetailPanel(false)
    setSelectedClient(null)
  }

  const getLatestNote = (notes: Note[]): string => {
    if (notes.length === 0) return ''
    const sortedNotes = [...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return sortedNotes[0].content
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.recrutierBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
    
    const matchesMonth = selectedMonth === 'all' || 
      (client.seatedYearMonth && client.seatedYearMonth.includes(selectedMonth))
    
    return matchesSearch && matchesStatus && matchesMonth
  })

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">送客一覧</h1>
            <p className="text-sm text-gray-600 mt-1">求職者の送客状況を管理</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              新規追加
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="検索（求職者名、採用担当者、送客先企業）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="seated">着座済</option>
            <option value="adjustment">調整中</option>
            <option value="pending">面談前</option>
            <option value="cancelled">キャンセル</option>
          </select>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべての月</option>
            <option value="2025/7">2025年7月</option>
            <option value="2025/8">2025年8月</option>
            <option value="2025/9">2025年9月</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                採用担当者名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                フリガナ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                面談日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                面談実施有無
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ご着座年月日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メモ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr 
                key={client.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => openDetailPanel(client)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.recrutierBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.freelancer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={client.assignedTo}
                    onChange={(e) => handleAssigneeChange(client.id, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">未割当</option>
                    {assigneeList.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.registrationDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.workDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={client.status}
                    onChange={(e) => handleStatusChange(client.id, e.target.value as ClientData['status'])}
                    className={`px-2 py-1 text-xs font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[client.status]}`}
                  >
                    <option value="seated">着座済（着座）</option>
                    <option value="adjustment">調整中（調整）</option>
                    <option value="pending">面談前</option>
                    <option value="cancelled">面談キャンセル</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {client.seatedYearMonth && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                      {client.seatedYearMonth}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openNotesModal(client)
                      }}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      メモ ({client.notes.length})
                    </button>
                    {getLatestNote(client.notes) && (
                      <p className="text-xs text-gray-600 truncate max-w-xs" title={getLatestNote(client.notes)}>
                        {getLatestNote(client.notes)}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">該当するデータが見つかりません</p>
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {filteredClients.length} 件の結果
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              前へ
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              次へ
            </button>
          </div>
        </div>
      </div>

      {/* メモモーダル */}
      {showNotesModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedClient.freelancer} のメモ
              </h3>
              <button
                onClick={closeNotesModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* タイムライン表示 */}
              {selectedClient.notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">メモはまだありません</p>
              ) : (
                <div className="space-y-4">
                  {selectedClient.notes
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map((note) => (
                      <div key={note.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {note.createdBy}
                            </span>
                            <span className="text-xs text-gray-500">
                              {note.createdAt.toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="新しいメモを入力..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 詳細パネル */}
      {showDetailPanel && selectedClient && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-25 z-40"
            onClick={closeDetailPanel}
          />
          
          {/* スライドパネル */}
          <div className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${showDetailPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">求職者詳細</h2>
                <button
                  onClick={closeDetailPanel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* コンテンツ */}
              <div className="flex-1 overflow-y-auto">
                {/* 基本情報 */}
                <div className="px-6 py-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">基本情報</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-gray-500">ID</dt>
                      <dd className="text-sm font-medium text-gray-900">#{selectedClient.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">求職者名</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.freelancer}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">採用担当者</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.recrutierBy}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">担当者</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.assignedTo || '未割当'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">面談日</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.registrationDate}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">面談時間</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.workDate || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">ステータス</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${statusColors[selectedClient.status]}`}>
                          {statusLabels[selectedClient.status]}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">着座年月</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedClient.seatedYearMonth || '-'}</dd>
                    </div>
                  </dl>
                </div>

                {/* メモタイムライン */}
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">メモ履歴</h3>
                    <span className="text-xs text-gray-500">{selectedClient.notes.length}件</span>
                  </div>

                  {selectedClient.notes.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                      メモはまだありません
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.notes
                        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                        .map((note) => (
                          <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">
                                {note.createdBy}
                              </span>
                              <span className="text-xs text-gray-500">
                                {note.createdAt.toLocaleString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* フッター - メモ追加 */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="新しいメモを追加..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}