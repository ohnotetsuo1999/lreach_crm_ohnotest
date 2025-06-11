'use client'

import { useState, useEffect } from 'react'
import { Pack, Template } from '@/types'
import { X, Clock, Settings, Plus, Edit2, Trash2, Save, Move, ArrowUp, ArrowDown } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface PackDrawerProps {
  pack: Pack | null
  isOpen: boolean
  onClose: () => void
  onSave: (pack: Pack) => void
  onAddTemplate: (packId: string) => void
  onEditTemplate: (template: Template) => void
  onDeleteTemplate: (templateId: string) => void
  onReorderTemplates: (packId: string, templates: Template[]) => void
}

export function PackDrawer({
  pack,
  isOpen,
  onClose,
  onSave,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onReorderTemplates
}: PackDrawerProps) {
  const [formData, setFormData] = useState({
    offsetMinutes: 0,
    conditionJson: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (pack) {
      setFormData({
        offsetMinutes: pack.offsetMinutes,
        conditionJson: pack.conditionJson || ''
      })
      setShowAdvanced(!!pack.conditionJson)
    }
  }, [pack])

  const handleSave = () => {
    if (!pack) return

    const updatedPack: Pack = {
      ...pack,
      offsetMinutes: formData.offsetMinutes,
      conditionJson: formData.conditionJson || undefined
    }

    onSave(updatedPack)
    onClose()
  }

  const formatTimeInput = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return { hours, minutes: mins }
  }

  const parseTimeInput = (hours: number, minutes: number) => {
    return hours * 60 + minutes
  }

  const timeInput = formatTimeInput(formData.offsetMinutes)

  const handleTemplateReorder = (result: DropResult) => {
    if (!result.destination || !pack) return

    const items = Array.from(pack.templates || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order values
    const reorderedTemplates = items.map((template, index) => ({
      ...template,
      order: index + 1
    }))

    onReorderTemplates(pack.id, reorderedTemplates)
  }

  const moveTemplateUp = (index: number) => {
    if (!pack || index === 0) return
    
    const templates = [...(pack.templates || [])]
    const temp = templates[index]
    templates[index] = templates[index - 1]
    templates[index - 1] = temp
    
    // Update order values
    const reorderedTemplates = templates.map((template, idx) => ({
      ...template,
      order: idx + 1
    }))
    
    onReorderTemplates(pack.id, reorderedTemplates)
  }

  const moveTemplateDown = (index: number) => {
    if (!pack || index === (pack.templates?.length || 0) - 1) return
    
    const templates = [...(pack.templates || [])]
    const temp = templates[index]
    templates[index] = templates[index + 1]
    templates[index + 1] = temp
    
    // Update order values
    const reorderedTemplates = templates.map((template, idx) => ({
      ...template,
      order: idx + 1
    }))
    
    onReorderTemplates(pack.id, reorderedTemplates)
  }

  const getMessagePreview = (messageJson: string) => {
    try {
      const message = JSON.parse(messageJson)
      if (message.type === 'text') {
        return message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '')
      } else if (message.type === 'flex') {
        return message.altText || 'Flex Message'
      }
    } catch (error) {
      return 'Invalid JSON'
    }
    return 'Unknown message type'
  }

  if (!isOpen || !pack) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pack {pack.order} 設定
              </h2>
              <p className="text-sm text-gray-600">
                配信タイミングとメッセージの設定
              </p>
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
            <div className="p-6 space-y-6">
              {/* タイミング設定 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  実行タイミング
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      時間
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={timeInput.hours}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0
                        setFormData({
                          ...formData,
                          offsetMinutes: parseTimeInput(hours, timeInput.minutes)
                        })
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={timeInput.minutes}
                      onChange={(e) => {
                        const minutes = parseInt(e.target.value) || 0
                        setFormData({
                          ...formData,
                          offsetMinutes: parseTimeInput(timeInput.hours, minutes)
                        })
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  {formData.offsetMinutes === 0 
                    ? '前のPackの直後に実行' 
                    : `前のPackから${Math.floor(formData.offsetMinutes / 60)}時間${formData.offsetMinutes % 60}分後に実行`
                  }
                </div>

                {/* プリセット */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">クイック設定</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'すぐに', minutes: 0 },
                      { label: '5分後', minutes: 5 },
                      { label: '30分後', minutes: 30 },
                      { label: '1時間後', minutes: 60 },
                      { label: '1日後', minutes: 1440 },
                      { label: '1週間後', minutes: 10080 }
                    ].map((preset) => (
                      <button
                        key={preset.minutes}
                        onClick={() => setFormData({ ...formData, offsetMinutes: preset.minutes })}
                        className={`px-3 py-1 text-xs rounded-full border ${
                          formData.offsetMinutes === preset.minutes
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
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
                        実行条件（JSON）
                      </label>
                      <textarea
                        value={formData.conditionJson}
                        onChange={(e) => setFormData({ ...formData, conditionJson: e.target.value })}
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder='例: {"field": "tags", "operator": "contains", "value": "premium"}'
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        空の場合は無条件で実行されます
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* メッセージテンプレート */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    メッセージテンプレート（{pack.templates?.length || 0}件）
                  </h3>
                  
                  <button
                    onClick={() => onAddTemplate(pack.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    追加
                  </button>
                </div>

                {pack.templates && pack.templates.length > 0 ? (
                  <DragDropContext onDragEnd={handleTemplateReorder}>
                    <Droppable droppableId="templates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3"
                        >
                          {pack.templates.map((template, index) => (
                            <Draggable key={template.id} draggableId={template.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-gray-50 rounded-lg p-3 border ${
                                    snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    {/* Drag handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 cursor-grab mt-1"
                                    >
                                      <Move className="w-4 h-4" />
                                    </div>

                                    {/* Order badge */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-1">
                                      {template.order}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            テンプレート {template.order}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                          {/* Move buttons */}
                                          <button
                                            onClick={() => moveTemplateUp(index)}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => moveTemplateDown(index)}
                                            disabled={index === (pack.templates?.length || 0) - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                          </button>

                                          {/* Edit/Delete buttons */}
                                          <button
                                            onClick={() => onEditTemplate(template)}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm('このテンプレートを削除しますか？')) {
                                                onDeleteTemplate(template.id)
                                              }
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Template preview */}
                                      <div className="bg-white p-3 rounded border border-gray-200">
                                        <div className="text-xs font-medium text-gray-700 mb-1">
                                          {JSON.parse(template.lineMessageJson).type === 'text' ? 'テキストメッセージ' : 'Flexメッセージ'}
                                        </div>
                                        <div className="text-sm text-gray-600 line-clamp-2">
                                          {getMessagePreview(template.lineMessageJson)}
                                        </div>
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
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">メッセージテンプレートがありません</p>
                    <button
                      onClick={() => onAddTemplate(pack.id)}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      最初のテンプレートを作成
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
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
  )
}