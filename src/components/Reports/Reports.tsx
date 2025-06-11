'use client'

import { useState } from 'react'
import { ScenarioReportTable } from '@/components/ScenarioReport/ScenarioReportTable'
import { ScenarioDetailAnalysis } from '@/components/ScenarioReport/ScenarioDetailAnalysis'
import { BarChart3, Mail, TrendingUp, Zap } from 'lucide-react'

interface ReportsProps {
  // We can add more props here if needed for other report types
}

export function Reports({}: ReportsProps) {
  const [selectedReportType, setSelectedReportType] = useState<'mass-delivery' | 'scenario-delivery' | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list')

  const reportTypes = [
    { 
      id: 'mass-delivery', 
      label: '一斉配信', 
      icon: Mail, 
      description: 'シナリオごとの配信実績レポート',
      color: 'bg-blue-500'
    },
    { 
      id: 'scenario-delivery', 
      label: 'シナリオ配信', 
      icon: Zap, 
      description: '自動シナリオの配信結果レポート',
      color: 'bg-green-500'
    }
  ]

  const handleScenarioSelect = (scenario: any) => {
    setSelectedScenario(scenario)
    setCurrentView('detail')
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedScenario(null)
  }

  const renderContent = () => {
    if (!selectedReportType) {
      return (
        <div className="p-12">
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">レポートタイプを選択してください</h3>
            <p className="text-sm text-gray-600">確認したいレポートの種類を選択してください。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReportType(type.id as 'mass-delivery' | 'scenario-delivery')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 ${type.color} rounded-lg mr-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-700">
                      {type.label}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-blue-600">
                    {type.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    switch (selectedReportType) {
      case 'mass-delivery':
        if (selectedScenario && currentView === 'detail') {
          return (
            <ScenarioDetailAnalysis
              scenario={selectedScenario}
              onBack={handleBack}
            />
          )
        }
        return <ScenarioReportTable onScenarioSelect={handleScenarioSelect} />
      
      case 'scenario-delivery':
        return (
          <div className="p-12 text-center">
            <div className="text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">シナリオ配信レポート</h3>
              <p className="text-sm">この機能は現在開発中です。</p>
            </div>
          </div>
        )
      
      default:
        return <div>Unknown report type</div>
    }
  }

  const handleBackToSelection = () => {
    setSelectedReportType(null)
    setCurrentView('list')
    setSelectedScenario(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">レポート</h2>
          <p className="text-sm text-gray-600 mt-1">配信結果の分析とレポート</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {selectedReportType && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToSelection}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← 戻る
              </button>
              <div className="flex items-center">
                {(() => {
                  const selectedType = reportTypes.find(type => type.id === selectedReportType)
                  if (!selectedType) return null
                  const Icon = selectedType.icon
                  return (
                    <>
                      <div className={`p-2 ${selectedType.color} rounded-lg mr-3`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedType.label}</h3>
                        <p className="text-sm text-gray-600">{selectedType.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
        
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}