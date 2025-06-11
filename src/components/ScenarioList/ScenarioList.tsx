'use client'

import { useState } from 'react'
import { ScenarioCard } from './ScenarioCard'
import { Scenario, Campaign, TriggerType } from '@/types'
import { Plus, Filter, Search, Grid, List } from 'lucide-react'

interface ScenarioListProps {
  scenarios: Scenario[]
  campaigns: Campaign[]
  onCreateScenario: () => void
  onEditScenario: (scenario: Scenario) => void
  onDuplicateScenario: (scenario: Scenario) => void
  onDeleteScenario: (scenarioId: string) => void
  onToggleActive: (scenarioId: string, isActive: boolean) => void
  onViewAnalytics: (scenarioId: string) => void
}

export function ScenarioList({
  scenarios,
  campaigns,
  onCreateScenario,
  onEditScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleActive,
  onViewAnalytics
}: ScenarioListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrigger, setFilterTrigger] = useState<TriggerType | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [filterCampaign, setFilterCampaign] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // フィルタリング処理
  const filteredScenarios = scenarios.filter(scenario => {
    // 検索クエリによるフィルタ
    const matchesSearch = searchQuery === '' || 
      scenario.name.toLowerCase().includes(searchQuery.toLowerCase())

    // トリガーによるフィルタ
    const matchesTrigger = filterTrigger === 'ALL' || scenario.trigger === filterTrigger

    // ステータスによるフィルタ
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && scenario.isActive) ||
      (filterStatus === 'INACTIVE' && !scenario.isActive)

    // キャンペーンによるフィルタ
    const matchesCampaign = filterCampaign === 'ALL' || scenario.campaignId === filterCampaign

    return matchesSearch && matchesTrigger && matchesStatus && matchesCampaign
  })

  const activeCount = scenarios.filter(s => s.isActive).length
  const inactiveCount = scenarios.filter(s => !s.isActive).length

  const triggerOptions: { value: TriggerType | 'ALL', label: string }[] = [
    { value: 'ALL', label: 'すべて' },
    { value: 'MANUAL', label: '手動実行' },
    { value: 'SCHEDULE', label: 'スケジュール' },
    { value: 'USER_ACTION', label: 'ユーザーアクション' },
    { value: 'TAG_ADDED', label: 'タグ追加' },
    { value: 'STATUS_CHANGED', label: 'ステータス変更' },
    { value: 'TIME_BASED', label: '時間ベース' }
  ]

  const clearFilters = () => {
    setSearchQuery('')
    setFilterTrigger('ALL')
    setFilterStatus('ALL')
    setFilterCampaign('ALL')
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">シナリオ一覧</h2>
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>全{scenarios.length}件</span>
            <span className="text-green-600">アクティブ: {activeCount}件</span>
            <span className="text-gray-400">停止中: {inactiveCount}件</span>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            フィルター
          </button>
          
          <button
            onClick={onCreateScenario}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規シナリオ
          </button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* 検索 */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="シナリオ名で検索..."
            />
          </div>

          {/* クイックフィルター */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus(filterStatus === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
              className={`px-3 py-2 text-sm rounded-md border ${
                filterStatus === 'ACTIVE'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              アクティブのみ
            </button>
            
            <button
              onClick={() => setFilterStatus(filterStatus === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
              className={`px-3 py-2 text-sm rounded-md border ${
                filterStatus === 'INACTIVE'
                  ? 'bg-gray-50 text-gray-700 border-gray-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              停止中のみ
            </button>
          </div>
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  トリガー種別
                </label>
                <select
                  value={filterTrigger}
                  onChange={(e) => setFilterTrigger(e.target.value as TriggerType | 'ALL')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  キャンペーン
                </label>
                <select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">すべてのキャンペーン</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  フィルタークリア
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* シナリオリスト */}
      {filteredScenarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery || filterTrigger !== 'ALL' || filterStatus !== 'ALL' || filterCampaign !== 'ALL'
              ? '条件に一致するシナリオが見つかりません'
              : 'シナリオがありません'
            }
          </div>
          <button
            onClick={onCreateScenario}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            最初のシナリオを作成
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onEdit={onEditScenario}
              onDuplicate={onDuplicateScenario}
              onDelete={onDeleteScenario}
              onToggleActive={onToggleActive}
              onViewAnalytics={onViewAnalytics}
            />
          ))}
        </div>
      )}
    </div>
  )
}