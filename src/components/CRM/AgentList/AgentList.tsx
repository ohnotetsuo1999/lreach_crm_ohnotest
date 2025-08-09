'use client'

import { useState } from 'react'
import { Agent, AgentStatus, AgentPermission } from '@/types'
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Star,
  Users,
  TrendingUp,
  Shield,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react'

interface AgentListProps {
  agents: Agent[]
  onCreateAgent: () => void
  onEditAgent: (agent: Agent) => void
  onViewAgent: (agent: Agent) => void
  onUpdateStatus: (agentId: string, status: AgentStatus) => void
  onStartChat: (agentId: string) => void
}

const statusLabels: Record<AgentStatus, { label: string; color: string }> = {
  active: { label: 'アクティブ', color: 'bg-green-100 text-green-800' },
  inactive: { label: '非アクティブ', color: 'bg-gray-100 text-gray-800' },
  suspended: { label: '停止中', color: 'bg-red-100 text-red-800' }
}

const permissionLabels: Record<AgentPermission, string> = {
  view_all_candidates: '全候補者閲覧',
  edit_candidates: '候補者編集',
  view_all_jobs: '全求人閲覧',
  create_jobs: '求人作成',
  manage_applications: '応募管理',
  send_messages: 'メッセージ送信',
  export_data: 'データエクスポート'
}

export function AgentList({
  agents,
  onCreateAgent,
  onEditAgent,
  onViewAgent,
  onUpdateStatus,
  onStartChat
}: AgentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AgentStatus | 'all'>('all')
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'placements' | 'active'>('name')
  
  const itemsPerPage = 10

  // すべての専門分野を抽出
  const allSpecializations = Array.from(
    new Set(agents.flatMap(agent => agent.specializations || []))
  ).sort()

  // フィルタリング
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.position?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || agent.status === selectedStatus
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
      agent.specializations?.includes(selectedSpecialization)
    
    return matchesSearch && matchesStatus && matchesSpecialization
  })

  // ソート
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'placements':
        return (b.successfulPlacements || 0) - (a.successfulPlacements || 0)
      case 'active':
        return new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime()
      default:
        return 0
    }
  })

  // ページネーション
  const totalPages = Math.ceil(sortedAgents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAgents = sortedAgents.slice(startIndex, endIndex)

  // 統計情報
  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    totalPlacements: agents.reduce((sum, a) => sum + (a.successfulPlacements || 0), 0),
    totalCandidates: agents.reduce((sum, a) => sum + (a.activeJobSeekers || 0), 0)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">エージェント管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            採用エージェントの情報とパフォーマンスを管理します
          </p>
        </div>
        <button
          onClick={onCreateAgent}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新規エージェント</span>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総エージェント数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総採用実績</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPlacements}</p>
            </div>
            <Award className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">管理候補者数</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalCandidates}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
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
              placeholder="名前、メール、会社名、ポジションで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="name">名前順</option>
            <option value="rating">評価順</option>
            <option value="placements">採用実績順</option>
            <option value="active">最終活動順</option>
          </select>
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

        {/* フィルターパネル */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AgentStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {Object.entries(statusLabels).map(([status, { label }]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                専門分野
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                {allSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* エージェントテーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  エージェント
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会社/ポジション
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  専門分野
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  パフォーマンス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  権限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終活動
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {agent.profileImageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={agent.profileImageUrl}
                            alt={agent.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {agent.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {agent.company ? (
                      <div>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          {agent.company}
                        </div>
                        {agent.position && (
                          <div className="text-sm text-gray-500">{agent.position}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {agent.specializations && agent.specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.slice(0, 2).map(spec => (
                          <span
                            key={spec}
                            className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                          >
                            {spec}
                          </span>
                        ))}
                        {agent.specializations.length > 2 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                            +{agent.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {agent.successfulPlacements || 0}件採用
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {agent.activeJobSeekers || 0}名管理中
                        </span>
                      </div>
                      {agent.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {agent.permissions.length}個の権限
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      statusLabels[agent.status].color
                    }`}>
                      {statusLabels[agent.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(agent.lastActiveAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewAgent(agent)}
                        className="text-gray-600 hover:text-gray-900"
                        title="詳細"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartChat(agent.id)}
                        className="text-green-600 hover:text-green-900"
                        title="チャット"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditAgent(agent)}
                        className="text-gray-600 hover:text-gray-900"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {filteredAgents.length}件中 {startIndex + 1}-{Math.min(endIndex, filteredAgents.length)}件を表示
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
    </div>
  )
}