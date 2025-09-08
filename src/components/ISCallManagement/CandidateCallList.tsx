'use client'

import { useState } from 'react'
import { Phone, Clock, Calendar, User, CheckCircle, XCircle, AlertCircle, MessageSquare, Filter, Search, ChevronRight, PhoneCall, PhoneOff, PhoneIncoming, PhoneMissed, Mail, FileText, History, Plus } from 'lucide-react'

interface CallRecord {
  id: string
  date: Date
  type: 'outgoing' | 'incoming' | 'missed'
  status: 'connected' | 'no-answer' | 'busy' | 'voicemail'
  duration?: number
  agent: string
  notes?: string
  result?: 'positive' | 'neutral' | 'negative'
}

interface Candidate {
  id: string
  name: string
  type: 'applicant' | 'jobseeker'
  jobTitle?: string
  company?: string
  status: 'new' | 'in-progress' | 'interview-scheduled' | 'offer' | 'rejected' | 'on-hold'
  lastContact?: Date
  nextAction?: string
  nextActionDate?: Date
  callAttempts: number
  phoneNumber: string
  email: string
  selectionStage: string
  priority: 'high' | 'medium' | 'low'
  assignedTo: string
  notes?: string
  callHistory?: CallRecord[]
}

const mockCallHistory: Record<string, CallRecord[]> = {
  '1': [
    {
      id: 'call-1-1',
      date: new Date('2024-01-23T10:30:00'),
      type: 'outgoing',
      status: 'connected',
      duration: 420,
      agent: '山田 花子',
      notes: '面接日程について相談。木曜日午後を希望',
      result: 'positive'
    },
    {
      id: 'call-1-2',
      date: new Date('2024-01-22T14:00:00'),
      type: 'outgoing',
      status: 'connected',
      duration: 600,
      agent: '山田 花子',
      notes: '初回ヒアリング完了。スキルマッチ良好',
      result: 'positive'
    }
  ],
  '2': [
    {
      id: 'call-2-1',
      date: new Date('2024-01-23T11:15:00'),
      type: 'outgoing',
      status: 'no-answer',
      agent: '山田 花子',
      notes: '不在。午後に再架電予定'
    },
    {
      id: 'call-2-2',
      date: new Date('2024-01-20T15:30:00'),
      type: 'outgoing',
      status: 'connected',
      duration: 300,
      agent: '山田 花子',
      notes: '求人詳細説明。興味あり',
      result: 'positive'
    }
  ],
  '3': [
    {
      id: 'call-3-1',
      date: new Date('2024-01-23T09:45:00'),
      type: 'incoming',
      status: 'connected',
      duration: 180,
      agent: '田中 次郎',
      notes: '条件について質問あり',
      result: 'neutral'
    }
  ]
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: '田中 太郎',
    type: 'applicant',
    jobTitle: 'フロントエンドエンジニア',
    company: '株式会社テックイノベーション',
    status: 'new',
    callAttempts: 2,
    phoneNumber: '090-1234-5678',
    email: 'tanaka@example.com',
    selectionStage: '書類選考',
    priority: 'high',
    assignedTo: '山田 花子',
    nextAction: '初回コンタクト',
    nextActionDate: new Date('2024-01-25'),
    callHistory: mockCallHistory['1']
  },
  {
    id: '2',
    name: '佐藤 美咲',
    type: 'jobseeker',
    jobTitle: 'プロダクトマネージャー',
    status: 'in-progress',
    lastContact: new Date('2024-01-20'),
    callAttempts: 2,
    phoneNumber: '090-2345-6789',
    email: 'sato@example.com',
    selectionStage: '一次面接',
    priority: 'medium',
    assignedTo: '山田 花子',
    nextAction: '面接日程調整',
    nextActionDate: new Date('2024-01-24'),
    notes: '17時以降を希望',
    callHistory: mockCallHistory['2']
  },
  {
    id: '3',
    name: '鈴木 健一',
    type: 'applicant',
    jobTitle: 'バックエンドエンジニア',
    company: '株式会社デジタルソリューション',
    status: 'interview-scheduled',
    lastContact: new Date('2024-01-19'),
    callAttempts: 3,
    phoneNumber: '090-3456-7890',
    email: 'suzuki@example.com',
    selectionStage: '最終面接',
    priority: 'high',
    assignedTo: '田中 次郎',
    nextAction: '最終面接（1/26）',
    nextActionDate: new Date('2024-01-26'),
    callHistory: mockCallHistory['3']
  },
  {
    id: '4',
    name: '山田 花子',
    type: 'jobseeker',
    jobTitle: 'UIデザイナー',
    status: 'on-hold',
    lastContact: new Date('2024-01-18'),
    callAttempts: 1,
    phoneNumber: '090-4567-8901',
    email: 'yamada.h@example.com',
    selectionStage: '検討中',
    priority: 'low',
    assignedTo: '田中 次郎',
    notes: '他社選考中、2月に再度連絡'
  },
  {
    id: '5',
    name: '高橋 翔',
    type: 'applicant',
    jobTitle: 'データサイエンティスト',
    company: '株式会社AIラボ',
    status: 'offer',
    lastContact: new Date('2024-01-21'),
    callAttempts: 5,
    phoneNumber: '090-5678-9012',
    email: 'takahashi@example.com',
    selectionStage: 'オファー提示',
    priority: 'high',
    assignedTo: '山田 花子',
    nextAction: 'オファー回答待ち',
    nextActionDate: new Date('2024-01-25')
  }
]

const statusColors = {
  'new': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'interview-scheduled': 'bg-purple-100 text-purple-800',
  'offer': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'on-hold': 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  'new': '新規',
  'in-progress': '選考中',
  'interview-scheduled': '面接予定',
  'offer': 'オファー',
  'rejected': '不採用',
  'on-hold': '保留'
}

const priorityColors = {
  'high': 'text-red-500',
  'medium': 'text-yellow-500',
  'low': 'text-gray-400'
}

export function CandidateCallList() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info')

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    const matchesPriority = filterPriority === 'all' || candidate.priority === filterPriority
    const matchesType = filterType === 'all' || candidate.type === filterType
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getCallStatusIcon = (attempts: number) => {
    if (attempts === 0) return <Phone className="w-4 h-4" />
    if (attempts < 3) return <PhoneIncoming className="w-4 h-4" />
    return <PhoneCall className="w-4 h-4" />
  }

  const getCallIcon = (type: string, status: string) => {
    if (type === 'missed') return <PhoneMissed className="w-4 h-4 text-red-500" />
    if (type === 'incoming') return <PhoneIncoming className="w-4 h-4 text-blue-500" />
    if (status === 'connected') return <PhoneCall className="w-4 h-4 text-green-500" />
    if (status === 'no-answer') return <PhoneOff className="w-4 h-4 text-gray-500" />
    return <Phone className="w-4 h-4 text-yellow-500" />
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getResultIcon = (result?: string) => {
    if (result === 'positive') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (result === 'negative') return <XCircle className="w-4 h-4 text-red-500" />
    if (result === 'neutral') return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return null
  }

  const getDaysUntilAction = (date?: Date) => {
    if (!date) return null
    const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return <span className="text-red-600">期限切れ</span>
    if (days === 0) return <span className="text-orange-600">本日</span>
    if (days === 1) return <span className="text-yellow-600">明日</span>
    return <span>{days}日後</span>
  }

  return (
    <div className="flex h-full">
      <div className={`${selectedCandidate ? 'w-2/3' : 'w-full'} p-6 overflow-auto`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">架電管理</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">本日の架電予定</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-600">選考中</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">今週の面接予定</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600">オファー提示中</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="候補者名、職種、企業名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全タイプ</option>
              <option value="applicant">応募者</option>
              <option value="jobseeker">求職者</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              <option value="new">新規</option>
              <option value="in-progress">選考中</option>
              <option value="interview-scheduled">面接予定</option>
              <option value="offer">オファー</option>
              <option value="rejected">不採用</option>
              <option value="on-hold">保留</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全優先度</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優先度</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">候補者</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">選考段階</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">架電状況</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">次回アクション</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr 
                  key={candidate.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedCandidate(candidate)
                    setActiveTab('info')
                  }}
                >
                  <td className="px-4 py-3">
                    <AlertCircle className={`w-5 h-5 ${priorityColors[candidate.priority]}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.jobTitle}</p>
                      {candidate.company && (
                        <p className="text-xs text-gray-400">{candidate.company}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      candidate.type === 'applicant' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {candidate.type === 'applicant' ? '応募者' : '求職者'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{candidate.selectionStage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getCallStatusIcon(candidate.callAttempts)}
                      <div>
                        <p className="text-sm text-gray-900">{candidate.callAttempts}回</p>
                        {candidate.lastContact && (
                          <p className="text-xs text-gray-500">
                            最終: {candidate.lastContact.toLocaleDateString('ja-JP')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {candidate.nextAction && (
                      <div>
                        <p className="text-sm text-gray-900">{candidate.nextAction}</p>
                        {candidate.nextActionDate && (
                          <p className="text-xs text-gray-500">
                            {getDaysUntilAction(candidate.nextActionDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[candidate.status]}`}>
                      {statusLabels[candidate.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {candidate.assignedTo}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCandidate && (
        <div className="w-1/3 border-l border-gray-200 bg-white overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                <p className="text-gray-600">{selectedCandidate.jobTitle}</p>
                {selectedCandidate.company && (
                  <p className="text-sm text-gray-500">{selectedCandidate.company}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCandidate(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'info' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                基本情報
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                架電履歴
              </button>
            </div>

            {activeTab === 'info' ? (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedCandidate.phoneNumber}</span>
                    <button className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                      架電
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedCandidate.email}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">選考段階</p>
                    <p className="text-lg font-medium text-gray-900">{selectedCandidate.selectionStage}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">ステータス</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedCandidate.status]}`}>
                      {statusLabels[selectedCandidate.status]}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">優先度</p>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`w-5 h-5 ${priorityColors[selectedCandidate.priority]}`} />
                      <span className="text-gray-900">
                        {selectedCandidate.priority === 'high' ? '高' : selectedCandidate.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>

                  {selectedCandidate.nextAction && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">次回アクション</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{selectedCandidate.nextAction}</p>
                        {selectedCandidate.nextActionDate && (
                          <p className="text-sm text-gray-600 mt-1">
                            期限: {selectedCandidate.nextActionDate.toLocaleDateString('ja-JP')} {getDaysUntilAction(selectedCandidate.nextActionDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCandidate.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">メモ</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{selectedCandidate.notes}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">担当者</p>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{selectedCandidate.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    詳細情報を見る
                  </button>
                  <button 
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    メモを追加
                  </button>
                </div>

                {showAddNote && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="メモを入力..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNote(false)
                          setNewNote('')
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">架電履歴</h4>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    記録追加
                  </button>
                </div>

                {selectedCandidate.callHistory && selectedCandidate.callHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.callHistory.map((call) => (
                      <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCallIcon(call.type, call.status)}
                            <span className="text-sm font-medium text-gray-900">
                              {call.date.toLocaleDateString('ja-JP')} {call.date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {getResultIcon(call.result)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-gray-500">種類: </span>
                            <span className="text-gray-900">
                              {call.type === 'outgoing' ? '発信' : call.type === 'incoming' ? '着信' : '不在着信'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">状態: </span>
                            <span className="text-gray-900">
                              {call.status === 'connected' ? '通話成功' : 
                               call.status === 'no-answer' ? '不在' : 
                               call.status === 'busy' ? '通話中' : '留守電'}
                            </span>
                          </div>
                          {call.duration && (
                            <div>
                              <span className="text-gray-500">通話時間: </span>
                              <span className="text-gray-900">{formatDuration(call.duration)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">担当: </span>
                            <span className="text-gray-900">{call.agent}</span>
                          </div>
                        </div>
                        
                        {call.notes && (
                          <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                            {call.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>架電履歴がありません</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}