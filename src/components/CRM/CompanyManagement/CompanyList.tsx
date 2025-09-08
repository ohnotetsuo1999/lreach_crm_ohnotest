'use client'

import { useState } from 'react'
import { Company } from '@/types'
import {
  Search,
  Filter,
  Plus,
  Building2,
  MapPin,
  Users,
  Globe,
  Calendar,
  Edit2,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mail,
  Phone,
  X
} from 'lucide-react'

interface CompanyListProps {
  companies: Company[]
  onCreateCompany: () => void
  onEditCompany: (company: Company) => void
  onViewCompany: (company: Company) => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800'
}

const statusLabels = {
  active: 'アクティブ',
  inactive: '非アクティブ',
  paused: '一時停止'
}

const sizeLabels = {
  startup: 'スタートアップ',
  small: '小規模',
  medium: '中規模',
  large: '大規模',
  enterprise: 'エンタープライズ'
}

export function CompanyList({
  companies,
  onCreateCompany,
  onEditCompany,
  onViewCompany
}: CompanyListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedSize, setSelectedSize] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    industry: '',
    size: 'medium',
    description: '',
    website: '',
    location: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    hiringStatus: 'active'
  })

  const itemsPerPage = 10

  // 業界リストを抽出
  const industries = Array.from(
    new Set((companies || []).filter(c => c && c.industry).map(c => c.industry))
  ).filter(Boolean)

  // フィルタリング
  const filteredCompanies = (companies || []).filter(company => {
    if (!company) return false
    const matchesSearch = 
      (company.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    const matchesSize = selectedSize === 'all' || company.size === selectedSize
    const matchesStatus = selectedStatus === 'all' || company.hiringStatus === selectedStatus
    
    return matchesSearch && matchesIndustry && matchesSize && matchesStatus
  })

  // ページネーション
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  // 統計情報
  const stats = {
    total: (companies || []).length,
    active: (companies || []).filter(c => c && c.hiringStatus === 'active').length,
    totalJobPostings: (companies || []).reduce((sum, c) => sum + ((c && c.activeJobPostings) || 0), 0),
    totalHires: (companies || []).reduce((sum, c) => sum + ((c && c.totalHires) || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">企業管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            採用企業の情報を管理します
          </p>
        </div>
        <button
          onClick={() => setShowAddCompany(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新規企業登録</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総企業数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">採用中</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">求人数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalJobPostings}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">採用実績</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalHires}</p>
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
              placeholder="企業名、業界、場所で検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
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
                業界
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                企業規模
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {Object.entries(sizeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                採用ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 企業リスト */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  企業名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  業界
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  規模
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所在地
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  採用状況
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  担当者
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCompanies.map((company) => {
                if (!company) return null
                return (
                <tr 
                  key={company.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewCompany(company)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name || '企業名未設定'}
                        </div>
                        {company.website && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" />
                            {company.website.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{company.industry}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {sizeLabels[company.size]}
                    </span>
                    {company.employeeCount && (
                      <div className="text-xs text-gray-500 mt-1">
                        {company.employeeCount}名
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {company.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {company.activeJobPostings || 0}件
                    </div>
                    {company.totalHires && (
                      <div className="text-xs text-gray-500 mt-1">
                        採用実績: {company.totalHires}名
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      statusColors[company.hiringStatus]
                    }`}>
                      {statusLabels[company.hiringStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {company.contactPerson && (
                      <div className="text-sm text-gray-900">
                        {company.contactPerson}
                      </div>
                    )}
                    {company.contactEmail && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {company.contactEmail.split('@')[0]}
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
                {filteredCompanies.length}件中 {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)}件を表示
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
                        ? 'bg-blue-500 text-white'
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

      {/* 新規企業登録モーダル */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">新規企業登録</h3>
                <button
                  onClick={() => {
                    setShowAddCompany(false)
                    setNewCompany({
                      name: '',
                      industry: '',
                      size: 'medium',
                      description: '',
                      website: '',
                      location: '',
                      contactPerson: '',
                      contactEmail: '',
                      contactPhone: '',
                      hiringStatus: 'active'
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">企業名 *</label>
                    <input
                      type="text"
                      value={newCompany.name || ''}
                      onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 株式会社○○"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">業界 *</label>
                    <input
                      type="text"
                      value={newCompany.industry || ''}
                      onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: IT・ソフトウェア"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">企業規模</label>
                    <select
                      value={newCompany.size || 'medium'}
                      onChange={(e) => setNewCompany({...newCompany, size: e.target.value as Company['size']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(sizeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
                    <input
                      type="text"
                      value={newCompany.location || ''}
                      onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 東京都渋谷区"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">企業説明</label>
                  <textarea
                    value={newCompany.description || ''}
                    onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="企業の事業内容や特徴を入力"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webサイト</label>
                    <input
                      type="url"
                      value={newCompany.website || ''}
                      onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">従業員数</label>
                    <input
                      type="number"
                      value={newCompany.employeeCount || ''}
                      onChange={(e) => setNewCompany({...newCompany, employeeCount: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                    <input
                      type="text"
                      value={newCompany.contactPerson || ''}
                      onChange={(e) => setNewCompany({...newCompany, contactPerson: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="山田太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">連絡先メール</label>
                    <input
                      type="email"
                      value={newCompany.contactEmail || ''}
                      onChange={(e) => setNewCompany({...newCompany, contactEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="recruit@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                    <input
                      type="tel"
                      value={newCompany.contactPhone || ''}
                      onChange={(e) => setNewCompany({...newCompany, contactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="03-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">採用ステータス</label>
                  <select
                    value={newCompany.hiringStatus || 'active'}
                    onChange={(e) => setNewCompany({...newCompany, hiringStatus: e.target.value as Company['hiringStatus']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCompany(false)
                    setNewCompany({
                      name: '',
                      industry: '',
                      size: 'medium',
                      description: '',
                      website: '',
                      location: '',
                      contactPerson: '',
                      contactEmail: '',
                      contactPhone: '',
                      hiringStatus: 'active'
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    if (newCompany.name && newCompany.industry) {
                      alert(`企業「${newCompany.name}」を登録しました（デモ）`)
                      setShowAddCompany(false)
                      onCreateCompany()
                      setNewCompany({
                        name: '',
                        industry: '',
                        size: 'medium',
                        description: '',
                        website: '',
                        location: '',
                        contactPerson: '',
                        contactEmail: '',
                        contactPhone: '',
                        hiringStatus: 'active'
                      })
                    } else {
                      alert('企業名と業界は必須です')
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}