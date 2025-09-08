'use client'

import React, { useState } from 'react'
import { 
  XCircle, MapPin, DollarSign, Clock, Building2, Users, 
  Calendar, Eye, Send, Edit2, Trash2, Copy, Globe, Pause, Play,
  CheckCircle, Star, Briefcase, TrendingUp, Award, Heart
} from 'lucide-react'

interface JobPosting {
  id: string
  title: string
  company: string
  companyLogo?: string
  employmentType: '正社員' | '契約社員' | 'パート・アルバイト' | '業務委託' | 'インターン'
  location: string
  salaryMin: number
  salaryMax: number
  salaryType: '年収' | '月給' | '時給'
  description: string
  requirements: string[]
  benefits: string[]
  status: 'draft' | 'published' | 'paused' | 'expired'
  publishedAt?: Date
  expiresAt?: Date
  viewCount: number
  applyCount: number
  createdAt: Date
  updatedAt: Date
  isPublic?: boolean
  department?: string
  experienceLevel?: string
  workStyle?: string[]
}

interface JobDetailModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobPosting | null
  onEdit?: (job: JobPosting) => void
  onDelete?: (jobId: string) => void
  onPublish?: (jobId: string) => void
  onPause?: (jobId: string) => void
  onDuplicate?: (job: JobPosting) => void
  mode?: 'view' | 'edit'
  showActions?: boolean
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800'
}

const statusLabels = {
  draft: '下書き',
  published: '公開中',
  paused: '一時停止',
  expired: '掲載終了'
}

export function JobDetailModal({ 
  isOpen, 
  onClose, 
  job,
  onEdit,
  onDelete,
  onPublish,
  onPause,
  onDuplicate,
  mode = 'view',
  showActions = true
}: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'requirements' | 'analytics'>('details')

  if (!isOpen || !job) return null

  const formatSalary = () => {
    const min = job.salaryMin.toLocaleString()
    const max = job.salaryMax.toLocaleString()
    return `${min} - ${max}円${job.salaryType === '年収' ? '/年' : job.salaryType === '月給' ? '/月' : '/時'}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">求人詳細</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]}`}>
                {statusLabels[job.status]}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="px-6 py-4 border-b border-gray-200 flex gap-2">
            {job.status === 'draft' && onPublish && (
              <button
                onClick={() => onPublish(job.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                公開する
              </button>
            )}
            {job.status === 'published' && onPause && (
              <button
                onClick={() => onPause(job.id)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                一時停止
              </button>
            )}
            {job.status === 'paused' && onPublish && (
              <button
                onClick={() => onPublish(job.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                再開する
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(job)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                編集
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(job)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                複製
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(job.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              className={`pb-3 px-1 font-medium ${
                activeTab === 'details' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('details')}
            >
              詳細情報
            </button>
            <button
              className={`pb-3 px-1 font-medium ${
                activeTab === 'requirements' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('requirements')}
            >
              応募要件
            </button>
            <button
              className={`pb-3 px-1 font-medium ${
                activeTab === 'analytics' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              分析
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Job Title and Company */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{job.company}</span>
                </div>
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">勤務地</span>
                  </div>
                  <p className="font-medium">{job.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">給与</span>
                  </div>
                  <p className="font-medium">{formatSalary()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">雇用形態</span>
                  </div>
                  <p className="font-medium">{job.employmentType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">掲載期限</span>
                  </div>
                  <p className="font-medium">
                    {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('ja-JP') : '未設定'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">仕事内容</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">福利厚生</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Style */}
              {job.workStyle && job.workStyle.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">勤務スタイル</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.workStyle.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">応募要件</h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {job.experienceLevel && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">経験レベル</h4>
                  <p className="text-gray-600">{job.experienceLevel}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">閲覧数</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{job.viewCount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Send className="w-5 h-5" />
                    <span className="text-sm">応募数</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{job.applyCount.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">応募率</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {job.viewCount > 0 ? ((job.applyCount / job.viewCount) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">掲載情報</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">作成日</span>
                    <span className="font-medium">{new Date(job.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">最終更新日</span>
                    <span className="font-medium">{new Date(job.updatedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  {job.publishedAt && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">公開日</span>
                      <span className="font-medium">{new Date(job.publishedAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                  {job.expiresAt && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">掲載期限</span>
                      <span className="font-medium">{new Date(job.expiresAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}