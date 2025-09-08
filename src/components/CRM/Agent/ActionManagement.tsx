'use client'

import { useState } from 'react'
import { 
  Users, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Target, 
  TrendingUp, 
  ArrowRight, 
  Eye, 
  Edit2, 
  MessageSquare, 
  UserCheck, 
  UserX, 
  ClipboardList, 
  DollarSign, 
  ChevronLeft, 
  ChevronDown, 
  Star, 
  Plus, 
  User,
  Filter,
  Search,
  MoreVertical,
  Activity,
  Archive,
  Trash2
} from 'lucide-react'

interface Action {
  id: string
  type: 'call' | 'email' | 'meeting' | 'interview' | 'document' | 'follow-up' | 'other'
  title: string
  description: string
  targetType: 'jobseeker' | 'company' | 'job'
  targetId: string
  targetName: string
  assignee: string
  assigneeId: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
  notes?: string
  result?: string
  nextAction?: string
}

interface Agent {
  id: string
  name: string
  email: string
  role: string
  department: string
  activeActions: number
  completedActions: number
  avatar?: string
}

const actionTypeIcons = {
  'call': Phone,
  'email': Mail,
  'meeting': Calendar,
  'interview': UserCheck,
  'document': FileText,
  'follow-up': MessageSquare,
  'other': ClipboardList
}

const actionTypeLabels = {
  'call': '電話',
  'email': 'メール',
  'meeting': '面談',
  'interview': '面接',
  'document': '書類',
  'follow-up': 'フォローアップ',
  'other': 'その他'
}

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  'pending': '未着手',
  'in-progress': '進行中',
  'completed': '完了',
  'cancelled': 'キャンセル'
}

const priorityColors = {
  'low': 'bg-gray-100 text-gray-600',
  'medium': 'bg-blue-100 text-blue-600',
  'high': 'bg-orange-100 text-orange-600',
  'urgent': 'bg-red-100 text-red-600'
}

const priorityLabels = {
  'low': '低',
  'medium': '中',
  'high': '高',
  'urgent': '緊急'
}

// Mock data
const mockAgents: Agent[] = [
  {
    id: '1',
    name: '山田 太郎',
    email: 'yamada@company.com',
    role: 'シニアエージェント',
    department: '営業部',
    activeActions: 12,
    completedActions: 45
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@company.com',
    role: 'エージェント',
    department: '営業部',
    activeActions: 8,
    completedActions: 32
  },
  {
    id: '3',
    name: '鈴木 次郎',
    email: 'suzuki@company.com',
    role: 'エージェント',
    department: 'カスタマーサクセス',
    activeActions: 5,
    completedActions: 28
  }
]

const mockActions: Action[] = [
  {
    id: '1',
    type: 'call',
    title: '田中様へのフォローアップコール',
    description: '前回の面接結果についてのフィードバック',
    targetType: 'jobseeker',
    targetId: 'js1',
    targetName: '田中 一郎',
    assignee: '山田 太郎',
    assigneeId: '1',
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    type: 'meeting',
    title: '株式会社ABC商事との打ち合わせ',
    description: '新規求人の要件定義',
    targetType: 'company',
    targetId: 'c1',
    targetName: '株式会社ABC商事',
    assignee: '山田 太郎',
    assigneeId: '1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date('2024-01-26'),
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '3',
    type: 'email',
    title: '応募書類の送付',
    description: '履歴書・職務経歴書を企業へ送付',
    targetType: 'job',
    targetId: 'j1',
    targetName: 'フロントエンドエンジニア募集',
    assignee: '佐藤 花子',
    assigneeId: '2',
    status: 'completed',
    priority: 'high',
    dueDate: new Date('2024-01-22'),
    completedDate: new Date('2024-01-21'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-21'),
    result: '書類送付完了。企業からの返答待ち。'
  },
  {
    id: '4',
    type: 'interview',
    title: '一次面接の日程調整',
    description: '候補者と企業の面接日程を調整',
    targetType: 'jobseeker',
    targetId: 'js2',
    targetName: '佐藤 次郎',
    assignee: '佐藤 花子',
    assigneeId: '2',
    status: 'pending',
    priority: 'urgent',
    dueDate: new Date('2024-01-24'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '5',
    type: 'follow-up',
    title: '面接後のフォローアップ',
    description: '面接の感想と次のステップについて確認',
    targetType: 'jobseeker',
    targetId: 'js3',
    targetName: '鈴木 三郎',
    assignee: '鈴木 次郎',
    assigneeId: '3',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date('2024-01-27'),
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  }
]

export default function ActionManagement() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [actions, setActions] = useState<Action[]>(mockActions)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddAction, setShowAddAction] = useState(false)

  // Filter actions
  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || action.status === filterStatus
    const matchesPriority = filterPriority === 'all' || action.priority === filterPriority
    const matchesType = filterType === 'all' || action.type === filterType
    const matchesAgent = !selectedAgent || action.assigneeId === selectedAgent.id
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAgent
  })

  // Group actions by date
  const groupedActions = filteredActions.reduce((groups, action) => {
    const date = action.dueDate.toLocaleDateString('ja-JP')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(action)
    return groups
  }, {} as Record<string, Action[]>)

  // Stats
  const stats = {
    total: actions.length,
    pending: actions.filter(a => a.status === 'pending').length,
    inProgress: actions.filter(a => a.status === 'in-progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    urgent: actions.filter(a => a.priority === 'urgent' && a.status !== 'completed').length
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Agent List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">エージェント</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 rounded p-2">
              <div className="font-semibold text-blue-700">{mockAgents.length}</div>
              <div className="text-blue-600">総エージェント</div>
            </div>
            <div className="bg-green-50 rounded p-2">
              <div className="font-semibold text-green-700">{stats.total}</div>
              <div className="text-green-600">総アクション</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => setSelectedAgent(null)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                !selectedAgent ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">全エージェント</div>
              <div className="text-sm text-gray-500">全てのアクションを表示</div>
            </button>

            {mockAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  selectedAgent?.id === agent.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-500">{agent.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{agent.activeActions}</div>
                    <div className="text-xs text-gray-500">アクティブ</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">アクション管理</h1>
              <p className="text-gray-600 mt-1">
                {selectedAgent ? `${selectedAgent.name}のアクション` : '全エージェントのアクション'}
              </p>
            </div>
            <button
              onClick={() => setShowAddAction(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規アクション</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">未着手</span>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">進行中</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">完了</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">緊急</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.urgent}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">総アクション</span>
                <Activity className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="アクション、対象、担当者で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全タイプ</option>
              {Object.entries(actionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全ステータス</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全優先度</option>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedActions).length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">該当するアクションがありません</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActions).map(([date, dateActions]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-gray-50 py-2">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {dateActions.map(action => {
                      const Icon = actionTypeIcons[action.type]
                      return (
                        <div
                          key={action.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                action.status === 'completed' ? 'bg-green-100' :
                                action.status === 'in-progress' ? 'bg-blue-100' :
                                action.priority === 'urgent' ? 'bg-red-100' :
                                'bg-gray-100'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  action.status === 'completed' ? 'text-green-600' :
                                  action.status === 'in-progress' ? 'text-blue-600' :
                                  action.priority === 'urgent' ? 'text-red-600' :
                                  'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[action.status]}`}>
                                    {statusLabels[action.status]}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[action.priority]}`}>
                                    {priorityLabels[action.priority]}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {action.assignee}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {action.targetType === 'jobseeker' && <User className="w-3 h-3" />}
                                    {action.targetType === 'company' && <Building2 className="w-3 h-3" />}
                                    {action.targetType === 'job' && <Briefcase className="w-3 h-3" />}
                                    {action.targetName}
                                  </span>
                                  {action.completedDate && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      完了: {action.completedDate.toLocaleDateString('ja-JP')}
                                    </span>
                                  )}
                                </div>
                                {action.result && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                    結果: {action.result}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}