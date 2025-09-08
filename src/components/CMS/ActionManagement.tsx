'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Building2, Search, Filter, ChevronRight, Plus } from 'lucide-react'
import { UnifiedDetailModal } from '@/components/shared/UnifiedDetailModal'

interface Action {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assignees?: string[]  // Changed to array for multiple assignees
  notes?: string
  jobSeekerName: string
  jobSeekerAssignee?: string  // Added job seeker assignee
  jobTitle: string
  companyName: string
  selectionId: string
}

interface SelectionStage {
  id: string
  name: string
  order: number
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'withdrawn'
  date?: Date | null
  assignee?: string | null
}

interface Selection {
  id: string
  candidateId: string
  jobPostingId?: string
  jobTitle: string
  companyName: string
  status: 'active' | 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'on-hold'
  applicationDate: Date
  currentStage: string
  stages: SelectionStage[]
  actions?: Action[]
  nextAction?: string
  nextActionDate?: Date
  nextActionAssignee?: string
  notes?: string
  offerDetails?: {
    salary: string
    startDate: Date
    conditions: string[]
  }
}

// Mock data for actions
const mockActions: Action[] = [
  // 今日のタスク
  {
    id: 'act1',
    title: '履歴書確認・スクリーニング',
    status: 'pending',
    dueDate: new Date(),
    assignees: ['self'],
    jobSeekerAssignee: 'member-sato',
    notes: 'React/TypeScriptの経験を重点的に確認。過去のプロジェクト実績も評価',
    jobSeekerName: '田中 太郎',
    jobTitle: 'フロントエンドリードエンジニア',
    companyName: '株式会社イノベーション',
    selectionId: 's1'
  },
  {
    id: 'act2',
    title: '一次面接の日程調整',
    status: 'in-progress',
    dueDate: new Date(),
    assignees: ['member-sato', 'self'],
    jobSeekerAssignee: 'member-tanaka',
    notes: '候補者の希望：月・水・金の14:00以降。企業側は来週で調整中',
    jobSeekerName: '鈴木 花子',
    jobTitle: 'バックエンドエンジニア',
    companyName: '株式会社テックソリューション',
    selectionId: 's2'
  },
  {
    id: 'act3',
    title: '面接フィードバック送信',
    status: 'pending',
    dueDate: new Date(),
    assignees: ['self', 'member-yamada'],
    jobSeekerAssignee: 'self',
    notes: '技術面は問題なし。カルチャーフィットについて追加情報を提供',
    jobSeekerName: '佐藤 一郎',
    jobTitle: 'プロダクトマネージャー',
    companyName: 'デジタルイノベーション株式会社',
    selectionId: 's3'
  },
  
  // 明日のタスク
  {
    id: 'act4',
    title: 'オファー条件の最終確認',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    assignees: ['company', 'self'],
    jobSeekerAssignee: 'member-sato',
    notes: '年収レンジ：800-1000万円、RSU付与あり、リモート勤務可',
    jobSeekerName: '山田 美咲',
    jobTitle: 'UXデザイナー',
    companyName: '株式会社クリエイティブ',
    selectionId: 's4'
  },
  {
    id: 'act5',
    title: '候補者へ面接対策資料送付',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    assignees: ['self', 'member-tanaka'],
    jobSeekerAssignee: 'member-yamada',
    notes: '企業の事業内容、技術スタック、面接官の情報をまとめて送付',
    jobSeekerName: '高橋 健太',
    jobTitle: 'DevOpsエンジニア',
    companyName: 'クラウドテック株式会社',
    selectionId: 's5'
  },
  {
    id: 'act6',
    title: '職務経歴書の修正依頼',
    status: 'in-progress',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    assignees: ['candidate'],
    jobSeekerAssignee: 'self',
    notes: '直近のプロジェクト成果を数値で追記してもらう',
    jobSeekerName: '渡辺 理沙',
    jobTitle: 'データサイエンティスト',
    companyName: 'AIソリューション株式会社',
    selectionId: 's6'
  },
  
  // 1週間以内のタスク
  {
    id: 'act7',
    title: '二次面接の実施',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    assignees: ['company', 'self'],
    jobSeekerAssignee: 'member-sato',
    notes: '技術部門責任者との面談。システム設計に関する質問を準備',
    jobSeekerName: '中村 光一',
    jobTitle: 'ソフトウェアアーキテクト',
    companyName: 'エンタープライズ株式会社',
    selectionId: 's7'
  },
  {
    id: 'act8',
    title: 'リファレンスチェック',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    assignees: ['self'],
    jobSeekerAssignee: 'member-tanaka',
    notes: '前職の上司2名に連絡予定',
    jobSeekerName: '斉藤 翔',
    jobTitle: 'SREエンジニア',
    companyName: 'インフラテック株式会社',
    selectionId: 's8'
  },
  {
    id: 'act9',
    title: '最終面接の準備',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    assignees: ['candidate', 'self'],
    jobSeekerAssignee: 'member-yamada',
    notes: 'CEO面談に向けて、ビジョンマッチングの観点で準備',
    jobSeekerName: '木村 真理子',
    jobTitle: 'プロダクトデザイナー',
    companyName: 'デザインファースト株式会社',
    selectionId: 's9'
  },
  
  // 2週間以内のタスク
  {
    id: 'act10',
    title: 'オファー面談の実施',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    assignees: ['company', 'candidate', 'self'],
    jobSeekerAssignee: 'self',
    notes: '条件面の最終調整。入社日の確認も含む',
    jobSeekerName: '加藤 健介',
    jobTitle: 'テクニカルリード',
    companyName: '株式会社グロース',
    selectionId: 's10'
  },
  {
    id: 'act11',
    title: '内定承諾書の送付',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
    assignees: ['self'],
    jobSeekerAssignee: 'member-sato',
    notes: '労働条件通知書と合わせて送付',
    jobSeekerName: '森田 優子',
    jobTitle: 'QAエンジニア',
    companyName: 'クオリティ株式会社',
    selectionId: 's11'
  },
  {
    id: 'act12',
    title: '他社選考状況の確認',
    status: 'in-progress',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 4)),
    assignees: ['self'],
    jobSeekerAssignee: 'member-tanaka',
    notes: '3社並行で選考中。優先順位の確認が必要',
    jobSeekerName: '小林 達也',
    jobTitle: 'バックエンドエンジニア',
    companyName: 'API企業A',
    selectionId: 's12'
  },
  
  // 過去（期限超過）のタスク
  {
    id: 'act13',
    title: '書類提出期限',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    assignees: ['candidate'],
    jobSeekerAssignee: 'self',
    notes: '英文レジュメの提出待ち',
    jobSeekerName: '山口 健',
    jobTitle: 'グローバルエンジニア',
    companyName: '外資系企業B',
    selectionId: 's13'
  },
  {
    id: 'act14',
    title: '面接結果の連絡',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    assignees: ['company'],
    jobSeekerAssignee: 'member-yamada',
    notes: '企業から結果待ち。フォローアップが必要',
    jobSeekerName: '橋本 亮',
    jobTitle: 'フルスタックエンジニア',
    companyName: 'スタートアップC',
    selectionId: 's14'
  },
  
  // 将来のタスク
  {
    id: 'act15',
    title: '年収交渉',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    assignees: ['member-yamada', 'self'],
    jobSeekerAssignee: 'member-tanaka',
    notes: '希望年収と企業提示額に100万円の差。調整中',
    jobSeekerName: '前田 将太',
    jobTitle: 'セキュリティエンジニア',
    companyName: 'セキュリティ企業E',
    selectionId: 's15'
  },
  {
    id: 'act16',
    title: '入社後フォローアップ',
    status: 'pending',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    assignees: ['self'],
    jobSeekerAssignee: 'member-yamada',
    notes: '入社1ヶ月後の定着確認。上司、本人両方にヒアリング',
    jobSeekerName: '岡田 みなみ',
    jobTitle: 'UI/UXデザイナー',
    companyName: 'デザインスタジオF',
    selectionId: 's16'
  }
]

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

// Action assignee options (includes candidate and company)
const actionAssigneeOptions = [
  { value: 'self', label: '自分' },
  { value: 'candidate', label: '求職者' },
  { value: 'company', label: '企業' },
  { value: 'member-sato', label: '佐藤 花子' },
  { value: 'member-tanaka', label: '田中 真由美' },
  { value: 'member-suzuki', label: '鈴木 一郎' },
  { value: 'member-yamada', label: '山田 太郎' },
  { value: 'other', label: 'その他' }
]

// Job seeker assignee options (only people, no candidate or company)
const jobSeekerAssigneeOptions = [
  { value: 'self', label: '自分' },
  { value: 'member-sato', label: '佐藤 花子' },
  { value: 'member-tanaka', label: '田中 真由美' },
  { value: 'member-suzuki', label: '鈴木 一郎' },
  { value: 'member-yamada', label: '山田 太郎' },
  { value: 'other', label: 'その他' }
]

// Mock selection data
const mockSelections: Record<string, Selection> = {
  's1': {
    id: 's1',
    candidateId: '1',
    jobTitle: 'フロントエンドリードエンジニア',
    companyName: '株式会社イノベーション',
    status: 'active',
    applicationDate: new Date('2024-01-15'),
    currentStage: '最終面接',
    stages: [
      { id: 'st1', name: '書類選考', order: 1, status: 'passed', date: new Date('2024-01-15'), assignee: 'self' },
      { id: 'st2', name: '一次面接', order: 2, status: 'passed', date: new Date('2024-01-18'), assignee: 'self' },
      { id: 'st3', name: '二次面接', order: 3, status: 'passed', date: new Date('2024-01-22'), assignee: 'member-sato' },
      { id: 'st4', name: '最終面接', order: 4, status: 'in-progress', date: new Date('2024-01-25'), assignee: 'company' },
    ],
    actions: mockActions.filter(a => a.selectionId === 's1')
  }
}

export function ActionManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterActionAssignees, setFilterActionAssignees] = useState<string[]>([])  // Multiple selection for action assignees
  const [filterJobSeekerAssignee, setFilterJobSeekerAssignee] = useState<string>('all')  // Job seeker assignee filter
  const [filterDateRange, setFilterDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  
  // Modal states
  const [showSelectionEdit, setShowSelectionEdit] = useState(false)
  const [selectedSelection, setSelectedSelection] = useState<Selection | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  // Get assignee label
  const getAssigneeLabel = (value: string | undefined) => {
    if (!value) return ''
    // Check both option sets
    const option = actionAssigneeOptions.find(opt => opt.value === value) || 
                   jobSeekerAssigneeOptions.find(opt => opt.value === value)
    return option?.label || value
  }

  // Handle action click to open selection detail
  const handleActionClick = (action: Action) => {
    const selection = mockSelections[action.selectionId]
    if (selection) {
      // Create mock candidate data
      const mockCandidate = {
        id: '1',
        name: action.jobSeekerName,
        email: 'candidate@example.com',
        phone: '090-1234-5678',
        location: '東京都',
        currentTitle: 'シニアエンジニア',
        currentCompany: '現職企業',
        desiredSalary: '700-900万円',
        availability: '即時可能',
        experience: 8,
        assignee: action.jobSeekerAssignee,
        registrationDate: new Date('2024-11-01'),
        lastContact: new Date('2024-12-15'),
        selections: [selection]
      }
      
      setSelectedSelection(selection)
      setSelectedCandidate(mockCandidate)
      setShowSelectionEdit(true)
    }
  }

  // Handle save from modal
  const handleSaveSelection = (selection: Selection, actions: Action[]) => {
    console.log('Saving selection:', selection)
    console.log('Actions:', actions)
    // ここで実際の保存処理を実装
    alert('保存しました（デモ）')
  }

  // Filter actions based on date range
  const getFilteredByDate = (actions: Action[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filterDateRange) {
      case 'today':
        return actions.filter(a => {
          if (!a.dueDate) return false
          const dueDate = new Date(a.dueDate.getFullYear(), a.dueDate.getMonth(), a.dueDate.getDate())
          return dueDate.getTime() === today.getTime()
        })
      case 'week':
        const weekFromNow = new Date(today)
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return actions.filter(a => {
          if (!a.dueDate) return false
          return a.dueDate >= today && a.dueDate <= weekFromNow
        })
      case 'month':
        const monthFromNow = new Date(today)
        monthFromNow.setMonth(monthFromNow.getMonth() + 1)
        return actions.filter(a => {
          if (!a.dueDate) return false
          return a.dueDate >= today && a.dueDate <= monthFromNow
        })
      case 'all':
      default:
        return actions
    }
  }

  // Filter actions based on all criteria
  const filteredActions = mockActions.filter(action => {
    const matchesSearch = searchTerm === '' || 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.jobSeekerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || action.status === filterStatus
    
    // Check action assignees filter (multiple selection)
    const matchesActionAssignees = filterActionAssignees.length === 0 || 
      (action.assignees && action.assignees.some(a => filterActionAssignees.includes(a)))
    
    // Check job seeker assignee filter
    const matchesJobSeekerAssignee = filterJobSeekerAssignee === 'all' || 
      action.jobSeekerAssignee === filterJobSeekerAssignee
    
    return matchesSearch && matchesStatus && matchesActionAssignees && matchesJobSeekerAssignee
  })

  // Apply date filter
  const dateFilteredActions = getFilteredByDate(filteredActions)

  // Group actions by date
  const groupedActions = dateFilteredActions.reduce((groups, action) => {
    const date = action.dueDate ? action.dueDate.toLocaleDateString('ja-JP') : '期限なし'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(action)
    return groups
  }, {} as Record<string, Action[]>)

  // Sort date keys
  const sortedDateKeys = Object.keys(groupedActions).sort((a, b) => {
    if (a === '期限なし') return 1
    if (b === '期限なし') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">アクション管理</h1>
            <p className="text-gray-600 mt-1">選考に関するアクションを期限ごとに管理</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range */}
          <div>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value as typeof filterDateRange)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">今日</option>
              <option value="week">1週間以内</option>
              <option value="month">1ヶ月以内</option>
              <option value="all">すべて</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">未着手</option>
              <option value="in-progress">進行中</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>

          {/* Action Assignees Multi-select */}
          <div className="relative">
            <div className="dropdown">
              <button
                type="button" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterActionAssignees.length > 0 
                  ? `アクション担当者 (${filterActionAssignees.length})`
                  : 'アクション担当者'
                }
              </button>
              <div className="dropdown-content absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg hidden hover:block">
                {actionAssigneeOptions.map(option => (
                  <label key={option.value} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterActionAssignees.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilterActionAssignees([...filterActionAssignees, option.value])
                        } else {
                          setFilterActionAssignees(filterActionAssignees.filter(v => v !== option.value))
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
                <div className="border-t border-gray-200 px-3 py-2">
                  <button
                    onClick={() => setFilterActionAssignees([])}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    すべてクリア
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Job Seeker Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">求職者担当者</label>
            <select
              value={filterJobSeekerAssignee}
              onChange={(e) => setFilterJobSeekerAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべて</option>
              {jobSeekerAssigneeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions grouped by date */}
      <div className="space-y-6">
        {sortedDateKeys.map(dateKey => {
          const actions = groupedActions[dateKey]
          const isOverdue = dateKey !== '期限なし' && new Date(dateKey) < new Date(new Date().setHours(0, 0, 0, 0))
          
          return (
            <div key={dateKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`px-4 py-3 border-b border-gray-200 ${isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className={`font-medium ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                      {dateKey}
                      {isOverdue && <span className="ml-2 text-sm text-red-600">（期限超過）</span>}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-600">
                    {actions.length}件のアクション
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {actions.map(action => (
                  <div 
                    key={action.id} 
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleActionClick(action)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[action.status]}`}>
                            {statusLabels[action.status]}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <User className="w-4 h-4" />
                              <span>{action.jobSeekerName}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              求職者担当: {getAssigneeLabel(action.jobSeekerAssignee)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Building2 className="w-4 h-4" />
                              <span>{action.companyName}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              アクション担当: {action.assignees?.map(a => getAssigneeLabel(a)).join(', ')}
                            </div>
                          </div>
                        </div>

                        {action.notes && (
                          <p className="text-sm text-gray-500 mt-2">{action.notes}</p>
                        )}
                      </div>

                      <button className="text-gray-400 hover:text-gray-600">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {sortedDateKeys.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">該当するアクションが見つかりません</p>
          </div>
        )}
      </div>

      {/* Unified Detail Modal */}
      <UnifiedDetailModal
        isOpen={showSelectionEdit}
        onClose={() => {
          setShowSelectionEdit(false)
          setSelectedSelection(null)
          setSelectedCandidate(null)
        }}
        jobSeeker={selectedCandidate}
        selection={selectedSelection}
        onSave={handleSaveSelection}
        initialTab="actions"
        mode="selection"
      />
    </div>
  )
}