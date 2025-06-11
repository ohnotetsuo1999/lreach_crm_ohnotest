'use client'

import { StatsCard } from './StatsCard'
import { DeliveryLog } from '@/types'
import { Send, Eye, Users, UserPlus, Calendar } from 'lucide-react'

interface DashboardProps {
  deliveries: DeliveryLog[]
  totalUsers: number
  totalSent: number
  totalOpened: number
  totalClicked: number
  openRate: number
  clickRate: number
  totalReservations: number
  reservationRate: number
  todayReservations: number
  users?: any[]
  scenarios?: any[]
  onAIActionClick?: (action: string, data?: any) => void
}

export function Dashboard({ 
  deliveries, 
  totalUsers, 
  totalSent, 
  totalOpened, 
  totalClicked,
  openRate,
  clickRate,
  totalReservations,
  reservationRate,
  todayReservations,
  users = [],
  scenarios = [],
  onAIActionClick
}: DashboardProps) {
  
  // Calculate new users this month
  const newUsersThisMonth = users.filter(u => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return new Date(u.createdAt) > monthAgo
  }).length
  
  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="月間配信数"
          value={totalSent}
          icon={<Send className="w-5 h-5 text-blue-600" />}
          change={12.5}
          trend="up"
        />
        
        <StatsCard
          title="新規ユーザー数"
          value={newUsersThisMonth}
          icon={<UserPlus className="w-5 h-5 text-green-600" />}
          change={23.1}
          trend="up"
        />
        
        <StatsCard
          title="開封率"
          value={`${openRate.toFixed(1)}%`}
          icon={<Eye className="w-5 h-5 text-purple-600" />}
          change={-2.1}
          trend="down"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="予約数"
          value={totalReservations}
          icon={<Calendar className="w-5 h-5 text-orange-600" />}
          change={8.7}
          trend="up"
        />
        
        <StatsCard
          title="予約率"
          value={`${reservationRate.toFixed(1)}%`}
          icon={<Users className="w-5 h-5 text-cyan-600" />}
          change={5.3}
          trend="up"
        />
        
        <StatsCard
          title="本日の予約数"
          value={todayReservations}
          icon={<Calendar className="w-5 h-5 text-green-600" />}
          change={12.5}
          trend="up"
        />
      </div>
    </div>
  )
}