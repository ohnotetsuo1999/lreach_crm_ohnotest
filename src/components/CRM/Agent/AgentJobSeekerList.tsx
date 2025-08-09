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
  Calendar,
  Building,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  UserPlus,
  Send,
  FileText,
  Briefcase,
  Users
} from 'lucide-react'

interface AgentJobSeekerListProps {
  jobSeekers: JobSeeker[]
  jobApplications?: JobApplication[]
  jobPostings?: JobPosting[]
  currentAgentId: string
  onCreateJobSeeker: () => void
  onEditJobSeeker: (jobSeeker: JobSeeker) => void
  onViewJobSeeker: (jobSeeker: JobSeeker) => void
  onDeleteJobSeeker: (jobSeekerId: string) => void
  onRecommendJobSeeker: (jobSeekerId: string) => void
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

export function AgentJobSeekerList({
  jobSeekers,
  jobApplications = [],
  jobPostings = [],
  currentAgentId,
  onCreateJobSeeker,
  onEditJobSeeker,
  onViewJobSeeker,
  onDeleteJobSeeker,
  onRecommendJobSeeker
}: AgentJobSeekerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobSeekerStatus | 'all'>('all')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const itemsPerPage = 10

  // Filter job seekers managed by current agent
  const agentJobSeekers = jobSeekers.filter(js => 
    js.source === 'agency' || js.tags?.includes(`agent:${currentAgentId}`)
  )

  // Filtering
  const filteredJobSeekers = agentJobSeekers.filter(jobSeeker => {
    const matchesSearch = 
      jobSeeker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.phone.includes(searchQuery) ||
      jobSeeker.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || jobSeeker.status === selectedStatus
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => jobSeeker.skills.some(s => s.name === skill))
    
    return matchesSearch && matchesStatus && matchesSkills
  })

  // Pagination
  const totalPages = Math.ceil(filteredJobSeekers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobSeekers = filteredJobSeekers.slice(startIndex, endIndex)

  // Get all skills
  const allSkills = Array.from(
    new Set(agentJobSeekers.flatMap(js => js.skills.map(s => s.name)))
  ).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">求職者管理（エージェント）</h2>
          <p className="mt-1 text-sm text-gray-600">
            エージェントとして管理している求職者の一覧
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

      {/* Search and filters */}
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

        {/* Filter panel */}
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
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">管理中の求職者</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{agentJobSeekers.length}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">推薦済み</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {jobApplications.filter(app => 
                  app.source === 'agent' && 
                  agentJobSeekers.some(js => js.id === app.jobSeekerId)
                ).length}
              </p>
            </div>
            <Send className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">面接中</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {agentJobSeekers.filter(js => js.status === 'interviewing').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">採用済み</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {agentJobSeekers.filter(js => js.status === 'hired').length}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Job seeker table */}
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
                  スキル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推薦状況
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
              {currentJobSeekers.map((jobSeeker) => {
                const recommendations = jobApplications.filter(app => 
                  app.jobSeekerId === jobSeeker.id && app.source === 'agent'
                )
                
                return (
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
                          </div>
                          {jobSeeker.currentCompany && (
                            <div className="text-sm text-gray-500">
                              {jobSeeker.currentCompany} - {jobSeeker.currentPosition}
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
                      {jobSeeker.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {jobSeeker.skills.slice(0, 3).map(skill => (
                            <span
                              key={skill.id}
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
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {recommendations.length > 0 ? (
                            <span className="flex items-center gap-1">
                              <Send className="w-4 h-4 text-green-500" />
                              {recommendations.length}件推薦中
                            </span>
                          ) : (
                            <span className="text-gray-500">未推薦</span>
                          )}
                        </div>
                        {recommendations.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            最新: {new Date(recommendations[0].appliedAt).toLocaleDateString('ja-JP')}
                          </div>
                        )}
                      </div>
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
                        <button
                          onClick={() => onRecommendJobSeeker(jobSeeker.id)}
                          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                          title="推薦"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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