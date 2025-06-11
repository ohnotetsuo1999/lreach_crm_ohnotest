'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart as RechartsFunnelChart, Funnel, Cell } from 'recharts'

interface FunnelData {
  name: string
  value: number
  percentage: number
  color: string
}

interface FunnelChartProps {
  data: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
  }
  title?: string
}

const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6'  // violet-500
]

export function FunnelChart({ data, title = '配信ファネル' }: FunnelChartProps) {
  const funnelData: FunnelData[] = [
    {
      name: '配信',
      value: data.sent,
      percentage: 100,
      color: COLORS[0]
    },
    {
      name: '到達',
      value: data.delivered,
      percentage: data.sent > 0 ? (data.delivered / data.sent) * 100 : 0,
      color: COLORS[1]
    },
    {
      name: '開封',
      value: data.opened,
      percentage: data.sent > 0 ? (data.opened / data.sent) * 100 : 0,
      color: COLORS[2]
    },
    {
      name: 'クリック',
      value: data.clicked,
      percentage: data.sent > 0 ? (data.clicked / data.sent) * 100 : 0,
      color: COLORS[3]
    },
    {
      name: 'コンバージョン',
      value: data.converted,
      percentage: data.sent > 0 ? (data.converted / data.sent) * 100 : 0,
      color: COLORS[4]
    }
  ]

  // バーチャート用のデータ
  const barData = funnelData.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            {data.value.toLocaleString()}件 ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      {/* ファネル統計 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {funnelData.map((item, index) => (
          <div key={item.name} className="text-center">
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
            <div className="text-xs text-gray-500">
              {item.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* バーチャート */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* コンバージョン率詳細 */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">コンバージョン率</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">到達率</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.sent > 0 ? ((data.delivered / data.sent) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">開封率</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.delivered > 0 ? ((data.opened / data.delivered) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">CTR</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.opened > 0 ? ((data.clicked / data.opened) * 100).toFixed(1) : 0}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">CVR</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.clicked > 0 ? ((data.converted / data.clicked) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 改善提案 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">改善提案</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {data.delivered / data.sent < 0.95 && (
            <p>• 到達率が低いです。配信リストの見直しを検討してください</p>
          )}
          {data.opened / data.delivered < 0.3 && (
            <p>• 開封率が低いです。件名や送信時間の最適化を検討してください</p>
          )}
          {data.clicked / data.opened < 0.1 && (
            <p>• クリック率が低いです。メッセージ内容やCTAの改善を検討してください</p>
          )}
          {data.converted / data.clicked < 0.05 && (
            <p>• コンバージョン率が低いです。ランディングページの改善を検討してください</p>
          )}
        </div>
      </div>
    </div>
  )
}