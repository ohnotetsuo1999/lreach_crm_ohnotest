'use client'

import React, { useState } from 'react'
import { JobPosting, JobApplication, JobSeeker, ApplicationStatus, Interview } from '@/types'
import {
  ArrowLeft,
  Edit2,
  Copy,
  Archive,
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Users,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  MessageCircle,
  Star,
  ChevronRight,
  Target,
  Award,
  BookOpen,
  TrendingUp
} from 'lucide-react'

interface JobPostingDetailProps {
  jobPosting: JobPosting
  applications: JobApplication[]
  jobSeekers: JobSeeker[]
  onBack: () => void
  onEdit: (jobPosting: JobPosting) => void
  onDuplicate: (jobPosting: JobPosting) => void
  onArchive: (jobPostingId: string) => void
  onUpdateStatus: (jobPostingId: string, status: JobPosting['status']) => void
  onViewApplication: (application: JobApplication) => void
  onViewJobSeeker: (jobSeeker: JobSeeker) => void
  onUpdateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void
  onScheduleInterview: (applicationId: string) => void
}

const statusLabels: Record<JobPosting['status'], { label: string; color: string; icon: any }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800', icon: FileText },
  published: { label: '公開中', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  active: { label: 'アクティブ', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  closed: { label: '募集終了', color: 'bg-red-100 text-red-800', icon: XCircle },
  on_hold: { label: '一時停止', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  filled: { label: '採用済み', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
}

const applicationStatusLabels: Record<ApplicationStatus, { label: string; color: string }> = {
  new: { label: '新規', color: 'bg-blue-50 text-blue-700' },
  applied: { label: '応募済み', color: 'bg-blue-100 text-blue-800' },
  reviewing: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
  shortlisted: { label: '候補者リスト入り', color: 'bg-green-100 text-green-800' },
  interviewing: { label: '面接中', color: 'bg-purple-100 text-purple-800' },
  offered: { label: 'オファー済み', color: 'bg-orange-100 text-orange-800' },
  accepted: { label: '承諾', color: 'bg-green-200 text-green-900' },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: '辞退', color: 'bg-gray-200 text-gray-700' }
}

const employmentTypeLabels = {
  'full-time': '正社員',
  'part-time': 'パート・アルバイト',
  'contract': '契約社員',
  'freelance': 'フリーランス',
  'intern': 'インターン'
}

export function JobPostingDetail({
  jobPosting,
  applications,
  jobSeekers,
  onBack,
  onEdit,
  onDuplicate,
  onArchive,
  onUpdateStatus,
  onViewApplication,
  onViewJobSeeker,
  onUpdateApplicationStatus,
  onScheduleInterview
}: JobPostingDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'pipeline' | 'analytics'>('overview')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // 応募者の統計
  const applicationStats = {
    total: applications.length,
    byStatus: Object.entries(applicationStatusLabels).reduce((acc, [status]) => {
      acc[status as ApplicationStatus] = applications.filter(app => app.status === status).length
      return acc
    }, {} as Record<ApplicationStatus, number>),
    averageRating: applications.reduce((sum, app) => sum + (app.averageRating || 0), 0) / 
      applications.filter(app => app.averageRating).length || 0
  }

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus)

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
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
            <h2 className="text-2xl font-bold text-gray-900">{jobPosting.title}</h2>
            <p className="text-sm text-gray-600">求人詳細</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(jobPosting)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
          <button
            onClick={() => onDuplicate(jobPosting)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>複製</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`求人「${jobPosting.title}」をアーカイブしますか？`)) {
                onArchive(jobPosting.id)
              }
            }}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ステータスとメタ情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    statusLabels[jobPosting.status].color
                  }`}
                >
                  {React.createElement(statusLabels[jobPosting.status].icon, { className: 'w-4 h-4' })}
                  {statusLabels[jobPosting.status].label}
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showStatusMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {Object.entries(statusLabels).map(([status, { label }]) => (
                      <button
                        key={status}
                        onClick={() => {
                          onUpdateStatus(jobPosting.id, status as JobPosting['status'])
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
              
              <div className="text-sm text-gray-600">
                作成日: {formatDate(jobPosting.createdAt)}
                {jobPosting.publishedAt && ` / 公開日: ${formatDate(jobPosting.publishedAt)}`}
                {jobPosting.expiresAt && ` / 掲載期限: ${formatDate(jobPosting.expiresAt)}`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{applicationStats.total}</div>
              <div className="text-gray-500">応募者数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{jobPosting.numberOfOpenings}</div>
              <div className="text-gray-500">募集人数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {applicationStats.averageRating.toFixed(1)}
              </div>
              <div className="text-gray-500">平均評価</div>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">部門:</span>
              <span className="text-sm font-medium">{jobPosting.department || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">勤務地:</span>
              <span className="text-sm font-medium">{jobPosting.location}</span>
              {jobPosting.remoteOption && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {
                    {
                      'onsite': 'オンサイト',
                      'remote': 'リモート',
                      'hybrid': 'ハイブリッド'
                    }[jobPosting.remoteOption]
                  }
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">雇用形態:</span>
              <span className="text-sm font-medium">
                {employmentTypeLabels[jobPosting.employmentType]}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {jobPosting.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">給与:</span>
                <span className="text-sm font-medium">
                  {jobPosting.salary.currency} {jobPosting.salary.min.toLocaleString()}〜{jobPosting.salary.max.toLocaleString()}
                  ({
                    {
                      'hourly': '時給',
                      'monthly': '月給',
                      'yearly': '年収'
                    }[jobPosting.salary.period]
                  })
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">必要経験:</span>
              <span className="text-sm font-medium">
                {jobPosting.requiredExperience ? `${jobPosting.requiredExperience}年以上` : '経験不問'}
              </span>
            </div>
            {jobPosting.targetHiringDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">採用目標日:</span>
                <span className="text-sm font-medium">{formatDate(jobPosting.targetHiringDate)}</span>
              </div>
            )}
          </div>
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
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'applications'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            応募者一覧 ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'pipeline'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            採用パイプライン
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'analytics'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            分析
          </button>
        </nav>

        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">求人内容</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">必須要件</h4>
                <ul className="space-y-2">
                  {jobPosting.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">業務内容</h4>
                <ul className="space-y-2">
                  {jobPosting.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <Target className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {jobPosting.preferredQualifications && jobPosting.preferredQualifications.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">歓迎要件</h4>
                  <ul className="space-y-2">
                    {jobPosting.preferredQualifications.map((qual, index) => (
                      <li key={index} className="flex items-start">
                        <Award className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">必須スキル</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobPosting.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {jobPosting.preferredSkills && jobPosting.preferredSkills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">歓迎スキル</h4>
                    <div className="flex flex-wrap gap-2">
                      {jobPosting.preferredSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {jobPosting.benefits && jobPosting.benefits.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">福利厚生</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {jobPosting.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">採用プロセス</h4>
                <div className="flex items-center space-x-2">
                  {jobPosting.hiringProcess.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm mt-1">{stage.name}</span>
                        {stage.estimatedDuration && (
                          <span className="text-xs text-gray-500">{stage.estimatedDuration}日</span>
                        )}
                      </div>
                      {index < jobPosting.hiringProcess.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 応募者一覧タブ */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* フィルター */}
              <div className="flex items-center gap-4 mb-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">すべてのステータス ({applications.length})</option>
                  {Object.entries(applicationStatusLabels).map(([status, { label }]) => (
                    <option key={status} value={status}>
                      {label} ({applicationStats.byStatus[status as ApplicationStatus]})
                    </option>
                  ))}
                </select>
              </div>

              {/* 応募者リスト */}
              <div className="space-y-3">
                {filteredApplications.map(application => {
                  const jobSeeker = jobSeekers.find(js => js.id === application.jobSeekerId)
                  if (!jobSeeker) return null

                  return (
                    <div key={application.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {jobSeeker.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{jobSeeker.name}</h5>
                            <p className="text-sm text-gray-600">{jobSeeker.currentPosition || '経験なし'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              応募日: {formatDate(application.appliedAt)}
                            </p>
                            {application.averageRating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{application.averageRating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">
                                  ({application.ratings?.length || 0}件の評価)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            applicationStatusLabels[application.status].color
                          }`}>
                            {applicationStatusLabels[application.status].label}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onViewJobSeeker(jobSeeker)}
                              className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                              title="求職者詳細"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onViewApplication(application)}
                              className="p-2 text-green-600 hover:bg-white rounded-lg transition-colors"
                              title="応募詳細"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {application.status === 'shortlisted' && (
                              <button
                                onClick={() => onScheduleInterview(application.id)}
                                className="p-2 text-blue-600 hover:bg-white rounded-lg transition-colors"
                                title="面接予約"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 採用パイプラインタブ */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {['applied', 'reviewing', 'interviewing', 'offered'].map(status => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      {applicationStatusLabels[status as ApplicationStatus].label}
                    </h5>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      {applicationStats.byStatus[status as ApplicationStatus]}
                    </div>
                    <div className="space-y-2">
                      {applications
                        .filter(app => app.status === status)
                        .slice(0, 3)
                        .map(app => {
                          const jobSeeker = jobSeekers.find(js => js.id === app.jobSeekerId)
                          return jobSeeker ? (
                            <div key={app.id} className="text-sm text-gray-600 truncate">
                              {jobSeeker.name}
                            </div>
                          ) : null
                        })}
                      {applicationStats.byStatus[status as ApplicationStatus] > 3 && (
                        <div className="text-xs text-gray-500">
                          他{applicationStats.byStatus[status as ApplicationStatus] - 3}名
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 分析タブ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">応募転換率</h5>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12.5%</div>
                  <p className="text-xs text-gray-500 mt-1">閲覧数に対する応募率</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">平均応募時間</h5>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3.2日</div>
                  <p className="text-xs text-gray-500 mt-1">公開から応募までの平均日数</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-700">採用率</h5>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">15%</div>
                  <p className="text-xs text-gray-500 mt-1">応募者に対する採用率</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">ステータス別分布</h5>
                <div className="space-y-2">
                  {Object.entries(applicationStatusLabels).map(([status, { label, color }]) => {
                    const count = applicationStats.byStatus[status as ApplicationStatus]
                    const percentage = (count / applicationStats.total) * 100
                    
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="w-32 text-sm text-gray-600">{label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div
                            className={`h-full rounded-full ${color.split(' ')[0]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-gray-700 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}