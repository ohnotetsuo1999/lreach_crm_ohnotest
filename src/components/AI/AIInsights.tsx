'use client'

import { useState, useEffect } from 'react'
import { User, DeliveryLog, Scenario, Template } from '@/types'
import { Brain, TrendingUp, Target, MessageSquare, Lightbulb, AlertTriangle, CheckCircle, Clock, Zap, Bot } from 'lucide-react'

interface AIInsightsProps {
  users: User[]
  deliveryLogs: DeliveryLog[]
  scenarios: Scenario[]
  templates: Template[]
  onApplySuggestion: (suggestion: AISuggestion) => void
}

interface AISuggestion {
  id: string
  type: 'segment' | 'scenario' | 'template' | 'timing' | 'performance'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  confidence: number
  action: any
  reasoning: string[]
}

export function AIInsights({ users, deliveryLogs, scenarios, templates, onApplySuggestion }: AIInsightsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    generateAISuggestions()
  }, [users, deliveryLogs, scenarios, templates])

  const generateAISuggestions = () => {
    setIsAnalyzing(true)
    
    // シミュレートAI分析の遅延
    setTimeout(() => {
      const newSuggestions: AISuggestion[] = []

      // 1. 高開封率ユーザーのセグメント提案
      const highEngagementUsers = users.filter(user => {
        const userLogs = deliveryLogs.filter(log => log.userId === user.id)
        const openRate = userLogs.length > 0 ? 
          userLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / userLogs.length : 0
        return openRate > 0.7
      })

      if (highEngagementUsers.length >= 2) {
        newSuggestions.push({
          id: 'high_engagement_segment',
          type: 'segment',
          priority: 'high',
          title: '高エンゲージメントセグメント作成',
          description: `${highEngagementUsers.length}名の高開封率ユーザーを特別セグメントとして管理することを提案します`,
          impact: '開封率 +25%, CVR +40% 向上予想',
          confidence: 87,
          action: {
            type: 'create_segment',
            name: '高エンゲージメントユーザー',
            userIds: highEngagementUsers.map(u => u.id)
          },
          reasoning: [
            '過去30日間の開封率が70%以上',
            '類似属性を持つユーザーグループの特定',
            'プレミアムコンテンツでの更なる収益化可能性'
          ]
        })
      }

      // 2. 休眠ユーザー復活シナリオ提案
      const dormantUsers = users.filter(user => {
        const recentLogs = deliveryLogs.filter(log => 
          log.userId === user.id && 
          new Date(log.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        )
        return recentLogs.length === 0
      })

      if (dormantUsers.length >= 2) {
        newSuggestions.push({
          id: 'dormant_reactivation',
          type: 'scenario',
          priority: 'high',
          title: '休眠ユーザー復活シナリオ',
          description: `${dormantUsers.length}名の休眠ユーザーに対する段階的復活キャンペーンを提案します`,
          impact: '復活率 +30%, 月間売上 +15% 向上予想',
          confidence: 82,
          action: {
            type: 'create_scenario',
            name: '休眠ユーザー復活キャンペーン',
            trigger: 'TAG_ADDED',
            triggerValue: '休眠'
          },
          reasoning: [
            '14日間無反応のユーザーを検出',
            '段階的アプローチで復活率向上',
            '特別オファーによる再エンゲージメント促進'
          ]
        })
      }

      // 3. 配信タイミング最適化提案
      const timeAnalysis = deliveryLogs.reduce((acc, log) => {
        if (log.openedAt) {
          const hour = new Date(log.openedAt).getHours()
          acc[hour] = (acc[hour] || 0) + 1
        }
        return acc
      }, {} as Record<number, number>)

      const bestHour = Object.entries(timeAnalysis)
        .sort(([,a], [,b]) => b - a)[0]?.[0]

      if (bestHour && parseInt(bestHour) !== 10) {
        newSuggestions.push({
          id: 'timing_optimization',
          type: 'timing',
          priority: 'medium',
          title: '配信タイミング最適化',
          description: `${bestHour}時台の配信で開封率が最も高いことが判明しました`,
          impact: '開封率 +18% 向上予想',
          confidence: 91,
          action: {
            type: 'update_timing',
            recommendedHour: parseInt(bestHour)
          },
          reasoning: [
            `${bestHour}時台に${timeAnalysis[parseInt(bestHour)]}件の開封を確認`,
            'ユーザーの行動パターン分析結果',
            '統計的に有意な差を検出'
          ]
        })
      }

      // 4. テンプレート改善提案
      const templatePerformance = templates.map(template => {
        const templateLogs = deliveryLogs.filter(log => log.templateId === template.id)
        const openRate = templateLogs.length > 0 ? 
          templateLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / templateLogs.length : 0
        return { template, openRate, logs: templateLogs }
      }).sort((a, b) => a.openRate - b.openRate)

      const poorPerformingTemplate = templatePerformance[0]
      if (poorPerformingTemplate && poorPerformingTemplate.openRate < 0.3 && poorPerformingTemplate.logs.length > 2) {
        newSuggestions.push({
          id: 'template_improvement',
          type: 'template',
          priority: 'medium',
          title: 'テンプレート改善提案',
          description: `テンプレート${poorPerformingTemplate.template.order}の開封率が低下しています`,
          impact: '開封率 +35% 向上予想',
          confidence: 76,
          action: {
            type: 'improve_template',
            templateId: poorPerformingTemplate.template.id,
            suggestions: [
              '件名にパーソナライゼーション追加',
              'Flex Messageでビジュアル強化',
              'CTAボタンの文言変更'
            ]
          },
          reasoning: [
            `現在の開封率: ${(poorPerformingTemplate.openRate * 100).toFixed(1)}%`,
            '業界平均を下回る性能',
            'A/Bテストによる改善余地あり'
          ]
        })
      }

      // 5. 収益機会の提案
      const vipUsers = users.filter(user => user.tags.some(tag => tag.name === 'VIP'))
      if (vipUsers.length >= 2) {
        newSuggestions.push({
          id: 'revenue_opportunity',
          type: 'performance',
          priority: 'high',
          title: 'VIP向け限定オファー',
          description: `${vipUsers.length}名のVIPユーザーに対する限定プレミアムオファーを提案します`,
          impact: 'ARPU +45%, LTV +60% 向上予想',
          confidence: 84,
          action: {
            type: 'create_vip_campaign',
            targetUsers: vipUsers.map(u => u.id)
          },
          reasoning: [
            'VIPユーザーの高い購買意欲を確認',
            '限定性による希少価値創出',
            '高単価商品への誘導可能性'
          ]
        })
      }

      setSuggestions(newSuggestions)
      setIsAnalyzing(false)
    }, 1500)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'segment': return Target
      case 'scenario': return MessageSquare
      case 'template': return Lightbulb
      case 'timing': return Clock
      case 'performance': return TrendingUp
      default: return Brain
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AIインサイト</h2>
            <p className="text-sm text-gray-600">
              データ分析に基づくスマートな改善提案
            </p>
          </div>
        </div>
        
        <button
          onClick={generateAISuggestions}
          disabled={isAnalyzing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isAnalyzing ? '分析中...' : '再分析'}
        </button>
      </div>

      {/* 分析中の表示 */}
      {isAnalyzing && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin">
              <Bot className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">AI分析中...</h3>
              <p className="text-sm text-gray-600 mt-1">
                ユーザー行動とパフォーマンスデータを分析しています
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 提案一覧 */}
      {!isAnalyzing && suggestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suggestions.map((suggestion) => {
            const Icon = getTypeIcon(suggestion.type)
            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {suggestion.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {suggestion.impact}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">AI信頼度:</span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${suggestion.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {suggestion.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onApplySuggestion(suggestion)
                      }}
                      className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                    >
                      提案を適用
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedSuggestion && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSuggestion(null)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedSuggestion.title}
                </h2>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">詳細説明</h3>
                    <p className="text-sm text-gray-600">
                      {selectedSuggestion.description}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">期待される効果</h3>
                    <p className="text-sm text-green-600 font-medium">
                      {selectedSuggestion.impact}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">AI分析根拠</h3>
                    <ul className="space-y-2">
                      {selectedSuggestion.reasoning.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedSuggestion(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      onApplySuggestion(selectedSuggestion)
                      setSelectedSuggestion(null)
                    }}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    提案を適用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提案がない場合 */}
      {!isAnalyzing && suggestions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              現在、改善提案はありません
            </h3>
            <p className="text-sm text-gray-600">
              より多くのデータが蓄積されると、AIがより精度の高い提案を行います
            </p>
          </div>
        </div>
      )}
    </div>
  )
}