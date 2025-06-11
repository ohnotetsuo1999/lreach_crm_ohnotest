'use client'

import { useState, useEffect } from 'react'
import { Template, TemplateFolder } from '@/types'
import { X, Save, Settings, Eye, Code, Image, Type, Package } from 'lucide-react'

interface TemplateDrawerProps {
  template: Template | null
  isOpen: boolean
  onClose: () => void
  onSave: (templateId: string, updates: Partial<Template>) => void
  onDelete: (templateId: string) => void
  folders: TemplateFolder[]
}

export function TemplateDrawer({
  template,
  isOpen,
  onClose,
  onSave,
  onDelete,
  folders
}: TemplateDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT' as 'TEXT' | 'FLEX' | 'IMAGE' | 'PACK',
    content: '',
    folderId: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        content: template.content,
        folderId: template.folderId || ''
      })
    }
  }, [template])

  const handleSave = () => {
    if (!template) return

    onSave(template.id, {
      name: formData.name.trim(),
      type: formData.type,
      content: formData.content.trim(),
      folderId: formData.folderId || undefined
    })
    onClose()
  }

  const handleDelete = () => {
    if (!template) return
    
    if (confirm('このテンプレートを削除しますか？')) {
      onDelete(template.id)
      onClose()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type className="w-4 h-4" />
      case 'FLEX': return <Code className="w-4 h-4" />
      case 'IMAGE': return <Image className="w-4 h-4" />
      case 'PACK': return <Package className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FLEX': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'IMAGE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PACK': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'TEXT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テキスト内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="メッセージ内容を入力してください"
            />
            <p className="mt-1 text-xs text-gray-500">
              変数: {'{{user.name}}, {{user.phone}}'} などが使用できます
            </p>
          </div>
        )
      
      case 'FLEX':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flex Message JSON
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={'{"type": "bubble", "body": {...}}'}
            />
            <p className="mt-1 text-xs text-gray-500">
              LINE Flex Message形式のJSONを入力してください
            </p>
          </div>
        )
      
      case 'IMAGE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像URL
            </label>
            <input
              type="url"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              HTTPS形式の画像URLを入力してください
            </p>
            {formData.content && (
              <div className="mt-3">
                <img
                  src={formData.content}
                  alt="プレビュー"
                  className="max-w-full h-auto rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      
      case 'PACK':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パック説明
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="このパックの説明を入力してください"
            />
          </div>
        )
      
      default:
        return null
    }
  }

  if (!isOpen || !template) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                {getTypeIcon(template.type)}
                <span className="ml-1">
                  {template.type === 'TEXT' ? 'テキスト' : 
                   template.type === 'FLEX' ? 'Flex' : 
                   template.type === 'IMAGE' ? '画像' : 'パック'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h2>
                <p className="text-sm text-gray-600">
                  テンプレート設定
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`p-2 rounded-full transition-colors ${
                  previewMode ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="プレビュー"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フォルダ
                  </label>
                  <select
                    value={formData.folderId}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">未分類</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* タイプ選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイプ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['TEXT', 'FLEX', 'IMAGE', 'PACK'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {getTypeIcon(type)}
                        <span>
                          {type === 'TEXT' ? 'テキスト' : 
                           type === 'FLEX' ? 'Flex' : 
                           type === 'IMAGE' ? '画像' : 'パック'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* コンテンツエディター */}
              {renderContentEditor()}

              {/* 高度な設定 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium text-gray-900">高度な設定</span>
                  </div>
                  <span className="text-gray-400">
                    {showAdvanced ? '−' : '+'}
                  </span>
                </button>
                
                {showAdvanced && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メタデータ
                      </label>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>作成日: {template.createdAt.toLocaleString('ja-JP')}</div>
                        {template.updatedAt && (
                          <div>更新日: {template.updatedAt.toLocaleString('ja-JP')}</div>
                        )}
                        <div>ID: {template.id}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* プレビュー */}
              {previewMode && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">プレビュー</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {formData.type === 'TEXT' && (
                      <div className="whitespace-pre-wrap text-sm">{formData.content}</div>
                    )}
                    {formData.type === 'FLEX' && (
                      <div className="font-mono text-xs text-gray-600">
                        Flex Message プレビュー機能は開発中です
                      </div>
                    )}
                    {formData.type === 'IMAGE' && formData.content && (
                      <img
                        src={formData.content}
                        alt="プレビュー"
                        className="max-w-full h-auto rounded"
                      />
                    )}
                    {formData.type === 'PACK' && (
                      <div className="text-sm text-gray-600">{formData.content}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                削除
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}