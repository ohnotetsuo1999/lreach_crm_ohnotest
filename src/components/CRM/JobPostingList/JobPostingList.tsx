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
  ExternalLink,
  Upload,
  X
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
  published: { label: 'アクティブ', color: 'bg-green-100 text-green-800' },
  active: { label: 'アクティブ', color: 'bg-green-100 text-green-800' },
  closed: { label: '停止', color: 'bg-red-100 text-red-800' },
  on_hold: { label: '保留', color: 'bg-yellow-100 text-yellow-800' },
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
  const [showAddJobPosting, setShowAddJobPosting] = useState(false)
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
  const [newJobPosting, setNewJobPosting] = useState<Partial<JobPosting>>({
    title: '',
    companyName: '',
    description: '',
    requirements: [],
    benefits: [],
    salary: {
      min: 0,
      max: 0,
      currency: 'JPY',
      period: 'yearly' as const
    },
    location: '',
    employmentType: 'full-time',
    department: '',
    status: 'draft' as JobPostingStatus
  })
  
  const itemsPerPage = 10

  // Handle PDF upload and auto-fill for job posting
  const handleJobPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setUploadedPdf(file)
      
      // Simulate PDF parsing and auto-fill
      setTimeout(() => {
        setNewJobPosting(prev => ({
          ...prev,
          title: 'シニアフロントエンドエンジニア',
          companyName: '株式会社テックカンパニー',
          description: 'React/Next.jsを用いた大規模Webアプリケーションの開発をリードしていただきます。',
          requirements: [
            'React/Next.jsでの開発経験3年以上',
            'TypeScriptの実務経験',
            'チーム開発経験',
            'アジャイル開発の経験'
          ],
          benefits: [
            'リモートワーク可',
            'フレックスタイム制',
            '書籍購入支援',
            '資格取得支援'
          ],
          salary: {
            min: 600,
            max: 900,
            currency: 'JPY',
            period: 'yearly' as const
          },
          location: '東京都渋谷区',
          employmentType: 'full-time',
          department: '開発部'
        }))
        alert('PDFから求人情報を読み取りました')
      }, 1000)
    }
  }

  // すべての部門を抽出
  const departments = Array.from(
    new Set((jobPostings || []).map(jp => jp && jp.department).filter(Boolean))
  ) as string[]

  // フィルタリング
  const filteredJobPostings = (jobPostings || []).filter(jobPosting => {
    if (!jobPosting) return false
    const matchesSearch = 
      (jobPosting.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jobPosting.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jobPosting.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jobPosting.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    
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
    total: (jobPostings || []).length,
    published: (jobPostings || []).filter(jp => jp && jp.status === 'published').length,
    totalApplications: (jobPostings || []).reduce((sum, jp) => sum + (jp && jp.applications?.length || 0), 0),
    totalOpenings: (jobPostings || []).reduce((sum, jp) => sum + (jp && jp.numberOfOpenings || 0), 0)
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
          onClick={() => setShowAddJobPosting(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新規求人</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-3 gap-4">
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
                  企業名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人情報
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
                  状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公開日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentJobPostings.map((jobPosting) => {
                if (!jobPosting) return null
                return (
                <tr 
                  key={jobPosting.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewJobPosting(jobPosting)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {jobPosting.companyName || (typeof jobPosting.company === 'string' ? jobPosting.company : jobPosting.company?.name) || '企業名未設定'}
                        </div>
                        {jobPosting.department && (
                          <div className="text-xs text-gray-500">
                            {jobPosting.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {jobPosting.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {jobPosting.requiredExperience ? `経験${jobPosting.requiredExperience}年以上` : '経験不問'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {jobPosting.location || '未設定'}
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
                </tr>
                )
              })}
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

      {/* 新規求人追加モーダル */}
      {showAddJobPosting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">新規求人作成</h3>
                <button
                  onClick={() => {
                    setShowAddJobPosting(false)
                    setNewJobPosting({
                      title: '',
                      companyName: '',
                      description: '',
                      requirements: [],
                      benefits: [],
                      salary: {
      min: 0,
      max: 0,
      currency: 'JPY',
      period: 'yearly' as const
    },
                      location: '',
                      employmentType: 'full-time',
                      department: '',
                      status: 'draft' as JobPostingStatus
                    })
                    setUploadedPdf(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* PDF Upload */}
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">求人票（PDF）をアップロードして自動入力</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleJobPdfUpload}
                    className="hidden"
                    id="job-pdf-upload"
                  />
                  <label
                    htmlFor="job-pdf-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                  >
                    PDFを選択
                  </label>
                  {uploadedPdf && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {uploadedPdf.name} をアップロードしました
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">企業名 *</label>
                    <input
                      type="text"
                      value={newJobPosting.companyName || ''}
                      onChange={(e) => setNewJobPosting({...newJobPosting, companyName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 株式会社〇〇"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">職種名 *</label>
                    <input
                      type="text"
                      value={newJobPosting.title || ''}
                      onChange={(e) => setNewJobPosting({...newJobPosting, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: フロントエンドエンジニア"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">雇用形態</label>
                    <select
                      value={newJobPosting.employmentType || 'full-time'}
                      onChange={(e) => setNewJobPosting({...newJobPosting, employmentType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-time">正社員</option>
                      <option value="part-time">パート・アルバイト</option>
                      <option value="contract">契約社員</option>
                      <option value="freelance">フリーランス</option>
                      <option value="internship">インターン</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">職務内容 *</label>
                  <textarea
                    value={newJobPosting.description || ''}
                    onChange={(e) => setNewJobPosting({...newJobPosting, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="業務内容の詳細を記入してください"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">給与</label>
                    <input
                      type="text"
                      value={newJobPosting.salary ? `${newJobPosting.salary.min}-${newJobPosting.salary.max}万円` : ''}
                      onChange={(e) => {
                        const match = e.target.value.match(/(\d+)-(\d+)/)
                        if (match) {
                          setNewJobPosting({
                            ...newJobPosting, 
                            salary: {
                              min: parseInt(match[1]),
                              max: parseInt(match[2]),
                              currency: 'JPY',
                              period: 'yearly' as const
                            }
                          })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 500-800万円"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">勤務地</label>
                    <input
                      type="text"
                      value={newJobPosting.location || ''}
                      onChange={(e) => setNewJobPosting({...newJobPosting, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 東京都渋谷区"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">部署</label>
                    <input
                      type="text"
                      value={newJobPosting.department || ''}
                      onChange={(e) => setNewJobPosting({...newJobPosting, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 開発部"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">応募要件（1行1項目）</label>
                  <textarea
                    value={newJobPosting.requirements?.join('\n') || ''}
                    onChange={(e) => setNewJobPosting({...newJobPosting, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="例:&#10;React/Next.jsでの開発経験&#10;TypeScriptの実務経験"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">福利厚生（1行1項目）</label>
                  <textarea
                    value={newJobPosting.benefits?.join('\n') || ''}
                    onChange={(e) => setNewJobPosting({...newJobPosting, benefits: e.target.value.split('\n').filter(b => b.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="例:&#10;リモートワーク可&#10;フレックスタイム制"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                  <select
                    value={newJobPosting.status || 'draft'}
                    onChange={(e) => setNewJobPosting({...newJobPosting, status: e.target.value as JobPostingStatus})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                    <option value="on_hold">保留</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddJobPosting(false)
                    setNewJobPosting({
                      title: '',
                      companyName: '',
                      description: '',
                      requirements: [],
                      benefits: [],
                      salary: {
      min: 0,
      max: 0,
      currency: 'JPY',
      period: 'yearly' as const
    },
                      location: '',
                      employmentType: 'full-time',
                      department: '',
                      status: 'draft' as JobPostingStatus
                    })
                    setUploadedPdf(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    if (newJobPosting.title && newJobPosting.companyName && newJobPosting.description) {
                      alert(`求人「${newJobPosting.title}」を作成しました（デモ）`)
                      setShowAddJobPosting(false)
                      onCreateJobPosting()
                      setNewJobPosting({
                        title: '',
                        description: '',
                        requirements: [],
                        benefits: [],
                        salary: {
      min: 0,
      max: 0,
      currency: 'JPY',
      period: 'yearly' as const
    },
                        location: '',
                        employmentType: 'full-time',
                        department: '',
                        status: 'draft' as JobPostingStatus
                      })
                      setUploadedPdf(null)
                    } else {
                      alert('企業名、職種名、職務内容は必須です')
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}