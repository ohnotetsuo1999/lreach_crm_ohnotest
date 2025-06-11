'use client'

import { useState, useEffect } from 'react'
import { Pack, Template, ActionRule, Tag, Status } from '@/types'
import { X, Settings, Plus, Save, Move, ArrowUp, ArrowDown, Target } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { InlineActionRuleEditor } from './InlineActionRuleEditor'
import { TemplatePreviewCard } from '../TemplatePreview/TemplatePreviewCard'
import { TemplateSelector } from '../TemplateSelection/TemplateSelector'
import { QuickTemplateCreator } from '../TemplateSelection/QuickTemplateCreator'
import { PackTimingEditor } from '../PackTiming/PackTimingEditor'

interface PackDrawerProps {
  pack: Pack | null
  isOpen: boolean
  onClose: () => void
  onSave: (pack: Pack) => void
  onAddTemplate: (packId: string) => void
  onEditTemplate: (template: Template) => void
  onDeleteTemplate: (templateId: string) => void
  onReorderTemplates: (packId: string, templates: Template[]) => void
  actionRules?: ActionRule[]
  tags?: Tag[]
  statuses?: Status[]
  onCreateActionRule?: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateActionRule?: (ruleId: string, rule: Partial<ActionRule>) => void
  onDeleteActionRule?: (ruleId: string) => void
  availableTemplates?: Template[]
  onCreateTemplate?: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function PackDrawer({
  pack,
  isOpen,
  onClose,
  onSave,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onReorderTemplates,
  actionRules = [],
  tags = [],
  statuses = [],
  onCreateActionRule,
  onUpdateActionRule,
  onDeleteActionRule,
  availableTemplates = [],
  onCreateTemplate
}: PackDrawerProps) {
  const [formData, setFormData] = useState({
    offsetMinutes: 0,
    conditionJson: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showQuickCreator, setShowQuickCreator] = useState(false)

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

  const handlePackUpdate = (updates: Partial<Pack>) => {
    if (!pack) return
    
    const updatedPack = { ...pack, ...updates }
    onSave(updatedPack)
  }


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

  const handleTemplateCreate = (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (onCreateTemplate) {
      const newTemplate = {
        ...template,
        order: (pack?.templates?.length || 0) + 1
      }
      onCreateTemplate(newTemplate)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    if (onCreateTemplate) {
      const newTemplate = {
        ...template,
        order: (pack?.templates?.length || 0) + 1
      }
      onCreateTemplate(newTemplate)
    }
  }

  if (!isOpen || !pack) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white bg-opacity-60 shadow-xl">
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
              <PackTimingEditor
                pack={pack}
                onUpdate={handlePackUpdate}
              />

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
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowQuickCreator(true)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      新規作成
                    </button>
                    <button
                      onClick={() => setShowTemplateSelector(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      既存から追加
                    </button>
                  </div>
                </div>

                {pack.templates && pack.templates.length > 0 ? (
                  <DragDropContext onDragEnd={handleTemplateReorder}>
                    <Droppable droppableId="templates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {pack.templates.map((template, index) => (
                            <Draggable key={template.id} draggableId={template.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`transition-all ${
                                    snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                  }`}
                                >
                                  <div className="relative">
                                    {/* Drag handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="absolute left-2 top-4 p-1 text-gray-400 hover:text-gray-600 cursor-grab z-10"
                                    >
                                      <Move className="w-4 h-4" />
                                    </div>

                                    {/* Move buttons */}
                                    <div className="absolute right-2 top-2 flex flex-col space-y-1 z-10">
                                      <button
                                        onClick={() => moveTemplateUp(index)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveTemplateDown(index)}
                                        disabled={index === (pack.templates?.length || 0) - 1}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Template Preview Card */}
                                    <div className="pl-8 pr-16">
                                      <TemplatePreviewCard
                                        template={template}
                                        actionRules={actionRules}
                                        tags={tags}
                                        statuses={statuses}
                                        onEdit={onEditTemplate}
                                        onDelete={(templateId) => {
                                          if (confirm('このテンプレートを削除しますか？')) {
                                            onDeleteTemplate(templateId)
                                          }
                                        }}
                                      />
                                    </div>

                                    {/* Template-specific action rules section */}
                                    {onCreateActionRule && (
                                      <div className="pl-8 pr-4 mt-3">
                                        <InlineActionRuleEditor
                                          packId={pack.id}
                                          templateId={template.id}
                                          existingRules={actionRules}
                                          tags={tags}
                                          statuses={statuses}
                                          onCreateRule={onCreateActionRule}
                                          onUpdateRule={onUpdateActionRule!}
                                          onDeleteRule={onDeleteActionRule!}
                                        />
                                      </div>
                                    )}
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
                    <p className="text-sm mb-4">メッセージテンプレートがありません</p>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setShowQuickCreator(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        新規作成
                      </button>
                      <button
                        onClick={() => setShowTemplateSelector(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        既存から追加
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* アクションルール設定 */}
              {onCreateActionRule && (
                <div className="mt-6">
                  <InlineActionRuleEditor
                    packId={pack.id}
                    existingRules={actionRules}
                    tags={tags}
                    statuses={statuses}
                    onCreateRule={onCreateActionRule}
                    onUpdateRule={onUpdateActionRule!}
                    onDeleteRule={onDeleteActionRule!}
                  />
                </div>
              )}
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

      {/* テンプレート選択モーダル */}
      {showTemplateSelector && (
        <TemplateSelector
          availableTemplates={availableTemplates}
          onCreateNew={() => {
            setShowTemplateSelector(false)
            setShowQuickCreator(true)
          }}
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
          packId={pack.id}
        />
      )}

      {/* クイック作成モーダル */}
      {showQuickCreator && (
        <QuickTemplateCreator
          packId={pack.id}
          onSave={handleTemplateCreate}
          onClose={() => setShowQuickCreator(false)}
          suggestedOrder={(pack?.templates?.length || 0) + 1}
        />
      )}
    </div>
  )
}