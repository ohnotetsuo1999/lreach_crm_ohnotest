'use client'

import React, { useState } from 'react'
import { Plus, Search, Building2, Edit2, Trash2, Eye, Mail, Phone, Globe, MapPin, Users, Calendar, CheckCircle, XCircle, Star, Briefcase } from 'lucide-react'

interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  employeeCount: string
  foundedYear: number
  capital?: string
  description: string
  website?: string
  email: string
  phone?: string
  address: string
  status: 'active' | 'inactive' | 'pending'
  jobCount: number
  totalApplications: number
  rating?: number
  createdAt: Date
  updatedAt: Date
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

const statusLabels = {
  active: '契約中',
  inactive: '非アクティブ',
  pending: '審査中'
}

export function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  
  // ダミーデータ
  const [companies] = useState<Company[]>([
    {
      id: '1',
      name: '株式会社テックイノベーション',
      logo: '/api/placeholder/60/60',
      industry: 'IT・通信',
      employeeCount: '100-500',
      foundedYear: 2015,
      capital: '1億円',
      description: '最先端のテクノロジーを活用したソリューションを提供',
      website: 'https://techinnovation.example.com',
      email: 'hr@techinnovation.example.com',
      phone: '03-1234-5678',
      address: '東京都渋谷区渋谷1-1-1',
      status: 'active',
      jobCount: 12,
      totalApplications: 156,
      rating: 4.5,
      createdAt: new Date('2023-06-15'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '2',
      name: '成長株式会社',
      industry: '人材・サービス',
      employeeCount: '50-100',
      foundedYear: 2018,
      description: 'B2B営業支援サービスを展開',
      email: 'recruit@seichou.example.com',
      phone: '06-9876-5432',
      address: '大阪府大阪市北区梅田2-2-2',
      status: 'active',
      jobCount: 5,
      totalApplications: 89,
      rating: 4.2,
      createdAt: new Date('2023-08-20'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '3',
      name: 'AI総研株式会社',
      logo: '/api/placeholder/60/60',
      industry: 'IT・通信',
      employeeCount: '500-1000',
      foundedYear: 2010,
      capital: '5億円',
      description: 'AI技術の研究開発と社会実装',
      website: 'https://ai-research.example.com',
      email: 'careers@ai-research.example.com',
      address: '東京都港区六本木3-3-3',
      status: 'active',
      jobCount: 8,
      totalApplications: 234,
      rating: 4.8,
      createdAt: new Date('2023-05-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '4',
      name: 'サービス向上株式会社',
      industry: 'サービス業',
      employeeCount: '10-50',
      foundedYear: 2020,
      description: 'カスタマーサポートサービスのアウトソーシング',
      email: 'info@service-up.example.com',
      address: '福岡県福岡市中央区天神4-4-4',
      status: 'pending',
      jobCount: 2,
      totalApplications: 12,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    },
    {
      id: '5',
      name: 'クリエイティブデザイン株式会社',
      logo: '/api/placeholder/60/60',
      industry: 'デザイン・広告',
      employeeCount: '10-50',
      foundedYear: 2016,
      description: 'Webデザインとブランディング支援',
      website: 'https://creative-design.example.com',
      email: 'jobs@creative-design.example.com',
      phone: '03-5555-1234',
      address: '東京都新宿区西新宿5-5-5',
      status: 'inactive',
      jobCount: 0,
      totalApplications: 45,
      rating: 3.9,
      createdAt: new Date('2023-09-01'),
      updatedAt: new Date('2024-01-31')
    }
  ])
  
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || company.status === selectedStatus
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    
    return matchesSearch && matchesStatus && matchesIndustry
  })
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">企業管理</h1>
          <p className="text-sm text-gray-600 mt-1">登録企業の管理とプロフィール編集</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新規企業登録
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">登録企業数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">契約中企業</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {companies.filter(c => c.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総求人数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {companies.reduce((sum, c) => sum + c.jobCount, 0)}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総応募数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {companies.reduce((sum, c) => sum + c.totalApplications, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="企業名、説明で検索"
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
            <option value="active">契約中</option>
            <option value="inactive">非アクティブ</option>
            <option value="pending">審査中</option>
          </select>
          
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべての業界</option>
            <option value="IT・通信">IT・通信</option>
            <option value="人材・サービス">人材・サービス</option>
            <option value="サービス業">サービス業</option>
            <option value="デザイン・広告">デザイン・広告</option>
          </select>
        </div>
      </div>

      {/* 企業リスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border mt-1 ${statusColors[company.status]}`}>
                      {statusLabels[company.status]}
                    </span>
                  </div>
                </div>
                {company.rating && (
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm ml-1">{company.rating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Building2 className="w-4 h-4 mr-2" />
                  {company.industry} • {company.employeeCount}名
                </div>
                {company.address && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.address}
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  設立: {company.foundedYear}年
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>求人: {company.jobCount}件</span>
                  <span>応募: {company.totalApplications}件</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="詳細">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800" title="編集">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="削除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCompanies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">該当する企業が見つかりません</p>
        </div>
      )}
    </div>
  )
}