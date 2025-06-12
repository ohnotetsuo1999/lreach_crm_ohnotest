'use client'

import { useState, useEffect } from 'react'
import { TemplatePack, Template, TemplateFolder } from '@/types'
import { ArrowLeft, Package, Edit, Trash2, Eye, Settings, Type, Code, Image, Save, X, Plus, Search, Check } from 'lucide-react'

interface PackDetailProps {
  pack: TemplatePack
  templates: Template[]
  templateFolders: TemplateFolder[]
  onBack: () => void
  onUpdatePack: (packId: string, updates: Partial<TemplatePack>) => void
  onDeletePack: (packId: string) => void
  onUpdateTemplate: (templateId: string, updates: Partial<Template>) => void
  onPreviewTemplate: (template: Template) => void
}

export function PackDetail({
  pack,
  templates,
  templateFolders,
  onBack,
  onUpdatePack,
  onDeletePack,
  onUpdateTemplate,
  onPreviewTemplate
}: PackDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [formData, setFormData] = useState({
    name: pack.name,
    description: pack.description || '',
    templateIds: pack.templateIds
  })

  // パック内のテンプレート取得
  const packTemplates = templates.filter(template => 
    pack.templateIds.includes(template.id)
  )

  // テンプレートタイプ別のアイコン
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type className="w-4 h-4" />
      case 'FLEX': return <Code className="w-4 h-4" />
      case 'IMAGE': return <Image className="w-4 h-4" />
      case 'PACK': return <Package className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  // テンプレートタイプ別の色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FLEX': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'IMAGE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PACK': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // パック情報保存
  const handleSavePack = () => {
    onUpdatePack(pack.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      templateIds: formData.templateIds
    })
    setIsEditing(false)
  }

  // パック削除
  const handleDeletePack = () => {
    if (confirm('このパックを削除しますか？パック内のテンプレート自体は削除されません。')) {
      onDeletePack(pack.id)
      onBack()
    }
  }

  // テンプレート編集開始
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate({...template})
  }

  // テンプレート保存
  const handleSaveTemplate = () => {
    if (!editingTemplate) return
    
    onUpdateTemplate(editingTemplate.id, {
      name: editingTemplate.name,
      content: editingTemplate.content,
      notes: editingTemplate.notes,
      folderId: editingTemplate.folderId
    })
    setEditingTemplate(null)
  }

  // テンプレートをパックから削除
  const handleRemoveTemplate = (templateId: string) => {
    if (confirm('このテンプレートをパックから削除しますか？')) {
      const newTemplateIds = formData.templateIds.filter(id => id !== templateId)
      setFormData({ ...formData, templateIds: newTemplateIds })
      onUpdatePack(pack.id, { templateIds: newTemplateIds })
    }
  }

  // テンプレートをパックに追加
  const handleAddTemplate = (templateId: string) => {
    if (!formData.templateIds.includes(templateId)) {
      const newTemplateIds = [...formData.templateIds, templateId]
      setFormData({ ...formData, templateIds: newTemplateIds })
      onUpdatePack(pack.id, { templateIds: newTemplateIds })
    }
  }

  // 利用可能なテンプレート（パックに含まれていないもの）
  const availableTemplates = templates.filter(template => 
    !pack.templateIds.includes(template.id) && template.type !== 'PACK'
  )

  // フィルタリングされた利用可能なテンプレート
  const filteredAvailableTemplates = availableTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !template.folderId
    } else if (selectedFolder !== '') {
      matchesFolder = template.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            テンプレートに戻る
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pack.name}</h1>
              <p className="text-sm text-gray-600">パック詳細・テンプレート設定</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            パック編集
          </button>
          <button
            onClick={handleDeletePack}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </button>
        </div>
      </div>

      {/* パック情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">パック情報</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">パック名</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="text-sm text-gray-900 py-2">{pack.name}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート数</label>
            <div className="text-sm text-gray-900 py-2">{packTemplates.length} 件</div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="パックの説明を入力"
            />
          ) : (
            <div className="text-sm text-gray-900 py-2">{pack.description || '説明なし'}</div>
          )}
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  name: pack.name,
                  description: pack.description || '',
                  templateIds: pack.templateIds
                })
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2 inline" />
              キャンセル
            </button>
            <button
              onClick={handleSavePack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              保存
            </button>
          </div>
        )}
      </div>

      {/* テンプレート一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">パック内テンプレート</h2>
            <button 
              onClick={() => setShowAddTemplateModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              テンプレート追加
            </button>
          </div>
        </div>

        {packTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">テンプレートがありません</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              このパックにはまだテンプレートが登録されていません
            </p>
            <button 
              onClick={() => setShowAddTemplateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初のテンプレートを追加
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テンプレート名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    フォルダ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packTemplates.map((template) => {
                  const folder = template.folderId 
                    ? templateFolders.find(f => f.id === template.folderId)
                    : null

                  return (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {template.content.length > 50 
                            ? template.content.substring(0, 50) + '...' 
                            : template.content
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                          {getTypeIcon(template.type)}
                          <span className="ml-1">
                            {template.type === 'TEXT' ? 'テキスト' : 
                             template.type === 'FLEX' ? 'Flex' : 
                             template.type === 'IMAGE' ? '画像' : 'パック'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {folder ? folder.name : '未分類'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onPreviewTemplate(template)}
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center p-1 rounded hover:bg-gray-100"
                            title="プレビュー"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                            title="編集"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveTemplate(template.id)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                            title="パックから削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* テンプレート編集モーダル */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">テンプレート編集</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート名</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                  <textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">備考（任意）</label>
                  <textarea
                    value={editingTemplate.notes || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="テンプレートの備考やメモを入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ</label>
                  <select
                    value={editingTemplate.folderId || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, folderId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">未分類</option>
                    {templateFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* テンプレート追加モーダル */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddTemplateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-full flex-col">
              {/* モーダルヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">テンプレートを追加</h3>
                    <p className="text-sm text-gray-600 mt-1">パックに追加するテンプレートを選択してください</p>
                  </div>
                  <button
                    onClick={() => setShowAddTemplateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* フィルター部分 */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="テンプレート名または内容で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="w-64">
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">すべてのフォルダ</option>
                      <option value="null">未分類</option>
                      {templateFolders.map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* テンプレート一覧 */}
              <div className="flex-1 overflow-y-auto">
                {filteredAvailableTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {availableTemplates.length === 0 
                        ? '追加可能なテンプレートがありません' 
                        : '検索条件に一致するテンプレートがありません'
                      }
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {availableTemplates.length === 0 
                        ? 'すべてのテンプレートが既にこのパックに追加されています'
                        : '検索条件を変更してお試しください'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {filteredAvailableTemplates.map((template) => {
                        const folder = template.folderId 
                          ? templateFolders.find(f => f.id === template.folderId)
                          : null

                        return (
                          <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                                    {getTypeIcon(template.type)}
                                    <span className="ml-1">
                                      {template.type === 'TEXT' ? 'テキスト' : 
                                       template.type === 'FLEX' ? 'Flex' : 
                                       template.type === 'IMAGE' ? '画像' : 'パック'}
                                    </span>
                                  </span>
                                  {folder && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {folder.name}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {template.content.length > 100 
                                    ? template.content.substring(0, 100) + '...' 
                                    : template.content
                                  }
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>作成日: {new Date(template.createdAt).toLocaleDateString('ja-JP')}</span>
                                  {template.notes && (
                                    <span>備考: {template.notes.substring(0, 30)}{template.notes.length > 30 ? '...' : ''}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => onPreviewTemplate(template)}
                                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                  title="プレビュー"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    handleAddTemplate(template.id)
                                    setShowAddTemplateModal(false)
                                  }}
                                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  追加
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* モーダルフッター */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {filteredAvailableTemplates.length} 件のテンプレートが利用可能
                  </p>
                  <button
                    onClick={() => setShowAddTemplateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}