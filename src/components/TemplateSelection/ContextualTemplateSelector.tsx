'use client'

import { useState } from 'react'
import { Template, TemplateUsageContext, TemplateFilter, TemplatePurpose, ScenarioStage } from '@/types'
import { Search, Filter, X, Plus, Target, Users, TrendingUp } from 'lucide-react'
import { TemplateSelector } from './TemplateSelector'

interface ContextualTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
  onCreateTemplate: (context: TemplateUsageContext) => void
  availableTemplates: Template[]
  usageContext: TemplateUsageContext
  packId: string
}

export function ContextualTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateTemplate,
  availableTemplates,
  usageContext,
  packId
}: ContextualTemplateSelectorProps) {
  const [filter, setFilter] = useState<TemplateFilter>({})
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'create'>('recommended')

  if (!isOpen) return null

  // コンテキストに基づく推奨テンプレート
  const getRecommendedTemplates = () => {
    return availableTemplates.filter(template => {
      // シナリオコンテキストによる推奨
      if (usageContext.purpose && template.scenarioContext?.purpose === usageContext.purpose) {
        return true
      }
      
      // 使用頻度による推奨
      if (template.usageStats && template.usageStats.usedInScenarios > 0) {
        return true
      }
      
      return false
    }).slice(0, 6) // 最大6件の推奨
  }

  const getFilteredTemplates = () => {
    return availableTemplates.filter(template => {
      if (filter.type && filter.type.length > 0 && !filter.type.includes(template.type)) {
        return false
      }
      
      if (filter.purpose && filter.purpose.length > 0) {
        if (!template.scenarioContext?.purpose || !filter.purpose.includes(template.scenarioContext.purpose)) {
          return false
        }
      }
      
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase()
        if (!template.name.toLowerCase().includes(searchLower) && 
            !template.content.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      return true
    })
  }

  const handleCreateWithContext = () => {
    onCreateTemplate(usageContext)
    onClose()
  }

  const getPurposeOptions = (): { value: TemplatePurpose; label: string }[] => [
    { value: 'WELCOME', label: 'ウェルカム' },
    { value: 'NOTIFICATION', label: 'お知らせ' },
    { value: 'REMINDER', label: 'リマインダー' },
    { value: 'PROMOTION', label: 'プロモーション' },
    { value: 'SURVEY', label: 'アンケート' },
    { value: 'FOLLOW_UP', label: 'フォローアップ' },
    { value: 'SUPPORT', label: 'サポート' },
    { value: 'ENGAGEMENT', label: 'エンゲージメント' },
    { value: 'CONVERSION', label: 'コンバージョン' },
    { value: 'RETENTION', label: 'リテンション' },
    { value: 'OTHER', label: 'その他' }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                テンプレート選択
              </h2>
              <p className="text-sm text-gray-600">
                {usageContext.scenarioName && `シナリオ: ${usageContext.scenarioName}`}
                {usageContext.targetSegmentName && ` | 対象: ${usageContext.targetSegmentName}`}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* コンテキスト情報 */}
          {usageContext && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-blue-700">
                  <Target className="w-4 h-4 mr-1" />
                  目的: {usageContext.purpose || '未設定'}
                </div>
                {usageContext.targetSegmentName && (
                  <div className="flex items-center text-sm text-blue-700">
                    <Users className="w-4 h-4 mr-1" />
                    対象: {usageContext.targetSegmentName}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* タブ */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'recommended'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              推奨テンプレート
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              すべてのテンプレート
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'create'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              新規作成
            </button>
          </div>

          {/* 検索・フィルタ */}
          {activeTab !== 'create' && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="テンプレートを検索..."
                    value={filter.searchTerm || ''}
                    onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  フィルタ
                </button>
              </div>

              {showAdvancedFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">目的</label>
                    <select
                      multiple
                      value={filter.purpose || []}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value as TemplatePurpose)
                        setFilter({ ...filter, purpose: values })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getPurposeOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'recommended' && (
              <RecommendedTemplatesView 
                templates={getRecommendedTemplates()}
                onSelectTemplate={onSelectTemplate}
                onCreateTemplate={handleCreateWithContext}
                usageContext={usageContext}
              />
            )}
            
            {activeTab === 'all' && (
              <AllTemplatesView 
                templates={getFilteredTemplates()}
                onSelectTemplate={onSelectTemplate}
                packId={packId}
              />
            )}
            
            {activeTab === 'create' && (
              <CreateTemplateView 
                onCreateTemplate={handleCreateWithContext}
                usageContext={usageContext}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 推奨テンプレート表示
function RecommendedTemplatesView({ templates, onSelectTemplate, onCreateTemplate, usageContext }: {
  templates: Template[]
  onSelectTemplate: (template: Template) => void
  onCreateTemplate: () => void
  usageContext: TemplateUsageContext
}) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">推奨テンプレートがありません</h3>
        <p className="text-sm text-gray-600 mb-6">
          このシナリオに適したテンプレートが見つかりませんでした。<br />
          新しいテンプレートを作成することをお勧めします。
        </p>
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規テンプレート作成
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">推奨テンプレート</h3>
        <p className="text-sm text-gray-600">
          現在のシナリオに適していると思われるテンプレートです
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {templates.map((template) => (
          <TemplateRecommendationCard 
            key={template.id}
            template={template}
            onSelect={() => onSelectTemplate(template)}
            usageContext={usageContext}
          />
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規テンプレート作成
        </button>
      </div>
    </div>
  )
}

// すべてのテンプレート表示
function AllTemplatesView({ templates, onSelectTemplate, packId }: {
  templates: Template[]
  onSelectTemplate: (template: Template) => void
  packId: string
}) {
  // 既存のTemplateSelectorコンポーネントを使用
  return (
    <TemplateSelector
      availableTemplates={templates}
      onCreateNew={() => {}}
      onSelectTemplate={onSelectTemplate}
      onClose={() => {}}
      packId={packId}
    />
  )
}

// 新規作成ビュー
function CreateTemplateView({ onCreateTemplate, usageContext }: {
  onCreateTemplate: () => void
  usageContext: TemplateUsageContext
}) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <Plus className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">新規テンプレート作成</h3>
        <p className="text-sm text-gray-600 mb-6">
          現在のシナリオに最適化されたテンプレートを作成します
        </p>
        
        {usageContext && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-2">設定情報</h4>
            <div className="text-blue-700 space-y-1">
              {usageContext.scenarioName && <div>シナリオ: {usageContext.scenarioName}</div>}
              {usageContext.purpose && <div>目的: {usageContext.purpose}</div>}
              {usageContext.targetSegmentName && <div>対象: {usageContext.targetSegmentName}</div>}
            </div>
          </div>
        )}
        
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          テンプレートを作成
        </button>
      </div>
    </div>
  )
}

// テンプレート推奨カード
function TemplateRecommendationCard({ template, onSelect, usageContext }: {
  template: Template
  onSelect: () => void
  usageContext: TemplateUsageContext
}) {
  const getMatchReasons = () => {
    const reasons: string[] = []
    
    if (template.scenarioContext?.purpose === usageContext.purpose) {
      reasons.push('目的が一致')
    }
    
    if (template.usageStats && template.usageStats.usedInScenarios > 0) {
      reasons.push(`${template.usageStats.usedInScenarios}回使用実績`)
    }
    
    if (template.suggestedActionRules && template.suggestedActionRules.length > 0) {
      reasons.push('アクション設定あり')
    }
    
    return reasons
  }

  return (
    <button
      onClick={onSelect}
      className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {template.type === 'TEXT' ? 'テキスト' : template.type === 'FLEX' ? 'Flex' : template.type}
          </span>
        </div>
      </div>

      <div className="mb-3 p-3 bg-gray-50 rounded border text-sm text-gray-700">
        {template.content.length > 100 ? template.content.substring(0, 100) + '...' : template.content}
      </div>

      <div className="space-y-2">
        {getMatchReasons().map((reason, index) => (
          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 mr-1">
            {reason}
          </span>
        ))}
      </div>

      <div className="mt-3 text-right">
        <span className="text-blue-600 group-hover:text-blue-700 font-medium text-sm">
          このテンプレートを選択
        </span>
      </div>
    </button>
  )
}