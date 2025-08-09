'use client'

import React, { useState } from 'react'
import { 
  Send, 
  User, 
  Briefcase, 
  Building, 
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Video,
  Paperclip
} from 'lucide-react'
import type { 
  MaskedProfile, 
  JobPosting, 
  RecommendationRequest,
  Company 
} from '@/types'

interface RecommendationRequestFormProps {
  profile?: MaskedProfile
  jobPosting?: JobPosting
  maskedProfiles?: MaskedProfile[]
  companies?: Company[]
  company?: Company
  jobPostings?: JobPosting[]
  onSubmit: (request: Partial<RecommendationRequest>) => void
  onCancel?: () => void
}

export default function RecommendationRequestForm({ 
  profile,
  jobPosting,
  jobPostings,
  maskedProfiles,
  companies,
  company,
  onSubmit,
  onCancel 
}: RecommendationRequestFormProps) {
  const [formData, setFormData] = useState<Partial<RecommendationRequest>>({
    maskedProfileId: profile?.id || '',
    requesterCompany: company?.name || '',
    jobPostingId: jobPosting?.id || '',
    message: '',
    requirements: [],
    preferredSkills: [],
    offeredSalary: {
      min: 0,
      max: 0,
      currency: 'JPY',
      negotiable: true
    },
    benefits: [],
    startDate: undefined,
    priority: 'medium',
    deadline: undefined,
    attachments: []
  })

  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  // 求人選択時の処理
  const handleJobSelect = (jobId: string) => {
    const job = jobPostings?.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setFormData({
        ...formData,
        jobPostingId: jobId,
        offeredSalary: job.salary || formData.offeredSalary,
        benefits: job.benefits || [],
        requirements: job.requirements || []
      })
    }
  }

  // デフォルトメッセージの生成
  const generateDefaultMessage = () => {
    if (!selectedJob) return ''
    
    return `この度は、貴社にぜひご検討いただきたい候補者がおります。

候補者プロファイル: ${profile?.profileCode || 'N/A'}

【ポジション】${selectedJob.title}

この候補者は${profile?.yearsOfExperience || 0}年の経験を持ち、${profile?.currentJobLevel || ''}レベルで活躍されています。
${profile?.advisorInsights?.strengths?.slice(0, 2)?.join('、') || ''}という強みがあり、
${selectedJob.title}のポジションに最適な人材と考えております。

特に以下の点で貴社のニーズにマッチしています：
${profile?.advisorInsights?.recommendations || ''}

ぜひ一度、詳細なプロフィールをご覧いただき、面談の機会をいただければ幸いです。

よろしくお願いいたします。`
  }

  const handleSubmit = () => {
    if (!formData.jobPostingId) {
      alert('求人を選択してください')
      return
    }
    if (!formData.message) {
      formData.message = generateDefaultMessage()
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">推薦リクエスト送信</h2>
              <p className="text-blue-100">
                候補者 {profile?.profileCode || 'N/A'} を推薦
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-blue-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* フォーム本体 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* 候補者情報サマリー */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              候補者情報
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">プロファイル:</span> {profile?.profileCode || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">経験年数:</span> {profile?.yearsOfExperience || 0}年
              </div>
              <div>
                <span className="text-gray-600">現在のレベル:</span> {profile?.currentJobLevel || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">希望勤務地:</span> {profile?.preferences?.locations?.join(', ') || '未設定'}
              </div>
            </div>
          </div>

          {/* 求人選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              対象求人 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.jobPostingId}
              onChange={(e) => handleJobSelect(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">求人を選択してください</option>
              {jobPostings?.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.department} ({job.location})
                </option>
              ))}
            </select>
          </div>

          {/* 選択した求人の詳細 */}
          {selectedJob && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">{selectedJob.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  {selectedJob.salary 
                    ? `${selectedJob.salary.min}~${selectedJob.salary.max}万円`
                    : '応相談'}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  {selectedJob.employmentType}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  採用予定: {selectedJob.numberOfOpenings}名
                </div>
              </div>
            </div>
          )}

          {/* メッセージ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              エージェントへのメッセージ
            </label>
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setFormData({ ...formData, message: generateDefaultMessage() })}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                デフォルトメッセージを使用
              </button>
            </div>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={6}
              placeholder="なぜこの候補者を推薦したいか、詳細を記載してください"
            />
          </div>

          {/* 提示条件 */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">提示条件</h3>
            
            {/* 給与 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                提示年収（万円）
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="最小"
                  value={formData.offeredSalary?.min}
                  onChange={(e) => setFormData({
                    ...formData,
                    offeredSalary: {
                      ...formData.offeredSalary!,
                      min: parseInt(e.target.value)
                    }
                  })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <span>〜</span>
                <input
                  type="number"
                  placeholder="最大"
                  value={formData.offeredSalary?.max}
                  onChange={(e) => setFormData({
                    ...formData,
                    offeredSalary: {
                      ...formData.offeredSalary!,
                      max: parseInt(e.target.value)
                    }
                  })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offeredSalary?.negotiable}
                    onChange={(e) => setFormData({
                      ...formData,
                      offeredSalary: {
                        ...formData.offeredSalary!,
                        negotiable: e.target.checked
                      }
                    })}
                  />
                  <span className="text-sm">交渉可</span>
                </label>
              </div>
            </div>

            {/* 開始予定日 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                入社予定日
              </label>
              <input
                type="date"
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* 福利厚生 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                福利厚生
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="福利厚生を追加"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={() => {
                    if (newBenefit) {
                      setFormData({
                        ...formData,
                        benefits: [...(formData.benefits || []), newBenefit]
                      })
                      setNewBenefit('')
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits?.map((benefit, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                    {benefit}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        benefits: formData.benefits?.filter((_, i) => i !== index)
                      })}
                      className="ml-1 hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 優先度と期限 */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                優先度
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                回答期限
              </label>
              <input
                type="date"
                value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* 詳細設定 */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              詳細設定
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* 追加要件 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    追加要件
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="要件を追加"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (newRequirement) {
                          setFormData({
                            ...formData,
                            requirements: [...(formData.requirements || []), newRequirement]
                          })
                          setNewRequirement('')
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {formData.requirements?.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="flex-1">{req}</span>
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            requirements: formData.requirements?.filter((_, i) => i !== index)
                          })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 希望スキル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望スキル
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="スキルを追加"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (newSkill) {
                          setFormData({
                            ...formData,
                            preferredSkills: [...(formData.preferredSkills || []), newSkill]
                          })
                          setNewSkill('')
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredSkills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            preferredSkills: formData.preferredSkills?.filter((_, i) => i !== index)
                          })}
                          className="ml-2"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 添付ファイル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    添付資料
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      クリックまたはドラッグ&ドロップでファイルをアップロード
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ピッチ資料、動画、会社紹介資料など
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              ※ 送信後、エージェントに通知が送られます
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 border rounded-lg hover:bg-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                推薦リクエストを送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}