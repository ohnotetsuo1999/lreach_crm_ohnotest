'use client'

import React, { useState } from 'react'
import { JobSeeker, JobSeekerStatus, JobApplication, JobPosting } from '@/types'
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Link2,
  ExternalLink,
  Users
} from 'lucide-react'

interface JobSeekerListProps {
  jobSeekers: JobSeeker[]
  jobApplications?: JobApplication[]
  jobPostings?: JobPosting[]
  onCreateJobSeeker: () => void
  onEditJobSeeker: (jobSeeker: JobSeeker) => void
  onViewJobSeeker: (jobSeeker: JobSeeker) => void
  onDeleteJobSeeker: (jobSeekerId: string) => void
  onStartChat: (jobSeekerId: string) => void
}

const statusLabels: Record<JobSeekerStatus, { label: string; color: string }> = {
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

const sourceLabels: Record<string, { label: string; color: string; icon: any }> = {
  line: { label: 'LINE', color: 'bg-green-100 text-green-800', icon: MessageCircle },
  web: { label: 'Webサイト', color: 'bg-blue-100 text-blue-800', icon: ExternalLink },
  referral: { label: '紹介', color: 'bg-purple-100 text-purple-800', icon: Users },
  direct: { label: '直接応募', color: 'bg-yellow-100 text-yellow-800', icon: Mail },
  agency: { label: 'エージェント', color: 'bg-orange-100 text-orange-800', icon: Building }
}

export function JobSeekerList({
  jobSeekers,
  jobApplications = [],
  jobPostings = [],
  onCreateJobSeeker,
  onEditJobSeeker,
  onViewJobSeeker,
  onDeleteJobSeeker,
  onStartChat
}: JobSeekerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobSeekerStatus | 'all'>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const itemsPerPage = 10

  // フィルタリング
  const filteredJobSeekers = jobSeekers.filter(jobSeeker => {
    const matchesSearch = 
      jobSeeker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.phone.includes(searchQuery) ||
      jobSeeker.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || jobSeeker.status === selectedStatus
    
    const matchesSource = selectedSource === 'all' || jobSeeker.source === selectedSource
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => jobSeeker.skills.some(s => s.name === skill))
    
    return matchesSearch && matchesStatus && matchesSource && matchesSkills
  })

  // ページネーション
  const totalPages = Math.ceil(filteredJobSeekers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobSeekers = filteredJobSeekers.slice(startIndex, endIndex)

  // すべてのスキルを抽出
  const allSkills = Array.from(
    new Set(jobSeekers.flatMap(js => js.skills.map(s => s.name)))
  ).sort()

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">求職者情報</h2>
          <p className="mt-1 text-sm text-gray-600">
            求職者の情報を管理し、採用プロセスを追跡します
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>インポート</span>
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>エクスポート</span>
          </button>
          <button
            onClick={onCreateJobSeeker}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新規求職者</span>
          </button>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="名前、メール、電話番号、会社名、ポジションで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>フィルター</span>
          </button>
        </div>

        {/* フィルターパネル */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedStatus === 'all'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  {Object.entries(statusLabels).map(([status, { label }]) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status as JobSeekerStatus)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedStatus === status
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  流入経路
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSource('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedSource === 'all'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    すべて
                  </button>
                  {Object.entries(sourceLabels).map(([source, { label }]) => (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedSource === source
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スキル
              </label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill))
                      } else {
                        setSelectedSkills([...selectedSkills, skill])
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 求職者テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求職者情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  連絡先
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募求人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スキル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  流入経路
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentJobSeekers.map((jobSeeker) => (
                <tr key={jobSeeker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {jobSeeker.profileImageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={jobSeeker.profileImageUrl}
                            alt={jobSeeker.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {jobSeeker.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {jobSeeker.name}
                          {jobSeeker.lineUserId && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              <MessageCircle className="w-3 h-3" />
                              LINE
                            </span>
                          )}
                        </div>
                        {jobSeeker.age && (
                          <div className="text-sm text-gray-500">
                            {jobSeeker.age}歳
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{jobSeeker.email}</div>
                      <div className="text-gray-500">{jobSeeker.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const applications = jobApplications.filter(app => app.jobSeekerId === jobSeeker.id)
                      if (applications.length === 0) {
                        return <span className="text-sm text-gray-400">-</span>
                      }
                      return (
                        <div className="space-y-1">
                          {applications.slice(0, 2).map(app => {
                            const job = jobPostings.find(jp => jp.id === app.jobPostingId)
                            if (!job) return null
                            return (
                              <div key={app.id} className="text-sm">
                                <div className="text-gray-900">{job.title}</div>
                                <div className="text-xs text-gray-500">
                                  {job.department} • {new Date(app.appliedAt).toLocaleDateString('ja-JP')}
                                </div>
                              </div>
                            )
                          })}
                          {applications.length > 2 && (
                            <span className="text-xs text-gray-500">
                              他{applications.length - 2}件
                            </span>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    {jobSeeker.skills && jobSeeker.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {jobSeeker.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={skill.id || `skill-${jobSeeker.id}-${index}`}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {jobSeeker.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{jobSeeker.skills.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {jobSeeker.source && sourceLabels[jobSeeker.source] && (
                      <div className="flex items-center gap-1">
                        {React.createElement(sourceLabels[jobSeeker.source].icon, {
                          className: 'w-4 h-4 text-gray-500'
                        })}
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          sourceLabels[jobSeeker.source].color
                        }`}>
                          {sourceLabels[jobSeeker.source].label}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      statusLabels[jobSeeker.status].color
                    }`}>
                      {statusLabels[jobSeeker.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(jobSeeker.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewJobSeeker(jobSeeker)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="詳細"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {jobSeeker.lineUserId && (
                        <button
                          onClick={() => onStartChat(jobSeeker.id)}
                          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                          title="チャット"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditJobSeeker(jobSeeker)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`求職者「${jobSeeker.name}」を削除しますか？`)) {
                            onDeleteJobSeeker(jobSeeker.id)
                          }
                        }}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {filteredJobSeekers.length}件中 {startIndex + 1}-{Math.min(endIndex, filteredJobSeekers.length)}件を表示
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-green-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}