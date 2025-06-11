'use client'

import { ArrowLeft, Calendar, Users, Mail, MousePointer, UserCheck, TrendingUp, Target } from 'lucide-react'

interface ScenarioDetailData {
  no: number
  deliveryDateTime: string
  deliveryTitle: string
  deliveryCount: number
  openCount: number
  openRate: number
  massDelivery: {
    deliveryCount: number
    ctaTapCount: number
    ctaTapRate: number
    reservationCount: number
    reservationRate: number
    arrivalRate: number
  }
  ctaOneMinuteAfter: {
    deliveryCount: number
    ctaTapCount: number
    ctaTapRate: number
    reservationCount: number
    reservationRate: number
    arrivalRate: number
  }
  totalReservations: number
  totalReservationRate: number
  totalArrivals: number
  totalArrivalRate: number
  targetAudience: string
  deliveryAppeal: string
  deliveryContent: string
  memo: string
}

interface ScenarioDetailAnalysisProps {
  scenario: ScenarioDetailData
  onBack: () => void
}

export function ScenarioDetailAnalysis({ scenario, onBack }: ScenarioDetailAnalysisProps) {
  const conversionFunnel = [
    { stage: '配信', count: scenario.deliveryCount, rate: 100, icon: Mail, color: 'bg-blue-500' },
    { stage: '開封', count: scenario.openCount, rate: scenario.openRate, icon: Users, color: 'bg-green-500' },
    { stage: 'CTAタップ', count: scenario.massDelivery.ctaTapCount, rate: scenario.massDelivery.ctaTapRate, icon: MousePointer, color: 'bg-yellow-500' },
    { stage: '予約', count: scenario.totalReservations, rate: scenario.totalReservationRate, icon: UserCheck, color: 'bg-purple-500' },
    { stage: '着座', count: scenario.totalArrivals, rate: scenario.totalArrivalRate, icon: Target, color: 'bg-red-500' }
  ]

  const keyMetrics = [
    {
      title: '総配信数',
      value: scenario.deliveryCount.toLocaleString(),
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: Mail
    },
    {
      title: '開封率',
      value: `${scenario.openRate}%`,
      change: '-1.3%',
      changeType: 'negative' as const,
      icon: Users
    },
    {
      title: '予約率',
      value: `${scenario.totalReservationRate}%`,
      change: '+0.8%',
      changeType: 'positive' as const,
      icon: UserCheck
    },
    {
      title: '着座率',
      value: `${scenario.totalArrivalRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Target
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{scenario.deliveryTitle}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {scenario.deliveryDateTime}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">シナリオ番号</div>
          <div className="text-xl font-bold text-gray-900">#{scenario.no}</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">前回比</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">コンバージョンファネル</h3>
        <div className="space-y-4">
          {conversionFunnel.map((stage, index) => {
            const Icon = stage.icon
            const width = stage.rate > 0 ? Math.max(stage.rate, 5) : 5
            
            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  {stage.stage}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                    style={{ width: `${width}%` }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {stage.count?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stage.rate?.toFixed(1) || 0}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 配信パフォーマンス */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">配信パフォーマンス</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">一斉配信数</span>
              <span className="font-medium">{scenario.massDelivery.deliveryCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">CTAタップ数</span>
              <span className="font-medium">{scenario.massDelivery.ctaTapCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">CTAタップ率</span>
              <span className="font-medium">{scenario.massDelivery.ctaTapRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">予約獲得数</span>
              <span className="font-medium">{scenario.massDelivery.reservationCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">引き上げ率</span>
              <span className="font-medium">{scenario.massDelivery.arrivalRate}%</span>
            </div>
          </div>
        </div>

        {/* 配信設定詳細 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">配信設定詳細</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">配信訴求</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {scenario.deliveryAppeal}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">配信対象者</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
                {scenario.targetAudience}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 配信内容とメモ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">配信内容</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {scenario.deliveryContent}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">メモ・改善点</h3>
          <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {scenario.memo}
            </p>
          </div>
        </div>
      </div>

      {/* 改善提案 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          AI改善提案
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-900 mb-2">開封率改善</h4>
            <p className="text-sm text-blue-800">
              配信時間を20:00-21:00に変更することで、開封率が平均2.3%向上する可能性があります。
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-400">
            <h4 className="font-medium text-green-900 mb-2">CTAタップ率向上</h4>
            <p className="text-sm text-green-800">
              ボタンテキストを「詳細を見る」から「今すぐ確認」に変更で、CTAタップ率が1.8%向上見込み。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}