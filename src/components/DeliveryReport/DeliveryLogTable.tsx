'use client'

import { useState } from 'react'
import { DeliveryLog, DeliveryStatus } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  Eye, 
  MousePointer, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  Download,
  Search,
  MoreHorizontal
} from 'lucide-react'

interface DeliveryLogTableProps {
  deliveryLogs: DeliveryLog[]
  onExport?: () => void
  onRetry?: (logId: string) => void
  onViewDetails?: (log: DeliveryLog) => void
}

export function DeliveryLogTable({ 
  deliveryLogs, 
  onExport, 
  onRetry, 
  onViewDetails 
}: DeliveryLogTableProps) {
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'sentAt' | 'openedAt' | 'clickedAt'>('sentAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'OPENED':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'CLICKED':
        return <MousePointer className="w-4 h-4 text-purple-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case 'PENDING': return '送信待ち'
      case 'SENT': return '送信済み'
      case 'DELIVERED': return '配信済み'
      case 'OPENED': return '開封済み'
      case 'CLICKED': return 'クリック済み'
      case 'FAILED': return '失敗'
      case 'CANCELLED': return 'キャンセル'
      default: return status
    }
  }

  const getStatusBadgeColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'OPENED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CLICKED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // フィルタリング
  const filteredLogs = deliveryLogs.filter(log => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.address?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // ソート
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aValue: any = null
    let bValue: any = null

    switch (sortBy) {
      case 'sentAt':
        aValue = a.sentAt ? new Date(a.sentAt) : new Date(0)
        bValue = b.sentAt ? new Date(b.sentAt) : new Date(0)
        break
      case 'openedAt':
        aValue = a.openedAt ? new Date(a.openedAt) : new Date(0)
        bValue = b.openedAt ? new Date(b.openedAt) : new Date(0)
        break
      case 'clickedAt':
        aValue = a.clickedAt ? new Date(a.clickedAt) : new Date(0)
        bValue = b.clickedAt ? new Date(b.clickedAt) : new Date(0)
        break
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // ページネーション
  const totalPages = Math.ceil(sortedLogs.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedLogs = sortedLogs.slice(startIndex, startIndex + pageSize)

  const handleSort = (column: 'sentAt' | 'openedAt' | 'clickedAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const statusOptions = [
    { value: 'ALL' as const, label: 'すべて', count: deliveryLogs.length },
    { value: 'PENDING' as const, label: '送信待ち', count: deliveryLogs.filter(l => l.status === 'PENDING').length },
    { value: 'SENT' as const, label: '送信済み', count: deliveryLogs.filter(l => l.status === 'SENT').length },
    { value: 'DELIVERED' as const, label: '配信済み', count: deliveryLogs.filter(l => l.status === 'DELIVERED').length },
    { value: 'OPENED' as const, label: '開封済み', count: deliveryLogs.filter(l => l.status === 'OPENED').length },
    { value: 'CLICKED' as const, label: 'クリック済み', count: deliveryLogs.filter(l => l.status === 'CLICKED').length },
    { value: 'FAILED' as const, label: '失敗', count: deliveryLogs.filter(l => l.status === 'FAILED').length }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">配信ログ</h3>
            <p className="text-sm text-gray-600">
              {filteredLogs.length.toLocaleString()}件（全{deliveryLogs.length.toLocaleString()}件中）
            </p>
          </div>
          
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </button>
          )}
        </div>
      </div>

      {/* フィルター */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="ユーザー名またはメールアドレスで検索..."
            />
          </div>

          {/* ステータスフィルター */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  statusFilter === option.value
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
                <span className="ml-1 text-xs">({option.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="min-w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                テンプレート
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sentAt')}
              >
                送信時刻
                {sortBy === 'sentAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('openedAt')}
              >
                開封時刻
                {sortBy === 'openedAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('clickedAt')}
              >
                クリック時刻
                {sortBy === 'clickedAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {log.user.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[150px]" title={log.user.name}>
                          {log.user.name}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="truncate max-w-[150px]" title={log.user.address || log.user.phone}>
                          {log.user.address || log.user.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    テンプレート #{log.template.order || 1}
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="truncate max-w-[100px]" title={`Pack ID: ${log.template.packId || 'N/A'}`}>
                      Pack ID: {log.template.packId?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(log.status)}
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(log.status)}`}>
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                  {log.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {log.error}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.sentAt 
                    ? (
                      <div>
                        <div>{format(new Date(log.sentAt), 'MM/dd HH:mm')}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(log.sentAt), { addSuffix: true, locale: ja })}
                        </div>
                      </div>
                    )
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.openedAt 
                    ? (
                      <div>
                        <div>{format(new Date(log.openedAt), 'MM/dd HH:mm')}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(log.openedAt), { addSuffix: true, locale: ja })}
                        </div>
                      </div>
                    )
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.clickedAt 
                    ? (
                      <div>
                        <div>{format(new Date(log.clickedAt), 'MM/dd HH:mm')}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(log.clickedAt), { addSuffix: true, locale: ja })}
                        </div>
                      </div>
                    )
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        詳細
                      </button>
                    )}
                    
                    {log.status === 'FAILED' && onRetry && (
                      <button
                        onClick={() => onRetry(log.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        再送
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {paginatedLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filteredLogs.length === 0 
              ? '条件に一致する配信ログがありません'
              : '配信ログがありません'
            }
          </div>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {startIndex + 1}-{Math.min(startIndex + pageSize, filteredLogs.length)} / {filteredLogs.length}件
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            
            <span className="px-3 py-1 text-sm">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}