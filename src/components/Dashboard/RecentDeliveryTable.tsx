'use client'

import { DeliveryLog } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Eye, MousePointer, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface RecentDeliveryTableProps {
  deliveries: DeliveryLog[]
}

export function RecentDeliveryTable({ deliveries }: RecentDeliveryTableProps) {
  const getStatusIcon = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'OPENED':
        return 'bg-blue-100 text-blue-800'
      case 'CLICKED':
        return 'bg-purple-100 text-purple-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">最近の配信状況</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="min-w-[150px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メッセージ
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                送信時刻
              </th>
              <th className="min-w-[120px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開封時刻
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {delivery.user.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        <div className="truncate max-w-[150px]" title={delivery.user.name}>
                          {delivery.user.name}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="truncate max-w-[150px]" title={delivery.user.address || delivery.user.phone}>
                          {delivery.user.address || delivery.user.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    テンプレート #{delivery.template.order || 1}
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="truncate max-w-[100px]" title={`Pack ID: ${delivery.template.packId || 'N/A'}`}>
                      Pack ID: {delivery.template.packId?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(delivery.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(delivery.status)}`}>
                      {getStatusLabel(delivery.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.sentAt 
                    ? formatDistanceToNow(new Date(delivery.sentAt), { addSuffix: true, locale: ja })
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {delivery.openedAt 
                    ? formatDistanceToNow(new Date(delivery.openedAt), { addSuffix: true, locale: ja })
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {deliveries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            最近の配信履歴がありません
          </div>
        )}
      </div>
    </div>
  )
}