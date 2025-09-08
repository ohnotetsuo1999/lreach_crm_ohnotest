'use client'

import { 
  LayoutDashboard, 
  Users, 
  Target, 
  List, 
  BarChart3, 
  Settings2, 
  Tags, 
  Send, 
  Bell, 
  Database, 
  Columns3, 
  Calendar, 
  FileText, 
  FileCheck, 
  UserCog, 
  Home, 
  MessageCircle, 
  Briefcase, 
  UserCheck, 
  GanttChartSquare,
  UserPlus,
  Building2
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: any) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'users', label: 'ユーザー管理', icon: Users },
    { id: 'segments', label: 'セグメント', icon: Target },
    { id: 'scenarios', label: 'シナリオ', icon: List },
    { id: 'templates', label: 'テンプレート', icon: FileText },
    { id: 'tags', label: 'タグ管理', icon: Tags },
    { id: 'reports', label: 'レポート', icon: BarChart3 },
    { id: 'broadcast', label: '一斉配信', icon: Send },
    { id: 'reminders', label: 'リマインダー', icon: Bell },
    { id: 'applicants', label: '求職者調整', icon: UserPlus },
    { id: 'interview-dashboard', label: '面談管理', icon: Calendar },
    { id: 'candidate-management', label: '候補者管理', icon: UserCheck },
    { id: 'crm-jobseekers', label: '求職者CRM', icon: Users },
    { id: 'crm-companies', label: '企業・求人管理', icon: Building2 },
    { id: 'crm-agents', label: 'アクション管理', icon: UserCog },
    { id: 'gantt-chart', label: 'ガントチャート', icon: GanttChartSquare },
    { id: 'admin-home', label: '管理者ホーム', icon: Home },
    { id: 'admin-database', label: 'DB管理', icon: Database },
    { id: 'admin-messages', label: 'メッセージ', icon: MessageCircle },
  ]

  return (
    <div className="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">LINE Marketing</h1>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}