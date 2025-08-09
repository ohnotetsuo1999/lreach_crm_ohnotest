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
  Building
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
        ...profile.certifications,
        profile.advisorInsights.recommendations,
        profile.advisorInsights.notes
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
    if (searchCriteria.salaryRange?.min !== undefined && profile.preferences.salaryRange) {
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左側：フィルターパネル */}
      <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r overflow-hidden`}>
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
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {skill}
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
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setSearchCriteria({ ...searchCriteria, locations: selected })
              }}
            >
              <option value="東京">東京</option>
              <option value="大阪">大阪</option>
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

      {/* メインエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">候補者プロファイル検索</h1>
            <div className="text-sm text-gray-600">
              {filteredProfiles.length} 件の候補者
            </div>
          </div>

          {/* 検索バー */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              フィルター
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="スキル、職種、キーワードで検索"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={searchCriteria.sortBy}
              onChange={(e) => setSearchCriteria({ 
                ...searchCriteria, 
                sortBy: e.target.value as any 
              })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="relevance">関連性順</option>
              <option value="experience">経験年数順</option>
              <option value="updated">更新日順</option>
              <option value="viewed">閲覧数順</option>
            </select>
          </div>
        </div>

        {/* プロファイル一覧 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProfile(profile)}
              >
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{profile.profileCode}</h3>
                        <p className="text-sm text-gray-600">
                          {profile.currentJobLevel} / {profile.yearsOfExperience}年
                        </p>
                      </div>
                    </div>
                    {profile.requestCount && profile.requestCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {profile.requestCount}件のリクエスト
                      </span>
                    )}
                  </div>

                  {/* キャリアサマリー */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {profile.careerSummary}
                  </p>

                  {/* スキルタグ */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                        typeof profile.skills[0] === 'string' ? (
                          // スキルが文字列配列の場合
                          profile.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          // スキルがオブジェクト配列の場合
                          profile.skills.slice(0, 2).map((skillGroup, index) => (
                            <React.Fragment key={index}>
                              {skillGroup.items && skillGroup.items.slice(0, 3).map((skill, skillIndex) => (
                                <span
                                  key={`${index}-${skillIndex}`}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </React.Fragment>
                          ))
                        )
                      )}
                      {Array.isArray(profile.skills) && 
                       (typeof profile.skills[0] === 'string' 
                         ? profile.skills.length > 5
                         : profile.skills.reduce((acc, sg) => acc + (sg.items?.length || 0), 0) > 6) && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{typeof profile.skills[0] === 'string' 
                            ? profile.skills.length - 5
                            : profile.skills.reduce((acc, sg) => acc + (sg.items?.length || 0), 0) - 6}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 希望条件 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.preferences?.locations?.join(', ') || '未設定'}</span>
                    </div>
                    {profile.preferences.salaryRange && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {profile.preferences.salaryRange.min}~{profile.preferences.salaryRange.max}万円
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{profile.preferences.availabilityPeriod}</span>
                    </div>
                  </div>

                  {/* CA所感（一部） */}
                  <div className="p-3 bg-blue-50 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-blue-900 mb-1">CA所感</p>
                    <p className="text-xs text-blue-800 line-clamp-2">
                      {profile.advisorInsights.recommendations}
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewProfile(profile)
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      詳細を見る
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRequestRecommendation(profile.id)
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      推薦依頼
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">候補者詳細: {selectedProfile.profileCode}</h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* キャリアサマリー */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">キャリアサマリー</h3>
                <p className="text-gray-700">{selectedProfile.careerSummary}</p>
              </div>

              {/* 経歴 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">職歴</h3>
                <div className="space-y-3">
                  {selectedProfile.experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <p className="font-medium">{exp.position}</p>
                      <p className="text-sm text-gray-600">
                        {exp.industry} / {exp.companySize === 'enterprise' ? '大企業' : 
                         exp.companySize === 'large' ? '大手' :
                         exp.companySize === 'medium' ? '中規模' :
                         exp.companySize === 'small' ? '中小' : 'スタートアップ'}
                        （{exp.duration}）
                      </p>
                      <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* スキル */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">スキル</h3>
                {selectedProfile.skills?.map((skillGroup, index) => 
                  typeof skillGroup === 'string' ? (
                    <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2 mb-2">
                      {skillGroup}
                    </span>
                  ) : (
                  <div key={index} className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
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

              {/* CA所感 */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">キャリアアドバイザー所感</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">人物像</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfile.advisorInsights?.personalityTraits?.join('、') || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">強み</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfile.advisorInsights?.strengths?.join('、') || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">推奨</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfile.advisorInsights?.recommendations || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">適合職種</p>
                    <p className="text-sm text-gray-600">
                      {selectedProfile.advisorInsights?.fitForRoles?.join('、') || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 border rounded-lg hover:bg-white"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  onRequestRecommendation(selectedProfile.id)
                  setSelectedProfile(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                この候補者を推薦依頼
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}