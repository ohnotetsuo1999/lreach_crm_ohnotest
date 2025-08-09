'use client'

import React, { useState } from 'react'
import { JobPosting, JobType, JobLocation } from '@/types'
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Heart,
  Share2,
  ArrowLeft,
  Globe,
  CheckCircle,
  Briefcase,
  Target,
  Zap,
  Star,
  Coffee,
  Award,
  TrendingUp,
  MessageCircle,
  Camera,
  ChevronRight,
  User,
  Mail,
  Phone,
  Upload,
  X,
  ExternalLink
} from 'lucide-react'

interface PublicJobDetailProps {
  jobPosting: JobPosting
  relatedJobs: JobPosting[]
  onApply: (applicantData: {
    name: string
    email: string
    phone: string
    resumeUrl?: string
    coverLetter?: string
  }) => void
  onBack: () => void
  onViewJob: (job: JobPosting) => void
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

export function PublicJobDetail({
  jobPosting,
  relatedJobs,
  onApply,
  onBack,
  onViewJob
}: PublicJobDetailProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<'overview' | 'requirements' | 'company' | 'apply'>('overview')
  
  // Application form state
  const [applicantData, setApplicantData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  })

  const formatSalary = (amount: number) => {
    return `¥${(amount / 10000).toFixed(0)}万`
  }

  const handleApply = () => {
    if (applicantData.name && applicantData.email) {
      onApply(applicantData)
      setShowApplicationForm(false)
      setApplicantData({ name: '', email: '', phone: '', coverLetter: '' })
      alert('応募が完了しました！')
    }
  }

  // Mock company data - in real app, this would come from the job posting
  const companyInfo = {
    name: jobPosting.department || '株式会社Example',
    description: '私たちは、テクノロジーとクリエイティビティを融合させ、新しい価値を創造する企業です。',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{jobPosting.title}</h1>
                <p className="text-sm text-gray-600">{companyInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowApplicationForm(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                応募する
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-green-500 to-green-600">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              {jobPosting.isUrgent && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  急募
                </span>
              )}
              {jobPosting.isFeatured && (
                <span className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  注目
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{jobPosting.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {companyInfo.name}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {jobPosting.location}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                {jobTypeLabels[jobPosting.jobType].label}
              </span>
              <span className="flex items-center gap-1">
                {React.createElement(locationTypeLabels[jobPosting.locationType].icon, {
                  className: 'w-4 h-4'
                })}
                {locationTypeLabels[jobPosting.locationType].label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '概要' },
              { id: 'requirements', label: '募集要項' },
              { id: 'company', label: '会社について' },
              { id: 'apply', label: '応募方法' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <>
                {/* Job Description */}
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">仕事内容</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{jobPosting.description}</p>
                  </div>
                  
                  {jobPosting.responsibilities && jobPosting.responsibilities.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">主な業務内容</h3>
                      <ul className="space-y-2">
                        {jobPosting.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* What We're Looking For */}
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">求める人物像</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">必須スキル・経験</h3>
                      <div className="flex flex-wrap gap-2">
                        {jobPosting.requiredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {jobPosting.preferredSkills && jobPosting.preferredSkills.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">歓迎スキル・経験</h3>
                        <div className="flex flex-wrap gap-2">
                          {jobPosting.preferredSkills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {jobPosting.experienceRequired && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">必要経験年数</h3>
                        <p className="text-gray-700">{jobPosting.experienceRequired}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                {jobPosting.benefits && jobPosting.benefits.length > 0 && (
                  <div className="bg-white rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">福利厚生</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobPosting.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Award className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Requirements Section */}
            {activeSection === 'requirements' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">募集要項</h2>
                <dl className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">職種</dt>
                    <dd className="text-gray-900">{jobPosting.title}</dd>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">雇用形態</dt>
                    <dd className="text-gray-900">{jobTypeLabels[jobPosting.jobType].label}</dd>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">勤務地</dt>
                    <dd className="text-gray-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {jobPosting.location}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {locationTypeLabels[jobPosting.locationType].label}
                      </div>
                    </dd>
                  </div>
                  
                  {jobPosting.salaryRange && (
                    <div className="border-b border-gray-100 pb-4">
                      <dt className="text-sm font-medium text-gray-500 mb-1">給与</dt>
                      <dd className="text-gray-900">
                        年収 {formatSalary(jobPosting.salaryRange.min)} 〜 {formatSalary(jobPosting.salaryRange.max)}
                      </dd>
                    </div>
                  )}
                  
                  {jobPosting.workingHours && (
                    <div className="border-b border-gray-100 pb-4">
                      <dt className="text-sm font-medium text-gray-500 mb-1">勤務時間</dt>
                      <dd className="text-gray-900">{jobPosting.workingHours}</dd>
                    </div>
                  )}
                  
                  {jobPosting.educationRequired && (
                    <div className="border-b border-gray-100 pb-4">
                      <dt className="text-sm font-medium text-gray-500 mb-1">学歴</dt>
                      <dd className="text-gray-900">{jobPosting.educationRequired}</dd>
                    </div>
                  )}
                  
                  <div className="border-b border-gray-100 pb-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">応募締切</dt>
                    <dd className="text-gray-900">
                      {jobPosting.closingDate 
                        ? new Date(jobPosting.closingDate).toLocaleDateString('ja-JP')
                        : '随時募集中'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Company Section */}
            {activeSection === 'company' && (
              <>
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">会社について</h2>
                  <p className="text-gray-700 mb-6">{companyInfo.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">従業員数</h3>
                      <p className="text-gray-900">{companyInfo.employees}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">設立</h3>
                      <p className="text-gray-900">{companyInfo.founded}</p>
                    </div>
                  </div>
                  
                  <a
                    href={companyInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    会社ウェブサイト
                  </a>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">カルチャー</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companyInfo.culture.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            {React.createElement(item.icon, { className: 'w-6 h-6 text-green-600' })}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">オフィスの様子</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {companyInfo.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`オフィス写真 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Apply Section */}
            {activeSection === 'apply' && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">応募方法</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    このポジションにご興味をお持ちいただきありがとうございます。
                    以下のボタンから応募フォームにお進みください。
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">応募プロセス</h3>
                    <ol className="list-decimal list-inside space-y-2 text-green-800">
                      <li>応募フォームの記入</li>
                      <li>書類選考（1週間以内にご連絡）</li>
                      <li>一次面接（オンライン可）</li>
                      <li>最終面接</li>
                      <li>内定</li>
                    </ol>
                  </div>
                  
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    応募フォームへ進む
                  </button>
                  
                  <p className="text-sm text-gray-600 text-center">
                    ご不明な点がございましたら、お気軽にお問い合わせください。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Job Summary Card */}
            <div className="bg-white rounded-lg p-6 sticky top-32">
              <h3 className="font-semibold text-gray-900 mb-4">募集概要</h3>
              <dl className="space-y-3">
                {jobPosting.salaryRange && (
                  <div>
                    <dt className="text-sm text-gray-500">年収</dt>
                    <dd className="font-semibold text-gray-900">
                      {formatSalary(jobPosting.salaryRange.min)} 〜 {formatSalary(jobPosting.salaryRange.max)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">雇用形態</dt>
                  <dd className="font-semibold text-gray-900">
                    {jobTypeLabels[jobPosting.jobType].label}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">勤務地</dt>
                  <dd className="font-semibold text-gray-900">{jobPosting.location}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">応募者数</dt>
                  <dd className="font-semibold text-gray-900">
                    {jobPosting.applications?.length || 0}名
                  </dd>
                </div>
              </dl>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  応募する
                </button>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`w-full px-4 py-2 border rounded-lg font-medium transition-colors ${
                    isSaved
                      ? 'border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 inline mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? '保存済み' : '保存する'}
                </button>
              </div>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">関連する求人</h3>
                <div className="space-y-3">
                  {relatedJobs.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onViewJob(job)}
                    >
                      <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{job.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          jobTypeLabels[job.jobType].color
                        }`}>
                          {jobTypeLabels[job.jobType].label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">応募フォーム</h3>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{jobPosting.title}</h4>
                <p className="text-sm text-gray-600">{companyInfo.name} - {jobPosting.location}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={applicantData.name}
                    onChange={(e) => setApplicantData({ ...applicantData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={applicantData.email}
                    onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={applicantData.phone}
                    onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    志望動機・自己PR
                  </label>
                  <textarea
                    value={applicantData.coverLetter}
                    onChange={(e) => setApplicantData({ ...applicantData, coverLetter: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="あなたの経験や志望動機をお聞かせください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    履歴書・職務経歴書
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" className="hidden" id="resume-upload" accept=".pdf,.doc,.docx" />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">クリックしてファイルを選択</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (最大10MB)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  ご応募いただいた情報は、採用選考の目的でのみ使用いたします。
                  個人情報の取り扱いについては、プライバシーポリシーをご確認ください。
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApply}
                  disabled={!applicantData.name || !applicantData.email}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  応募する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}