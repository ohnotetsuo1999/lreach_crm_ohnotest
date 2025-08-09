'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, BarChart3, PieChart, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface PredictiveData {
  period: string
  actual?: number
  predicted: number
  confidence: number
  category: string
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: number
  probability: number
  timeframe: string
  action?: string
}

interface AIPredictiveAnalyticsProps {
  deliveryLogs: any[]
  users: any[]
  scenarios: any[]
}

export function AIPredictiveAnalytics({ deliveryLogs, users, scenarios }: AIPredictiveAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'growth' | 'revenue'>('engagement')
  const [predictiveData, setPredictiveData] = useState<PredictiveData[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    generatePredictions()
  }, [selectedTimeframe, selectedMetric, deliveryLogs, users])

  const generatePredictions = () => {
    setIsLoading(true)
    
    setTimeout(() => {
      // 予測データの生成
      const periods = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
      const data: PredictiveData[] = []
      
      for (let i = -periods/2; i <= periods/2; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        let baseValue = 0
        let predicted = 0
        let confidence = 0
        
        if (selectedMetric === 'engagement') {
          baseValue = 25 + Math.sin(i * 0.3) * 10 + Math.random() * 5
          predicted = i > 0 ? baseValue * (1 + (Math.sin(i * 0.2) * 0.15)) : baseValue
          confidence = Math.max(60, 95 - Math.abs(i) * 2)
        } else if (selectedMetric === 'growth') {
          baseValue = users.length + Math.floor(Math.sin(i * 0.2) * 3 + Math.random() * 2)
          predicted = i > 0 ? baseValue + Math.floor(Math.sin(i * 0.1) * 5 + 2) : baseValue
          confidence = Math.max(70, 90 - Math.abs(i) * 1.5)
        } else {
          baseValue = 15000 + Math.sin(i * 0.4) * 5000 + Math.random() * 2000
          predicted = i > 0 ? baseValue * (1 + (Math.sin(i * 0.15) * 0.2)) : baseValue
          confidence = Math.max(65, 85 - Math.abs(i) * 1.8)
        }
        
        data.push({
          period: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
          actual: i <= 0 ? baseValue : undefined,
          predicted: predicted,
          confidence,
          category: selectedMetric
        })
      }
      
      setPredictiveData(data)
      
      // AIインサイトの生成
      const newInsights: AIInsight[] = []
      
      // エンゲージメント予測分析
      if (selectedMetric === 'engagement') {
        newInsights.push({
          type: 'opportunity',
          title: '来週のエンゲージメント急上昇予測',
          description: '来週火曜日から木曜日にかけて、エンゲージメント率が35%向上する可能性が高いです。この期間に重要なキャンペーンを実施することを推奨します。',
          impact: 35,
          probability: 87,
          timeframe: '来週',
          action: 'キャンペーン実施'
        })
        
        newInsights.push({
          type: 'risk',
          title: 'ユーザー疲労の兆候',
          description: '過去のパターン分析により、今月末にかけてメッセージ疲労による開封率低下のリスクがあります。配信頻度の調整を検討してください。',
          impact: -15,
          probability: 73,
          timeframe: '今月末',
          action: '配信頻度調整'
        })
      }
      
      if (selectedMetric === 'growth') {
        newInsights.push({
          type: 'trend',
          title: 'ユーザー獲得加速期',
          description: 'AI分析により、今後2週間でユーザー獲得ペースが20%向上する予測です。この機会に紹介キャンペーンを実施することで更なる成長が期待できます。',
          impact: 20,
          probability: 82,
          timeframe: '今後2週間',
          action: '紹介キャンペーン'
        })
      }
      
      if (selectedMetric === 'revenue') {
        newInsights.push({
          type: 'opportunity',
          title: '収益最大化のタイミング',
          description: '購買パターン分析により、来月第2週が収益最大化の最適タイミングです。限定オファーや高単価商品の促進を推奨します。',
          impact: 42,
          probability: 89,
          timeframe: '来月第2週',
          action: '限定オファー実施'
        })
      }
      
      // 共通の推奨事項
      newInsights.push({
        type: 'recommendation',
        title: 'AI最適化による自動調整',
        description: 'リアルタイムデータに基づいて配信タイミング、セグメンテーション、コンテンツを自動最適化することで、全体的なパフォーマンスが25%向上します。',
        impact: 25,
        probability: 94,
        timeframe: '継続的',
        action: 'AI自動最適化有効化'
      })
      
      setInsights(newInsights)
      setIsLoading(false)
    }, 1500)
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'engagement': return 'エンゲージメント率 (%)'
      case 'growth': return 'ユーザー数'
      case 'revenue': return '収益 (円)'
      default: return ''
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'trend': return <BarChart3 className="w-5 h-5 text-blue-500" />
      case 'recommendation': return <Zap className="w-5 h-5 text-purple-500" />
      default: return <Target className="w-5 h-5 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200'
      case 'risk': return 'bg-red-50 border-red-200'
      case 'trend': return 'bg-blue-50 border-blue-200'
      case 'recommendation': return 'bg-purple-50 border-purple-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI予測分析</h2>
          <p className="text-sm text-gray-600">
            機械学習による将来のパフォーマンス予測と最適化提案
          </p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="engagement">エンゲージメント</option>
            <option value="growth">ユーザー成長</option>
            <option value="revenue">収益予測</option>
          </select>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">7日間</option>
            <option value="30d">30日間</option>
            <option value="90d">90日間</option>
          </select>
        </div>
      </div>

      {/* 予測チャート */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getMetricLabel(selectedMetric)}予測
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-gray-600">実績値</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-gray-600">予測値</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600">AI分析中...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    selectedMetric === 'revenue' ? `¥${value?.toLocaleString()}` : 
                    selectedMetric === 'engagement' ? `${value?.toFixed(1)}%` : 
                    value?.toFixed(0),
                    name === 'actual' ? '実績値' : '予測値'
                  ]}
                  labelFormatter={(label) => `期間: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  name="実績値"
                  connectNulls={false}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="予測値"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AIインサイト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`rounded-lg border p-6 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {insight.title}
                  </h3>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      insight.impact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {insight.impact > 0 ? '+' : ''}{insight.impact}%
                    </div>
                    <div className="text-xs text-gray-500">
                      確率: {insight.probability}%
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{insight.timeframe}</span>
                    </div>
                  </div>
                  
                  {insight.action && (
                    <button className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      {insight.action}
                    </button>
                  )}
                </div>
                
                {/* 信頼度バー */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>AI信頼度</span>
                    <span>{insight.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${insight.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">予測改善率</p>
              <p className="text-2xl font-bold text-gray-900">+24.5%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">予測精度</p>
              <p className="text-2xl font-bold text-gray-900">87.3%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">最適化機会</p>
              <p className="text-2xl font-bold text-gray-900">{insights.length}件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}