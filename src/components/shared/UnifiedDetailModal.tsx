'use client'

import React, { useState, useEffect } from 'react'
import { 
  XCircle, History, User, Calendar, FileText, Layers, ListChecks, Info, Plus,
  Mail, Phone, MapPin, Building, GraduationCap, Award, Globe, Eye, Download,
  Edit2, Trash2, UserPlus, Send, MessageCircle, ChevronRight, Briefcase,
  DollarSign, Clock, CheckCircle, AlertCircle, Star, Users, Target, TrendingUp,
  BookOpen, Printer
} from 'lucide-react'
import { JobPosting as ImportedJobPosting, JobSeeker as ImportedJobSeeker } from '@/types'

interface SelectionStage {
  id: string
  name: string
  order: number
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'withdrawn'
  date?: Date | null
  assignee?: string
  notes?: string
}

interface Action {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assignee?: string
  notes?: string
}

interface Selection {
  id: string
  candidateId?: string
  jobPostingId?: string
  jobTitle?: string
  companyName?: string
  status: 'active' | 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'on-hold'
  applicationDate: Date
  currentStage: string
  stages: SelectionStage[]
  actions?: Action[]
  nextAction?: string
  nextActionDate?: Date
  nextActionAssignee?: string
  notes?: string
  jobPosting?: {
    title: string
    company: {
      name: string
    }
    salary?: string
    location?: string
  }
}

type JobSeeker = ImportedJobSeeker & {
  // Additional fields for backward compatibility
  nameReading?: string
  postalCode?: string
  desiredPosition?: string
  desiredWorkLocation?: string[]
  workLocation?: string
  experience?: number | string
  memo?: string
  workExperience?: any[]
  assignee?: string
}

interface HistoryEntry {
  id: string
  timestamp: Date
  user: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  description: string
}

interface JobApplication {
  id: string
  jobSeekerId: string
  jobPostingId: string
  appliedAt: Date
  status: string
}

type JobPosting = ImportedJobPosting

interface UnifiedDetailModalProps {
  isOpen: boolean
  onClose: () => void
  jobSeeker: JobSeeker | null
  selection?: Selection | null
  jobApplications?: JobApplication[]
  jobPostings?: JobPosting[]
  onSave?: (selection: Selection, actions: Action[]) => void
  onEdit?: (jobSeeker: JobSeeker) => void
  onDelete?: (jobSeekerId: string) => void
  onRecommend?: (jobSeekerId: string) => void
  history?: HistoryEntry[]
  initialTab?: 'basic' | 'selection' | 'actions' | 'stages' | 'resume' | 'cv' | 'history'
  mode?: 'jobseeker' | 'selection'
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: '新規', color: 'bg-blue-100 text-blue-800' },
  screening: { label: 'スクリーニング中', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: '適格', color: 'bg-green-100 text-green-800' },
  interviewing: { label: '面接中', color: 'bg-purple-100 text-purple-800' },
  offer_pending: { label: 'オファー検討中', color: 'bg-orange-100 text-orange-800' },
  hired: { label: '採用', color: 'bg-green-200 text-green-900' },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-800' },
  on_hold: { label: '保留', color: 'bg-gray-100 text-gray-800' },
  withdrawn: { label: '辞退', color: 'bg-gray-200 text-gray-700' }
}

export function UnifiedDetailModal({ 
  isOpen, 
  onClose, 
  jobSeeker,
  selection,
  jobApplications = [],
  jobPostings = [],
  onSave,
  onEdit,
  onDelete,
  onRecommend,
  history = [],
  initialTab = 'basic',
  mode = 'jobseeker'
}: UnifiedDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'selection' | 'actions' | 'stages' | 'resume' | 'cv' | 'history'>(initialTab)
  const [editingSelection, setEditingSelection] = useState<Selection | null>(null)
  const [editingActions, setEditingActions] = useState<Action[]>([])
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>([])
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showCvPreview, setShowCvPreview] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  useEffect(() => {
    if (selection) {
      setEditingSelection(selection)
      setEditingActions(selection.actions || [])
    }
  }, [selection])

  useEffect(() => {
    // Initialize with mock history or provided history
    if (!localHistory || localHistory.length === 0) {
      setLocalHistory(history.length > 0 ? history : getMockHistory())
    }
  }, [])

  // Mock history data for demonstration
  const getMockHistory = (): HistoryEntry[] => {
    const now = new Date()
    return [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        user: '山田 太郎',
        action: 'ステータス変更',
        field: 'status',
        oldValue: '書類選考',
        newValue: '一次面接',
        description: '書類選考を通過し、一次面接へ進みました'
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        user: '佐藤 花子',
        action: 'アクション追加',
        description: '面接日程調整のアクションを追加しました'
      }
    ]
  }

  if (!isOpen || !jobSeeker) return null

  const handleAddAction = () => {
    const newAction: Action = {
      id: `new-action-${Date.now()}`,
      title: '',
      status: 'pending',
      dueDate: undefined,
      assignee: '',
      notes: ''
    }
    setEditingActions([...editingActions, newAction])
  }

  const handleUpdateAction = (actionId: string, field: keyof Action, value: any) => {
    setEditingActions(editingActions.map(action => 
      action.id === actionId ? { ...action, [field]: value } : action
    ))
  }

  const handleDeleteAction = (actionId: string) => {
    setEditingActions(editingActions.filter(action => action.id !== actionId))
  }

  const handleSave = () => {
    if (onSave && editingSelection) {
      onSave(editingSelection, editingActions)
    }
    onClose()
  }

  // 応募中の案件を取得
  const activeApplications = jobApplications.filter(app => 
    app.jobSeekerId === jobSeeker.id && 
    ['applied', 'screening', 'interviewing'].includes(app.status)
  )

  // 選考ステージの集計
  const selectionStats = {
    total: jobApplications.filter(app => app.jobSeekerId === jobSeeker.id).length,
    active: activeApplications.length,
    offered: jobApplications.filter(app => 
      app.jobSeekerId === jobSeeker.id && app.status === 'offered'
    ).length,
    hired: jobApplications.filter(app => 
      app.jobSeekerId === jobSeeker.id && app.status === 'hired'
    ).length
  }

  const jobTitle = editingSelection?.jobTitle || editingSelection?.jobPosting?.title || ''
  const companyName = editingSelection?.companyName || 
    (typeof editingSelection?.jobPosting?.company === 'string' 
      ? editingSelection?.jobPosting?.company 
      : editingSelection?.jobPosting?.company?.name) || 
    editingSelection?.jobPosting?.companyName || ''

  // Always show all tabs for consistency
  const showSelectionTabs = true
  const showJobSeekerTabs = true

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                詳細
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {jobSeeker.name}
                {jobTitle && ` - ${jobTitle}`}
                {companyName && ` (${companyName})`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] ${
                activeTab === 'basic' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              <Info className="w-4 h-4" />
              <span className="text-xs">基本情報</span>
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] ${
                activeTab === 'selection' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('selection')}
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-xs">選考状況</span>
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] relative ${
                activeTab === 'stages' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('stages')}
            >
              <Layers className="w-4 h-4" />
              <span className="text-xs">選考ステージ</span>
              {editingSelection?.stages && editingSelection.stages.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {editingSelection.stages.length}
                </span>
              )}
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] relative ${
                activeTab === 'actions' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('actions')}
            >
              <ListChecks className="w-4 h-4" />
              <span className="text-xs">アクション管理</span>
              {editingActions.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {editingActions.length}
                </span>
              )}
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] ${
                activeTab === 'resume' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('resume')}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs">履歴書</span>
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] ${
                activeTab === 'cv' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('cv')}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">職務経歴書</span>
            </button>
            
            <button
              className={`px-4 py-2 font-medium flex flex-col items-center gap-1 min-w-[100px] relative ${
                activeTab === 'history' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4" />
              <span className="text-xs">編集履歴</span>
              {localHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {localHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'basic' && (
            <>
              {/* Basic Info */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {jobSeeker.profileImageUrl ? (
                    <img
                      className="h-24 w-24 rounded-full object-cover"
                      src={jobSeeker.profileImageUrl}
                      alt={jobSeeker.name}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-white font-semibold text-2xl">
                        {jobSeeker.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{jobSeeker.name}</h3>
                  {jobSeeker.status && (
                    <div className="mt-1">
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                        statusLabels[jobSeeker.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {statusLabels[jobSeeker.status]?.label || jobSeeker.status}
                      </span>
                    </div>
                  )}
                  {jobSeeker.currentCompany && (
                    <div className="mt-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{jobSeeker.currentCompany}</span>
                      </div>
                      {jobSeeker.currentPosition && (
                        <div className="mt-1 ml-6 text-sm">
                          {jobSeeker.currentPosition}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">連絡先情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  {jobSeeker.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{jobSeeker.email}</span>
                    </div>
                  )}
                  {jobSeeker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{jobSeeker.phone}</span>
                    </div>
                  )}
                  {jobSeeker.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{jobSeeker.address}</span>
                    </div>
                  )}
                  {jobSeeker.lineStatus && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        LINE: {jobSeeker.lineStatus === 'connected' ? '連携済み' : 
                               jobSeeker.lineStatus === 'blocked' ? 'ブロック' : '未連携'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">スキル</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobSeeker.skills.map((skill: any, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm"
                      >
                        <span>{typeof skill === 'string' ? skill : skill.name}</span>
                        {skill.level && (
                          <span className="ml-2 text-gray-500">({skill.level})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(jobSeeker.notes || jobSeeker.memo) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">備考</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {jobSeeker.notes || jobSeeker.memo}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'selection' && editingSelection && (
            <>
              {/* Selection Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">選考情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">求人</label>
                    <p className="text-sm text-gray-900">{jobTitle}</p>
                    <p className="text-xs text-gray-600">{companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                    <select 
                      value={editingSelection?.status || 'active'}
                      onChange={(e) => {
                        if (editingSelection) {
                          setEditingSelection({
                            ...editingSelection,
                            status: e.target.value as Selection['status']
                          })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="active">選考中</option>
                      <option value="offered">オファー中</option>
                      <option value="accepted">内定承諾</option>
                      <option value="rejected">不採用</option>
                      <option value="withdrawn">辞退</option>
                      <option value="on-hold">保留</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">応募日</label>
                    <input
                      type="date"
                      value={editingSelection?.applicationDate ? new Date(editingSelection.applicationDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (editingSelection && e.target.value) {
                          setEditingSelection({
                            ...editingSelection,
                            applicationDate: new Date(e.target.value)
                          })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">現在ステージ</label>
                    <p className="text-sm text-gray-900">{editingSelection.currentStage || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Selection Stats */}
              {jobApplications.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">応募総数</p>
                        <p className="text-2xl font-bold text-gray-900">{selectionStats.total}</p>
                      </div>
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">選考中</p>
                        <p className="text-2xl font-bold text-blue-600">{selectionStats.active}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">オファー</p>
                        <p className="text-2xl font-bold text-orange-600">{selectionStats.offered}</p>
                      </div>
                      <Star className="w-8 h-8 text-orange-400" />
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">採用</p>
                        <p className="text-2xl font-bold text-green-600">{selectionStats.hired}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">メモ</h3>
                <textarea
                  value={editingSelection?.notes || ''}
                  onChange={(e) => {
                    if (editingSelection) {
                      setEditingSelection({
                        ...editingSelection,
                        notes: e.target.value
                      })
                    }
                  }}
                  placeholder="選考に関するメモを入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
            </>
          )}

          {activeTab === 'stages' && editingSelection && (
            <>
              {/* Selection Stages */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">選考ステージ</h3>
                <div className="space-y-3">
                  {editingSelection?.stages.map((stage) => (
                    <div key={stage.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">ステージ</label>
                          <input
                            type="text"
                            value={stage.name}
                            onChange={(e) => {
                              if (editingSelection) {
                                const updatedStages = editingSelection.stages.map(s =>
                                  s.id === stage.id ? { ...s, name: e.target.value } : s
                                )
                                setEditingSelection({ ...editingSelection, stages: updatedStages })
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">状態</label>
                          <select 
                            value={stage.status}
                            onChange={(e) => {
                              if (editingSelection) {
                                const updatedStages = editingSelection.stages.map(s =>
                                  s.id === stage.id ? { ...s, status: e.target.value as SelectionStage['status'] } : s
                                )
                                setEditingSelection({ ...editingSelection, stages: updatedStages })
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">未実施</option>
                            <option value="in-progress">実施中</option>
                            <option value="passed">合格</option>
                            <option value="failed">不合格</option>
                            <option value="withdrawn">辞退</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">日付</label>
                          <input
                            type="date"
                            value={stage.date ? new Date(stage.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              if (editingSelection) {
                                const updatedStages = editingSelection.stages.map(s =>
                                  s.id === stage.id ? { ...s, date: e.target.value ? new Date(e.target.value) : null } : s
                                )
                                setEditingSelection({ ...editingSelection, stages: updatedStages })
                              }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">担当者</label>
                          <input
                            type="text"
                            value={stage.assignee || ''}
                            onChange={(e) => {
                              if (editingSelection) {
                                const updatedStages = editingSelection.stages.map(s =>
                                  s.id === stage.id ? { ...s, assignee: e.target.value } : s
                                )
                                setEditingSelection({ ...editingSelection, stages: updatedStages })
                              }
                            }}
                            placeholder="担当者名"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
                        <textarea
                          value={stage.notes || ''}
                          onChange={(e) => {
                            if (editingSelection) {
                              const updatedStages = editingSelection.stages.map(s =>
                                s.id === stage.id ? { ...s, notes: e.target.value } : s
                              )
                              setEditingSelection({ ...editingSelection, stages: updatedStages })
                            }
                          }}
                          placeholder="メモを入力"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      if (editingSelection) {
                        const newStage: SelectionStage = {
                          id: `stage-${Date.now()}`,
                          name: '',
                          order: editingSelection.stages.length + 1,
                          status: 'pending',
                          date: null,
                          assignee: '',
                          notes: ''
                        }
                        setEditingSelection({
                          ...editingSelection,
                          stages: [...editingSelection.stages, newStage]
                        })
                      }
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    ステージを追加
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'actions' && (
            <>
              {/* Action Management */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">アクション管理</h3>
                <div className="space-y-3">
                  {editingActions.map((action) => (
                    <div key={action.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => handleDeleteAction(action.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          削除
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">アクション</label>
                          <input
                            type="text"
                            value={action.title}
                            onChange={(e) => handleUpdateAction(action.id, 'title', e.target.value)}
                            placeholder="例: 二次面接実施"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">状態</label>
                          <select 
                            value={action.status}
                            onChange={(e) => handleUpdateAction(action.id, 'status', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">未着手</option>
                            <option value="in-progress">進行中</option>
                            <option value="completed">完了</option>
                            <option value="cancelled">キャンセル</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">期限</label>
                          <input
                            type="date"
                            value={action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleUpdateAction(action.id, 'dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">担当者</label>
                          <select
                            value={action.assignee || ''}
                            onChange={(e) => handleUpdateAction(action.id, 'assignee', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">選択してください</option>
                            <optgroup label="関係者">
                              <option value="self">自分</option>
                              <option value="candidate">{jobSeeker?.name || '求職者'}</option>
                              <option value="company">{companyName || '企業'}</option>
                            </optgroup>
                            <optgroup label="チームメンバー">
                              <option value="member-sato">佐藤 花子</option>
                              <option value="member-tanaka">田中 真由美</option>
                              <option value="member-suzuki">鈴木 一郎</option>
                              <option value="member-yamada">山田 太郎</option>
                            </optgroup>
                            <option value="other">その他</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
                        <textarea
                          value={action.notes || ''}
                          onChange={(e) => handleUpdateAction(action.id, 'notes', e.target.value)}
                          placeholder="アクションに関するメモ"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  {editingActions.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                      アクションがありません
                    </div>
                  )}
                  <button 
                    onClick={handleAddAction}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    アクションを追加
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              {/* Resume content - simplified for brevity */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">履歴書</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Eye className="w-4 h-4" />
                    プレビュー
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600">履歴書コンテンツ</p>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="space-y-4">
              {/* CV content - simplified for brevity */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">職務経歴書</h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Eye className="w-4 h-4" />
                    プレビュー
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600">職務経歴書コンテンツ</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            /* History Tab */
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  変更履歴
                </h3>
                
                {localHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">履歴がありません</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {localHistory.map((entry) => (
                      <div key={entry.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{entry.user}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(entry.timestamp).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {entry.action}
                          </span>
                        </div>
                        
                        <div className="ml-10">
                          <p className="text-sm text-gray-700 mb-1">{entry.description}</p>
                          
                          {entry.oldValue && entry.newValue && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                                {entry.oldValue}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                                {entry.newValue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          {mode === 'jobseeker' && onRecommend && (
            <button
              onClick={() => {
                onRecommend(jobSeeker.id)
                onClose()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <UserPlus className="w-4 h-4" />
              <span>推薦する</span>
            </button>
          )}
          {mode === 'jobseeker' && onEdit && (
            <button
              onClick={() => {
                onEdit(jobSeeker)
                onClose()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Edit2 className="w-4 h-4" />
              <span>編集</span>
            </button>
          )}
          {mode === 'jobseeker' && onDelete && (
            <button
              onClick={() => {
                if (confirm(`${jobSeeker.name}を削除しますか？`)) {
                  onDelete(jobSeeker.id)
                  onClose()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>削除</span>
            </button>
          )}
          {mode === 'selection' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                保存
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}