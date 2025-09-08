'use client'

import { useState } from 'react'
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  X,
  User,
  Building2,
  Briefcase,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  AlertTriangle,
  CalendarDays
} from 'lucide-react'

interface Action {
  id: string
  type: 'call' | 'email' | 'meeting' | 'interview' | 'document' | 'follow-up' | 'task'
  title: string
  description: string
  targetType: 'jobseeker' | 'company' | 'job'
  targetName: string
  targetId: string
  assignee: string
  status: 'todo' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  dueTime?: string
  completedDate?: Date
  notes?: string
  result?: string
  tags?: string[]
  relatedItems?: {
    type: string
    name: string
    id: string
  }[]
}

const actionTypeConfig = {
  call: { icon: Phone, label: '電話', color: 'blue' },
  email: { icon: Mail, label: 'メール', color: 'green' },
  meeting: { icon: Calendar, label: '面談', color: 'purple' },
  interview: { icon: ClipboardList, label: '面接', color: 'orange' },
  document: { icon: FileText, label: '書類', color: 'gray' },
  'follow-up': { icon: MessageSquare, label: 'フォロー', color: 'indigo' },
  task: { icon: ClipboardList, label: 'タスク', color: 'pink' }
}

const statusConfig = {
  todo: { label: '未着手', color: 'gray', icon: Clock },
  'in-progress': { label: '進行中', color: 'blue', icon: Clock },
  completed: { label: '完了', color: 'green', icon: CheckCircle },
  overdue: { label: '期限超過', color: 'red', icon: AlertCircle }
}

const priorityConfig = {
  low: { label: '低', color: 'gray' },
  medium: { label: '中', color: 'blue' },
  high: { label: '高', color: 'orange' },
  urgent: { label: '緊急', color: 'red' }
}

// Mock data with various dates (using dates relative to today for better demonstration)
const today = new Date()
const getDateFromToday = (daysOffset: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + daysOffset)
  return date
}

const mockActions: Action[] = [
  // Overdue actions
  {
    id: '1',
    type: 'call',
    title: '田中太郎様 - 初回ヒアリング',
    description: '転職意向の確認と希望条件のヒアリング',
    targetType: 'jobseeker',
    targetName: '田中太郎',
    targetId: 'js1',
    assignee: '山田花子',
    status: 'overdue',
    priority: 'high',
    dueDate: getDateFromToday(-3),
    dueTime: '14:00',
    tags: ['新規', '優先対応'],
    relatedItems: [
      { type: 'job', name: 'フロントエンドエンジニア', id: 'j1' },
      { type: 'company', name: '株式会社テックイノベーション', id: 'c1' }
    ]
  },
  {
    id: '2',
    type: 'document',
    title: '職務経歴書の修正依頼',
    description: '高橋様の職務経歴書の内容確認と修正',
    targetType: 'jobseeker',
    targetName: '高橋美咲',
    targetId: 'js3',
    assignee: '佐藤次郎',
    status: 'overdue',
    priority: 'high',
    dueDate: getDateFromToday(-1),
    tags: ['要対応', '書類不備']
  },
  // Today's actions
  {
    id: '3',
    type: 'meeting',
    title: '企業面談 - テックソリューション',
    description: '新規求人の要件定義ミーティング',
    targetType: 'company',
    targetName: '株式会社テックソリューション',
    targetId: 'c3',
    assignee: '佐藤次郎',
    status: 'todo',
    priority: 'urgent',
    dueDate: getDateFromToday(0),
    dueTime: '10:00',
    tags: ['重要', '新規案件']
  },
  {
    id: '4',
    type: 'call',
    title: 'オファー面談 - 中村様',
    description: '内定条件の説明と入社意思確認',
    targetType: 'jobseeker',
    targetName: '中村大輔',
    targetId: 'js5',
    assignee: '山田花子',
    status: 'todo',
    priority: 'urgent',
    dueDate: getDateFromToday(0),
    dueTime: '15:00',
    tags: ['内定', '最優先'],
    relatedItems: [
      { type: 'job', name: 'プロダクトマネージャー', id: 'j3' },
      { type: 'company', name: '株式会社イノベーションラボ', id: 'c5' }
    ]
  },
  {
    id: '5',
    type: 'email',
    title: '求人票送付 - ABC商事',
    description: 'フロントエンド案件の詳細資料を送付',
    targetType: 'company',
    targetName: '株式会社ABC商事',
    targetId: 'c2',
    assignee: '山田花子',
    status: 'in-progress',
    priority: 'medium',
    dueDate: getDateFromToday(0),
    dueTime: '17:00',
    notes: '採用担当者の田中様宛に送付済み。返答待ち。'
  },
  // Tomorrow's actions
  {
    id: '6',
    type: 'interview',
    title: '一次面接調整 - 鈴木様',
    description: 'バックエンドエンジニア職の一次面接',
    targetType: 'jobseeker',
    targetName: '鈴木一郎',
    targetId: 'js2',
    assignee: '山田花子',
    status: 'todo',
    priority: 'high',
    dueDate: getDateFromToday(1),
    dueTime: '14:00',
    relatedItems: [
      { type: 'job', name: 'バックエンドエンジニア', id: 'j2' },
      { type: 'company', name: '株式会社デジタルクラフト', id: 'c4' }
    ]
  },
  {
    id: '7',
    type: 'follow-up',
    title: '面接後フォロー - 渡辺様',
    description: '二次面接の結果確認と今後の進め方相談',
    targetType: 'jobseeker',
    targetName: '渡辺健',
    targetId: 'js4',
    assignee: '山田花子',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateFromToday(1),
    dueTime: '16:00'
  },
  // This week's actions
  {
    id: '8',
    type: 'email',
    title: '応募書類送付 - 佐々木様',
    description: 'データサイエンティスト職への応募',
    targetType: 'jobseeker',
    targetName: '佐々木真由',
    targetId: 'js6',
    assignee: '佐藤次郎',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateFromToday(3),
    dueTime: '15:00'
  },
  {
    id: '9',
    type: 'meeting',
    title: 'キャリア面談 - 加藤様',
    description: '転職活動の進捗確認と今後の戦略',
    targetType: 'jobseeker',
    targetName: '加藤健一',
    targetId: 'js8',
    assignee: '山田花子',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateFromToday(4),
    dueTime: '11:00',
    tags: ['定期面談']
  },
  {
    id: '10',
    type: 'call',
    title: '企業フォローアップ - デジタルクラフト',
    description: '採用進捗の確認と追加求人の相談',
    targetType: 'company',
    targetName: '株式会社デジタルクラフト',
    targetId: 'c4',
    assignee: '佐藤次郎',
    status: 'todo',
    priority: 'low',
    dueDate: getDateFromToday(5),
    dueTime: '14:00'
  },
  // Next week's actions
  {
    id: '11',
    type: 'task',
    title: '週次レポート作成',
    description: '今週の活動実績レポート作成',
    targetType: 'company',
    targetName: '全クライアント',
    targetId: 'all',
    assignee: '佐藤次郎',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateFromToday(7),
    notes: '毎週月曜日提出'
  },
  {
    id: '12',
    type: 'meeting',
    title: '転職相談 - 林様',
    description: '初回キャリアカウンセリング',
    targetType: 'jobseeker',
    targetName: '林健太',
    targetId: 'js7',
    assignee: '山田花子',
    status: 'todo',
    priority: 'low',
    dueDate: getDateFromToday(8),
    dueTime: '13:00'
  },
  {
    id: '13',
    type: 'interview',
    title: '最終面接 - 山本様',
    description: 'プロジェクトマネージャー職の最終面接',
    targetType: 'jobseeker',
    targetName: '山本翔太',
    targetId: 'js9',
    assignee: '山田花子',
    status: 'todo',
    priority: 'high',
    dueDate: getDateFromToday(10),
    dueTime: '15:00',
    relatedItems: [
      { type: 'job', name: 'プロジェクトマネージャー', id: 'j4' },
      { type: 'company', name: '株式会社グローバルテック', id: 'c6' }
    ]
  },
  // Later actions
  {
    id: '14',
    type: 'task',
    title: '月次レポート作成',
    description: '今月の活動実績レポート作成',
    targetType: 'company',
    targetName: '全クライアント',
    targetId: 'all',
    assignee: '佐藤次郎',
    status: 'in-progress',
    priority: 'low',
    dueDate: getDateFromToday(20),
    notes: '50%完了済み'
  },
  {
    id: '15',
    type: 'follow-up',
    title: '入社後フォロー - 斎藤様',
    description: '入社1ヶ月後の状況確認',
    targetType: 'jobseeker',
    targetName: '斎藤麻衣',
    targetId: 'js10',
    assignee: '山田花子',
    status: 'todo',
    priority: 'low',
    dueDate: getDateFromToday(30),
    dueTime: '10:00',
    tags: ['アフターフォロー']
  }
]

export default function SimpleActionManagement() {
  const [actions] = useState<Action[]>(mockActions)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('list')
  const [showDetail, setShowDetail] = useState(false)

  // Get today's date without time for comparison
  const todayForComparison = new Date()
  todayForComparison.setHours(0, 0, 0, 0)

  // Filter actions
  const filteredActions = actions.filter(action => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // Sort all actions by deadline (nearest first)
  const sortedActions = [...filteredActions].sort((a, b) => {
    // First sort by date
    const dateCompare = a.dueDate.getTime() - b.dueDate.getTime()
    if (dateCompare !== 0) return dateCompare
    
    // If same date, sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Group actions by deadline for display
  const groupActionsByDeadline = () => {
    const groups: { [key: string]: Action[] } = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      later: []
    }

    sortedActions.forEach(action => {
      const actionDate = new Date(action.dueDate)
      actionDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((actionDate.getTime() - todayForComparison.getTime()) / (1000 * 60 * 60 * 24))

      if (action.status === 'overdue' || daysDiff < 0) {
        groups.overdue.push(action)
      } else if (daysDiff === 0) {
        groups.today.push(action)
      } else if (daysDiff === 1) {
        groups.tomorrow.push(action)
      } else if (daysDiff <= 7) {
        groups.thisWeek.push(action)
      } else if (daysDiff <= 14) {
        groups.nextWeek.push(action)
      } else {
        groups.later.push(action)
      }
    })

    return groups
  }

  const groupedActions = groupActionsByDeadline()

  const groupConfig = {
    overdue: { label: '期限超過', color: 'red', icon: AlertTriangle, bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    today: { label: '今日', color: 'orange', icon: AlertCircle, bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    tomorrow: { label: '明日', color: 'yellow', icon: Clock, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    thisWeek: { label: '今週', color: 'blue', icon: CalendarDays, bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    nextWeek: { label: '来週', color: 'indigo', icon: Calendar, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    later: { label: 'それ以降', color: 'gray', icon: Calendar, bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
  }

  const openActionDetail = (action: Action) => {
    setSelectedAction(action)
    setShowDetail(true)
  }

  const ActionCard = ({ action }: { action: Action }) => {
    const typeConfig = actionTypeConfig[action.type]
    const Icon = typeConfig.icon
    const priorityConf = priorityConfig[action.priority]
    
    return (
      <div
        onClick={() => openActionDetail(action)}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${typeConfig.color}-100 flex-shrink-0`}>
            <Icon className={`w-5 h-5 text-${typeConfig.color}-600`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium text-gray-900 line-clamp-1">
                {action.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full bg-${priorityConf.color}-500`} title={priorityConf.label} />
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {action.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.dueTime || '終日'}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {action.assignee}
              </span>
              {action.tags && action.tags.length > 0 && (
                <div className="flex gap-1">
                  {action.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                  {action.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      +{action.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show detail view if an action is selected
  if (showDetail && selectedAction) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Detail Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowDetail(false)
                  setSelectedAction(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">アクション詳細</h1>
                <p className="text-sm text-gray-600 mt-1">{selectedAction.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                編集
              </button>
              <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                削除
              </button>
              {selectedAction.status !== 'completed' && (
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  完了にする
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status and Priority */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス情報</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">ステータス</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-${statusConfig[selectedAction.status].color}-100 text-${statusConfig[selectedAction.status].color}-700`}>
                      {statusConfig[selectedAction.status].label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">優先度</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-${priorityConfig[selectedAction.priority].color}-100 text-${priorityConfig[selectedAction.priority].color}-700`}>
                      {priorityConfig[selectedAction.priority].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">アクション詳細</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">タイプ</label>
                  <div className="mt-1 flex items-center gap-2">
                    {(() => {
                      const Icon = actionTypeConfig[selectedAction.type].icon
                      return <Icon className={`w-5 h-5 text-${actionTypeConfig[selectedAction.type].color}-600`} />
                    })()}
                    <span className="text-gray-900">{actionTypeConfig[selectedAction.type].label}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">説明</label>
                  <p className="mt-1 text-gray-900">{selectedAction.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-600">期限</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {selectedAction.dueDate.toLocaleDateString('ja-JP')}
                        {selectedAction.dueTime && ` ${selectedAction.dueTime}`}
                      </span>
                    </div>
                  </div>
                  {selectedAction.completedDate && (
                    <div>
                      <label className="text-sm text-gray-600">完了日</label>
                      <div className="mt-1 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-900">
                          {selectedAction.completedDate.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Target Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">対象情報</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">対象</label>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedAction.targetType === 'jobseeker' && <User className="w-4 h-4 text-gray-400" />}
                    {selectedAction.targetType === 'company' && <Building2 className="w-4 h-4 text-gray-400" />}
                    {selectedAction.targetType === 'job' && <Briefcase className="w-4 h-4 text-gray-400" />}
                    <span className="text-gray-900">{selectedAction.targetName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">担当者</label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedAction.assignee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {selectedAction.tags && selectedAction.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">タグ</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedAction.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedAction.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">メモ</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAction.notes}</p>
              </div>
            )}

            {/* Result */}
            {selectedAction.result && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">結果</h2>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800">{selectedAction.result}</p>
                </div>
              </div>
            )}

            {/* Related Items */}
            {selectedAction.relatedItems && selectedAction.relatedItems.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">関連項目</h2>
                <div className="space-y-2">
                  {selectedAction.relatedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        {item.type === 'job' && <Briefcase className="w-4 h-4 text-gray-400" />}
                        {item.type === 'company' && <Building2 className="w-4 h-4 text-gray-400" />}
                        <span className="text-gray-700">{item.name}</span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                          {item.type === 'job' ? '求人' : '企業'}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">アクション管理</h1>
            <p className="text-sm text-gray-600 mt-1">期限が近い順にタスクを表示</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                リスト表示
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                グループ表示
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4" />
              <span>新規アクション</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="アクション、担当者、対象者で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content View */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          // List View - All actions sorted by deadline
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                すべてのアクション（期限順）
                <span className="ml-2 text-sm text-gray-500">{sortedActions.length}件</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {sortedActions.map(action => {
                const typeConfig = actionTypeConfig[action.type]
                const Icon = typeConfig.icon
                const priorityConf = priorityConfig[action.priority]
                const isOverdue = action.dueDate < todayForComparison
                
                return (
                  <div
                    key={action.id}
                    onClick={() => openActionDetail(action)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : `bg-${typeConfig.color}-100`} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${isOverdue ? 'text-red-600' : `text-${typeConfig.color}-600`}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                            {isOverdue && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                期限超過
                              </span>
                            )}
                            <span className={`w-2 h-2 rounded-full bg-${priorityConf.color}-500`} title={priorityConf.label} />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{action.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {action.dueDate.toLocaleDateString('ja-JP', { 
                                month: 'numeric', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                              {action.dueTime && ` ${action.dueTime}`}
                            </span>
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
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
            {sortedActions.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">該当するアクションがありません</p>
              </div>
            )}
          </div>
        ) : (
          // Grouped View - Actions grouped by deadline period
          <div className="space-y-6">
            {Object.entries(groupedActions).map(([key, groupActions]) => {
              if (groupActions.length === 0) return null
              
              const config = groupConfig[key as keyof typeof groupConfig]
              const GroupIcon = config.icon
              
              return (
                <div key={key} className={`rounded-xl ${config.bgColor} border-2 ${config.borderColor}`}>
                  <div className="px-4 py-3 bg-white border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GroupIcon className={`w-5 h-5 text-${config.color}-600`} />
                        <h2 className="font-bold text-lg text-gray-900">{config.label}</h2>
                        {key === 'overdue' && (
                          <span className="ml-2 text-sm text-red-600 font-medium">要対応</span>
                        )}
                      </div>
                      <span className={`px-3 py-1 bg-${config.color}-100 text-${config.color}-700 rounded-full text-sm font-medium`}>
                        {groupActions.length}件
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 bg-white bg-opacity-50">
                    {groupActions.map(action => (
                      <ActionCard key={action.id} action={action} />
                    ))}
                  </div>
                </div>
              )
            })}
            {filteredActions.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">該当するアクションがありません</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
