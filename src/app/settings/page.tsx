'use client'

import { useState } from 'react'
import { 
  Settings, 
  Users
} from 'lucide-react'

const settingsSections = [
  {
    id: 'general',
    name: '一般設定',
    href: '/settings/general',
    icon: Settings,
    description: 'アプリケーションの基本設定を管理'
  },
  {
    id: 'members',
    name: 'メンバー',
    href: '/settings/members',
    icon: Users,
    description: 'チームメンバーと権限の管理'
  }
]

export default function SettingsPage() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              設定
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              システム設定とチーム管理
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <a
                key={section.id}
                href={section.href}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {section.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}