'use client'

import React, { useState } from 'react'
import { JobSeeker, JobApplication, JobPosting } from '@/types'
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  GraduationCap,
  Award,
  Globe,
  FileText,
  Eye,
  Download,
  Edit2,
  Trash2,
  UserPlus,
  Send,
  MessageCircle,
  ChevronRight,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Users,
  Target,
  TrendingUp,
  User,
  BookOpen,
  Printer
} from 'lucide-react'

interface JobSeekerDetailProps {
  jobSeeker: JobSeeker
  jobApplications?: JobApplication[]
  jobPostings?: JobPosting[]
  onClose: () => void
  onEdit?: (jobSeeker: JobSeeker) => void
  onDelete?: (jobSeekerId: string) => void
  onRecommend?: (jobSeekerId: string) => void
  showSelectionInfo?: boolean
  mode?: 'crm' | 'agent'
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

export function JobSeekerDetail({
  jobSeeker,
  jobApplications = [],
  jobPostings = [],
  onClose,
  onEdit,
  onDelete,
  onRecommend,
  showSelectionInfo = false,
  mode = 'crm'
}: JobSeekerDetailProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'resume' | 'cv' | 'selection' | 'actions' | 'history'>('basic')
  const [showResumePreview, setShowResumePreview] = useState(false)
  const [showCvPreview, setShowCvPreview] = useState(false)

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'agent' ? '求職者詳細' : '候補者詳細'}
              </h2>
              {showSelectionInfo && activeApplications.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {activeApplications.length}件の選考中
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'basic'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              基本情報
            </button>
            {showSelectionInfo && (
              <>
                <button
                  onClick={() => setActiveTab('selection')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'selection'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  選考状況
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'actions'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  アクション一覧
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resume'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              履歴書
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cv'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              職務経歴書
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              活動履歴
            </button>
          </nav>
        </div>

        {/* Content */}
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
                  <div className="mt-1">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      statusLabels[jobSeeker.status]?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[jobSeeker.status]?.label || jobSeeker.status}
                    </span>
                  </div>
                  {jobSeeker.currentCompany && (
                    <div className="mt-3 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{jobSeeker.currentCompany}</span>
                      </div>
                      <div className="mt-1 ml-6 text-sm">
                        {jobSeeker.currentPosition}
                      </div>
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
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{jobSeeker.phone}</span>
                  </div>
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

              {/* Career Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">キャリア情報</h4>
                <div className="grid grid-cols-2 gap-4">
                  {jobSeeker.yearsOfExperience && (
                    <div>
                      <div className="text-sm text-gray-500">経験年数</div>
                      <div className="font-medium">{jobSeeker.yearsOfExperience}年</div>
                    </div>
                  )}
                  {jobSeeker.desiredSalary && (
                    <div>
                      <div className="text-sm text-gray-500">希望年収</div>
                      <div className="font-medium">
                        {jobSeeker.desiredSalary.min}-{jobSeeker.desiredSalary.max}万円
                      </div>
                    </div>
                  )}
                  {jobSeeker.desiredWorkLocation && (
                    <div>
                      <div className="text-sm text-gray-500">希望勤務地</div>
                      <div className="font-medium">{jobSeeker.desiredWorkLocation.join(', ')}</div>
                    </div>
                  )}
                  {jobSeeker.availableFrom && (
                    <div>
                      <div className="text-sm text-gray-500">入社可能日</div>
                      <div className="font-medium">
                        {new Date(jobSeeker.availableFrom).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">スキル</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobSeeker.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm"
                      >
                        <span>{skill.name}</span>
                        {skill.level && (
                          <span className="ml-2 text-gray-500">({skill.level})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {jobSeeker.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">備考</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {jobSeeker.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Selection Tab */}
          {activeTab === 'selection' && showSelectionInfo && (
            <div className="space-y-6">
              {/* Selection Stats */}
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

              {/* Active Applications */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">選考中の案件</h4>
                {activeApplications.length > 0 ? (
                  <div className="space-y-3">
                    {activeApplications.map((app) => {
                      const job = jobPostings.find(j => j.id === app.jobPostingId)
                      return (
                        <div key={app.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {job?.title || '求人タイトル不明'}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {job?.company || '企業名不明'}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  応募日: {new Date(app.appliedAt).toLocaleDateString('ja-JP')}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  app.status === 'screening' ? 'bg-yellow-100 text-yellow-800' :
                                  app.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {app.status === 'screening' ? '書類選考中' :
                                   app.status === 'interviewing' ? '面接中' : '応募済み'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">現在選考中の案件はありません</p>
                )}
              </div>

              {/* Application History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">応募履歴</h4>
                {jobApplications.filter(app => app.jobSeekerId === jobSeeker.id).length > 0 ? (
                  <div className="space-y-2">
                    {jobApplications
                      .filter(app => app.jobSeekerId === jobSeeker.id)
                      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                      .map((app) => {
                        const job = jobPostings.find(j => j.id === app.jobPostingId)
                        return (
                          <div key={app.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">
                                  {job?.title || '求人タイトル不明'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {job?.company || '企業名不明'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  app.status === 'hired' ? 'bg-green-100 text-green-800' :
                                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  app.status === 'withdrawn' ? 'bg-gray-100 text-gray-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {app.status === 'hired' ? '採用' :
                                   app.status === 'rejected' ? '不採用' :
                                   app.status === 'withdrawn' ? '辞退' :
                                   '選考中'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(app.appliedAt).toLocaleDateString('ja-JP')}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">応募履歴はありません</p>
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && showSelectionInfo && (
            <div className="space-y-4">
              {/* Actions List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">アクション一覧</h4>
                <div className="space-y-3">
                  {/* Sample Actions */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">未着手</span>
                          <h5 className="font-medium text-gray-900">書類選考結果連絡</h5>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">候補者への書類選考結果の連絡</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            期限: 2024/01/25
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            担当: 山田 太郎
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">進行中</span>
                          <h5 className="font-medium text-gray-900">一次面接日程調整</h5>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">企業と候補者の日程調整中</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            期限: 2024/01/28
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            担当: 佐藤 花子
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">完了</span>
                          <h5 className="font-medium text-gray-900">履歴書確認</h5>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">提出された履歴書の内容確認完了</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            完了: 2024/01/20
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            担当: 田中 真由美
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">期限間近</span>
                          <h5 className="font-medium text-gray-900">参考資料送付</h5>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">面接前の企業情報資料を候補者へ送付</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            期限: 2024/01/23
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            担当: 鈴木 一郎
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Action Button */}
                <div className="mt-4">
                  <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                    + 新しいアクションを追加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">履歴書</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowResumePreview(!showResumePreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showResumePreview ? '編集ビュー' : 'プレビュー'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Printer className="w-4 h-4" />
                    印刷
                  </button>
                </div>
              </div>

              {/* Resume Content */}
              {showResumePreview ? (
                /* Preview Mode - Formatted like actual resume */
                <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg" style={{ minHeight: '842px' }}>
                  {/* Header */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-center mb-4">履 歴 書</h1>
                    <div className="text-sm text-right text-gray-600">
                      {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 現在
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-2">
                      <table className="w-full border-collapse border border-gray-400">
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium w-24">ふりがな</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm" colSpan={2}>{jobSeeker.nameReading || ''}</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">氏名</td>
                            <td className="border border-gray-400 px-2 py-1 text-lg font-bold" colSpan={2}>{jobSeeker.name}</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">生年月日</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">
                              {jobSeeker.birthDate ? new Date(jobSeeker.birthDate).toLocaleDateString('ja-JP') : ''} 
                              （満{jobSeeker.age || '--'}歳）
                            </td>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium w-16">性別</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">現住所</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm" colSpan={2}>
                              〒 {jobSeeker.postalCode || '---'}
                              <br />
                              {jobSeeker.address || ''}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">電話番号</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">{jobSeeker.phone}</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">
                              <span className="font-medium">メール:</span> {jobSeeker.email}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-start justify-center">
                      <div className="w-30 h-40 border-2 border-gray-400 bg-gray-50 flex items-center justify-center text-gray-400">
                        <User className="w-16 h-16" />
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-400">学歴</h3>
                    <table className="w-full border-collapse border border-gray-400">
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-sm w-32 text-center">年月</td>
                          <td className="border border-gray-400 px-2 py-1 text-sm">学歴</td>
                        </tr>
                        {typeof jobSeeker.education === 'string' ? (
                          <tr>
                            <td className="border border-gray-400 px-2 py-1 text-sm text-center">-</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">{jobSeeker.education}</td>
                          </tr>
                        ) : (
                          <>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1 text-sm text-center">-</td>
                              <td className="border border-gray-400 px-2 py-1 text-sm">学歴情報なし</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Work Experience Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-400">職歴</h3>
                    <table className="w-full border-collapse border border-gray-400">
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-sm w-32 text-center">年月</td>
                          <td className="border border-gray-400 px-2 py-1 text-sm">職歴</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-sm text-center">-</td>
                          <td className="border border-gray-400 px-2 py-1 text-sm">
                            {jobSeeker.currentCompany} - {jobSeeker.currentPosition}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-sm text-center"></td>
                          <td className="border border-gray-400 px-2 py-1 text-sm text-center">以上</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Qualifications Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-400">免許・資格</h3>
                    <table className="w-full border-collapse border border-gray-400">
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-sm w-32 text-center">年月</td>
                          <td className="border border-gray-400 px-2 py-1 text-sm">免許・資格</td>
                        </tr>
                        {jobSeeker.certifications && jobSeeker.certifications.length > 0 ? (
                          jobSeeker.certifications.map((cert, index) => (
                            <tr key={index}>
                              <td className="border border-gray-400 px-2 py-1 text-sm text-center">-</td>
                              <td className="border border-gray-400 px-2 py-1 text-sm">{cert.name || cert}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border border-gray-400 px-2 py-1 text-sm text-center">-</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">特になし</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Self PR Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-400">志望動機・自己PR</h3>
                    <div className="border border-gray-400 p-2 min-h-[100px]">
                      <p className="text-sm">{jobSeeker.memo || '記載なし'}</p>
                    </div>
                  </div>

                  {/* Desired Conditions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-bold bg-gray-100 px-2 py-1 border border-gray-400">本人希望記入欄</h3>
                      <table className="w-full border-collapse border border-gray-400">
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium w-24">希望職種</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">{jobSeeker.desiredPosition || '-'}</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">希望給与</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">{jobSeeker.desiredSalary || '-'}</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 bg-gray-100 px-2 py-1 text-sm font-medium">希望勤務地</td>
                            <td className="border border-gray-400 px-2 py-1 text-sm">{jobSeeker.workLocation || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode - Form Fields */
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">学歴</h4>
                    {jobSeeker.education && Array.isArray(jobSeeker.education) && jobSeeker.education.length > 0 ? (
                      <div className="space-y-2">
                        {jobSeeker.education.map((edu, index) => (
                          <div key={index} className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-sm">
                              {edu.startDate} - {edu.endDate || '現在'}
                            </span>
                            <span className="text-sm font-medium">
                              {edu.school} {edu.degree}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : typeof jobSeeker.education === 'string' && jobSeeker.education ? (
                      <p className="text-sm text-gray-700">{jobSeeker.education}</p>
                    ) : (
                      <p className="text-sm text-gray-500">学歴情報はありません</p>
                    )}
                  </div>

                  {jobSeeker.certifications && jobSeeker.certifications.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">資格・免許</h4>
                      <div className="space-y-2">
                        {jobSeeker.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{cert.name || cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {jobSeeker.languages && jobSeeker.languages.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">語学力</h4>
                      <div className="space-y-2">
                        {jobSeeker.languages.map((lang, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{lang.name}</span>
                            <span className="text-sm text-gray-600">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CV Tab */}
          {activeTab === 'cv' && (
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">職務経歴書</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCvPreview(!showCvPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    {showCvPreview ? '編集ビュー' : 'プレビュー'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Printer className="w-4 h-4" />
                    印刷
                  </button>
                </div>
              </div>

              {/* CV Content */}
              {showCvPreview ? (
                /* Preview Mode - Formatted like actual CV */
                <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-lg" style={{ minHeight: '842px' }}>
                  {/* Header */}
                  <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-center mb-2">職 務 経 歴 書</h1>
                    <div className="text-sm text-right text-gray-600">
                      {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 現在
                    </div>
                    <div className="text-right mt-2">
                      <p className="text-sm">氏名: <span className="font-bold text-lg ml-2">{jobSeeker.name}</span></p>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-3">職務要約</h2>
                    <div className="px-3">
                      <p className="text-sm leading-relaxed">
                        {jobSeeker.experience || '経験年数'}の実務経験を有し、
                        {jobSeeker.currentPosition}として{jobSeeker.currentCompany}に勤務。
                        主に{jobSeeker.skills?.slice(0, 3).join('、')}などのスキルを活用した業務に従事。
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-3">活かせる経験・知識・技術</h2>
                    <div className="px-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-bold text-sm mb-2">【技術スキル】</h3>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {jobSeeker.skills?.map((skill, index) => (
                              <li key={index}>{typeof skill === 'string' ? skill : skill.name}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm mb-2">【資格】</h3>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {jobSeeker.certifications && jobSeeker.certifications.length > 0 ? (
                              jobSeeker.certifications.map((cert, index) => (
                                <li key={index}>{typeof cert === 'string' ? cert : cert.name}</li>
                              ))
                            ) : (
                              <li>特になし</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Experience Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-3">職務経歴</h2>
                    <div className="px-3 space-y-6">
                      {/* Current Position */}
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">現在</span>
                        </div>
                        <h3 className="font-bold text-base mb-1">{jobSeeker.currentCompany}</h3>
                        <p className="text-sm text-gray-700 mb-2">
                          職種: {jobSeeker.currentPosition}
                        </p>
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-bold text-sm mb-2">【業務内容】</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>プロジェクトの企画・設計・開発</li>
                            <li>チームメンバーの技術指導とコードレビュー</li>
                            <li>クライアントとの要件定義・仕様調整</li>
                          </ul>
                          <h4 className="font-bold text-sm mt-3 mb-2">【実績・成果】</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>主要プロジェクトの納期内完了（100%達成）</li>
                            <li>開発効率の30%向上を実現</li>
                            <li>新規技術の導入によるコスト削減</li>
                          </ul>
                        </div>
                      </div>

                      {/* Previous Positions (if any) */}
                      {jobSeeker.workHistory && jobSeeker.workHistory.length > 0 && (
                        jobSeeker.workHistory.map((work, index) => (
                          <div key={index} className="border-l-4 border-gray-400 pl-4">
                            <div className="mb-2">
                              <span className="text-sm text-gray-600">
                                {work.startDate} - {work.endDate || '現在'}
                              </span>
                            </div>
                            <h3 className="font-bold text-base mb-1">{work.company}</h3>
                            <p className="text-sm text-gray-700 mb-2">
                              職種: {work.position}
                            </p>
                            {work.description && (
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm">{work.description}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Self PR Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-3">自己PR</h2>
                    <div className="px-3">
                      <p className="text-sm leading-relaxed">
                        {jobSeeker.memo || `${jobSeeker.experience}の経験を活かし、貴社の事業に貢献したいと考えております。`}
                      </p>
                    </div>
                  </div>

                  {/* Desired Conditions */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-3">希望条件</h2>
                    <div className="px-3">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 font-bold w-32">希望職種</td>
                            <td className="py-2">{jobSeeker.desiredPosition || '-'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 font-bold">希望年収</td>
                            <td className="py-2">{jobSeeker.desiredSalary || '-'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 font-bold">希望勤務地</td>
                            <td className="py-2">{jobSeeker.workLocation || '-'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-bold">転職可能時期</td>
                            <td className="py-2">即日可能</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode - Form Fields */
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">職務経歴</h4>
                    {jobSeeker.workExperience && jobSeeker.workExperience.length > 0 ? (
                      <div className="space-y-4">
                        {jobSeeker.workExperience.map((exp, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{exp.company}</div>
                                <div className="text-sm text-gray-600">{exp.position}</div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {exp.startDate} - {exp.endDate || '現在'}
                              </span>
                            </div>
                            {exp.description && (
                              <p className="text-sm text-gray-700">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="border-l-4 border-green-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{jobSeeker.currentCompany}</div>
                              <div className="text-sm text-gray-600">{jobSeeker.currentPosition}</div>
                            </div>
                            <span className="text-sm text-gray-500">現在</span>
                          </div>
                          <p className="text-sm text-gray-700">経験: {jobSeeker.experience}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">スキルセット</h4>
                    <div className="flex flex-wrap gap-2">
                      {jobSeeker.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">活動履歴</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">プロフィール更新</div>
                      <div className="text-xs text-gray-500">2024年1月20日 14:30</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">面接完了</div>
                      <div className="text-xs text-gray-500">2024年1月18日 10:00</div>
                      <div className="text-xs text-gray-600 mt-1">
                        株式会社イノベーション - フロントエンドエンジニア
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">書類選考通過</div>
                      <div className="text-xs text-gray-500">2024年1月15日 16:00</div>
                      <div className="text-xs text-gray-600 mt-1">
                        株式会社イノベーション - フロントエンドエンジニア
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">初回登録</div>
                      <div className="text-xs text-gray-500">
                        {new Date(jobSeeker.createdAt).toLocaleDateString('ja-JP')} 
                        {' '}
                        {new Date(jobSeeker.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {onRecommend && mode === 'agent' && (
              <button
                onClick={() => {
                  onRecommend(jobSeeker.id)
                  onClose()
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>推薦する</span>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(jobSeeker)
                  onClose()
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>編集</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`${jobSeeker.name}を削除しますか？`)) {
                    onDelete(jobSeeker.id)
                    onClose()
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}