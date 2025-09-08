'use client'

import React, { useState } from 'react'
import { JobSeeker, JobPosting, JobApplication, ApplicationStatus } from '@/types'
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus
} from 'lucide-react'

interface AgentRecommendationListProps {
  recommendations: JobApplication[]
  jobSeekers: JobSeeker[]
  jobPostings: JobPosting[]
  currentAgentId: string
  onViewRecommendation: (recommendation: JobApplication) => void
  onCreateRecommendation: () => void
}

const statusLabels: Record<ApplicationStatus, { label: string; color: string; icon: any }> = {
  new: { label: '新規', color: 'bg-blue-50 text-blue-700', icon: Clock },
  applied: { label: '応募済み', color: 'bg-blue-100 text-blue-800', icon: FileText },
  reviewing: { label: '審査中', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  shortlisted: { label: '候補者リスト入り', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  interviewing: { label: '面接中', color: 'bg-purple-100 text-purple-800', icon: Calendar },
  offered: { label: 'オファー済み', color: 'bg-orange-100 text-orange-800', icon: MessageCircle },
  accepted: { label: '承諾', color: 'bg-green-200 text-green-900', icon: CheckCircle },
  rejected: { label: '不採用', color: 'bg-red-100 text-red-800', icon: XCircle },
  withdrawn: { label: '辞退', color: 'bg-gray-200 text-gray-700', icon: AlertTriangle }
}

export function AgentRecommendationList({
  recommendations,
  jobSeekers,
  jobPostings,
  currentAgentId,
  onViewRecommendation,
  onCreateRecommendation
}: AgentRecommendationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const itemsPerPage = 10

  // Filter recommendations by current agent
  const agentRecommendations = recommendations.filter(rec => 
    rec.agentId === currentAgentId && rec.source === 'agent'
  )

  // Filtering
  const filteredRecommendations = agentRecommendations.filter(rec => {
    const jobSeeker = jobSeekers.find(js => js.id === rec.jobSeekerId)
    const jobPosting = jobPostings.find(jp => jp.id === rec.jobPostingId)
    
    const matchesSearch = 
      jobSeeker?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobSeeker?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobPosting?.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || rec.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Sort by date (newest first)
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => 
    new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  )

  // Pagination
  const totalPages = Math.ceil(sortedRecommendations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecommendations = sortedRecommendations.slice(startIndex, endIndex)

  // Get status counts
  const statusCounts = agentRecommendations.reduce((acc, rec) => {
    acc[rec.status] = (acc[rec.status] || 0) + 1
    return acc
  }, {} as Record<ApplicationStatus, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">推薦管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            推薦した候補者の選考状況を管理
          </p>
        </div>
        <button
          onClick={onCreateRecommendation}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>新規推薦</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総推薦数</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {agentRecommendations.length}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">審査中</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {statusCounts.reviewing || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">面接中</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {statusCounts.interviewing || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">オファー</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {statusCounts.offered || 0}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">採用成功</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {statusCounts.accepted || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="候補者名、メール、求人タイトルで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-green-50 border-green-500 text-green-700' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>フィルター</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                {Object.entries(statusLabels).map(([status, { label }]) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as ApplicationStatus)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedStatus === status
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  候補者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  推薦日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終更新
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecommendations.map((recommendation) => {
                const jobSeeker = jobSeekers.find(js => js.id === recommendation.jobSeekerId)
                const jobPosting = jobPostings.find(jp => jp.id === recommendation.jobPostingId)
                const StatusIcon = statusLabels[recommendation.status].icon
                
                if (!jobSeeker || !jobPosting) return null
                
                return (
                  <tr key={recommendation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {jobSeeker.profileImageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={jobSeeker.profileImageUrl}
                              alt={jobSeeker.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {jobSeeker.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{jobSeeker.name}</div>
                          <div className="text-sm text-gray-500">{jobSeeker.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{jobPosting.title}</div>
                        <div className="text-gray-500">
                          {jobPosting.department && `${jobPosting.department} • `}
                          {jobPosting.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(recommendation.appliedAt).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          statusLabels[recommendation.status].color
                        }`}>
                          {statusLabels[recommendation.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(recommendation.updatedAt).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewRecommendation(recommendation)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        詳細
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {sortedRecommendations.length}件中 {startIndex + 1}-{Math.min(endIndex, sortedRecommendations.length)}件を表示
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
                      ? 'bg-green-500 text-white'
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
  )
}