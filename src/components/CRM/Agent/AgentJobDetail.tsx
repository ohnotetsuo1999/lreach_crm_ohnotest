'use client'

import { useState } from 'react'
import { JobPosting, JobApplication } from '@/types'
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Building,
  Home,
  Globe,
  FileText,
  Target,
  Zap,
  CheckCircle,
  UserPlus,
  AlertCircle,
  TrendingUp,
  Award,
  Send
} from 'lucide-react'

interface AgentJobDetailProps {
  jobPosting: JobPosting
  jobApplications: JobApplication[]
  currentAgentId: string
  onBack: () => void
  onRecommend: () => void
}

const employmentTypeLabels = {
  'full-time': '正社員',
  'part-time': 'パート・アルバイト',
  'contract': '契約社員',
  'freelance': 'フリーランス',
  'intern': 'インターン'
}

const locationTypeLabels = {
  'onsite': 'オフィス勤務',
  'remote': 'リモート',
  'hybrid': 'ハイブリッド'
}

export function AgentJobDetail({
  jobPosting,
  jobApplications,
  currentAgentId,
  onBack,
  onRecommend
}: AgentJobDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'process' | 'stats'>('overview')

  // Get statistics
  const totalApplications = jobApplications.filter(app => 
    app.jobPostingId === jobPosting.id
  ).length
  
  const agentApplications = jobApplications.filter(app => 
    app.jobPostingId === jobPosting.id && 
    app.source === 'agent' &&
    app.agentId === currentAgentId
  )

  const applicationsByStatus = agentApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{jobPosting.title}</h1>
                {jobPosting.isUrgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    急募
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                {jobPosting.company && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{typeof jobPosting.company === 'string' ? jobPosting.company : jobPosting.company?.name || jobPosting.companyName}</span>
                  </div>
                )}
                {jobPosting.department && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{jobPosting.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{jobPosting.location}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onRecommend}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            候補者を推薦
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">募集人数</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{jobPosting.numberOfOpenings}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">応募総数</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalApplications}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">あなたの推薦</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{agentApplications.length}</p>
            </div>
            <Send className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">採用率</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {agentApplications.length > 0 
                  ? Math.round((applicationsByStatus.accepted || 0) / agentApplications.length * 100)
                  : 0
                }%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
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
              onClick={() => setActiveTab('requirements')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'requirements'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              応募要件
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'process'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              選考プロセス
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'stats'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              推薦実績
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">募集要項</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">雇用形態</p>
                      <p className="mt-1 text-gray-900">
                        {employmentTypeLabels[jobPosting.employmentType] || jobPosting.employmentType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">勤務形態</p>
                      <p className="mt-1 text-gray-900">
                        {locationTypeLabels[jobPosting.locationType] || jobPosting.locationType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">給与</p>
                      {jobPosting.salaryRange ? (
                        <p className="mt-1 text-gray-900">
                          ¥{(jobPosting.salaryRange.min / 10000).toFixed(0)}万 - 
                          ¥{(jobPosting.salaryRange.max / 10000).toFixed(0)}万
                          <span className="text-sm text-gray-500 ml-1">
                            ({jobPosting.salaryRange.period === 'yearly' ? '年収' : 
                              jobPosting.salaryRange.period === 'monthly' ? '月給' : '時給'})
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-400">要相談</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">掲載日</p>
                      <p className="mt-1 text-gray-900">
                        {jobPosting.publishedAt 
                          ? new Date(jobPosting.publishedAt).toLocaleDateString('ja-JP')
                          : '-'
                        }
                      </p>
                    </div>
                    {jobPosting.closingDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">応募締切</p>
                        <p className="mt-1 text-gray-900">
                          {new Date(jobPosting.closingDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">仕事内容</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
              </div>

              {jobPosting.responsibilities && jobPosting.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">主な業務</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {jobPosting.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Requirements tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              {jobPosting.requirements && jobPosting.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">必須条件</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {jobPosting.requirements.map((req, index) => (
                      <li key={index} className="text-gray-700">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {jobPosting.requiredSkills && jobPosting.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">必須スキル</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPosting.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jobPosting.preferredSkills && jobPosting.preferredSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">歓迎スキル</h3>
                  <div className="flex flex-wrap gap-2">
                    {jobPosting.preferredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process tab */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              {jobPosting.hiringProcess && jobPosting.hiringProcess.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">選考フロー</h3>
                  <div className="space-y-4">
                    {jobPosting.hiringProcess.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            目安期間: {step.estimatedDuration}日
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">推薦実績</h3>
                {agentApplications.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">審査中</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                          {applicationsByStatus.reviewing || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">面接中</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                          {applicationsByStatus.interviewing || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600">採用</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                          {applicationsByStatus.accepted || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">
                        この求人に対して、あなたは{agentApplications.length}名の候補者を推薦しています。
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">まだ推薦実績がありません</p>
                    <button
                      onClick={onRecommend}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      最初の候補者を推薦する
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}