'use client'

import { useState } from 'react'
import { User, Variable, Plus, Code, Calendar, Hash } from 'lucide-react'

interface QuickVarInsertProps {
  onInsert: (variable: string) => void
  className?: string
}

interface VariableCategory {
  name: string
  icon: React.ReactNode
  variables: Variable[]
}

interface Variable {
  key: string
  label: string
  description: string
  example: string
}

export function QuickVarInsert({ onInsert, className = '' }: QuickVarInsertProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('user')
  const [isOpen, setIsOpen] = useState(false)

  const variableCategories: VariableCategory[] = [
    {
      name: 'user',
      icon: <User className="w-4 h-4" />,
      variables: [
        {
          key: '{{user.name}}',
          label: 'ユーザー名',
          description: 'ユーザーの名前',
          example: '田中太郎'
        },
        {
          key: '{{user.firstName}}',
          label: '名前（名）',
          description: 'ユーザーの名前（名前部分）',
          example: '太郎'
        },
        {
          key: '{{user.lastName}}',
          label: '名前（姓）',
          description: 'ユーザーの名前（姓部分）',
          example: '田中'
        },
        {
          key: '{{user.email}}',
          label: 'メールアドレス',
          description: 'ユーザーのメールアドレス',
          example: 'tanaka@example.com'
        },
        {
          key: '{{user.phone}}',
          label: '電話番号',
          description: 'ユーザーの電話番号',
          example: '090-1234-5678'
        },
        {
          key: '{{user.tags}}',
          label: 'タグ一覧',
          description: 'ユーザーに設定されているタグ',
          example: 'VIP, プレミアム'
        }
      ]
    },
    {
      name: 'date',
      icon: <Calendar className="w-4 h-4" />,
      variables: [
        {
          key: '{{date.now}}',
          label: '現在日時',
          description: '現在の日時',
          example: '2024年6月10日 14:30'
        },
        {
          key: '{{date.today}}',
          label: '今日の日付',
          description: '今日の日付',
          example: '2024年6月10日'
        },
        {
          key: '{{date.tomorrow}}',
          label: '明日の日付',
          description: '明日の日付',
          example: '2024年6月11日'
        },
        {
          key: '{{date.dayOfWeek}}',
          label: '曜日',
          description: '今日の曜日',
          example: '月曜日'
        },
        {
          key: '{{date.month}}',
          label: '月',
          description: '今月',
          example: '6月'
        },
        {
          key: '{{date.year}}',
          label: '年',
          description: '今年',
          example: '2024年'
        }
      ]
    },
    {
      name: 'stats',
      icon: <Hash className="w-4 h-4" />,
      variables: [
        {
          key: '{{stats.messageCount}}',
          label: '配信回数',
          description: 'ユーザーへの総配信回数',
          example: '15'
        },
        {
          key: '{{stats.openRate}}',
          label: '開封率',
          description: 'ユーザーの開封率',
          example: '85%'
        },
        {
          key: '{{stats.clickRate}}',
          label: 'クリック率',
          description: 'ユーザーのクリック率',
          example: '25%'
        },
        {
          key: '{{stats.lastOpened}}',
          label: '最終開封日',
          description: '最後にメッセージを開封した日',
          example: '2024年6月8日'
        },
        {
          key: '{{stats.registrationDate}}',
          label: '登録日',
          description: 'ユーザーの登録日',
          example: '2024年1月15日'
        }
      ]
    },
    {
      name: 'system',
      icon: <Code className="w-4 h-4" />,
      variables: [
        {
          key: '{{system.botName}}',
          label: 'Bot名',
          description: 'LINEボットの名前',
          example: '公式アカウント'
        },
        {
          key: '{{system.companyName}}',
          label: '会社名',
          description: '会社・サービス名',
          example: '株式会社サンプル'
        },
        {
          key: '{{system.supportUrl}}',
          label: 'サポートURL',
          description: 'サポートページのURL',
          example: 'https://support.example.com'
        },
        {
          key: '{{system.unsubscribeUrl}}',
          label: '配信停止URL',
          description: '配信停止ページのURL',
          example: 'https://example.com/unsubscribe'
        }
      ]
    }
  ]

  const selectedCategoryData = variableCategories.find(cat => cat.name === selectedCategory)

  const getCategoryLabel = (categoryName: string) => {
    switch (categoryName) {
      case 'user': return 'ユーザー情報'
      case 'date': return '日付・時刻'
      case 'stats': return '統計情報'
      case 'system': return 'システム情報'
      default: return categoryName
    }
  }

  const handleVariableInsert = (variable: Variable) => {
    onInsert(variable.key)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        変数挿入
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">変数を挿入</h3>
            
            {/* カテゴリタブ */}
            <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
              {variableCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md ${
                    selectedCategory === category.name
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.icon}
                  <span className="ml-1 hidden sm:inline">
                    {getCategoryLabel(category.name)}
                  </span>
                </button>
              ))}
            </div>

            {/* 変数一覧 */}
            {selectedCategoryData && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedCategoryData.variables.map((variable) => (
                  <button
                    key={variable.key}
                    onClick={() => handleVariableInsert(variable)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {variable.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {variable.description}
                        </div>
                        <div className="text-xs font-mono text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                          {variable.key}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      例: {variable.example}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* フッター */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  変数をクリックして挿入
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}