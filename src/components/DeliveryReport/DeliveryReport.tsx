'use client'

import { useState } from 'react'
import { FunnelChart } from './FunnelChart'
import { DeliveryLogTable } from './DeliveryLogTable'
import { DeliveryLog, Template } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Download, Filter, TrendingUp, TrendingDown, Eye, MousePointer, Users } from 'lucide-react'

interface DeliveryReportProps {
  deliveryLogs: DeliveryLog[]
  templates: Template[]
  onExportReport: () => void
  onRetryDelivery: (logId: string) => void
  onViewLogDetails: (log: DeliveryLog) => void
}

export function DeliveryReport({
  deliveryLogs,
  templates,
  onExportReport,
  onRetryDelivery,
  onViewLogDetails
}: DeliveryReportProps) {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ALL')

  // データ集計
  const filteredLogs = deliveryLogs.filter(log => {
    const logDate = log.sentAt ? new Date(log.sentAt) : new Date(log.createdAt)
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    const inDateRange = logDate >= startDate && logDate <= endDate
    const matchesTemplate = selectedTemplate === 'ALL' || log.templateId === selectedTemplate
    
    return inDateRange && matchesTemplate
  })

  const totalStats = {
    sent: filteredLogs.length,
    delivered: filteredLogs.filter(log => ['DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)).length,
    opened: filteredLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length,
    clicked: filteredLogs.filter(log => log.status === 'CLICKED').length,
    converted: filteredLogs.filter(log => log.clickedAt && log.status === 'CLICKED').length // 仮の指標
  }

  // 日別統計
  const dailyStats = filteredLogs.reduce((acc, log) => {
    const date = log.sentAt ? new Date(log.sentAt).toISOString().split('T')[0] : new Date(log.createdAt).toISOString().split('T')[0]
    
    if (!acc[date]) {
      acc[date] = { date, sent: 0, delivered: 0, opened: 0, clicked: 0 }
    }
    
    acc[date].sent++
    if (['DELIVERED', 'OPENED', 'CLICKED'].includes(log.status)) acc[date].delivered++
    if (['OPENED', 'CLICKED'].includes(log.status)) acc[date].opened++
    if (log.status === 'CLICKED') acc[date].clicked++
    
    return acc
  }, {} as Record<string, any>)

  const chartData = Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date))

  // テンプレート別統計
  const templateStats = templates.map(template => {
    const templateLogs = filteredLogs.filter(log => log.templateId === template.id)
    return {
      name: `テンプレート ${template.order}`,
      sent: templateLogs.length,
      opened: templateLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length,
      clicked: templateLogs.filter(log => log.status === 'CLICKED').length,
      openRate: templateLogs.length > 0 ? (templateLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / templateLogs.length) * 100 : 0,
      clickRate: templateLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length > 0 ? (templateLogs.filter(log => log.status === 'CLICKED').length / templateLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length) * 100 : 0
    }
  })

  // ステータス分布
  const statusDistribution = [
    { name: '配信済み', value: filteredLogs.filter(log => log.status === 'DELIVERED').length, color: '#10B981' },
    { name: '開封済み', value: filteredLogs.filter(log => log.status === 'OPENED').length, color: '#3B82F6' },
    { name: 'クリック済み', value: filteredLogs.filter(log => log.status === 'CLICKED').length, color: '#8B5CF6' },
    { name: '送信待ち', value: filteredLogs.filter(log => log.status === 'PENDING').length, color: '#F59E0B' },
    { name: '失敗', value: filteredLogs.filter(log => log.status === 'FAILED').length, color: '#EF4444' }
  ].filter(item => item.value > 0)

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // 前期間との比較（仮データ）
  const previousPeriodStats = {
    sent: Math.floor(totalStats.sent * 0.85),
    opened: Math.floor(totalStats.opened * 0.9),
    clicked: Math.floor(totalStats.clicked * 0.8)
  }

  const trends = {
    sent: calculateTrend(totalStats.sent, previousPeriodStats.sent),
    opened: calculateTrend(totalStats.opened, previousPeriodStats.opened),
    clicked: calculateTrend(totalStats.clicked, previousPeriodStats.clicked)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">配信レポート</h2>
          <p className="mt-1 text-sm text-gray-600">
            メッセージ配信の詳細な分析とパフォーマンス追跡
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={onExportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            レポートダウンロード
          </button>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">期間:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">テンプレート:</span>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">すべて</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  テンプレート {template.order}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* サマリー統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総配信数</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.sent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            {trends.sent >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trends.sent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.sent).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">前期間比</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">開封率</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.delivered > 0 ? ((totalStats.opened / totalStats.delivered) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            {trends.opened >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trends.opened >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.opened).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">前期間比</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">クリック率</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.opened > 0 ? ((totalStats.clicked / totalStats.opened) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            {trends.clicked >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trends.clicked >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trends.clicked).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">前期間比</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">コンバージョン数</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.converted.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500">
              CVR: {totalStats.clicked > 0 ? ((totalStats.converted / totalStats.clicked) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ファネルチャート */}
        <FunnelChart data={totalStats} />

        {/* ステータス分布 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 時系列チャート */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">日別配信統計</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#3B82F6" name="配信数" />
                <Line type="monotone" dataKey="opened" stroke="#10B981" name="開封数" />
                <Line type="monotone" dataKey="clicked" stroke="#8B5CF6" name="クリック数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* テンプレート別パフォーマンス */}
      {templateStats.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">テンプレート別パフォーマンス</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テンプレート
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配信数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    開封数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    開封率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クリック数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    クリック率
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templateStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.opened.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        stat.openRate >= 30 ? 'text-green-600' :
                        stat.openRate >= 15 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stat.openRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.clicked.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        stat.clickRate >= 10 ? 'text-green-600' :
                        stat.clickRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stat.clickRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 配信ログテーブル */}
      <DeliveryLogTable
        deliveryLogs={filteredLogs}
        onExport={onExportReport}
        onRetry={onRetryDelivery}
        onViewDetails={onViewLogDetails}
      />
    </div>
  )
}