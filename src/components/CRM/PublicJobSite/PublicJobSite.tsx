'use client'

import { useState } from 'react'
import { JobPosting, JobType, JobLocation } from '@/types'
import {
  Search,
  MapPin,
  Building,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Users,
  ChevronRight,
  Filter,
  X,
  Heart,
  Share2,
  Send,
  ArrowLeft,
  Globe,
  CheckCircle,
  Zap,
  TrendingUp,
  Award,
  Star,
  Upload,
  Eye,
  Coffee
} from 'lucide-react'
import { EnhancedPublicJobDetail } from '../PublicJobDetail/EnhancedPublicJobDetail'

interface PublicJobSiteProps {
  jobPostings: JobPosting[]
  onApply: (jobId: string, applicantData: {
    name: string
    email: string
    phone: string
    resumeUrl?: string
    coverLetter?: string
  }) => void
}

const jobTypeLabels: Record<JobType, { label: string; color: string }> = {
  full_time: { label: '正社員', color: 'bg-blue-100 text-blue-800' },
  part_time: { label: 'パート・アルバイト', color: 'bg-green-100 text-green-800' },
  contract: { label: '契約社員', color: 'bg-purple-100 text-purple-800' },
  internship: { label: 'インターン', color: 'bg-yellow-100 text-yellow-800' },
  temporary: { label: '派遣', color: 'bg-orange-100 text-orange-800' }
}

const locationTypeLabels: Record<JobLocation, { label: string; icon: any }> = {
  onsite: { label: 'オンサイト', icon: Building },
  remote: { label: 'リモート', icon: Globe },
  hybrid: { label: 'ハイブリッド', icon: Users }
}

export function PublicJobSite({ jobPostings, onApply }: PublicJobSiteProps) {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobType, setSelectedJobType] = useState<JobType | 'all'>('all')
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [salaryRange, setSalaryRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000000 })
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [savedJobs, setSavedJobs] = useState<string[]>([])

  // Extract all departments
  const allDepartments = Array.from(
    new Set(jobPostings.map(job => job.department))
  ).filter(Boolean).sort()

  // Filter jobs
  const filteredJobs = jobPostings.filter(job => {
    if (job.status !== 'active') return false
    
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesJobType = selectedJobType === 'all' || job.jobType === selectedJobType
    const matchesLocation = selectedLocation === 'all' || job.locationType === selectedLocation
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment
    const matchesSalary = !job.salaryRange || 
      (job.salaryRange.min >= salaryRange.min && job.salaryRange.max <= salaryRange.max)
    
    return matchesSearch && matchesJobType && matchesLocation && matchesDepartment && matchesSalary
  })

  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job)
    setShowDetailView(true)
  }

  const handleBackToList = () => {
    setShowDetailView(false)
    setSelectedJob(null)
  }

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const formatSalary = (amount: number) => {
    return `¥${(amount / 10000).toFixed(0)}万`
  }

  // Show detail view if a job is selected
  if (showDetailView && selectedJob) {
    // Enhanced job posting with additional details
    const enhancedJobPosting = {
      ...selectedJob,
      overview: selectedJob.description,
      targetCandidate: '若いうちから成長環境で働きたい方\n実力主義の環境で活躍したい方\n体育会、インターン経験者\n明るく営業マンとして活躍しそうなイメージのつく方',
      recruitmentBackground: '事業拡大に伴う増員',
      selectionProcess: [
        '説明会or個別面接（説明会は、人事、個別面接は取締役が行います）',
        '説明会後は、取締役との面接',
        '最終面接（代表）'
      ],
      numberOfPositions: 40,
      probationPeriod: 'あり（6ヶ月）',
      otherBenefits: [
        'インセンティブ制度あり（計算式：年間売上*９％-（月給*12ヶ月））',
        'オフィスカジュアル',
        '社員旅行',
        'ウォーターサーバー設置',
        '筋肉食堂設置',
        'コーヒーメーカー設置',
        'ジョブローテーション',
        '能力開発補助制度'
      ],
      agentNotes: 'エージェント向けの追加情報',
      priority: 'high' as const,
      salaryDetails: '月給：250,000円〜'
    }

    const companyInfo = {
      name: selectedJob.department || '株式会社ビーバーズ',
      description: '建設業界や製造業界における経営課題に対する総合ソリューション営業、コンサルティング営業を展開しています。',
      employees: '50-200名',
      founded: '2015年',
      website: 'https://example.com',
      culture: [
        { icon: Coffee, label: 'カジュアルな雰囲気', description: 'フラットな組織でコミュニケーションが活発' },
        { icon: TrendingUp, label: '成長機会', description: '個人の成長を支援する環境' },
        { icon: Users, label: 'チームワーク', description: '協力して目標を達成する文化' },
        { icon: Zap, label: 'イノベーション', description: '新しいアイデアを歓迎する風土' }
      ],
      images: [
        '/api/placeholder/600/400',
        '/api/placeholder/600/400',
        '/api/placeholder/600/400'
      ]
    }

    return (
      <EnhancedPublicJobDetail
        jobPosting={enhancedJobPosting}
        companyInfo={companyInfo}
        onApply={(applicantData) => onApply(selectedJob.id, applicantData)}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">求人情報</h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-gray-900">ホーム</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">企業情報</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">採用プロセス</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">お問い合わせ</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">保存済み ({savedJobs.length})</span>
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                ログイン
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">あなたのキャリアを次のレベルへ</h2>
            <p className="text-xl mb-8">最適な求人を見つけて、理想のキャリアを実現しましょう</p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-2 flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="職種、キーワード、会社名で検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 focus:outline-none"
                  />
                </div>
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  検索
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{filteredJobs.length}件の求人</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span>50社以上の企業</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>毎日更新</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">絞り込み</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Job Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">雇用形態</h4>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value as JobType | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(jobTypeLabels).map(([type, { label }]) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Location Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">勤務地タイプ</h4>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value as JobLocation | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">すべて</option>
                    {Object.entries(locationTypeLabels).map(([type, { label }]) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">部門</h4>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">すべて</option>
                    {allDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Salary Range Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">年収</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">最小:</span>
                      <span className="font-medium">{formatSalary(salaryRange.min)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="500000"
                      value={salaryRange.min}
                      onChange={(e) => setSalaryRange({ ...salaryRange, min: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">最大:</span>
                      <span className="font-medium">{formatSalary(salaryRange.max)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="500000"
                      value={salaryRange.max}
                      onChange={(e) => setSalaryRange({ ...salaryRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{filteredJobs.length}件の求人が見つかりました</p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>絞り込み</span>
              </button>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewJob(job)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        {job.isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            急募
                          </span>
                        )}
                        {job.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            注目
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          jobTypeLabels[job.jobType].color
                        }`}>
                          {jobTypeLabels[job.jobType].label}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.requiredSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary(job.salaryRange.min)} - {formatSalary(job.salaryRange.max)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.postedAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          {job.applications?.length || 0}名応募
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSaveJob(job.id)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            savedJobs.includes(job.id)
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewJob(job)
                        }}
                        className="px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}