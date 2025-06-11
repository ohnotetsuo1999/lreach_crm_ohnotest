'use client'

import { useState, useEffect } from 'react'
import { Template, TemplatePack } from '@/types'
import { X, Save, Settings, Plus, Eye, Move, ArrowUp, ArrowDown, Trash2, Package } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface PackDrawerProps {
  pack: TemplatePack | null
  isOpen: boolean
  onClose: () => void
  onSave: (packId: string, updates: Partial<TemplatePack>) => void
  onDelete: (packId: string) => void
  templates: Template[]
  onUpdateTemplate: (templateId: string, updates: Partial<Template>) => void
}

export function PackDrawer({
  pack,
  isOpen,
  onClose,
  onSave,
  onDelete,
  templates,
  onUpdateTemplate
}: PackDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateIds: [] as string[]
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])
  const [packTemplates, setPackTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (pack) {
      setFormData({
        name: pack.name,
        description: pack.description || '',
        templateIds: pack.templateIds
      })
      
      // パックに含まれるテンプレートと利用可能なテンプレートを分離
      const packTemplateList = pack.templateIds
        .map(id => templates.find(t => t.id === id))
        .filter(Boolean) as Template[]
      
      const availableTemplateList = templates.filter(
        t => !pack.templateIds.includes(t.id) && t.type !== 'PACK'
      )
      
      setPackTemplates(packTemplateList)
      setAvailableTemplates(availableTemplateList)
    }
  }, [pack, templates])

  const handleSave = () => {
    if (!pack) return

    onSave(pack.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      templateIds: formData.templateIds
    })
    onClose()
  }

  const handleDelete = () => {
    if (!pack) return
    
    if (confirm('このテンプレートパックを削除しますか？')) {
      onDelete(pack.id)
      onClose()
    }
  }

  const handleAddTemplate = (template: Template) => {
    const newTemplateIds = [...formData.templateIds, template.id]
    setFormData({ ...formData, templateIds: newTemplateIds })
    
    setPackTemplates([...packTemplates, template])
    setAvailableTemplates(availableTemplates.filter(t => t.id !== template.id))
  }

  const handleRemoveTemplate = (templateId: string) => {
    const newTemplateIds = formData.templateIds.filter(id => id !== templateId)
    setFormData({ ...formData, templateIds: newTemplateIds })
    
    const removedTemplate = packTemplates.find(t => t.id === templateId)
    if (removedTemplate) {
      setPackTemplates(packTemplates.filter(t => t.id !== templateId))
      setAvailableTemplates([...availableTemplates, removedTemplate])
    }
  }

  const handleTemplateReorder = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(packTemplates)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPackTemplates(items)
    setFormData({ 
      ...formData, 
      templateIds: items.map(t => t.id) 
    })
  }

  const moveTemplateUp = (index: number) => {
    if (index === 0) return
    
    const items = [...packTemplates]
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp
    
    setPackTemplates(items)
    setFormData({ 
      ...formData, 
      templateIds: items.map(t => t.id) 
    })
  }

  const moveTemplateDown = (index: number) => {
    if (index === packTemplates.length - 1) return
    
    const items = [...packTemplates]
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp
    
    setPackTemplates(items)
    setFormData({ 
      ...formData, 
      templateIds: items.map(t => t.id) 
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FLEX': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'IMAGE': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isOpen || !pack) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 border-orange-200">
                <Package className="w-4 h-4 mr-1" />
                パック
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {pack.name}
                </h2>
                <p className="text-sm text-gray-600">
                  テンプレートパック設定 ({packTemplates.length}個のテンプレート)
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6 p-6 h-full">
              {/* 左カラム: パック設定 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">基本情報</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        パック名
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
                        説明
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="パックの説明を入力してください"
                      />
                    </div>
                  </div>
                </div>

                {/* 利用可能なテンプレート */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    利用可能なテンプレート ({availableTemplates.length}件)
                  </h3>
                  
                  <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                    {availableTemplates.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {availableTemplates.map((template) => (
                          <div key={template.id} className="p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {template.name}
                                </div>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                                    {template.type === 'TEXT' ? 'テキスト' : 
                                     template.type === 'FLEX' ? 'Flex' : '画像'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {template.createdAt.toLocaleDateString('ja-JP')}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddTemplate(template)}
                                className="ml-3 inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                追加
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        追加可能なテンプレートがありません
                      </div>
                    )}
                  </div>
                </div>

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
                          <div>作成日: {pack.createdAt.toLocaleString('ja-JP')}</div>
                          <div>更新日: {pack.updatedAt.toLocaleString('ja-JP')}</div>
                          <div>ID: {pack.id}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 右カラム: パック内テンプレート */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    パック内テンプレート ({packTemplates.length}件)
                  </h3>
                </div>

                {packTemplates.length > 0 ? (
                  <DragDropContext onDragEnd={handleTemplateReorder}>
                    <Droppable droppableId="packTemplates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3 max-h-[500px] overflow-y-auto"
                        >
                          {packTemplates.map((template, index) => (
                            <Draggable key={template.id} draggableId={template.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white border border-gray-200 rounded-lg transition-all ${
                                    snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                  }`}
                                >
                                  <div className="p-4 relative">
                                    {/* Drag handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="absolute left-2 top-4 p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                                    >
                                      <Move className="w-4 h-4" />
                                    </div>

                                    {/* Move buttons */}
                                    <div className="absolute right-2 top-2 flex space-x-1">
                                      <button
                                        onClick={() => moveTemplateUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveTemplateDown(index)}
                                        disabled={index === packTemplates.length - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveTemplate(template.id)}
                                        className="p-1 text-red-400 hover:text-red-600 rounded bg-white shadow-sm"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Template info */}
                                    <div className="pl-8 pr-20">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900">
                                            {index + 1}. {template.name}
                                          </span>
                                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                                            {template.type === 'TEXT' ? 'テキスト' : 
                                             template.type === 'FLEX' ? 'Flex' : '画像'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="text-xs text-gray-500 mb-2">
                                        {template.content.length > 100 
                                          ? template.content.substring(0, 100) + '...'
                                          : template.content
                                        }
                                      </div>
                                      
                                      <div className="text-xs text-gray-400">
                                        作成日: {template.createdAt.toLocaleDateString('ja-JP')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-sm mb-4">パックにテンプレートがありません</p>
                    <p className="text-xs">左側の利用可能なテンプレートから追加してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                パックを削除
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