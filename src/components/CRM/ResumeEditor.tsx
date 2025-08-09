'use client'

import React, { useState } from 'react'
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Globe, 
  Plus, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Send,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Clock
} from 'lucide-react'
import type { 
  JobSeeker, 
  WorkHistory, 
  Education, 
  Skill, 
  Certification, 
  Language,
  MaskedProfile 
} from '@/types'

interface ResumeEditorProps {
  jobSeeker?: JobSeeker
  onSave: (data: Partial<JobSeeker>) => void
  onMaskAndPublish?: (jobSeekerId: string) => void
}

export default function ResumeEditor({ jobSeeker, onSave, onMaskAndPublish }: ResumeEditorProps) {
  const [formData, setFormData] = useState<Partial<JobSeeker>>(jobSeeker || {
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: undefined,
    currentCompany: '',
    currentPosition: '',
    yearsOfExperience: 0,
    workHistory: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    desiredPositions: [],
    desiredSalary: { min: 0, max: 0, currency: 'JPY' },
    desiredLocation: [],
    workStyle: 'full-time',
    notes: ''
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'experience' | 'skills' | 'preferences'>('basic')
  const [showMaskedPreview, setShowMaskedPreview] = useState(false)

  // 職歴追加
  const addWorkHistory = () => {
    const newWork: WorkHistory = {
      id: `temp-${Date.now()}`,
      company: '',
      position: '',
      startDate: new Date(),
      endDate: undefined,
      isCurrent: false,
      description: '',
      achievements: []
    }
    setFormData({
      ...formData,
      workHistory: [...(formData.workHistory || []), newWork]
    })
  }

  // 学歴追加
  const addEducation = () => {
    const newEdu: Education = {
      id: `temp-${Date.now()}`,
      school: '',
      degree: '',
      field: '',
      startDate: new Date(),
      endDate: undefined,
      isCurrent: false,
      description: ''
    }
    setFormData({
      ...formData,
      education: [...(formData.education || []), newEdu]
    })
  }

  // スキル追加
  const addSkill = () => {
    const newSkill: Skill = {
      id: `temp-${Date.now()}`,
      name: '',
      level: 'intermediate',
      yearsOfExperience: 0
    }
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), newSkill]
    })
  }

  // 資格追加
  const addCertification = () => {
    const newCert: Certification = {
      id: `temp-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: new Date(),
      expiryDate: undefined
    }
    setFormData({
      ...formData,
      certifications: [...(formData.certifications || []), newCert]
    })
  }

  // 言語追加
  const addLanguage = () => {
    const newLang: Language = {
      id: `temp-${Date.now()}`,
      name: '',
      proficiency: 'conversational'
    }
    setFormData({
      ...formData,
      languages: [...(formData.languages || []), newLang]
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* ヘッダー */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">履歴書・職務経歴書エディター</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMaskedPreview(!showMaskedPreview)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {showMaskedPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showMaskedPreview ? 'マスク解除' : 'マスクプレビュー'}
              </button>
              {onMaskAndPublish && jobSeeker?.id && (
                <button
                  onClick={() => onMaskAndPublish(jobSeeker.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  マスク化してATS側へ公開
                </button>
              )}
              <button
                onClick={() => onSave(formData)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'basic' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              基本情報
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'experience' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              職歴・学歴
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'skills' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              スキル・資格
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'preferences' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              希望条件
            </button>
          </nav>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          {/* 基本情報タブ */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名 {showMaskedPreview && <span className="text-red-500">(マスク)</span>}
                  </label>
                  <input
                    type="text"
                    value={showMaskedPreview ? '***' : (formData.name || '')}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={showMaskedPreview}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス {showMaskedPreview && <span className="text-red-500">(マスク)</span>}
                  </label>
                  <input
                    type="email"
                    value={showMaskedPreview ? '***@***.***' : (formData.email || '')}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={showMaskedPreview}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号 {showMaskedPreview && <span className="text-red-500">(マスク)</span>}
                  </label>
                  <input
                    type="tel"
                    value={showMaskedPreview ? '***-****-****' : (formData.phone || '')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={showMaskedPreview}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所 {showMaskedPreview && <span className="text-red-500">(マスク)</span>}
                  </label>
                  <input
                    type="text"
                    value={showMaskedPreview ? '東京都' : (formData.address || '')}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={showMaskedPreview}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現在の会社 {showMaskedPreview && <span className="text-blue-500">(業界で表示)</span>}
                  </label>
                  <input
                    type="text"
                    value={showMaskedPreview ? 'IT企業（大手）' : (formData.currentCompany || '')}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={showMaskedPreview}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    現在の役職
                  </label>
                  <input
                    type="text"
                    value={formData.currentPosition || ''}
                    onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    経験年数
                  </label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience || 0}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 職歴・学歴タブ */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* 職歴 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">職歴</h3>
                  <button
                    onClick={addWorkHistory}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.workHistory?.map((work, index) => (
                    <div key={work.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={showMaskedPreview ? "IT企業（大手）" : "会社名"}
                          value={showMaskedPreview ? `業界${index + 1}` : work.company}
                          onChange={(e) => {
                            const updated = [...(formData.workHistory || [])]
                            updated[index] = { ...work, company: e.target.value }
                            setFormData({ ...formData, workHistory: updated })
                          }}
                          className="px-3 py-2 border rounded"
                          disabled={showMaskedPreview}
                        />
                        <input
                          type="text"
                          placeholder="役職"
                          value={work.position}
                          onChange={(e) => {
                            const updated = [...(formData.workHistory || [])]
                            updated[index] = { ...work, position: e.target.value }
                            setFormData({ ...formData, workHistory: updated })
                          }}
                          className="px-3 py-2 border rounded"
                        />
                      </div>
                      <textarea
                        placeholder="職務内容・実績"
                        value={work.description || ''}
                        onChange={(e) => {
                          const updated = [...(formData.workHistory || [])]
                          updated[index] = { ...work, description: e.target.value }
                          setFormData({ ...formData, workHistory: updated })
                        }}
                        className="w-full mt-2 px-3 py-2 border rounded"
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 学歴 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">学歴</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.education?.map((edu, index) => (
                    <div key={edu.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={showMaskedPreview ? "大学" : "学校名"}
                          value={showMaskedPreview ? edu.degree || '学士' : edu.school}
                          onChange={(e) => {
                            const updated = [...(formData.education || [])]
                            updated[index] = { ...edu, school: e.target.value }
                            setFormData({ ...formData, education: updated })
                          }}
                          className="px-3 py-2 border rounded"
                          disabled={showMaskedPreview}
                        />
                        <input
                          type="text"
                          placeholder="専攻"
                          value={edu.field || ''}
                          onChange={(e) => {
                            const updated = [...(formData.education || [])]
                            updated[index] = { ...edu, field: e.target.value }
                            setFormData({ ...formData, education: updated })
                          }}
                          className="px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* スキル・資格タブ */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* スキル */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">スキル</h3>
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {formData.skills?.map((skill, index) => (
                    <div key={skill.id} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="スキル名"
                        value={skill.name || ''}
                        onChange={(e) => {
                          const updated = [...(formData.skills || [])]
                          updated[index] = { ...skill, name: e.target.value }
                          setFormData({ ...formData, skills: updated })
                        }}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => {
                          const updated = [...(formData.skills || [])]
                          updated[index] = { ...skill, level: e.target.value as any }
                          setFormData({ ...formData, skills: updated })
                        }}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="beginner">初級</option>
                        <option value="intermediate">中級</option>
                        <option value="advanced">上級</option>
                        <option value="expert">エキスパート</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* 資格 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">資格</h3>
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.certifications?.map((cert, index) => (
                    <div key={cert.id} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="資格名"
                        value={cert.name || ''}
                        onChange={(e) => {
                          const updated = [...(formData.certifications || [])]
                          updated[index] = { ...cert, name: e.target.value }
                          setFormData({ ...formData, certifications: updated })
                        }}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="発行機関"
                        value={cert.issuer || ''}
                        onChange={(e) => {
                          const updated = [...(formData.certifications || [])]
                          updated[index] = { ...cert, issuer: e.target.value }
                          setFormData({ ...formData, certifications: updated })
                        }}
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 言語 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">言語</h3>
                  <button
                    onClick={addLanguage}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {formData.languages?.map((lang, index) => (
                    <div key={lang.id} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="言語"
                        value={lang.name || ''}
                        onChange={(e) => {
                          const updated = [...(formData.languages || [])]
                          updated[index] = { ...lang, name: e.target.value }
                          setFormData({ ...formData, languages: updated })
                        }}
                        className="flex-1 px-3 py-2 border rounded"
                      />
                      <select
                        value={lang.proficiency}
                        onChange={(e) => {
                          const updated = [...(formData.languages || [])]
                          updated[index] = { ...lang, proficiency: e.target.value as any }
                          setFormData({ ...formData, languages: updated })
                        }}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="native">ネイティブ</option>
                        <option value="fluent">流暢</option>
                        <option value="conversational">日常会話</option>
                        <option value="basic">基礎</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 希望条件タブ */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望職種
                </label>
                <textarea
                  placeholder="希望する職種を入力（複数可）"
                  value={formData.desiredPositions?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    desiredPositions: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望年収（最小）
                  </label>
                  <input
                    type="number"
                    value={formData.desiredSalary?.min || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      desiredSalary: { 
                        ...formData.desiredSalary!, 
                        min: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望年収（最大）
                  </label>
                  <input
                    type="number"
                    value={formData.desiredSalary?.max || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      desiredSalary: { 
                        ...formData.desiredSalary!, 
                        max: parseInt(e.target.value) 
                      } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望勤務地
                </label>
                <textarea
                  placeholder="希望する勤務地を入力（複数可）"
                  value={formData.desiredLocation?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    desiredLocation: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  雇用形態
                </label>
                <select
                  value={formData.workStyle || 'full-time'}
                  onChange={(e) => setFormData({ ...formData, workStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="full-time">正社員</option>
                  <option value="part-time">パート・アルバイト</option>
                  <option value="contract">契約社員</option>
                  <option value="freelance">フリーランス</option>
                  <option value="intern">インターン</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考・その他
                </label>
                <textarea
                  placeholder="その他の希望条件や備考"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}