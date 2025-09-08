'use client'

import { useState } from 'react'
import { JobPosting, JobPostingStatus, JobApplication } from '@/types'
import {
  Search,
  Filter,
  Plus,
  Eye,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Building,
  Clock,
  UserPlus,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface AgentJobListProps {
  jobPostings: JobPosting[]
  jobApplications: JobApplication[]
  currentAgentId: string
  onViewJobPosting: (jobPosting: JobPosting) => void
  onRecommendToJob: (jobPostingId: string) => void
}

const statusLabels: Record<JobPostingStatus, { label: string; color: string }> = {
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
  published: { label: '公開中', color: 'bg-green-100 text-green-800' },
  active: { label: 'アクティブ', color: 'bg-green-100 text-green-800' },
  closed: { label: '募集終了', color: 'bg-red-100 text-red-800' },
  on_hold: { label: '一時停止', color: 'bg-yellow-100 text-yellow-800' },
  filled: { label: '採用済み', color: 'bg-blue-100 text-blue-800' }
}

const employmentTypeLabels = {
  'full-time': '正社員',
  'part-time': 'パート・アルバイト',
  'contract': '契約社員',
  'freelance': 'フリーランス',
  'intern': 'インターン'
}

export function AgentJobList({
  jobPostings,
  jobApplications,
  currentAgentId,
  onViewJobPosting,
  onRecommendToJob
}: AgentJobListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobPostingStatus | 'all'>('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const itemsPerPage = 10

  // Filter only active job postings
  const activeJobPostings = jobPostings.filter(jp => 
    jp.status === 'published' || jp.status === 'active'
  )

  // Filtering
  const filteredJobPostings = activeJobPostings.filter(jobPosting => {
    const companyName = typeof jobPosting.company === 'string' 
      ? jobPosting.company 
      : jobPosting.company?.name || jobPosting.companyName || ''
    
    const matchesSearch = 
      jobPosting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || jobPosting.status === selectedStatus
    
    const matchesEmploymentType = selectedEmploymentType === 'all' || 
      jobPosting.employmentType === selectedEmploymentType
    
    return matchesSearch && matchesStatus && matchesEmploymentType
  })

  // Pagination
  const totalPages = Math.ceil(filteredJobPostings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobPostings = filteredJobPostings.slice(startIndex, endIndex)

  // Get agent's recommendations count
  const getAgentRecommendations = (jobPostingId: string) => {
    return jobApplications.filter(app => 
      app.jobPostingId === jobPostingId && 
      app.source === 'agent' &&
      app.agentId === currentAgentId
    ).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">求人管理（エージェント）</h2>
          <p className="mt-1 text-sm text-gray-600">
            推薦可能な求人案件の一覧
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="求人タイトル、企業名、部門、勤務地で検索"
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
                  雇用形態
                </label>
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => setSelectedEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  {Object.entries(employmentTypeLabels).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
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
              <p className="text-sm font-medium text-gray-600">募集中の求人</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{activeJobPostings.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">推薦実績</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {jobApplications.filter(app => 
                  app.source === 'agent' && app.agentId === currentAgentId
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
                {jobApplications.filter(app => 
                  app.source === 'agent' && 
                  app.agentId === currentAgentId &&
                  app.status === 'interviewing'
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">採用成功</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {jobApplications.filter(app => 
                  app.source === 'agent' && 
                  app.agentId === currentAgentId &&
                  app.status === 'accepted'
                ).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Job postings table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  企業名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部門
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  勤務地
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  雇用形態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  給与
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  募集状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推薦状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公開日
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentJobPostings.map((jobPosting) => {
                const agentRecommendations = getAgentRecommendations(jobPosting.id)
                const totalApplications = jobApplications.filter(app => 
                  app.jobPostingId === jobPosting.id
                ).length
                
                return (
                  <tr key={jobPosting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {jobPosting.title}
                        </div>
                        {jobPosting.isUrgent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full mt-1">
                            <AlertCircle className="w-3 h-3" />
                            急募
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof jobPosting.company === 'string' 
                          ? jobPosting.company 
                          : jobPosting.company?.name || jobPosting.companyName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{jobPosting.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {jobPosting.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                        {employmentTypeLabels[jobPosting.employmentType] || jobPosting.employmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {jobPosting.salaryRange ? (
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            ¥{(jobPosting.salaryRange.min / 10000).toFixed(0)}万 - 
                            ¥{(jobPosting.salaryRange.max / 10000).toFixed(0)}万
                          </div>
                          <div className="text-gray-500 text-xs">
                            {jobPosting.salaryRange.period === 'yearly' ? '年収' : 
                             jobPosting.salaryRange.period === 'monthly' ? '月給' : '時給'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-medium">{totalApplications}</span>
                          <span className="text-gray-500">/ {jobPosting.numberOfOpenings}</span>
                        </div>
                        {totalApplications >= jobPosting.numberOfOpenings && (
                          <div className="text-xs text-orange-600 mt-1">定員到達</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {agentRecommendations > 0 ? (
                          <div>
                            <span className="flex items-center gap-1 text-green-600">
                              <UserPlus className="w-4 h-4" />
                              {agentRecommendations}名推薦済
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">未推薦</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {jobPosting.publishedAt 
                          ? new Date(jobPosting.publishedAt).toLocaleDateString('ja-JP')
                          : '-'
                        }
                      </div>
                      {jobPosting.closingDate && (
                        <div className="text-xs text-gray-400">
                          期限: {new Date(jobPosting.closingDate).toLocaleDateString('ja-JP')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewJobPosting(jobPosting)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          詳細
                        </button>
                        <button
                          onClick={() => onRecommendToJob(jobPosting.id)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          推薦
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
              {filteredJobPostings.length}件中 {startIndex + 1}-{Math.min(endIndex, filteredJobPostings.length)}件を表示
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