'use client'

import React, { useState } from 'react'
import { Agent, AgentStatus, AgentPermission, JobSeeker, JobPosting } from '@/types'
import {
  ArrowLeft,
  Edit2,
  Shield,
  Mail,
  Phone,
  Building,
  Star,
  Users,
  Award,
  Calendar,
  MessageCircle,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  FileText
} from 'lucide-react'

interface AgentDetailProps {
  agent: Agent
  managedJobSeekers?: JobSeeker[]
  placedCandidates?: JobSeeker[]
  activeJobPostings?: JobPosting[]
  onBack: () => void
  onEdit: (agent: Agent) => void
  onUpdateStatus: (agentId: string, status: AgentStatus) => void
  onUpdatePermissions: (agentId: string, permissions: AgentPermission[]) => void
  onStartChat: (agentId: string) => void
  onViewJobSeeker: (jobSeeker: JobSeeker) => void
  onViewJobPosting: (jobPosting: JobPosting) => void
}

const statusLabels: Record<AgentStatus, { label: string; color: string; icon: any }> = {
  active: { label: 'アクティブ', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  inactive: { label: '非アクティブ', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  suspended: { label: '停止中', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}

const permissionLabels: Record<AgentPermission, { label: string; description: string }> = {
  view_all_candidates: { label: '全候補者閲覧', description: 'すべての求職者情報を閲覧できます' },
  edit_candidates: { label: '候補者編集', description: '求職者情報を編集できます' },
  view_all_jobs: { label: '全求人閲覧', description: 'すべての求人情報を閲覧できます' },
  create_jobs: { label: '求人作成', description: '新しい求人を作成できます' },
  manage_applications: { label: '応募管理', description: '応募情報を管理できます' },
  send_messages: { label: 'メッセージ送信', description: '求職者にメッセージを送信できます' },
  export_data: { label: 'データエクスポート', description: 'データをエクスポートできます' }
}

export function AgentDetail({
  agent,
  managedJobSeekers = [],
  placedCandidates = [],
  activeJobPostings = [],
  onBack,
  onEdit,
  onUpdateStatus,
  onUpdatePermissions,
  onStartChat,
  onViewJobSeeker,
  onViewJobPosting
}: AgentDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'placements' | 'performance' | 'permissions'>('overview')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<AgentPermission[]>(agent.permissions)
  const [isEditingPermissions, setIsEditingPermissions] = useState(false)

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  const handlePermissionToggle = (permission: AgentPermission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
    } else {
      setSelectedPermissions([...selectedPermissions, permission])
    }
  }

  const handleSavePermissions = () => {
    onUpdatePermissions(agent.id, selectedPermissions)
    setIsEditingPermissions(false)
  }

  // パフォーマンス統計
  const performanceStats = {
    conversionRate: placedCandidates.length > 0 ? (placedCandidates.length / managedJobSeekers.length * 100).toFixed(1) : '0',
    averageTimeToPlacement: '23', // ダミーデータ
    monthlyPlacements: '3', // ダミーデータ
    revenue: '2,500,000' // ダミーデータ
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
            <p className="text-sm text-gray-600">エージェント詳細</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartChat(agent.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>チャット開始</span>
          </button>
          <button
            onClick={() => onEdit(agent)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {agent.profileImageUrl ? (
              <img
                src={agent.profileImageUrl}
                alt={agent.name}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-medium text-gray-500">
                  {agent.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{agent.phone}</span>
              </div>
              {agent.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{agent.company}</span>
                  {agent.position && <span className="text-gray-500">/ {agent.position}</span>}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>参加日: {formatDate(agent.joinedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>最終活動: {formatDate(agent.lastActiveAt)}</span>
              </div>
              {agent.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">/ 5.0</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  statusLabels[agent.status].color
                }`}
              >
                {React.createElement(statusLabels[agent.status].icon, { className: 'w-4 h-4' })}
                {statusLabels[agent.status].label}
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {Object.entries(statusLabels).map(([status, { label }]) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdateStatus(agent.id, status as AgentStatus)
                        setShowStatusMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 専門分野 */}
        {agent.specializations && agent.specializations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">専門分野</h4>
            <div className="flex flex-wrap gap-2">
              {agent.specializations.map(spec => (
                <span key={spec} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* パフォーマンスサマリー */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">採用実績</span>
            <Award className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {agent.successfulPlacements || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">総採用数</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">管理候補者</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {agent.activeJobSeekers || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">アクティブ</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">成約率</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {performanceStats.conversionRate}%
          </div>
          <p className="text-xs text-gray-500 mt-1">採用/候補者</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">月間売上</span>
            <DollarSign className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{performanceStats.revenue}
          </div>
          <p className="text-xs text-gray-500 mt-1">今月の実績</p>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg border border-gray-200">
        <nav className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'candidates'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            管理候補者 ({managedJobSeekers.length})
          </button>
          <button
            onClick={() => setActiveTab('placements')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'placements'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            採用実績 ({placedCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'performance'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            パフォーマンス
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'permissions'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            権限管理
          </button>
        </nav>

        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {agent.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">メモ</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{agent.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">最近の活動</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">新規候補者を3名追加</p>
                      <p className="text-xs text-gray-500">2日前</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">求職者とのチャット対応</p>
                      <p className="text-xs text-gray-500">3日前</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">採用成功（エンジニア職）</p>
                      <p className="text-xs text-gray-500">1週間前</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">担当求人</h4>
                <div className="space-y-2">
                  {activeJobPostings.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => onViewJobPosting(job)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.location}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {job.applications?.length || 0}名応募
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 管理候補者タブ */}
          {activeTab === 'candidates' && (
            <div className="space-y-4">
              {managedJobSeekers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">管理中の候補者はいません</p>
              ) : (
                managedJobSeekers.map(jobSeeker => (
                  <div
                    key={jobSeeker.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => onViewJobSeeker(jobSeeker)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {jobSeeker.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{jobSeeker.name}</p>
                        <p className="text-sm text-gray-600">
                          {jobSeeker.currentPosition || '職歴なし'} 
                          {jobSeeker.currentCompany && ` @ ${jobSeeker.currentCompany}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        {
                          new: 'bg-blue-100 text-blue-800',
                          screening: 'bg-yellow-100 text-yellow-800',
                          qualified: 'bg-green-100 text-green-800',
                          interviewing: 'bg-purple-100 text-purple-800',
                          offer_pending: 'bg-orange-100 text-orange-800',
                          hired: 'bg-green-200 text-green-900',
                          rejected: 'bg-red-100 text-red-800',
                          on_hold: 'bg-gray-100 text-gray-800',
                          withdrawn: 'bg-gray-200 text-gray-700'
                        }[jobSeeker.status]
                      }`}>
                        {
                          {
                            new: '新規',
                            screening: 'スクリーニング中',
                            qualified: '適格',
                            interviewing: '面接中',
                            offer_pending: 'オファー検討中',
                            hired: '採用',
                            rejected: '不採用',
                            on_hold: '保留',
                            withdrawn: '辞退'
                          }[jobSeeker.status]
                        }
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 採用実績タブ */}
          {activeTab === 'placements' && (
            <div className="space-y-4">
              {placedCandidates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">まだ採用実績がありません</p>
              ) : (
                placedCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer"
                    onClick={() => onViewJobSeeker(candidate)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-600">
                          {candidate.currentPosition} @ {candidate.currentCompany}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">採用済み</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(candidate.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* パフォーマンスタブ */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">月別採用実績</h5>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">グラフ表示エリア</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">主要指標</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">平均採用期間</span>
                      <span className="text-sm font-medium">{performanceStats.averageTimeToPlacement}日</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">月間採用数</span>
                      <span className="text-sm font-medium">{performanceStats.monthlyPlacements}名</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">候補者満足度</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 権限管理タブ */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">システム権限</h4>
                {!isEditingPermissions ? (
                  <button
                    onClick={() => {
                      setIsEditingPermissions(true)
                      setSelectedPermissions(agent.permissions)
                    }}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    権限を編集
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditingPermissions(false)
                        setSelectedPermissions(agent.permissions)
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {Object.entries(permissionLabels).map(([permission, { label, description }]) => (
                  <div key={permission} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission as AgentPermission)}
                      onChange={() => handlePermissionToggle(permission as AgentPermission)}
                      disabled={!isEditingPermissions}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{description}</p>
                    </div>
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