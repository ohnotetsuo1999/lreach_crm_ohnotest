'use client'

import { useState } from 'react'
import { Template } from '@/types'
import { Plus, Copy, FileText, Layout, Type, Search, X } from 'lucide-react'

interface TemplateSelectorProps {
  availableTemplates: Template[]
  onCreateNew: () => void
  onSelectTemplate: (template: Template) => void
  onClose: () => void
  packId: string
}

export function TemplateSelector({
  availableTemplates,
  onCreateNew,
  onSelectTemplate,
  onClose,
  packId
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'text' | 'flex'>('all')

  // 他のPackで使用されているテンプレートを除外
  const unusedTemplates = availableTemplates.filter(template => 
    template.packId !== packId
  )

  // 検索とフィルタリング
  const filteredTemplates = unusedTemplates.filter(template => {
    try {
      const message = JSON.parse(template.lineMessageJson)
      
      // タイプフィルタ
      if (selectedType !== 'all' && message.type !== selectedType) {
        return false
      }
      
      // 検索フィルタ
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const messageText = message.type === 'text' 
          ? message.text 
          : message.altText || ''
        
        return messageText.toLowerCase().includes(searchLower) ||
               `テンプレート ${template.order}`.toLowerCase().includes(searchLower)
      }
      
      return true
    } catch {
      return false
    }
  })

  const getMessagePreview = (template: Template) => {
    try {
      const message = JSON.parse(template.lineMessageJson)
      if (message.type === 'text') {
        return message.text.length > 60 
          ? message.text.substring(0, 60) + '...' 
          : message.text
      } else if (message.type === 'flex') {
        return message.altText || 'Flex Message'
      }
    } catch {
      return 'Invalid template'
    }
    return 'Unknown template'
  }

  const getMessageType = (template: Template) => {
    try {
      const message = JSON.parse(template.lineMessageJson)
      return message.type
    } catch {
      return 'unknown'
    }
  }

  const extractButtons = (template: Template) => {
    try {
      const message = JSON.parse(template.lineMessageJson)
      const buttons: string[] = []
      
      const traverse = (obj: any) => {
        if (obj && typeof obj === 'object') {
          if (obj.type === 'button' && obj.action?.label) {
            buttons.push(obj.action.label)
          }
          Object.values(obj).forEach(value => {
            if (Array.isArray(value)) {
              value.forEach(traverse)
            } else if (typeof value === 'object') {
              traverse(value)
            }
          })
        }
      }
      
      traverse(message)
      return [...new Set(buttons)]
    } catch {
      return []
    }
  }

  const handleTemplateSelect = (template: Template) => {
    // テンプレートを複製して新しいPackに追加
    const newTemplate: Template = {
      ...template,
      id: `template_${Date.now()}`,
      packId: packId,
      order: 1, // 新しい順序は呼び出し元で設定
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    onSelectTemplate(newTemplate)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                テンプレート選択
              </h2>
              <p className="text-sm text-gray-600">
                新規作成または既存テンプレートを選択
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* アクションボタン */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onCreateNew()
                  onClose()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規テンプレート作成
              </button>
              
              <div className="text-sm text-gray-600 flex items-center">
                または既存のテンプレートを選択して複製
              </div>
            </div>
          </div>

          {/* 検索・フィルタ */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-4">
              {/* 検索 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="テンプレートを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* タイプフィルタ */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="text">テキスト</option>
                <option value="flex">Flex</option>
              </select>
            </div>
          </div>

          {/* テンプレート一覧 */}
          <div className="flex-1 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">利用可能なテンプレートがありません</p>
                <p className="text-sm">新規テンプレートを作成してください</p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const messageType = getMessageType(template)
                  const buttons = extractButtons(template)
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {messageType === 'text' ? (
                            <Type className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Layout className="w-4 h-4 text-purple-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            テンプレート {template.order}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            messageType === 'text' 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {messageType === 'text' ? 'テキスト' : 'Flex'}
                          </span>
                        </div>
                        
                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      </div>

                      {/* プレビュー */}
                      <div className="mb-3 p-3 bg-gray-50 rounded border text-sm text-gray-700">
                        {getMessagePreview(template)}
                      </div>

                      {/* メタ情報 */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          {buttons.length > 0 && (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
                              {buttons.length}ボタン
                            </span>
                          )}
                          <span>
                            {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        
                        <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                          複製して追加
                        </span>
                      </div>

                      {/* ボタン一覧（最大3個まで表示） */}
                      {buttons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {buttons.slice(0, 3).map((buttonText, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                            >
                              「{buttonText.length > 10 ? buttonText.substring(0, 10) + '...' : buttonText}」
                            </span>
                          ))}
                          {buttons.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{buttons.length - 3}個
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredTemplates.length}件のテンプレートが利用可能
              </span>
              <span>
                選択したテンプレートは複製されて追加されます
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}