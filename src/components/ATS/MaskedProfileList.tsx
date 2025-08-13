'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  Star,
  Eye,
  Send,
  Tag,
  Calendar,
  TrendingUp,
  Building,
  BarChart,
  FileText,
  Target
} from 'lucide-react'
import type { MaskedProfile, MaskedProfileSearchCriteria } from '@/types'

interface MaskedProfileListProps {
  profiles: MaskedProfile[]
  onViewProfile: (profile: MaskedProfile) => void
  onRequestRecommendation: (profileId: string) => void
}

export default function MaskedProfileList({ 
  profiles, 
  onViewProfile,
  onRequestRecommendation 
}: MaskedProfileListProps) {
  const [searchCriteria, setSearchCriteria] = useState<MaskedProfileSearchCriteria>({
    keywords: [],
    skills: [],
    industries: [],
    jobLevels: [],
    yearsOfExperience: {},
    salaryRange: {},
    locations: [],
    workStyles: [],
    sortBy: 'relevance'
  })

  const [showFilters, setShowFilters] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<MaskedProfile | null>(null)
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<MaskedProfile | null>(null)
  const [searchInput, setSearchInput] = useState('')

  // フィルタリング
  const filteredProfiles = profiles.filter(profile => {
    // キーワード検索
    if (searchInput) {
      const search = searchInput.toLowerCase()
      const searchableText = [
        profile.profileCode,
        profile.careerSummary,
        ...(profile.skills?.flatMap(s => 
          typeof s === 'string' ? [s] : (s.items || [])
        ) || []),
        ...(profile.certifications || []),
        profile.advisorInsights?.recommendations || '',
        profile.advisorInsights?.notes || ''
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(search)) return false
    }

    // スキルフィルタ
    if (searchCriteria.skills && searchCriteria.skills.length > 0) {
      const profileSkills = profile.skills?.flatMap(s => 
        typeof s === 'string' ? [s.toLowerCase()] : (s.items?.map(i => i.toLowerCase()) || [])
      ) || []
      if (!searchCriteria.skills.some(skill => 
        profileSkills.includes(skill.toLowerCase())
      )) return false
    }

    // 経験年数フィルタ
    if (searchCriteria.yearsOfExperience?.min !== undefined) {
      if (profile.yearsOfExperience < searchCriteria.yearsOfExperience.min) return false
    }
    if (searchCriteria.yearsOfExperience?.max !== undefined) {
      if (profile.yearsOfExperience > searchCriteria.yearsOfExperience.max) return false
    }

    // 給与レンジフィルタ
    if (searchCriteria.salaryRange?.min !== undefined && profile.preferences?.salaryRange) {
      if (profile.preferences.salaryRange.max < searchCriteria.salaryRange.min) return false
    }

    // 勤務地フィルタ
    if (searchCriteria.locations && searchCriteria.locations.length > 0) {
      if (!profile.preferences?.locations || !searchCriteria.locations.some(loc => 
        profile.preferences.locations.includes(loc)
      )) return false
    }

    return true
  })

  // 並び替え
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    switch (searchCriteria.sortBy) {
      case 'experience':
        return b.yearsOfExperience - a.yearsOfExperience
      case 'updated':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'viewed':
        return (b.viewCount || 0) - (a.viewCount || 0)
      default:
        return 0
    }
  })

  const getPriorityBadge = (profile: MaskedProfile) => {
    if (profile.requestCount && profile.requestCount > 2) {
      return { text: '人気', color: 'bg-red-100 text-red-800' }
    } else if (profile.viewCount && profile.viewCount > 30) {
      return { text: '注目', color: 'bg-yellow-100 text-yellow-800' }
    } else if (profile.yearsOfExperience >= 8) {
      return { text: 'ベテラン', color: 'bg-blue-100 text-blue-800' }
    }
    return null
  }

  return (
    <div className="h-full flex">
      {/* 左サイドバー - フィルター */}
      <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r overflow-hidden flex-shrink-0`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold">フィルター</h3>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* スキル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スキル
            </label>
            <input
              type="text"
              placeholder="スキルを入力"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value
                  if (value) {
                    setSearchCriteria({
                      ...searchCriteria,
                      skills: [...(searchCriteria.skills || []), value]
                    });
                    (e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {searchCriteria.skills?.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                  {skill}
                  <button
                    onClick={() => setSearchCriteria({
                      ...searchCriteria,
                      skills: searchCriteria.skills?.filter((_, i) => i !== index)
                    })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 経験年数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              経験年数
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="最小"
                className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                value={searchCriteria.yearsOfExperience?.min || ''}
                onChange={(e) => setSearchCriteria({
                  ...searchCriteria,
                  yearsOfExperience: {
                    ...searchCriteria.yearsOfExperience,
                    min: parseInt(e.target.value) || undefined
                  }
                })}
              />
              <input
                type="number"
                placeholder="最大"
                className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                value={searchCriteria.yearsOfExperience?.max || ''}
                onChange={(e) => setSearchCriteria({
                  ...searchCriteria,
                  yearsOfExperience: {
                    ...searchCriteria.yearsOfExperience,
                    max: parseInt(e.target.value) || undefined
                  }
                })}
              />
            </div>
          </div>

          {/* 希望年収 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望年収（万円）
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="最小"
                className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                value={searchCriteria.salaryRange?.min || ''}
                onChange={(e) => setSearchCriteria({
                  ...searchCriteria,
                  salaryRange: {
                    ...searchCriteria.salaryRange,
                    min: parseInt(e.target.value) || undefined
                  }
                })}
              />
              <input
                type="number"
                placeholder="最大"
                className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                value={searchCriteria.salaryRange?.max || ''}
                onChange={(e) => setSearchCriteria({
                  ...searchCriteria,
                  salaryRange: {
                    ...searchCriteria.salaryRange,
                    max: parseInt(e.target.value) || undefined
                  }
                })}
              />
            </div>
          </div>

          {/* 勤務地 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              勤務地
            </label>
            <select
              multiple
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={searchCriteria.locations}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setSearchCriteria({ ...searchCriteria, locations: selected })
              }}
            >
              <option value="東京都">東京都</option>
              <option value="大阪府">大阪府</option>
              <option value="名古屋">名古屋</option>
              <option value="福岡">福岡</option>
              <option value="リモート">リモート</option>
            </select>
          </div>

          {/* リセット */}
          <button
            onClick={() => setSearchCriteria({
              keywords: [],
              skills: [],
              industries: [],
              jobLevels: [],
              yearsOfExperience: {},
              salaryRange: {},
              locations: [],
              workStyles: [],
              sortBy: 'relevance'
            })}
            className="w-full px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            フィルターをリセット
          </button>
        </div>
      </div>

      {/* 中央 - 候補者リスト */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">候補者プロファイル</h2>
          
          {/* 検索バー */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="スキル、キーワードで検索"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* ソート */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {sortedProfiles.length} 件の候補者
            </span>
            <select
              value={searchCriteria.sortBy}
              onChange={(e) => setSearchCriteria({ 
                ...searchCriteria, 
                sortBy: e.target.value as any 
              })}
              className="text-sm px-2 py-1 border rounded"
            >
              <option value="relevance">関連性順</option>
              <option value="experience">経験年数順</option>
              <option value="updated">更新日順</option>
              <option value="viewed">閲覧数順</option>
            </select>
          </div>
        </div>

        {/* 候補者一覧 */}
        <div className="flex-1 overflow-y-auto">
          {sortedProfiles.map((profile) => {
            const badge = getPriorityBadge(profile)
            const isSelected = selectedProfile?.id === profile.id
            
            return (
              <div
                key={profile.id}
                onClick={() => {
                  setSelectedProfile(profile)
                  setSelectedProfileForDetail(profile)
                }}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {profile.profileCode}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {profile.currentJobLevel} / {profile.yearsOfExperience}年
                      </p>
                    </div>
                  </div>
                  {badge && (
                    <span className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>
                      {badge.text}
                    </span>
                  )}
                </div>

                <div className="ml-13">
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {profile.careerSummary}
                  </p>

                  {/* スキルタグ（最大5個） */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(typeof profile.skills[0] === 'string' 
                        ? profile.skills.slice(0, 5)
                        : profile.skills.flatMap(sg => sg.items || []).slice(0, 5)
                      ).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {typeof skill === 'string' ? skill : ''}
                        </span>
                      ))}
                      {(typeof profile.skills[0] === 'string' 
                        ? profile.skills.length > 5
                        : profile.skills.reduce((acc, sg) => acc + (sg.items?.length || 0), 0) > 5
                      ) && (
                        <span className="text-xs text-gray-500">
                          +{typeof profile.skills[0] === 'string' 
                            ? profile.skills.length - 5
                            : profile.skills.reduce((acc, sg) => acc + (sg.items?.length || 0), 0) - 5
                          }
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.preferences?.locations?.slice(0, 2).join(', ') || '未設定'}
                    </span>
                    {profile.preferences?.salaryRange && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {profile.preferences.salaryRange.min}~{profile.preferences.salaryRange.max}万
                      </span>
                    )}
                  </div>

                  {profile.requestCount && profile.requestCount > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-orange-600 flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        {profile.requestCount}件のリクエスト
                      </span>
                      {profile.viewCount && profile.viewCount > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {profile.viewCount}回閲覧
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 右側 - 詳細表示 */}
      <div className="flex-1 overflow-hidden bg-white">
        {selectedProfileForDetail ? (
          <div className="h-full flex flex-col">
            {/* ヘッダー */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedProfileForDetail.profileCode}
                      </h2>
                      <p className="text-gray-600">
                        {selectedProfileForDetail.currentJobLevel} | 経験{selectedProfileForDetail.yearsOfExperience}年
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewProfile(selectedProfileForDetail)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    詳細
                  </button>
                  <button
                    onClick={() => onRequestRecommendation(selectedProfileForDetail.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    推薦依頼
                  </button>
                </div>
              </div>

              {/* ステータスバー */}
              <div className="mt-4 flex gap-6 text-sm">
                {selectedProfileForDetail.viewCount && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{selectedProfileForDetail.viewCount}回閲覧</span>
                  </div>
                )}
                {selectedProfileForDetail.requestCount && selectedProfileForDetail.requestCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-700">{selectedProfileForDetail.requestCount}件のリクエスト</span>
                  </div>
                )}
                {selectedProfileForDetail.lastViewed && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      最終閲覧: {new Date(selectedProfileForDetail.lastViewed).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* キャリアサマリー */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  キャリアサマリー
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProfileForDetail.careerSummary}
                </p>
              </div>

              {/* 職歴 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  職歴
                </h3>
                <div className="space-y-4">
                  {selectedProfileForDetail.experiences?.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-gray-900">{exp.position}</p>
                        <span className="text-sm text-gray-500">{exp.duration}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {exp.industry} / {exp.companySize === 'enterprise' ? '大企業' : 
                         exp.companySize === 'large' ? '大手' :
                         exp.companySize === 'medium' ? '中規模' :
                         exp.companySize === 'small' ? '中小' : 'スタートアップ'}
                      </p>
                      <ul className="space-y-1">
                        {exp.achievements?.map((achievement, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* スキル */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-500" />
                  スキル
                </h3>
                {selectedProfileForDetail.skills?.map((skillGroup, index) => 
                  typeof skillGroup === 'string' ? (
                    <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2">
                      {skillGroup}
                    </span>
                  ) : (
                    <div key={index} className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {skillGroup.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items?.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ) || []}
              </div>

              {/* 学歴・資格 */}
              {(selectedProfileForDetail.education?.length > 0 || selectedProfileForDetail.certifications?.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gray-500" />
                    学歴・資格
                  </h3>
                  {selectedProfileForDetail.education?.map((edu, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-gray-700">
                        {edu.degree} - {edu.field} ({edu.graduationYear}年卒)
                      </p>
                    </div>
                  ))}
                  {selectedProfileForDetail.certifications?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">保有資格</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfileForDetail.certifications.map((cert, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 希望条件 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-500" />
                  希望条件
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">希望勤務地</p>
                    <p className="text-gray-900">
                      {selectedProfileForDetail.preferences?.locations?.join(', ') || '未設定'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">希望年収</p>
                    <p className="text-gray-900">
                      {selectedProfileForDetail.preferences?.salaryRange 
                        ? `${selectedProfileForDetail.preferences.salaryRange.min}~${selectedProfileForDetail.preferences.salaryRange.max}万円`
                        : '応相談'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">雇用形態</p>
                    <p className="text-gray-900">
                      {selectedProfileForDetail.preferences?.employmentTypes?.join(', ') || '正社員'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">入社可能時期</p>
                    <p className="text-gray-900">
                      {selectedProfileForDetail.preferences?.availabilityPeriod || '要相談'}
                    </p>
                  </div>
                </div>
              </div>

              {/* キャリアアドバイザー所感 */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  キャリアアドバイザー所感
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">人物像</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfileForDetail.advisorInsights?.personalityTraits?.join('、') || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">強み</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfileForDetail.advisorInsights?.strengths?.join('、') || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">推奨</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfileForDetail.advisorInsights?.recommendations || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">適合職種</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfileForDetail.advisorInsights?.fitForRoles?.join('、') || ''}
                    </p>
                  </div>
                  {selectedProfileForDetail.advisorInsights?.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">備考</p>
                      <p className="text-sm text-gray-600">
                        {selectedProfileForDetail.advisorInsights.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>候補者を選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}