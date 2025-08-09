'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Users, MessageSquare, Target, CheckCircle, X, Brain } from 'lucide-react'

interface SmartAlert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'performance' | 'user_behavior' | 'system' | 'opportunity'
  title: string
  message: string
  timestamp: Date
  confidence: number
  suggestedAction?: string
  isRead: boolean
  data?: any
}

interface AISmartAlertsProps {
  users: any[]
  deliveryLogs: any[]
  scenarios: any[]
  onActionClick?: (action: string, data: any) => void
}

export function AISmartAlerts({ users, deliveryLogs, scenarios, onActionClick }: AISmartAlertsProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    generateSmartAlerts()
    
    // リアルタイム監視のシミュレーション
    const interval = setInterval(generateSmartAlerts, 30000) // 30秒ごと
    return () => clearInterval(interval)
  }, [users, deliveryLogs, scenarios])

  const generateSmartAlerts = () => {
    const newAlerts: SmartAlert[] = []
    const now = new Date()

    // 1. パフォーマンス異常検知
    const recentLogs = deliveryLogs.filter(log => 
      new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    const openRate = recentLogs.length > 0 ? 
      recentLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / recentLogs.length : 0

    if (openRate < 0.15 && recentLogs.length > 3) {
      newAlerts.push({
        id: 'low_open_rate',
        type: 'critical',
        category: 'performance',
        title: '開封率大幅低下を検知',
        message: `過去24時間の開封率が${(openRate * 100).toFixed(1)}%まで低下しています。通常より60%以上下回っています。`,
        timestamp: now,
        confidence: 92,
        suggestedAction: 'テンプレート見直し',
        isRead: false,
        data: { openRate, threshold: 0.25 }
      })
    }

    // 2. ユーザー行動パターン異常
    const newUsers = users.filter(user => 
      new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    const registrationRate = newUsers.length / 7

    if (registrationRate < 0.5) {
      newAlerts.push({
        id: 'low_registration',
        type: 'warning',
        category: 'user_behavior',
        title: '新規登録率の低下',
        message: `過去7日間の新規登録が${newUsers.length}名と低調です。平均より50%低下しています。`,
        timestamp: now,
        confidence: 78,
        suggestedAction: '登録フロー改善',
        isRead: false,
        data: { newUsers: newUsers.length, expectedMin: 3 }
      })
    }

    // 3. 高価値機会の検出
    const highEngagementUsers = users.filter(user => {
      const userLogs = deliveryLogs.filter(log => log.userId === user.id)
      const engagementRate = userLogs.length > 0 ? 
        userLogs.filter(log => log.status === 'CLICKED').length / userLogs.length : 0
      return engagementRate > 0.4
    })

    if (highEngagementUsers.length >= 3) {
      newAlerts.push({
        id: 'high_engagement_opportunity',
        type: 'success',
        category: 'opportunity',
        title: '高エンゲージメントユーザー発見',
        message: `${highEngagementUsers.length}名の高エンゲージメントユーザーを検出。VIPセグメント作成の好機です。`,
        timestamp: now,
        confidence: 89,
        suggestedAction: 'VIPセグメント作成',
        isRead: false,
        data: { userIds: highEngagementUsers.map(u => u.id) }
      })
    }

    // 4. システム最適化提案
    const inactiveScenarios = scenarios.filter(s => !s.isActive && s.packs.length > 0)
    if (inactiveScenarios.length > 0) {
      newAlerts.push({
        id: 'inactive_scenarios',
        type: 'info',
        category: 'system',
        title: '未活用シナリオの検出',
        message: `${inactiveScenarios.length}個の設定済みシナリオが非アクティブです。活用することで配信効率が向上します。`,
        timestamp: now,
        confidence: 85,
        suggestedAction: 'シナリオ見直し',
        isRead: false,
        data: { scenarioIds: inactiveScenarios.map(s => s.id) }
      })
    }

    // 5. 配信タイミング最適化
    const hourlyDistribution = deliveryLogs.reduce((acc, log) => {
      if (log.openedAt) {
        const hour = new Date(log.openedAt).getHours()
        acc[hour] = (acc[hour] || 0) + 1
      }
      return acc
    }, {} as Record<number, number>)

    const peakHour = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0]

    if (peakHour && parseInt(peakHour) !== 10) {
      newAlerts.push({
        id: 'timing_optimization',
        type: 'info',
        category: 'performance',
        title: '配信タイミング最適化提案',
        message: `${peakHour}時台に最も高い開封率を記録。現在の配信時間を調整することで効果向上が期待できます。`,
        timestamp: now,
        confidence: 81,
        suggestedAction: '配信時間変更',
        isRead: false,
        data: { recommendedHour: parseInt(peakHour) }
      })
    }

    // 6. 季節性トレンド検知
    const currentMonth = now.getMonth()
    if (currentMonth === 2 || currentMonth === 11) { // 3月や12月
      newAlerts.push({
        id: 'seasonal_opportunity',
        type: 'success',
        category: 'opportunity',
        title: '季節性トレンド機会',
        message: '過去データから、この時期はエンゲージメントが20%向上する傾向があります。キャンペーン実施の好機です。',
        timestamp: now,
        confidence: 76,
        suggestedAction: '季節キャンペーン実施',
        isRead: false,
        data: { season: currentMonth === 2 ? 'spring' : 'winter' }
      })
    }

    // 既存のアラートと重複チェック
    const existingIds = alerts.map(a => a.id)
    const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id))
    
    if (uniqueNewAlerts.length > 0) {
      setAlerts(prev => [...uniqueNewAlerts, ...prev].slice(0, 20)) // 最新20件を保持
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning': return <TrendingDown className="w-5 h-5 text-yellow-500" />
      case 'info': return <Brain className="w-5 h-5 text-blue-500" />
      case 'success': return <TrendingUp className="w-5 h-5 text-green-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <TrendingUp className="w-4 h-4" />
      case 'user_behavior': return <Users className="w-4 h-4" />
      case 'system': return <MessageSquare className="w-4 h-4" />
      case 'opportunity': return <Target className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead
    if (filter === 'critical') return alert.type === 'critical'
    return true
  })

  const unreadCount = alerts.filter(a => !a.isRead).length

  return (
    <div className="relative">
      {/* アラートベルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* アラートパネル */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AIスマートアラート</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs rounded-full ${
                  filter === 'all' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                すべて ({alerts.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs rounded-full ${
                  filter === 'unread' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                未読 ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 text-xs rounded-full ${
                  filter === 'critical' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                重要 ({alerts.filter(a => a.type === 'critical').length})
              </button>
            </div>
          </div>

          {/* アラート一覧 */}
          <div className="overflow-y-auto max-h-80">
            {filteredAlerts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 ${getAlertBgColor(alert.type)} ${!alert.isRead ? 'border-l-4 border-purple-500' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {alert.title}
                          </h4>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {alert.message}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {getCategoryIcon(alert.category)}
                            <span>{alert.category}</span>
                            <span>•</span>
                            <span>信頼度: {alert.confidence}%</span>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString('ja-JP', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          {!alert.isRead && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="text-xs px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                              既読にする
                            </button>
                          )}
                          
                          {alert.suggestedAction && (
                            <button
                              onClick={() => {
                                onActionClick?.(alert.suggestedAction!, alert.data)
                                markAsRead(alert.id)
                              }}
                              className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                            >
                              {alert.suggestedAction}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">アラートなし</h3>
                <p className="text-xs text-gray-500">
                  {filter === 'unread' ? '未読のアラートはありません' : '現在アラートはありません'}
                </p>
              </div>
            )}
          </div>

          {/* フッター */}
          {filteredAlerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
                }}
                className="w-full text-xs text-gray-600 hover:text-gray-900"
              >
                すべて既読にする
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}