'use client'

import React, { useState } from 'react'
import { 
  XCircle, Building2, Search, Plus
} from 'lucide-react'

interface Company {
  id: string
  name: string
  industry?: string
  size?: string
  location?: string
}

interface JobCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (jobData: any) => void
}

export function JobCreateModal({ 
  isOpen, 
  onClose,
  onSave
}: JobCreateModalProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompanyList, setShowCompanyList] = useState(false)
  const [jobData, setJobData] = useState({
    companyName: '',
    title: '',
    employmentType: '正社員',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: '年収',
    description: '',
    requirements: '',
    benefits: '',
    department: '',
    experienceLevel: '',
    workStyle: [] as string[],
    expiresAt: ''
  })

  // Mock company data
  const companies: Company[] = [
    { id: '1', name: '株式会社テックイノベーション', industry: 'IT', size: '100-500人', location: '東京都渋谷区' },
    { id: '2', name: '成長株式会社', industry: '営業', size: '50-100人', location: '大阪府大阪市' },
    { id: '3', name: 'AI総研株式会社', industry: 'AI/機械学習', size: '10-50人', location: '東京都港区' },
    { id: '4', name: 'サービス向上株式会社', industry: 'サービス業', size: '500-1000人', location: '福岡県福岡市' },
    { id: '5', name: 'イノベーション株式会社', industry: 'IT', size: '100-500人', location: '東京都港区' },
    { id: '6', name: 'クリエイティブデザイン株式会社', industry: 'デザイン', size: '10-50人', location: '東京都新宿区' },
    { id: '7', name: 'グローバルコンサル株式会社', industry: 'コンサルティング', size: '1000人以上', location: '東京都千代田区' },
    { id: '8', name: 'フィンテック株式会社', industry: '金融', size: '50-100人', location: '東京都中央区' }
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!jobData.companyName) {
      alert('企業名を入力してください')
      return
    }
    if (!jobData.title) {
      alert('求人タイトルを入力してください')
      return
    }
    
    onSave({
      ...jobData,
      company: jobData.companyName,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    onClose()
  }

  const workStyleOptions = [
    'フルリモート可',
    'ハイブリッド勤務',
    'オフィス勤務',
    'フレックスタイム',
    '週4日勤務可',
    '時短勤務可',
    '直行直帰可'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">新規求人作成</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* PDF Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4">
                <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">求人票（PDF）をアップロードして自動入力</p>
              <label className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                PDFを選択
                <input type="file" accept=".pdf" className="hidden" />
              </label>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              企業名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={jobData.companyName}
              onChange={(e) => setJobData({...jobData, companyName: e.target.value})}
              placeholder="例: 株式会社テックイノベーション"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Title and Employment Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                職種名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
                placeholder="例: フロントエンドエンジニア"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                雇用形態
              </label>
              <select
                value={jobData.employmentType}
                onChange={(e) => setJobData({...jobData, employmentType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="正社員">正社員</option>
                <option value="契約社員">契約社員</option>
                <option value="パート・アルバイト">パート・アルバイト</option>
                <option value="業務委託">業務委託</option>
                <option value="インターン">インターン</option>
              </select>
            </div>
          </div>

          {/* Job Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              職務内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobData.description}
              onChange={(e) => setJobData({...jobData, description: e.target.value})}
              rows={6}
              placeholder="業務内容の詳細を記入してください"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務地
            </label>
            <input
              type="text"
              value={jobData.location}
              onChange={(e) => setJobData({...jobData, location: e.target.value})}
              placeholder="例: 東京都渋谷区"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              給与
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={jobData.salaryMin}
                onChange={(e) => setJobData({...jobData, salaryMin: e.target.value})}
                placeholder="最小"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">〜</span>
              <input
                type="number"
                value={jobData.salaryMax}
                onChange={(e) => setJobData({...jobData, salaryMax: e.target.value})}
                placeholder="最大"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={jobData.salaryType}
                onChange={(e) => setJobData({...jobData, salaryType: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="年収">年収</option>
                <option value="月給">月給</option>
                <option value="時給">時給</option>
              </select>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              応募要件
            </label>
            <textarea
              value={jobData.requirements}
              onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
              rows={4}
              placeholder="必須スキルや経験を改行で区切って記入"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              福利厚生
            </label>
            <textarea
              value={jobData.benefits}
              onChange={(e) => setJobData({...jobData, benefits: e.target.value})}
              rows={4}
              placeholder="福利厚生を改行で区切って記入"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            下書き保存
          </button>
          <button
            onClick={() => {
              handleSubmit()
              // In real implementation, this would also publish the job
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            保存して公開
          </button>
        </div>
      </div>
    </div>
  )
}