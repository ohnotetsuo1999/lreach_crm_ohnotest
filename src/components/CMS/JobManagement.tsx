'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, Eye, Edit2, Trash2, Copy, Globe, Pause, Play, Building2, MapPin, DollarSign, Clock, Users, BarChart3, CheckCircle } from 'lucide-react'
import { JobDetailModal } from '@/components/shared/JobDetailModal'
import { JobCreateModal } from '@/components/shared/JobCreateModal'

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

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  published: 'bg-green-100 text-green-800 border-green-300',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  expired: 'bg-red-100 text-red-800 border-red-300'
}

const statusLabels = {
  draft: '下書き',
  published: '公開中',
  paused: '一時停止',
  expired: '掲載終了'
}

export function JobManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // ダミーデータ（CRMと共有される公開求人を含む）
  const [jobPostings] = useState<JobPosting[]>([
    {
      id: '1',
      title: 'フロントエンドエンジニア',
      company: '株式会社テックイノベーション',
      companyLogo: '/api/placeholder/40/40',
      employmentType: '正社員',
      location: '東京都渋谷区',
      salaryMin: 5000000,
      salaryMax: 8000000,
      salaryType: '年収',
      description: 'React/Next.jsを使用したWebアプリケーション開発\n\n【主な業務内容】\n・新規サービスのフロントエンド開発\n・既存サービスの改善・機能追加\n・UI/UXの改善提案と実装\n・チームメンバーとのコードレビュー',
      requirements: ['React経験3年以上', 'TypeScript経験', 'チーム開発経験', 'Git/GitHubの使用経験'],
      benefits: ['リモートワーク可', '副業OK', 'フレックスタイム', '書籍購入支援', '資格取得支援'],
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-03-31'),
      viewCount: 1250,
      applyCount: 45,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      isPublic: true,
      experienceLevel: '中級〜上級',
      workStyle: ['フルリモート可', 'フレックスタイム', '週4日勤務可']
    },
    {
      id: '2',
      title: '営業マネージャー',
      company: '成長株式会社',
      employmentType: '正社員',
      location: '大阪府大阪市',
      salaryMin: 6000000,
      salaryMax: 10000000,
      salaryType: '年収',
      description: 'B2B営業チームのマネジメント、新規開拓\n\n【主な業務内容】\n・営業チーム（5-10名）のマネジメント\n・新規顧客開拓戦略の立案と実行\n・既存顧客との関係強化\n・売上目標の達成',
      requirements: ['営業経験5年以上', 'マネジメント経験3年以上', 'B2B営業経験'],
      benefits: ['インセンティブ制度', '社用車貸与', '住宅手当'],
      status: 'published',
      publishedAt: new Date('2024-01-20'),
      expiresAt: new Date('2024-04-30'),
      viewCount: 890,
      applyCount: 23,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-20'),
      isPublic: true,
      experienceLevel: '管理職',
      workStyle: ['オフィス勤務', '直行直帰可']
    },
    {
      id: '3',
      title: 'データサイエンティスト',
      company: 'AI総研株式会社',
      employmentType: '正社員',
      location: '東京都港区',
      salaryMin: 7000000,
      salaryMax: 12000000,
      salaryType: '年収',
      description: '機械学習モデルの開発、データ分析',
      requirements: ['Python経験3年以上', '機械学習の実務経験', 'SQL'],
      benefits: ['フルリモート可', '書籍購入支援', '研修制度充実'],
      status: 'paused',
      publishedAt: new Date('2024-01-10'),
      viewCount: 2100,
      applyCount: 67,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-01'),
      isPublic: false
    },
    {
      id: '4',
      title: 'カスタマーサポート',
      company: 'サービス向上株式会社',
      employmentType: 'パート・アルバイト',
      location: '福岡県福岡市',
      salaryMin: 1200,
      salaryMax: 1500,
      salaryType: '時給',
      description: 'お客様からの問い合わせ対応、サポート業務',
      requirements: ['接客経験', 'PC基本操作'],
      benefits: ['シフト制', '交通費支給', '社員登用制度あり'],
      status: 'draft',
      viewCount: 0,
      applyCount: 0,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      isPublic: false
    },
    {
      id: '5',
      title: 'バックエンドエンジニア',
      company: '株式会社テックイノベーション',
      employmentType: '正社員',
      location: '東京都渋谷区',
      salaryMin: 6000000,
      salaryMax: 10000000,
      salaryType: '年収',
      description: 'サーバーサイドアプリケーションの開発・運用',
      requirements: ['Go/Python経験3年以上', 'AWS経験', 'マイクロサービス開発経験'],
      benefits: ['リモートワーク可', 'ストックオプション', '技術書購入支援'],
      status: 'published',
      publishedAt: new Date('2024-02-01'),
      expiresAt: new Date('2024-04-30'),
      viewCount: 980,
      applyCount: 34,
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-02-01'),
      isPublic: true,
      experienceLevel: '中級〜上級',
      workStyle: ['フルリモート可', 'フレックスタイム']
    },
    {
      id: '6',
      title: 'プロダクトマネージャー',
      company: 'イノベーション株式会社',
      employmentType: '正社員',
      location: '東京都港区',
      salaryMin: 8000000,
      salaryMax: 12000000,
      salaryType: '年収',
      description: 'プロダクトの企画・開発・改善をリード',
      requirements: ['PM経験3年以上', 'BtoC サービス経験', 'データ分析スキル'],
      benefits: ['フルリモート可', 'ストックオプション', '英語研修支援'],
      status: 'published',
      publishedAt: new Date('2024-02-05'),
      expiresAt: new Date('2024-05-31'),
      viewCount: 1560,
      applyCount: 52,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-05'),
      isPublic: true,
      experienceLevel: '上級',
      workStyle: ['ハイブリッド勤務', 'フレックスタイム']
    }
  ])
  
  const filteredJobs = jobPostings.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    const matchesType = selectedType === 'all' || job.employmentType === selectedType
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  const formatSalary = (min: number, max: number, type: string) => {
    if (type === '年収') {
      return `${(min / 10000).toFixed(0)}万円 〜 ${(max / 10000).toFixed(0)}万円`
    } else if (type === '月給') {
      return `${(min / 10000).toFixed(0)}万円 〜 ${(max / 10000).toFixed(0)}万円/月`
    } else {
      return `${min.toLocaleString()}円 〜 ${max.toLocaleString()}円/時`
    }
  }

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job)
    setShowDetailModal(true)
  }

  const handlePublish = (jobId: string) => {
    console.log('Publishing job:', jobId)
    // 実装: ステータスを published に変更
  }

  const handlePause = (jobId: string) => {
    console.log('Pausing job:', jobId)
    // 実装: ステータスを paused に変更
  }

  const handleEdit = (job: JobPosting) => {
    console.log('Editing job:', job)
    // 実装: 編集モーダルを開く
  }

  const handleDelete = (jobId: string) => {
    if (confirm('この求人を削除してもよろしいですか？')) {
      console.log('Deleting job:', jobId)
      // 実装: 求人を削除
    }
  }

  const handleDuplicate = (job: JobPosting) => {
    console.log('Duplicating job:', job)
    // 実装: 求人を複製
  }

  const handleCreateJob = (jobData: any) => {
    console.log('Creating new job:', jobData)
    // 実装: 新規求人を作成
    setShowCreateModal(false)
  }
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">掲載求人管理</h1>
          <p className="text-sm text-gray-600 mt-1">求人情報の作成・編集・公開管理</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規求人作成
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">公開中の求人</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {jobPostings.filter(j => j.status === 'published').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総閲覧数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {jobPostings.reduce((sum, job) => sum + job.viewCount, 0).toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総応募数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {jobPostings.reduce((sum, job) => sum + job.applyCount, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均応募率</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {((jobPostings.reduce((sum, job) => sum + (job.viewCount > 0 ? job.applyCount / job.viewCount : 0), 0) / jobPostings.length) * 100).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="求人タイトル、企業名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="draft">下書き</option>
            <option value="published">公開中</option>
            <option value="paused">一時停止</option>
            <option value="expired">掲載終了</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべての雇用形態</option>
            <option value="正社員">正社員</option>
            <option value="契約社員">契約社員</option>
            <option value="パート・アルバイト">パート・アルバイト</option>
            <option value="業務委託">業務委託</option>
            <option value="インターン">インターン</option>
          </select>
        </div>
      </div>

      {/* 求人リスト */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  雇用形態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  給与
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  パフォーマンス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map(job => (
                <tr 
                  key={job.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.company}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{job.employmentType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[job.status]}`}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>{job.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{job.applyCount}</span>
                      </div>
                      {job.viewCount > 0 && (
                        <div className="text-xs text-gray-500">
                          ({((job.applyCount / job.viewCount) * 100).toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 求人詳細モーダル */}
      <JobDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPublish={handlePublish}
        onPause={handlePause}
        onDuplicate={handleDuplicate}
        showActions={true}
      />

      {/* 新規求人作成モーダル */}
      <JobCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateJob}
      />
    </div>
  )
}