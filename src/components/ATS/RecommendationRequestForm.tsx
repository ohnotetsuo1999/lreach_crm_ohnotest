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
  Paperclip,
  X,
  Percent,
  Shield,
  RefreshCw,
  Info,
  Calculator,
  File,
  FileCheck,
  Download,
  Eye
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

interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  url?: string
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
  const [showAgentTerms, setShowAgentTerms] = useState(false)
  const [newRequirement, setNewRequirement] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  
  // ファイルアップロード関連
  const [agentFiles, setAgentFiles] = useState<FileUpload[]>([])
  const [candidateFiles, setCandidateFiles] = useState<FileUpload[]>([])
  const [isDraggingAgent, setIsDraggingAgent] = useState(false)
  const [isDraggingCandidate, setIsDraggingCandidate] = useState(false)
  
  // エージェント向け条件
  const [agentTerms, setAgentTerms] = useState({
    commissionRate: 30, // デフォルト30%
    commissionType: 'annual', // 'annual' or 'fixed'
    fixedCommission: 0,
    guaranteePeriod: 3, // 返金保証期間（月）
    refundPolicy: 'full', // 'full', 'partial', 'none'
    partialRefundRates: [
      { month: 1, rate: 100 },
      { month: 2, rate: 70 },
      { month: 3, rate: 50 }
    ],
    paymentTiming: 'after_start', // 'after_start' or 'after_probation'
    paymentDays: 30, // 入社後の支払い日数
    additionalTerms: ''
  })

  // ファイルアップロード処理
  const handleFileUpload = (files: FileList | null, type: 'agent' | 'candidate') => {
    if (!files) return
    
    const newFiles: FileUpload[] = Array.from(files).map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file)
    }))
    
    if (type === 'agent') {
      setAgentFiles([...agentFiles, ...newFiles])
    } else {
      setCandidateFiles([...candidateFiles, ...newFiles])
    }
  }

  // ファイル削除処理
  const handleFileRemove = (fileId: string, type: 'agent' | 'candidate') => {
    if (type === 'agent') {
      setAgentFiles(agentFiles.filter(f => f.id !== fileId))
    } else {
      setCandidateFiles(candidateFiles.filter(f => f.id !== fileId))
    }
  }

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent, type: 'agent' | 'candidate') => {
    e.preventDefault()
    if (type === 'agent') {
      setIsDraggingAgent(true)
    } else {
      setIsDraggingCandidate(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent, type: 'agent' | 'candidate') => {
    e.preventDefault()
    if (type === 'agent') {
      setIsDraggingAgent(false)
    } else {
      setIsDraggingCandidate(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'agent' | 'candidate') => {
    e.preventDefault()
    if (type === 'agent') {
      setIsDraggingAgent(false)
    } else {
      setIsDraggingCandidate(false)
    }
    handleFileUpload(e.dataTransfer.files, type)
  }

  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 求人選択時の処理
  const handleJobSelect = (jobId: string) => {
    const job = jobPostings?.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setFormData({
        ...formData,
        jobPostingId: jobId,
        offeredSalary: job.salary ? {
          min: job.salary.min,
          max: job.salary.max,
          currency: job.salary.currency,
          negotiable: true
        } : formData.offeredSalary,
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

  // 手数料の計算
  const calculateCommission = () => {
    if (!formData.offeredSalary) return 0
    
    const annualSalary = (formData.offeredSalary.min + formData.offeredSalary.max) / 2
    
    if (agentTerms.commissionType === 'annual') {
      return Math.round(annualSalary * (agentTerms.commissionRate / 100))
    } else {
      return agentTerms.fixedCommission
    }
  }

  const handleSubmit = () => {
    if (!formData.jobPostingId) {
      alert('求人を選択してください')
      return
    }
    if (!formData.message) {
      formData.message = generateDefaultMessage()
    }
    
    // エージェント条件とファイルを含めて送信
    const requestWithExtras = {
      ...formData,
      agentTerms: agentTerms,
      agentFiles: agentFiles,
      candidateFiles: candidateFiles
    }
    
    onSubmit(requestWithExtras)
  }

  return (
    <>
      {/* オーバーレイ背景 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* 右スライドパネル */}
      <div className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">推薦リクエスト送信</h2>
                <p className="text-blue-100 text-sm">
                  候補者 {profile?.profileCode || 'N/A'} を推薦
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* フォーム本体 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* 候補者情報サマリー */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  対象求人 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jobPostingId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="bg-blue-50 rounded-lg p-4">
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

              {/* 添付資料セクション */}
              <div className="space-y-4">
                {/* エージェント向け資料 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    エージェント向け資料
                    <span className="text-xs text-gray-500">（エージェントのみ閲覧可能）</span>
                  </h4>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDraggingAgent ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'agent')}
                    onDragLeave={(e) => handleDragLeave(e, 'agent')}
                    onDrop={(e) => handleDrop(e, 'agent')}
                  >
                    <input
                      type="file"
                      id="agent-files"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'agent')}
                    />
                    <label htmlFor="agent-files" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        クリックまたはドラッグ&ドロップでファイルをアップロード
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        会社紹介資料、求人詳細、福利厚生資料など
                      </p>
                    </label>
                  </div>
                  
                  {/* アップロード済みファイル */}
                  {agentFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {agentFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            onClick={() => handleFileRemove(file.id, 'agent')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 求職者展開OK資料 */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-green-600" />
                    求職者展開OK資料
                    <span className="text-xs text-gray-500">（求職者への共有可能）</span>
                  </h4>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDraggingCandidate ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'candidate')}
                    onDragLeave={(e) => handleDragLeave(e, 'candidate')}
                    onDrop={(e) => handleDrop(e, 'candidate')}
                  >
                    <input
                      type="file"
                      id="candidate-files"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, 'candidate')}
                    />
                    <label htmlFor="candidate-files" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        クリックまたはドラッグ&ドロップでファイルをアップロード
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        求人票、職場環境資料、プロジェクト概要など
                      </p>
                    </label>
                  </div>
                  
                  {/* アップロード済みファイル */}
                  {candidateFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {candidateFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <button
                            onClick={() => handleFileRemove(file.id, 'candidate')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* エージェント向け条件 */}
              <div className="border rounded-lg mb-6">
                <button
                  onClick={() => setShowAgentTerms(!showAgentTerms)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">エージェント向け条件</span>
                    <span className="text-sm text-gray-600">
                      (手数料: {agentTerms.commissionRate}% / 約{calculateCommission()}万円)
                    </span>
                  </div>
                  {showAgentTerms ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {showAgentTerms && (
                  <div className="px-4 pb-4 space-y-4 border-t">
                    {/* 紹介手数料 */}
                    <div className="mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        紹介手数料
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="annual"
                              checked={agentTerms.commissionType === 'annual'}
                              onChange={(e) => setAgentTerms({...agentTerms, commissionType: e.target.value as any})}
                              className="text-blue-600"
                            />
                            <span className="text-sm">年収ベース</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="fixed"
                              checked={agentTerms.commissionType === 'fixed'}
                              onChange={(e) => setAgentTerms({...agentTerms, commissionType: e.target.value as any})}
                              className="text-blue-600"
                            />
                            <span className="text-sm">固定額</span>
                          </label>
                        </div>
                        
                        {agentTerms.commissionType === 'annual' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={agentTerms.commissionRate}
                              onChange={(e) => setAgentTerms({...agentTerms, commissionRate: parseInt(e.target.value) || 0})}
                              className="w-20 px-3 py-2 border rounded-lg text-sm"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm">% (年収に対する割合)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={agentTerms.fixedCommission}
                              onChange={(e) => setAgentTerms({...agentTerms, fixedCommission: parseInt(e.target.value) || 0})}
                              className="w-32 px-3 py-2 border rounded-lg text-sm"
                              min="0"
                            />
                            <span className="text-sm">万円</span>
                          </div>
                        )}
                        
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">予想手数料</span>
                            <span className="text-lg font-bold text-blue-700">
                              {calculateCommission().toLocaleString()} 万円
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 返金保証 */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        返金保証規定
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <label className="text-sm text-gray-700">保証期間</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={agentTerms.guaranteePeriod}
                              onChange={(e) => setAgentTerms({...agentTerms, guaranteePeriod: parseInt(e.target.value) || 0})}
                              className="w-20 px-3 py-2 border rounded-lg text-sm"
                              min="0"
                              max="12"
                            />
                            <span className="text-sm">ヶ月</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">返金ポリシー</label>
                          <select
                            value={agentTerms.refundPolicy}
                            onChange={(e) => setAgentTerms({...agentTerms, refundPolicy: e.target.value as any})}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="full">全額返金</option>
                            <option value="partial">段階的返金</option>
                            <option value="none">返金なし</option>
                          </select>
                        </div>
                        
                        {agentTerms.refundPolicy === 'partial' && (
                          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <p className="text-xs text-gray-600 mb-2">月別返金率</p>
                            {agentTerms.partialRefundRates.map((rate, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{rate.month}ヶ月以内</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={rate.rate}
                                    onChange={(e) => {
                                      const newRates = [...agentTerms.partialRefundRates]
                                      newRates[index].rate = parseInt(e.target.value) || 0
                                      setAgentTerms({...agentTerms, partialRefundRates: newRates})
                                    }}
                                    className="w-16 px-2 py-1 border rounded text-sm"
                                    min="0"
                                    max="100"
                                  />
                                  <span>%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 支払い条件 */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        支払い条件
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-700 block mb-2">支払いタイミング</label>
                          <select
                            value={agentTerms.paymentTiming}
                            onChange={(e) => setAgentTerms({...agentTerms, paymentTiming: e.target.value as any})}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="after_start">入社後</option>
                            <option value="after_probation">試用期間終了後</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={agentTerms.paymentDays}
                            onChange={(e) => setAgentTerms({...agentTerms, paymentDays: parseInt(e.target.value) || 0})}
                            className="w-20 px-3 py-2 border rounded-lg text-sm"
                            min="0"
                            max="90"
                          />
                          <span className="text-sm">日以内に支払い</span>
                        </div>
                      </div>
                    </div>

                    {/* 追加条件・備考 */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        追加条件・備考
                      </h4>
                      <textarea
                        value={agentTerms.additionalTerms}
                        onChange={(e) => setAgentTerms({...agentTerms, additionalTerms: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows={4}
                        placeholder="その他の特記事項、特別な条件などがあれば記入してください"
                      />
                    </div>
                  </div>
                )}
              </div>

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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={6}
                  placeholder="なぜこの候補者を推薦したいか、詳細を記載してください"
                />
              </div>

              {/* 期限 */}
              <div className="mb-6">
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
          </div>

          {/* フッター */}
          <div className="px-6 py-4 border-t bg-gray-50">
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
    </>
  )
}