'use client'

import { useState } from 'react'
import { Users, Building2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, FileText, Phone, Mail, MapPin, Briefcase, Target, TrendingUp, ArrowRight, Eye, Edit2, MessageSquare, UserCheck, UserX, ClipboardList, DollarSign, ChevronLeft, ChevronDown, Star, Plus, User } from 'lucide-react'
import { JobPosting } from '@/types'
import { mockJobPostingsData } from '@/data/mockJobPostings'
import { UnifiedDetailModal } from '@/components/shared/UnifiedDetailModal'

interface Company {
  id: string
  name: string
  industry: string
  logo?: string
}

interface SelectionStage {
  id: string
  name: string
  order: number
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'withdrawn'
  date?: Date
  assignee?: string
  notes?: string
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  currentTitle: string
  currentCompany: string
  experience: number
  location: string
  desiredSalary: string
  availability: string
  registrationDate: Date
  lastContact?: Date
  assignee?: string
  selections: Selection[]
}

interface Action {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assignees?: string[]
  jobSeekerAssignee?: string
  notes?: string
}

interface Selection {
  id: string
  candidateId: string
  jobPostingId?: string
  jobPosting: JobPosting
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

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: '田中 太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    currentTitle: 'シニアエンジニア',
    currentCompany: '株式会社テックソリューション',
    experience: 8,
    location: '東京都港区',
    desiredSalary: '800-1000万円',
    availability: '即日可能',
    registrationDate: new Date('2024-01-10'),
    lastContact: new Date('2024-01-23'),
    selections: [
      {
        id: 's1',
        candidateId: '1',
        jobPosting: {
          id: 'j1',
          title: 'フロントエンドリードエンジニア',
          companyId: 'c1',
          companyName: '株式会社イノベーション',
          salary: '900-1200万円',
          location: '東京都渋谷区',
          employmentType: 'full-time',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '',
          requirements: [],
          numberOfOpenings: 1
        } as JobPosting,
        status: 'active',
        applicationDate: new Date('2024-01-15'),
        currentStage: '二次面接',
        stages: [
          { id: 'st1', name: '書類選考', order: 1, status: 'passed', date: new Date('2024-01-16'), assignee: '山田 太郎' },
          { id: 'st2', name: '一次面接', order: 2, status: 'passed', date: new Date('2024-01-20'), assignee: '佐藤 花子' },
          { id: 'st3', name: '二次面接', order: 3, status: 'in-progress', date: new Date('2024-01-25'), assignee: '田中 真由美' },
          { id: 'st4', name: '最終面接', order: 4, status: 'pending' },
          { id: 'st5', name: 'オファー', order: 5, status: 'pending' }
        ],
        actions: [
          {
            id: 'a1',
            title: '面接フィードバック送信',
            status: 'pending',
            dueDate: new Date('2024-01-26'),
            assignees: ['member-tanaka'],
            notes: '一次面接の結果を候補者に連絡'
          },
          {
            id: 'a2',
            title: '二次面接日程調整',
            status: 'in-progress',
            dueDate: new Date('2024-01-24'),
            assignees: ['member-sato'],
            jobSeekerAssignee: 'candidate'
          }
        ],
        nextAction: '二次面接実施',
        nextActionDate: new Date('2024-01-25'),
        nextActionAssignee: '田中 真由美'
      },
      {
        id: 's1-2',
        candidateId: '1',
        jobPosting: {
          id: 'j2',
          title: 'プロダクトマネージャー',
          companyId: 'c2',
          companyName: '株式会社テックリード',
          salary: '1000-1400万円',
          location: '東京都港区',
          employmentType: 'full-time',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '',
          requirements: [],
          numberOfOpenings: 1
        } as JobPosting,
        status: 'active',
        applicationDate: new Date('2024-01-18'),
        currentStage: '書類選考',
        stages: [
          { id: 'st1-2', name: '書類選考', order: 1, status: 'in-progress', date: new Date('2024-01-19') },
          { id: 'st2-2', name: '一次面接', order: 2, status: 'pending' },
          { id: 'st3-2', name: '二次面接', order: 3, status: 'pending' },
          { id: 'st4-2', name: '最終面接', order: 4, status: 'pending' }
        ],
        actions: [
          {
            id: 'a3',
            title: '書類選考実施',
            status: 'in-progress',
            dueDate: new Date('2024-01-22'),
            assignees: ['member-yamada']
          }
        ]
      },
      {
        id: 's1-3',
        candidateId: '1',
        jobPosting: {
          id: 'j3',
          title: 'テクニカルディレクター',
          companyId: 'c3',
          companyName: '株式会社デジタルフロンティア',
          salary: '850-1100万円',
          location: '東京都渋谷区',
          employmentType: 'full-time',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '',
          requirements: [],
          numberOfOpenings: 1
        } as JobPosting,
        status: 'rejected',
        applicationDate: new Date('2024-01-10'),
        currentStage: '一次面接',
        stages: [
          { id: 'st1-3', name: '書類選考', order: 1, status: 'passed', date: new Date('2024-01-11') },
          { id: 'st2-3', name: '一次面接', order: 2, status: 'failed', date: new Date('2024-01-14'), notes: '技術力は高いが、マネジメント経験が不足' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    phone: '090-2345-6789',
    currentTitle: 'プロダクトマネージャー',
    currentCompany: '株式会社デジタルトランス',
    experience: 6,
    location: '東京都千代田区',
    desiredSalary: '700-900万円',
    availability: '1ヶ月後',
    registrationDate: new Date('2024-01-12'),
    assignee: '山田 太郎',
    selections: [
      {
        id: 's2',
        candidateId: '2',
        jobPosting: mockJobPostingsData[1],
        status: 'offered',
        applicationDate: new Date('2024-01-12'),
        currentStage: 'オファー',
        stages: [
          { id: 'st21', name: '書類選考', order: 1, status: 'passed', date: new Date('2024-01-13') },
          { id: 'st22', name: '一次面接', order: 2, status: 'passed', date: new Date('2024-01-17') },
          { id: 'st23', name: '二次面接', order: 3, status: 'passed', date: new Date('2024-01-20') },
          { id: 'st24', name: '最終面接', order: 4, status: 'passed', date: new Date('2024-01-22') },
          { id: 'st25', name: 'オファー', order: 5, status: 'in-progress', date: new Date('2024-01-23') }
        ],
        offerDetails: {
          salary: '850万円',
          startDate: new Date('2024-03-01'),
          conditions: ['リモートワーク週3日', 'ストックオプション付与']
        }
      }
    ]
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    phone: '090-3456-7890',
    currentTitle: 'バックエンドエンジニア',
    currentCompany: '株式会社クラウドシステムズ',
    experience: 10,
    location: '神奈川県横浜市',
    desiredSalary: '900-1100万円',
    availability: '2ヶ月後',
    registrationDate: new Date('2024-01-08'),
    selections: []
  }
]

const statusColors: Record<string, string> = {
  active: 'text-blue-600 bg-blue-100',
  offered: 'text-green-600 bg-green-100',
  accepted: 'text-green-800 bg-green-200',
  rejected: 'text-red-600 bg-red-100',
  withdrawn: 'text-gray-600 bg-gray-100',
  'on-hold': 'text-yellow-600 bg-yellow-100'
}

const statusLabels: Record<string, string> = {
  active: '選考中',
  offered: 'オファー中',
  accepted: '内定承諾',
  rejected: '不採用',
  withdrawn: '辞退',
  'on-hold': '保留'
}

const stageStatusIcons: Record<string, JSX.Element> = {
  pending: <Clock className="w-4 h-4 text-gray-400" />,
  'in-progress': <Clock className="w-4 h-4 text-blue-500" />,
  passed: <CheckCircle className="w-4 h-4 text-green-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  withdrawn: <AlertCircle className="w-4 h-4 text-gray-500" />
}

export default function SelectionManagement() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [candidateTab, setCandidateTab] = useState<'info' | 'resume' | 'cv' | 'selection' | 'actions'>('info')
  const [showSelectionEdit, setShowSelectionEdit] = useState(false)
  const [editingSelection, setEditingSelection] = useState<Selection | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showJobSeekerSearch, setShowJobSeekerSearch] = useState(false)

  const handleSaveSelection = (selection: Selection, actions: Action[]) => {
    console.log('保存する選考情報:', selection)
    console.log('保存するアクション:', actions)
    // ここで実際の保存処理を実装
    alert('選考情報を保存しました')
  }

  const getAssigneeLabel = (assignee: string, selection?: Selection, candidate?: Candidate) => {
    if (assignee === 'self') return '自分'
    if (assignee === 'candidate') return candidate?.name || '求職者'
    if (assignee === 'company') return selection?.jobPosting?.company?.name || '企業'
    if (assignee.startsWith('member-')) {
      const memberMap: Record<string, string> = {
        'member-sato': '佐藤 花子',
        'member-tanaka': '田中 真由美',
        'member-suzuki': '鈴木 一郎',
        'member-yamada': '山田 太郎'
      }
      return memberMap[assignee] || assignee
    }
    return assignee
  }

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.currentCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.currentTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAssignee = filterAssignee === 'all' || 
      (filterAssignee === 'unassigned' && !candidate.assignee) ||
      candidate.assignee === filterAssignee
    
    const hasStatus = (status: string) => 
      candidate.selections.some(s => s.status === status)
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && hasStatus('active')) ||
      (filterStatus === 'offered' && hasStatus('offered')) ||
      (filterStatus === 'accepted' && hasStatus('accepted')) ||
      (filterStatus === 'rejected' && hasStatus('rejected'))
    
    return matchesSearch && matchesAssignee && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">選考管理</h1>
        <p className="text-gray-600">候補者の選考プロセスを管理します</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総候補者数</p>
              <p className="text-2xl font-bold text-gray-900">{mockCandidates.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">選考中</p>
              <p className="text-2xl font-bold text-green-600">
                {mockCandidates.filter(c => c.selections.some(s => s.status === 'active')).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">オファー中</p>
              <p className="text-2xl font-bold text-orange-600">
                {mockCandidates.filter(c => c.selections.some(s => s.status === 'offered')).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今週の面接</p>
              <p className="text-2xl font-bold text-purple-600">5</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            onClick={() => setShowJobSeekerSearch(true)}
          >
              <Plus className="w-4 h-4" />
              新規選考を追加
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="候補者を検索..."
              value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <select 
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">全担当者</option>
              <option value="unassigned">未割当</option>
              <option value="山田 太郎">山田 太郎</option>
              <option value="佐藤 花子">佐藤 花子</option>
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">全ステータス</option>
              <option value="active">選考中</option>
              <option value="offered">オファー中</option>
              <option value="accepted">内定承諾</option>
              <option value="rejected">不採用</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCandidate(candidate)}
                  >
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">
                      {candidate.currentTitle} @ {candidate.currentCompany}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{candidate.email}</span>
                      <span>{candidate.phone}</span>
                      {candidate.assignee && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded">担当: {candidate.assignee}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                    onClick={() => setSelectedCandidate(candidate)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Selections */}
              <div className="space-y-3">
                {candidate.selections.map((selection) => {
                  const expandedStates: { [key: string]: boolean } = {}
                  const [isExpanded, setIsExpanded] = useState(false)
                  
                  return (
                    <div key={selection.id} className="border border-gray-200 rounded-lg">
                      <div 
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selection.status === 'offered' ? 'bg-green-50' : selection.status === 'rejected' ? 'bg-red-50' : ''}`}
                        onClick={() => {
                          setEditingSelection(selection)
                          setEditingCandidate(candidate)
                          setShowSelectionEdit(true)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{selection.jobPosting?.title || '求人タイトル未設定'}</h4>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[selection.status]}`}>
                                {statusLabels[selection.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {selection.jobPosting?.company?.name || selection.jobPosting?.companyName || '企業名未設定'} • {selection.jobPosting?.location || '場所未設定'} • {selection.jobPosting?.salary || '給与未設定'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>応募日: {selection.applicationDate.toLocaleDateString('ja-JP')}</span>
                              <span>現在: {selection.currentStage}</span>
                              {selection.nextActionDate && (
                                <span className="text-orange-600">
                                  次回: {selection.nextActionDate.toLocaleDateString('ja-JP')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stage Progress */}
                        <div className="mt-4 flex items-center gap-2">
                          {selection.stages.map((stage, index) => (
                            <div key={stage.id} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1">
                                  {stageStatusIcons[stage.status]}
                                  <span className={`text-xs ${
                                    stage.status === 'passed' ? 'text-green-600' :
                                    stage.status === 'failed' ? 'text-red-600' :
                                    stage.status === 'in-progress' ? 'text-blue-600' :
                                    'text-gray-400'
                                  }`}>
                                    {stage.name}
                                  </span>
                                </div>
                                {stage.date && (
                                  <span className="text-xs text-gray-400 mt-1">
                                    {stage.date.toLocaleDateString('ja-JP')}
                                  </span>
                                )}
                                {stage.assignee && (
                                  <span className="text-xs text-gray-500">
                                    {stage.assignee}
                                  </span>
                                )}
                              </div>
                              {index < selection.stages.length - 1 && (
                                <div className={`w-12 h-0.5 mx-2 ${
                                  stage.status === 'passed' ? 'bg-green-300' :
                                  stage.status === 'failed' ? 'bg-red-300' :
                                  stage.status === 'in-progress' ? 'bg-blue-300' :
                                  'bg-gray-300'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>

                        {selection.offerDetails && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-900 mb-2">オファー条件</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">年収:</span>
                                <span className="ml-2 font-medium">{selection.offerDetails.salary}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">入社日:</span>
                                <span className="ml-2 font-medium">{selection.offerDetails.startDate.toLocaleDateString('ja-JP')}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">条件:</span>
                                <span className="ml-2">{selection.offerDetails.conditions.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {selection.actions && selection.actions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-700 font-medium mb-2">アクション一覧</p>
                            <div className="space-y-2">
                              {selection.actions.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map((action) => (
                                <div key={action.id} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 text-xs rounded ${
                                        action.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {action.status === 'in-progress' ? '進行中' : '未着手'}
                                      </span>
                                      <span className="text-sm text-gray-900">{action.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                      {action.dueDate && (
                                        <span>{action.dueDate.toLocaleDateString('ja-JP')}</span>
                                      )}
                                      {action.assignee && (
                                        <span>{getAssigneeLabel(action.assignee, selection, candidate)}</span>
                                      )}
                                    </div>
                                  </div>
                                  {action.notes && (
                                    <p className="text-xs text-gray-600 mt-1">{action.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selection.notes && (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">メモ</p>
                            <p className="text-sm text-gray-900">{selection.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Detail Modal for Candidate View */}
      {selectedCandidate && !showSelectionEdit && (
        <UnifiedDetailModal
          isOpen={!!selectedCandidate}
          onClose={() => {
            setSelectedCandidate(null)
            setCandidateTab('info')
          }}
          jobSeeker={selectedCandidate}
          selection={selectedCandidate.selections?.[0]}
          initialTab={candidateTab === 'selection' ? 'selection' : candidateTab === 'actions' ? 'actions' : 'basic'}
          mode="jobseeker"
        />
      )}

      {/* Unified Detail Modal for Selection Edit */}
      {showSelectionEdit && editingCandidate && (
        <UnifiedDetailModal
          isOpen={showSelectionEdit}
          onClose={() => {
            setShowSelectionEdit(false)
            setEditingSelection(null)
            setEditingCandidate(null)
          }}
          jobSeeker={editingCandidate}
          selection={editingSelection}
          onSave={handleSaveSelection}
          initialTab="stages"
          mode="selection"
        />
      )}

      {/* 求職者検索モーダル */}
      {showJobSeekerSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">求職者を選択</h2>
              <button
                onClick={() => setShowJobSeekerSearch(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {mockCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // 選考プロセスを開始する処理
                    console.log('選考開始:', candidate)
                    setShowJobSeekerSearch(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                      <p className="text-sm text-gray-600">
                        {candidate.currentTitle} @ {candidate.currentCompany}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}