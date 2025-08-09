'use client'

import React, { useState } from 'react'
import { 
  Inbox, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Building,
  DollarSign,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  ChevronRight,
  Filter,
  Search,
  Briefcase
} from 'lucide-react'
import type { RecommendationRequest, RecommendationRequestStatus } from '@/types'

interface RequestInboxProps {
  requests: RecommendationRequest[]
  onViewRequest: (request: RecommendationRequest) => void
  onSendToLine: (requestId: string) => void
  onUpdateStatus: (requestId: string, status: RecommendationRequestStatus) => void
}

export default function RequestInbox({ 
  requests, 
  onViewRequest, 
  onSendToLine,
  onUpdateStatus 
}: RequestInboxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null)

  // 求職者ごとにグループ化
  const groupedRequests = requests.reduce<Record<string, RecommendationRequest[]>>((acc, req) => {
    const candidateKey = req.candidateId || req.maskedProfileId || 'unknown'
    if (!acc[candidateKey]) {
      acc[candidateKey] = []
    }
    acc[candidateKey].push(req)
    return acc
  }, {})

  // 求職者リストを作成
  const candidateList = Object.entries(groupedRequests).map(([candidateId, reqs]) => {
    const firstReq = reqs[0]
    return {
      candidateId,
      candidateName: firstReq.candidateName || '候補者' + candidateId.slice(-4),
      candidateSkills: firstReq.candidateSkills || [],
      candidateExperience: firstReq.candidateExperience || '',
      candidateCurrentCompany: firstReq.candidateCurrentCompany || '',
      requestCount: reqs.length,
      newRequestCount: reqs.filter(r => r.status === 'new').length,
      latestRequest: reqs.sort((a, b) => 
        new Date(b.requestDate || b.createdAt || 0).getTime() - 
        new Date(a.requestDate || a.createdAt || 0).getTime()
      )[0]
    }
  })

  // ステータスごとのアイコンとカラー
  const getStatusIcon = (status: RecommendationRequestStatus) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'viewed':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'sent_to_candidate':
        return <Send className="w-4 h-4 text-purple-500" />
      case 'candidate_interested':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'candidate_declined':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusLabel = (status: RecommendationRequestStatus) => {
    const labels: Record<RecommendationRequestStatus, string> = {
      'new': '新着',
      'viewed': '既読',
      'in_progress': '対応中',
      'sent_to_candidate': '候補者に送信済み',
      'candidate_interested': '候補者が興味あり',
      'candidate_declined': '候補者が辞退',
      'completed': '完了',
      'expired': '期限切れ',
      'cancelled': 'キャンセル'
    }
    return labels[status]
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  // フィルタリング
  const filteredCandidates = candidateList.filter(candidate => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        candidate.candidateName.toLowerCase().includes(search) ||
        candidate.candidateId.toLowerCase().includes(search)
      )
    }
    return true
  })

  // 選択された求職者のリクエスト
  const selectedCandidateRequests = selectedCandidate 
    ? groupedRequests[selectedCandidate] || []
    : []

  return (
    <div className="h-full flex">
      {/* サイドバー - 求職者一覧 */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-4">求職者別 推薦リクエスト</h2>
          
          {/* 検索 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="求職者名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="text-sm text-gray-600">
            合計 {candidateList.length} 名の求職者
          </div>
        </div>

        {/* 求職者一覧 */}
        <div className="flex-1 overflow-y-auto">
          {filteredCandidates.map((candidate) => {
            const hasNewRequests = candidate.newRequestCount > 0
            
            return (
              <div
                key={candidate.candidateId}
                onClick={() => {
                  setSelectedCandidate(candidate.candidateId)
                  setSelectedRequest(null)
                }}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedCandidate === candidate.candidateId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {candidate.candidateName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {candidate.candidateId}
                      </p>
                    </div>
                  </div>
                  {hasNewRequests && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      新着 {candidate.newRequestCount}
                    </span>
                  )}
                </div>

                <div className="ml-13">
                  <div className="text-sm text-gray-600 mb-1">
                    {candidate.candidateExperience} | {candidate.candidateCurrentCompany}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {candidate.requestCount} 件の推薦
                    </span>
                  </div>
                  {candidate.candidateSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.candidateSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {candidate.candidateSkills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.candidateSkills.length - 3}
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

      {/* メインエリア */}
      <div className="flex-1 overflow-hidden">
        {selectedCandidate ? (
          <div className="h-full flex">
            {/* 推薦リクエスト一覧 */}
            <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
              <div className="p-4 bg-white border-b">
                <h3 className="font-semibold text-gray-900">推薦リクエスト一覧</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCandidateRequests.length} 件のリクエスト
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {selectedCandidateRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 bg-white border-b cursor-pointer hover:bg-gray-50 ${
                      selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm text-gray-600">
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(request.priority)}`}>
                        {request.priority === 'urgent' ? '緊急' : 
                         request.priority === 'high' ? '高' :
                         request.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1">
                      {request.jobPostingTitle || '求人タイトル'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {request.requesterCompany}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.location || '東京都'}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {request.salaryRange || '応相談'}
                      </span>
                    </div>

                    {request.deadline && (
                      <div className="mt-2 text-xs text-red-600">
                        期限: {new Date(request.deadline).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* リクエスト詳細 */}
            {selectedRequest && (
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {selectedRequest.jobPostingTitle || '求人情報'}
                      </h2>
                      <p className="text-gray-600">
                        {selectedRequest.requesterCompany} - {selectedRequest.requesterName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedRequest.status === 'new' && (
                        <button
                          onClick={() => onUpdateStatus(selectedRequest.id, 'in_progress')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                          対応開始
                        </button>
                      )}
                      {(selectedRequest.status === 'in_progress' || selectedRequest.status === 'viewed') && (
                        <button
                          onClick={() => onSendToLine(selectedRequest.id)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          LINEで候補者に送信
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 求人詳細 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">求人詳細</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">勤務地</p>
                        <p className="font-medium">{selectedRequest.location || '東京都'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">給与</p>
                        <p className="font-medium">{selectedRequest.salaryRange || '応相談'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">雇用形態</p>
                        <p className="font-medium">{selectedRequest.employmentType || '正社員'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">募集期限</p>
                        <p className="font-medium">
                          {selectedRequest.deadline 
                            ? new Date(selectedRequest.deadline).toLocaleDateString('ja-JP')
                            : '期限なし'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 仕事内容 */}
                  {selectedRequest.jobDescription && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">仕事内容</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.jobDescription}
                      </p>
                    </div>
                  )}

                  {/* 必須スキル */}
                  {selectedRequest.requiredSkills && selectedRequest.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">必須スキル</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.requiredSkills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 福利厚生 */}
                  {selectedRequest.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">福利厚生</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedRequest.benefits) ? (
                          selectedRequest.benefits.map((benefit, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {benefit}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-700">{selectedRequest.benefits}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HR担当者からのメッセージ */}
                  {selectedRequest.message && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">HR担当者からのメッセージ</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.message}
                      </p>
                    </div>
                  )}

                  {/* 備考 */}
                  {selectedRequest.notes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">備考</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRequest.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>求職者を選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}