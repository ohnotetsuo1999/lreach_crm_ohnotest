'use client'

import { useState } from 'react'
import { JobPosting, JobPostingStatus } from '@/types'
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Copy,
  Archive,
  MoreVertical,
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
  ExternalLink
} from 'lucide-react'

interface JobPostingListProps {
  jobPostings: JobPosting[]
  onCreateJobPosting: () => void
  onEditJobPosting: (jobPosting: JobPosting) => void
  onViewJobPosting: (jobPosting: JobPosting) => void
  onDuplicateJobPosting: (jobPosting: JobPosting) => void
  onArchiveJobPosting: (jobPostingId: string) => void
  onUpdateStatus: (jobPostingId: string, status: JobPostingStatus) => void
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

export function JobPostingList({
  jobPostings,
  onCreateJobPosting,
  onEditJobPosting,
  onViewJobPosting,
  onDuplicateJobPosting,
  onArchiveJobPosting,
  onUpdateStatus
}: JobPostingListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobPostingStatus | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'applications'>('newest')
  
  const itemsPerPage = 10

  // すべての部門を抽出
  const departments = Array.from(
    new Set(jobPostings.map(jp => jp.department).filter(Boolean))
  ) as string[]

  // フィルタリング
  const filteredJobPostings = jobPostings.filter(jobPosting => {
    const matchesSearch = 
      jobPosting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || jobPosting.status === selectedStatus
    const matchesDepartment = selectedDepartment === 'all' || jobPosting.department === selectedDepartment
    const matchesEmploymentType = selectedEmploymentType === 'all' || jobPosting.employmentType === selectedEmploymentType
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesEmploymentType
  })

  // ソート
  const sortedJobPostings = [...filteredJobPostings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'applications':
        return (b.applications?.length || 0) - (a.applications?.length || 0)
      default:
        return 0
    }
  })

  // ページネーション
  const totalPages = Math.ceil(sortedJobPostings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentJobPostings = sortedJobPostings.slice(startIndex, endIndex)

  // 統計情報
  const stats = {
    total: jobPostings.length,
    published: jobPostings.filter(jp => jp.status === 'published').length,
    totalApplications: jobPostings.reduce((sum, jp) => sum + (jp.applications?.length || 0), 0),
    totalOpenings: jobPostings.reduce((sum, jp) => sum + jp.numberOfOpenings, 0)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">求人管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            求人情報を管理し、応募状況を追跡します
          </p>
        </div>
        <button
          onClick={onCreateJobPosting}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新規求人</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総求人数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">公開中</p>
              <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総応募数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">募集人数</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalOpenings}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* 検索とフィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="求人タイトル、説明、勤務地、部門で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="applications">応募数順</option>
          </select>
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
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as JobPostingStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {Object.entries(statusLabels).map(([status, { label }]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部門
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
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
        )}
      </div>

      {/* 求人テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人情報
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
                  応募数/募集数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
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
              {currentJobPostings.map((jobPosting) => (
                <tr key={jobPosting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {jobPosting.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {jobPosting.requiredExperience ? `${jobPosting.requiredExperience}年以上` : '経験不問'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Building className="w-4 h-4 text-gray-400" />
                      {jobPosting.department || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {jobPosting.location}
                    </div>
                    {jobPosting.remoteOption && (
                      <div className="text-xs text-gray-500">
                        {
                          {
                            'onsite': 'オンサイト',
                            'remote': 'リモート',
                            'hybrid': 'ハイブリッド'
                          }[jobPosting.remoteOption]
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {employmentTypeLabels[jobPosting.employmentType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {jobPosting.salary ? (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          {jobPosting.salary.currency} {jobPosting.salary.min.toLocaleString()}〜
                        </div>
                        <div className="text-xs text-gray-500">
                          {
                            {
                              'hourly': '時給',
                              'monthly': '月給',
                              'yearly': '年収'
                            }[jobPosting.salary.period]
                          }
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{jobPosting.applications?.length || 0}</span>
                      <span className="text-gray-500"> / {jobPosting.numberOfOpenings}</span>
                    </div>
                    {jobPosting.applications && jobPosting.applications.length >= jobPosting.numberOfOpenings && (
                      <div className="text-xs text-orange-600">定員到達</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      statusLabels[jobPosting.status].color
                    }`}>
                      {statusLabels[jobPosting.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {jobPosting.publishedAt 
                        ? new Date(jobPosting.publishedAt).toLocaleDateString('ja-JP')
                        : '-'
                      }
                    </div>
                    {jobPosting.expiresAt && (
                      <div className="text-xs text-gray-400">
                        期限: {new Date(jobPosting.expiresAt).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewJobPosting(jobPosting)}
                        className="text-green-600 hover:text-green-900"
                      >
                        詳細
                      </button>
                      {(jobPosting.status === 'published' || jobPosting.status === 'active') && (
                        <button
                          onClick={() => window.open(`/jobs/${jobPosting.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="公開URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>公開URL</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
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
    </div>
  )
}