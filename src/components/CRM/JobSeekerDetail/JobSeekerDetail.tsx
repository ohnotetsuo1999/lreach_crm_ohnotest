'use client'

import { useState } from 'react'
import { JobSeeker, JobApplication, ApplicationStatus } from '@/types'
import {
  ArrowLeft,
  Edit2,
  Download,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  Link2,
  MessageCircle,
  DollarSign,
  Clock,
  Tag,
  MoreVertical,
  Plus,
  Star,
  X
} from 'lucide-react'

interface JobSeekerDetailProps {
  jobSeeker: JobSeeker
  applications?: JobApplication[]
  onBack: () => void
  onEdit: (jobSeeker: JobSeeker) => void
  onDelete: (jobSeekerId: string) => void
  onStartChat: (jobSeekerId: string) => void
  onAddNote: (jobSeekerId: string, note: string) => void
  onUpdateStatus: (jobSeekerId: string, status: JobSeeker['status']) => void
  onAddTag: (jobSeekerId: string, tag: string) => void
  onRemoveTag: (jobSeekerId: string, tag: string) => void
}

const statusLabels: Record<JobSeeker['status'], { label: string; color: string }> = {
  new: { label: '新規', color: 'bg-blue-100 text-blue-800' },
  screening: { label: 'スクリーニング中', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: '適格', color: 'bg-green-100 text-green-800' },
  interviewing: { label: '面接中', color: 'bg-purple-100 text-purple-800' },
  offer_pending: { label: 'オファー検討中', color: 'bg-orange-100 text-orange-800' },
  hired: { label: '採用', color: 'bg-green-200 text-green-900' },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-800' },
  on_hold: { label: '保留', color: 'bg-gray-100 text-gray-800' },
  withdrawn: { label: '辞退', color: 'bg-gray-200 text-gray-700' }
}

const applicationStatusLabels: Record<ApplicationStatus, { label: string; color: string }> = {
  new: { label: '新規', color: 'bg-blue-50 text-blue-700' },
  applied: { label: '応募済み', color: 'bg-blue-100 text-blue-800' },
  reviewing: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
  shortlisted: { label: '候補者リスト入り', color: 'bg-green-100 text-green-800' },
  interviewing: { label: '面接中', color: 'bg-purple-100 text-purple-800' },
  offered: { label: 'オファー済み', color: 'bg-orange-100 text-orange-800' },
  accepted: { label: '承諾', color: 'bg-green-200 text-green-900' },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: '辞退', color: 'bg-gray-200 text-gray-700' }
}

export function JobSeekerDetail({
  jobSeeker,
  applications = [],
  onBack,
  onEdit,
  onDelete,
  onStartChat,
  onAddNote,
  onUpdateStatus,
  onAddTag,
  onRemoveTag
}: JobSeekerDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'applications' | 'notes'>('overview')
  const [newNote, setNewNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showAddTag, setShowAddTag] = useState(false)

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  const calculateAge = (birthDate: Date | undefined) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{jobSeeker.name}</h2>
            <p className="text-sm text-gray-600">求職者詳細</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {jobSeeker.lineUserId && (
            <button
              onClick={() => onStartChat(jobSeeker.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>LINEチャット</span>
            </button>
          )}
          <button
            onClick={() => onEdit(jobSeeker)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </button>
          <button
            onClick={() => {
              if (confirm(`求職者「${jobSeeker.name}」を削除しますか？`)) {
                onDelete(jobSeeker.id)
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {jobSeeker.profileImageUrl ? (
              <img
                src={jobSeeker.profileImageUrl}
                alt={jobSeeker.name}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-medium text-gray-500">
                  {jobSeeker.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{jobSeeker.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{jobSeeker.phone}</span>
              </div>
              {jobSeeker.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{jobSeeker.address}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {jobSeeker.birthDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {formatDate(jobSeeker.birthDate)}
                    {calculateAge(jobSeeker.birthDate) && ` (${calculateAge(jobSeeker.birthDate)}歳)`}
                  </span>
                </div>
              )}
              {jobSeeker.currentCompany && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{jobSeeker.currentCompany}</span>
                </div>
              )}
              {jobSeeker.currentPosition && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{jobSeeker.currentPosition}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-2 ${
                  statusLabels[jobSeeker.status].color
                }`}
              >
                {statusLabels[jobSeeker.status].label}
                <MoreVertical className="w-3 h-3" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {Object.entries(statusLabels).map(([status, { label }]) => (
                    <button
                      key={status}
                      onClick={() => {
                        onUpdateStatus(jobSeeker.id, status as JobSeeker['status'])
                        setShowStatusMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              登録日: {formatDate(jobSeeker.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* タグセクション */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">タグ</h3>
          <button
            onClick={() => setShowAddTag(!showAddTag)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {jobSeeker.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() => onRemoveTag(jobSeeker.id, tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {showAddTag && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (newTag.trim()) {
                  onAddTag(jobSeeker.id, newTag.trim())
                  setNewTag('')
                  setShowAddTag(false)
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="新しいタグ"
                className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
              >
                追加
              </button>
            </form>
          )}
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg border border-gray-200">
        <nav className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            概要
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'experience'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            経歴
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'skills'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            スキル・資格
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'applications'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            応募履歴 ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notes'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            メモ
          </button>
        </nav>

        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">希望条件</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">希望職種:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {jobSeeker.desiredPositions.map((position, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {jobSeeker.desiredSalary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        希望給与: {jobSeeker.desiredSalary.currency} {jobSeeker.desiredSalary.min.toLocaleString()} - {jobSeeker.desiredSalary.max.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {jobSeeker.desiredLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        希望勤務地: {jobSeeker.desiredLocation.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {jobSeeker.workStyle && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        雇用形態: {
                          {
                            'full-time': '正社員',
                            'part-time': 'パート・アルバイト',
                            'contract': '契約社員',
                            'freelance': 'フリーランス',
                            'intern': 'インターン'
                          }[jobSeeker.workStyle]
                        }
                      </span>
                    </div>
                  )}
                  
                  {jobSeeker.availableFrom && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        入社可能日: {formatDate(jobSeeker.availableFrom)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">書類・リンク</h4>
                <div className="space-y-2">
                  {jobSeeker.resumeUrl && (
                    <a
                      href={jobSeeker.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="w-4 h-4" />
                      履歴書
                    </a>
                  )}
                  {jobSeeker.portfolioUrl && (
                    <a
                      href={jobSeeker.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link2 className="w-4 h-4" />
                      ポートフォリオ
                    </a>
                  )}
                  {jobSeeker.attachments?.map(attachment => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="w-4 h-4" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 経歴タブ */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">職歴</h4>
                <div className="space-y-4">
                  {jobSeeker.workHistory?.map(work => (
                    <div key={work.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{work.position}</h5>
                          <p className="text-sm text-gray-600">{work.company}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(work.startDate)} - {work.isCurrent ? '現在' : formatDate(work.endDate)}
                          </p>
                        </div>
                        {work.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            現職
                          </span>
                        )}
                      </div>
                      {work.description && (
                        <p className="mt-2 text-sm text-gray-700">{work.description}</p>
                      )}
                      {work.achievements && work.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {work.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">学歴</h4>
                <div className="space-y-4">
                  {jobSeeker.education?.map(edu => (
                    <div key={edu.id} className="border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium text-gray-900">{edu.school}</h5>
                      {edu.degree && <p className="text-sm text-gray-600">{edu.degree}</p>}
                      {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                      <p className="text-xs text-gray-500">
                        {formatDate(edu.startDate)} - {edu.isCurrent ? '在学中' : formatDate(edu.endDate)}
                      </p>
                      {edu.description && (
                        <p className="mt-2 text-sm text-gray-700">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* スキル・資格タブ */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">スキル</h4>
                <div className="space-y-3">
                  {jobSeeker.skills.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{skill.name}</span>
                        {skill.yearsOfExperience && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({skill.yearsOfExperience}年)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                          <Star
                            key={level}
                            className={`w-4 h-4 ${
                              level <= {
                                beginner: 1,
                                intermediate: 2,
                                advanced: 3,
                                expert: 4
                              }[skill.level]
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">資格</h4>
                <div className="space-y-3">
                  {jobSeeker.certifications.map(cert => (
                    <div key={cert.id} className="border-l-2 border-gray-200 pl-4">
                      <h5 className="font-medium text-gray-900">{cert.name}</h5>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      <p className="text-xs text-gray-500">
                        取得日: {formatDate(cert.issueDate)}
                        {cert.expiryDate && ` (有効期限: ${formatDate(cert.expiryDate)})`}
                      </p>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-500">認定番号: {cert.credentialId}</p>
                      )}
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          証明書を表示
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">言語</h4>
                <div className="space-y-2">
                  {jobSeeker.languages.map(lang => (
                    <div key={lang.id} className="flex items-center justify-between">
                      <span className="text-gray-900">{lang.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        {
                          native: 'bg-green-100 text-green-800',
                          fluent: 'bg-blue-100 text-blue-800',
                          conversational: 'bg-yellow-100 text-yellow-800',
                          basic: 'bg-gray-100 text-gray-800'
                        }[lang.proficiency]
                      }`}>
                        {
                          {
                            native: 'ネイティブ',
                            fluent: '流暢',
                            conversational: '日常会話レベル',
                            basic: '基礎レベル'
                          }[lang.proficiency]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 応募履歴タブ */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">まだ応募履歴がありません</p>
              ) : (
                applications.map(application => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          求人タイトル（ID: {application.jobPostingId}）
                        </h5>
                        <p className="text-sm text-gray-500">
                          応募日: {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        applicationStatusLabels[application.status].color
                      }`}>
                        {applicationStatusLabels[application.status].label}
                      </span>
                    </div>
                    
                    {application.averageRating && (
                      <div className="mt-2 flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{application.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* メモタブ */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (newNote.trim()) {
                    onAddNote(jobSeeker.id, newNote.trim())
                    setNewNote('')
                  }
                }}
                className="space-y-3"
              >
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="新しいメモを追加..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  メモを追加
                </button>
              </form>
              
              {jobSeeker.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{jobSeeker.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}