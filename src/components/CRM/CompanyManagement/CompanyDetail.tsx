'use client'

import { Company, JobPosting } from '@/types'
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  TrendingUp,
  ArrowLeft,
  Edit2,
  Plus,
  ExternalLink
} from 'lucide-react'

interface CompanyDetailProps {
  company: Company
  jobPostings?: JobPosting[]
  onBack: () => void
  onEdit: () => void
  onCreateJobPosting: () => void
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

export function CompanyDetail({
  company,
  jobPostings = [],
  onBack,
  onEdit,
  onCreateJobPosting
}: CompanyDetailProps) {
  const activeJobPostings = jobPostings.filter(jp => jp.status === 'active' || jp.status === 'published')
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{company.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreateJobPosting}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新規求人作成</span>
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">採用ステータス</p>
              <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                statusColors[company.hiringStatus]
              }`}>
                {statusLabels[company.hiringStatus]}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">企業規模</p>
              <p className="text-gray-900 font-medium">{sizeLabels[company.size]}</p>
              {company.employeeCount && (
                <p className="text-sm text-gray-500 mt-1">従業員数: {company.employeeCount}名</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">所在地</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{company.location}</p>
              </div>
              {company.address && (
                <p className="text-sm text-gray-500 mt-1 ml-6">{company.address}</p>
              )}
            </div>
            
            {company.foundedYear && (
              <div>
                <p className="text-sm text-gray-600 mb-1">設立年</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{company.foundedYear}年</p>
                  <span className="text-sm text-gray-500">
                    （{new Date().getFullYear() - company.foundedYear}年目）
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Webサイト</p>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="w-4 h-4" />
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-gray-400">未設定</p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">担当者</p>
              {company.contactPerson ? (
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{company.contactPerson}</p>
                  {company.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${company.contactEmail}`} className="text-blue-600 hover:text-blue-700">
                        {company.contactEmail}
                      </a>
                    </div>
                  )}
                  {company.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${company.contactPhone}`} className="text-blue-600 hover:text-blue-700">
                        {company.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">未設定</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 企業説明 */}
      {company.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">企業説明</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
        </div>
      )}

      {/* 企業文化・福利厚生 */}
      {(company.culture || company.benefits) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">企業文化・福利厚生</h3>
          {company.culture && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">企業文化</p>
              <p className="text-gray-700">{company.culture}</p>
            </div>
          )}
          {company.benefits && company.benefits.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">福利厚生</p>
              <div className="flex flex-wrap gap-2">
                {company.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 採用統計 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">求人数</p>
              <p className="text-2xl font-bold text-gray-900">
                {company.activeJobPostings || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">アクティブ</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">採用実績</p>
              <p className="text-2xl font-bold text-gray-900">
                {company.totalHires || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">累計</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">採用率</p>
              <p className="text-2xl font-bold text-gray-900">
                {company.totalHires && activeJobPostings.length > 0
                  ? Math.round((company.totalHires / activeJobPostings.length) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">平均</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* 求人情報セクション */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            紐づいている求人
            <span className="ml-2 text-sm text-gray-500">
              ({jobPostings?.length || 0}件)
            </span>
          </h3>
          <button
            onClick={onCreateJobPosting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>求人追加</span>
          </button>
        </div>
        
        {jobPostings && jobPostings.length > 0 ? (
          <div className="space-y-4">
            {jobPostings.map((jobPosting) => {
              const statusColor = jobPosting.status === 'published' || jobPosting.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : jobPosting.status === 'draft' 
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
              
              const statusLabel = jobPosting.status === 'published' || jobPosting.status === 'active'
                ? '募集中'
                : jobPosting.status === 'draft'
                ? '下書き'
                : '募集終了'
                
              return (
                <div
                  key={jobPosting.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => window.location.href = `/job-postings/${jobPosting.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 text-lg">{jobPosting.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{jobPosting.department || '部署未設定'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{jobPosting.location || '勤務地未設定'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>
                            {jobPosting.employmentType === 'full-time' ? '正社員' :
                             jobPosting.employmentType === 'part-time' ? 'パート' :
                             jobPosting.employmentType === 'contract' ? '契約社員' : '雇用形態未設定'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            掲載: {jobPosting.publishedAt 
                              ? new Date(jobPosting.publishedAt).toLocaleDateString('ja-JP')
                              : '未掲載'}
                          </span>
                        </div>
                      </div>
                      
                      {jobPosting.salary && (
                        <div className="text-sm text-gray-700 mb-2">
                          年収: {jobPosting.salary.min?.toLocaleString()}万円 〜 {jobPosting.salary.max?.toLocaleString()}万円
                        </div>
                      )}
                      
                      {jobPosting.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{jobPosting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        {jobPosting.applications && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Users className="w-4 h-4" />
                            応募者: {jobPosting.applications.length}名
                          </span>
                        )}
                        {jobPosting.numberOfOpenings && (
                          <span className="text-gray-500">
                            募集人数: {jobPosting.numberOfOpenings}名
                          </span>
                        )}
                        {jobPosting.requiredSkills && jobPosting.requiredSkills.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">必須スキル:</span>
                            {jobPosting.requiredSkills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {jobPosting.requiredSkills.length > 3 && (
                              <span className="text-xs text-gray-500">+{jobPosting.requiredSkills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">この企業の求人はまだありません</p>
            <button
              onClick={onCreateJobPosting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>最初の求人を作成</span>
            </button>
          </div>
        )}
      </div>

      {/* メモ */}
      {company.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">メモ</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{company.notes}</p>
        </div>
      )}

      {/* システム情報 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>作成日: {new Date(company.createdAt).toLocaleDateString('ja-JP')}</span>
          <span>最終更新: {new Date(company.updatedAt).toLocaleDateString('ja-JP')}</span>
        </div>
      </div>
    </div>
  )
}