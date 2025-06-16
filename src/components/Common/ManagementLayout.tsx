'use client'

import { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { ActionMenu, ActionMenuItem } from './ActionMenu'

interface ManagementLayoutProps {
  title: string
  description: string
  headerActions?: ActionMenuItem[]
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  folderTree: ReactNode
  content: ReactNode
  modals?: ReactNode
  extraHeaderContent?: ReactNode
}

export function ManagementLayout({
  title,
  description,
  headerActions = [],
  searchQuery,
  onSearchChange,
  searchPlaceholder = '検索',
  folderTree,
  content,
  modals,
  extraHeaderContent
}: ManagementLayoutProps) {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {extraHeaderContent}
          
          {/* アクションメニュー */}
          {headerActions.length > 0 && (
            <ActionMenu items={headerActions} />
          )}
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左カラム: フォルダツリー */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">フォルダ</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {folderTree}
            </div>
          </div>
        </div>

        {/* 右カラム: コンテンツ表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">コンテンツ</h3>
                <div className="flex items-center space-x-3">
                  {/* アクションメニュー（コンテンツ用） */}
                  {headerActions.length > 0 && (
                    <ActionMenu items={headerActions} />
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* モーダル */}
      {modals}
    </div>
  )
}