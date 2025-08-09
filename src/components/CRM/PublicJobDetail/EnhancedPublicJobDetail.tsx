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
  ExternalLink,
  Shield,
  UserCheck,
  Sparkles,
  GraduationCap,
  FileText,
  AlertCircle
} from 'lucide-react'

interface EnhancedPublicJobDetailProps {
  jobPosting: JobPosting & {
    // 追加の求人詳細情報
    overview?: string
    targetCandidate?: string
    recruitmentBackground?: string
    selectionProcess?: string[]
    numberOfPositions?: number
    probationPeriod?: string
    otherBenefits?: string[]
    agentNotes?: string
    priority?: 'high' | 'medium' | 'low'
  }
  companyInfo?: {
    name: string
    description: string
    employees: string
    founded: string
    website: string
    culture: Array<{ icon: any; label: string; description: string }>
    images: string[]
  }
  onApply: (applicantData: {
    name: string
    email: string
    phone: string
    resumeUrl?: string
    coverLetter?: string
  }) => void
  onBack: () => void
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

export function EnhancedPublicJobDetail({
  jobPosting,
  companyInfo,
  onApply,
  onBack
}: EnhancedPublicJobDetailProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)
  
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
                <h1 className="text-lg font-semibold text-gray-900">{companyInfo?.name || jobPosting.department}</h1>
                <p className="text-sm text-gray-600">{jobPosting.title}</p>
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

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 max-w-7xl mx-auto mt-4 mx-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700">
                候補者のプライバシー保護観点におけるセキュリティ対策のため、推薦者の氏名・現所属を非表示にしています。
                推薦者の氏名・現所属を表示するには、
                <a href="#" className="font-medium underline">ログイン</a>
                または
                <a href="#" className="font-medium underline">ユーザー登録</a>
                してください。
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyNotice(false)}
              className="ml-3 flex-shrink-0"
            >
              <X className="h-5 w-5 text-blue-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {companyInfo?.name || jobPosting.department}
                  </h1>
                  <h2 className="text-xl text-gray-700">{jobPosting.title}</h2>
                  {jobPosting.priority === 'high' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full mt-2">
                      <AlertCircle className="w-4 h-4" />
                      最優先採用
                    </span>
                  )}
                </div>
                {companyInfo?.images?.[0] && (
                  <img
                    src={companyInfo.images[0]}
                    alt={companyInfo.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            {/* 基本情報 */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">基本情報</h3>
              <dl className="space-y-4">
                {jobPosting.overview && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">仕事概要</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{jobPosting.overview}</dd>
                  </div>
                )}
                
                {jobPosting.responsibilities && jobPosting.responsibilities.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">具体的な業務内容</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1">
                        {jobPosting.responsibilities.map((resp, index) => (
                          <li key={index} className="text-gray-900">{resp}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">必須スキル</dt>
                  <dd>
                    {jobPosting.requiredSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {jobPosting.requiredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">特になし</p>
                    )}
                  </dd>
                </div>

                {jobPosting.preferredSkills && jobPosting.preferredSkills.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">歓迎スキル</dt>
                    <dd>
                      <div className="flex flex-wrap gap-2">
                        {jobPosting.preferredSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}

                {jobPosting.targetCandidate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">求める人物像</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{jobPosting.targetCandidate}</dd>
                  </div>
                )}

                {jobPosting.salaryRange && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">給与</dt>
                    <dd className="text-gray-900">
                      {formatSalary(jobPosting.salaryRange.min)} 〜 {formatSalary(jobPosting.salaryRange.max)}
                      {jobPosting.salaryDetails && (
                        <div className="text-sm text-gray-600 mt-1">{jobPosting.salaryDetails}</div>
                      )}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">勤務地</dt>
                  <dd className="text-gray-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {jobPosting.location}
                    </div>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-600 mb-1">雇用形態</dt>
                  <dd>
                    <span className={`px-3 py-1 rounded-full text-sm ${jobTypeLabels[jobPosting.jobType].color}`}>
                      {jobTypeLabels[jobPosting.jobType].label}
                    </span>
                  </dd>
                </div>

                {jobPosting.workingHours && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">勤務体系</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{jobPosting.workingHours}</dd>
                  </div>
                )}

                {jobPosting.probationPeriod && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">試用期間</dt>
                    <dd className="text-gray-900">{jobPosting.probationPeriod}</dd>
                  </div>
                )}

                {jobPosting.benefits && jobPosting.benefits.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">福利厚生</dt>
                    <dd>
                      <ul className="list-disc list-inside space-y-1">
                        {jobPosting.benefits.map((benefit, index) => (
                          <li key={index} className="text-gray-900">{benefit}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {jobPosting.otherBenefits && jobPosting.otherBenefits.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">その他</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">
                      {jobPosting.otherBenefits.join('\n')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* エージェント用追記事項 */}
            {jobPosting.agentNotes && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  エージェント用追記事項
                </h3>
                <div className="space-y-4">
                  {jobPosting.recruitmentBackground && (
                    <div>
                      <dt className="text-sm font-medium text-gray-700 mb-1">募集背景</dt>
                      <dd className="text-gray-900">{jobPosting.recruitmentBackground}</dd>
                    </div>
                  )}
                  {jobPosting.targetCandidate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-700 mb-1">ターゲット</dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">{jobPosting.targetCandidate}</dd>
                    </div>
                  )}
                  {jobPosting.numberOfPositions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-700 mb-1">採用人数</dt>
                      <dd className="text-gray-900">{jobPosting.numberOfPositions}人</dd>
                    </div>
                  )}
                  {jobPosting.selectionProcess && jobPosting.selectionProcess.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-700 mb-1">選考フロー</dt>
                      <dd>
                        <ol className="list-decimal list-inside space-y-1">
                          {jobPosting.selectionProcess.map((step, index) => (
                            <li key={index} className="text-gray-900">{step}</li>
                          ))}
                        </ol>
                      </dd>
                    </div>
                  )}
                  {jobPosting.closingDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-700 mb-1">募集期間</dt>
                      <dd className="text-gray-900">
                        {new Date(jobPosting.closingDate).toLocaleDateString('ja-JP')}まで
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Gallery */}
            {companyInfo?.images && companyInfo.images.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">オフィスの様子</h3>
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
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply Card */}
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">応募する</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  応募フォームへ進む
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
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">応募締切</p>
                  <p className="font-medium text-gray-900">
                    {jobPosting.closingDate 
                      ? new Date(jobPosting.closingDate).toLocaleDateString('ja-JP')
                      : '随時募集中'}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            {companyInfo && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">会社情報</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">従業員数</dt>
                    <dd className="font-medium text-gray-900">{companyInfo.employees}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">設立</dt>
                    <dd className="font-medium text-gray-900">{companyInfo.founded}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">ウェブサイト</dt>
                    <dd>
                      <a
                        href={companyInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        会社サイトを見る
                      </a>
                    </dd>
                  </div>
                </dl>
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
                <p className="text-sm text-gray-600">{companyInfo?.name || jobPosting.department}</p>
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