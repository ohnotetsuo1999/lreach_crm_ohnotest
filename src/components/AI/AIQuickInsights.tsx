'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react'

interface QuickInsight {
  type: 'opportunity' | 'warning' | 'tip'
  title: string
  description: string
  action?: string
}

interface AIQuickInsightsProps {
  users: any[]
  deliveryLogs: any[]
  scenarios: any[]
  onActionClick?: (action: string, data?: any) => void
}

export function AIQuickInsights({ users, deliveryLogs, scenarios, onActionClick }: AIQuickInsightsProps) {
  const [insights, setInsights] = useState<QuickInsight[]>([])

  useEffect(() => {
    generateQuickInsights()
  }, [users, deliveryLogs, scenarios])

  const generateQuickInsights = () => {
    const newInsights: QuickInsight[] = []

    // 開封率分析
    const openRate = deliveryLogs.length > 0 ? 
      (deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / deliveryLogs.length) * 100 : 0

    if (openRate < 25) {
      newInsights.push({
        type: 'warning',
        title: '開封率改善の機会',
        description: `現在の開封率${openRate.toFixed(1)}%は業界平均を下回っています`,
        action: 'テンプレート最適化'
      })
    } else if (openRate > 40) {
      newInsights.push({
        type: 'opportunity',
        title: '高パフォーマンス検出',
        description: `開封率${openRate.toFixed(1)}%と非常に良好です`,
        action: 'VIPセグメント作成'
      })
    }

    // VIPユーザー分析
    const vipUsers = users.filter(user => user.tags?.some((tag: any) => tag.name === 'VIP'))
    if (vipUsers.length >= 2) {
      newInsights.push({
        type: 'opportunity',
        title: 'VIP向け特別キャンペーン',
        description: `${vipUsers.length}名のVIPユーザーに限定オファーを提案`,
        action: '限定キャンペーン作成'
      })
    }

    // シナリオ効率分析
    const activeScenarios = scenarios.filter(s => s.isActive)
    const inactiveScenarios = scenarios.filter(s => !s.isActive && s.packs.length > 0)
    
    if (inactiveScenarios.length > 0) {
      newInsights.push({
        type: 'tip',
        title: 'シナリオ活用提案',
        description: `${inactiveScenarios.length}個の未活用シナリオがあります`,
        action: 'シナリオ見直し'
      })
    }

    // 成長機会
    const newUsers = users.filter(user => 
      new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    
    if (newUsers.length >= 2) {
      newInsights.push({
        type: 'opportunity',
        title: '新規ユーザー増加中',
        description: `過去7日で${newUsers.length}名の新規登録`,
        action: 'ウェルカムシリーズ強化'
      })
    }

    setInsights(newInsights.slice(0, 3)) // 最大3つまで表示
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'tip':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-600" />
      default:
        return <Brain className="w-4 h-4 text-gray-600" />
    }
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AIクイックインサイト</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${getInsightStyle(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  {insight.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {insight.description}
                </p>
                
                {insight.action && (
                  <button
                    onClick={() => onActionClick?.(insight.action!)}
                    className="mt-2 inline-flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    {insight.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}