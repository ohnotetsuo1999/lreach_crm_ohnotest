'use client'

import { StatsCard } from './StatsCard'
import { RecentDeliveryTable } from './RecentDeliveryTable'
import { DeliveryLog } from '@/types'
import { Send, Eye, MousePointer, Users, TrendingUp, Clock } from 'lucide-react'

interface DashboardProps {
  deliveries: DeliveryLog[]
  totalUsers: number
  totalSent: number
  totalOpened: number
  totalClicked: number
  openRate: number
  clickRate: number
}

export function Dashboard({ 
  deliveries, 
  totalUsers, 
  totalSent, 
  totalOpened, 
  totalClicked,
  openRate,
  clickRate 
}: DashboardProps) {
  
  const recentDeliveries = deliveries.slice(0, 10)
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="総ユーザー数"
          value={totalUsers}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          change={5.2}
          trend="up"
        />
        
        <StatsCard
          title="今月の配信数"
          value={totalSent}
          icon={<Send className="w-5 h-5 text-green-600" />}
          change={12.5}
          trend="up"
        />
        
        <StatsCard
          title="開封率"
          value={`${openRate.toFixed(1)}%`}
          icon={<Eye className="w-5 h-5 text-purple-600" />}
          change={-2.1}
          trend="down"
        />
        
        <StatsCard
          title="クリック率"
          value={`${clickRate.toFixed(1)}%`}
          icon={<MousePointer className="w-5 h-5 text-orange-600" />}
          change={8.3}
          trend="up"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDeliveryTable deliveries={recentDeliveries} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">配信統計</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">配信済み</span>
                <span className="text-sm font-medium">{totalSent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">開封済み</span>
                <span className="text-sm font-medium">{totalOpened.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">クリック済み</span>
                <span className="text-sm font-medium">{totalClicked.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">今日のアクティビティ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    3件のシナリオが実行中
                  </p>
                  <p className="text-xs text-gray-500">
                    2分前
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    開封率が平均を上回っています
                  </p>
                  <p className="text-xs text-gray-500">
                    1時間前
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    15人の新規ユーザーが追加
                  </p>
                  <p className="text-xs text-gray-500">
                    3時間前
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}