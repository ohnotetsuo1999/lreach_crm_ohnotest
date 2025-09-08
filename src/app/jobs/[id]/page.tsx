'use client'

import { useEffect, useState } from 'react'
import { JobPosting } from '@/types'
import { EnhancedPublicJobDetail } from '@/components/CRM/PublicJobDetail/EnhancedPublicJobDetail'
import { useParams, useRouter } from 'next/navigation'

// Mock data - in production this would come from your database
const mockJobPostings: JobPosting[] = [
  {
    id: 'jp1',
    title: 'フルスタックエンジニア',
    companyName: 'テックカンパニー株式会社',
    companyId: 'company-001',
    department: '開発部',
    description: 'Webアプリケーション開発のフルスタックエンジニアを募集しています。最新技術を使った開発に携わることができます。',
    requirements: ['React/Vue.jsなどのフロントエンド開発経験3年以上', 'Node.js/Pythonなどのバックエンド開発経験', 'AWS/GCPなどのクラウド経験'],
    responsibilities: ['新規プロダクトの設計・開発', '既存システムの改善・保守', 'チームメンバーのメンタリング'],
    employmentType: 'full-time',
    jobType: 'full_time',
    location: '東京都渋谷区',
    locationType: 'hybrid',
    remoteOption: 'hybrid',
    salary: { min: 6000000, max: 10000000, currency: 'JPY', period: 'yearly' },
    salaryRange: { min: 6000000, max: 10000000, currency: 'JPY', period: 'yearly' },
    requiredSkills: ['JavaScript', 'React', 'Node.js'],
    preferredSkills: ['TypeScript', 'AWS', 'Docker'],
    status: 'published',
    publishedAt: new Date('2024-11-01'),
    postedAt: new Date('2024-11-01'),
    hiringProcess: [
      { id: 'hp1', name: '書類選考', order: 1, estimatedDuration: 3 },
      { id: 'hp2', name: '一次面接', order: 2, estimatedDuration: 7 },
      { id: 'hp3', name: '最終面接', order: 3, estimatedDuration: 7 }
    ],
    numberOfOpenings: 3,
    createdBy: 'agent1',
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date()
  },
  {
    id: 'jp2',
    title: '営業マネージャー',
    companyName: 'ビジネスソリューション株式会社',
    companyId: 'company-002',
    department: '営業部',
    description: 'B2B営業チームのマネージャーを募集。チーム管理と新規開拓の経験がある方を求めています。',
    requirements: ['営業経験5年以上', 'マネジメント経験3年以上', 'B2B営業の経験'],
    responsibilities: ['営業チームの管理・育成', '営業戦略の立案・実行', 'KPI管理'],
    employmentType: 'full-time',
    jobType: 'full_time',
    location: '東京都新宿区',
    locationType: 'onsite',
    remoteOption: 'onsite',
    salary: { min: 8000000, max: 12000000, currency: 'JPY', period: 'yearly' },
    salaryRange: { min: 8000000, max: 12000000, currency: 'JPY', period: 'yearly' },
    requiredSkills: ['営業', 'マネジメント', 'B2B'],
    preferredSkills: ['SaaS', 'IT業界経験'],
    status: 'active',
    publishedAt: new Date('2024-10-20'),
    postedAt: new Date('2024-10-20'),
    closingDate: new Date('2024-12-31'),
    isUrgent: true,
    hiringProcess: [
      { id: 'hp1', name: '書類選考', order: 1, estimatedDuration: 5 },
      { id: 'hp2', name: '一次面接', order: 2, estimatedDuration: 7 },
      { id: 'hp3', name: '二次面接', order: 3, estimatedDuration: 7 },
      { id: 'hp4', name: '最終面接', order: 4, estimatedDuration: 5 }
    ],
    numberOfOpenings: 1,
    createdBy: 'hr1',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date()
  },
  {
    id: 'jp3',
    title: 'データサイエンティスト',
    companyName: 'データ分析株式会社',
    companyId: 'company-003',
    department: 'データサイエンス部',
    description: 'ビッグデータ分析と機械学習モデルの開発を担当するデータサイエンティストを募集しています。',
    requirements: ['Python/Rでのデータ分析経験3年以上', '機械学習の実務経験', 'SQLでのデータ操作スキル'],
    responsibilities: ['データ分析・可視化', '機械学習モデルの開発', 'ビジネス部門への提案'],
    employmentType: 'full-time',
    jobType: 'full_time',
    location: '東京都港区',
    locationType: 'hybrid',
    remoteOption: 'hybrid',
    salary: { min: 7000000, max: 11000000, currency: 'JPY', period: 'yearly' },
    salaryRange: { min: 7000000, max: 11000000, currency: 'JPY', period: 'yearly' },
    requiredSkills: ['Python', 'SQL', '機械学習'],
    preferredSkills: ['TensorFlow', 'PyTorch', 'AWS'],
    status: 'published',
    publishedAt: new Date('2024-11-05'),
    postedAt: new Date('2024-11-05'),
    hiringProcess: [
      { id: 'hp1', name: '書類選考', order: 1, estimatedDuration: 3 },
      { id: 'hp2', name: '技術面接', order: 2, estimatedDuration: 7 },
      { id: 'hp3', name: '最終面接', order: 3, estimatedDuration: 5 }
    ],
    numberOfOpenings: 2,
    createdBy: 'hr2',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date()
  }
]

export default function PublicJobPage() {
  const params = useParams()
  const router = useRouter()
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In production, fetch from your database
    const job = mockJobPostings.find(jp => jp.id === params.id)
    if (job && (job.status === 'published' || job.status === 'active')) {
      setJobPosting(job)
    }
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!jobPosting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">求人情報が見つかりません</h1>
          <p className="text-gray-600 mb-8">この求人は公開されていないか、削除された可能性があります。</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  const enhancedJobPosting = {
    ...jobPosting,
    overview: jobPosting.description,
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
    priority: 'high' as const,
    salaryDetails: '月給：250,000円〜'
  }

  const companyInfo = {
    name: jobPosting.companyName || jobPosting.department || '株式会社ビーバーズ',
    description: jobPosting.companyName === 'データ分析株式会社' 
      ? 'ビッグデータ分析とAI技術を活用したビジネスソリューションを提供しています。'
      : jobPosting.companyName === 'ビジネスソリューション株式会社'
      ? '企業のIT戦略を支援する総合ソリューションを提供しています。'
      : jobPosting.companyName === 'テックカンパニー株式会社'
      ? '最新技術を活用したWebサービス・アプリケーションを開発しています。'
      : '建設業界や製造業界における経営課題に対する総合ソリューション営業、コンサルティング営業を展開しています。',
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

  const handleApply = (applicantData: {
    name: string
    email: string
    phone: string
    resumeUrl?: string
    coverLetter?: string
  }) => {
    // In production, save to database
    console.log('Application submitted:', applicantData)
    alert('応募が完了しました！担当者から連絡させていただきます。')
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <EnhancedPublicJobDetail
      jobPosting={enhancedJobPosting}
      companyInfo={companyInfo}
      onApply={handleApply}
      onBack={handleBack}
    />
  )
}

// Import icons used in companyInfo
import { Coffee, TrendingUp, Users, Zap } from 'lucide-react'