'use client'

import { useState } from 'react'
import { Template, PackTemplate, ScenarioActionRule, ActionType, TagAction, Tag, Status, LineMessage } from '@/types'
import { Plus, Search, X, Eye, Settings, Move, Trash2, AlertCircle, Target, Users } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { EnhancedLinePreview } from '../TemplatePreview/EnhancedLinePreview'

interface ScenarioTemplateManagerProps {
  packId: string
  packTemplates: PackTemplate[]
  availableTemplates: Template[]
  tags: Tag[]
  statuses: Status[]
  users?: any[] // テスト送信用ユーザーリスト
  onAddTemplate: (templateId: string) => void
  onRemoveTemplate: (packTemplateId: string) => void
  onReorderTemplates: (reorderedPackTemplates: PackTemplate[]) => void
  onUpdateActionRule: (packTemplateId: string, actionRule: Partial<ScenarioActionRule>) => void
  onCreateActionRule: (packTemplateId: string, actionRule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteActionRule: (packTemplateId: string, actionRuleId: string) => void
  onTestSend?: (userIds: string[], template: Template) => Promise<void>
}

export function ScenarioTemplateManager({
  packId,
  packTemplates,
  availableTemplates,
  tags,
  statuses,
  users = [],
  onAddTemplate,
  onRemoveTemplate,
  onReorderTemplates,
  onUpdateActionRule,
  onCreateActionRule,
  onDeleteActionRule,
  onTestSend
}: ScenarioTemplateManagerProps) {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [expandedPackTemplate, setExpandedPackTemplate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // テンプレート情報を取得
  const getTemplateData = (packTemplate: PackTemplate) => {
    return availableTemplates.find(t => t.id === packTemplate.templateId)
  }

  // ドラッグアンドドロップでの並び替え
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(packTemplates)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const reorderedPackTemplates = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    onReorderTemplates(reorderedPackTemplates)
  }

  // フィルタリングされたテンプレート
  const filteredAvailableTemplates = availableTemplates.filter(template => {
    // 既に追加されているテンプレートは除外
    const isAlreadyAdded = packTemplates.some(pt => pt.templateId === template.id)
    if (isAlreadyAdded) return false

    // 検索フィルタ
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      return template.name.toLowerCase().includes(searchLower) ||
             template.content.toLowerCase().includes(searchLower)
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">テンプレート管理</h3>
          <p className="text-sm text-gray-600">
            このパックで送信するテンプレートとアクションを設定
          </p>
        </div>
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          テンプレート追加
        </button>
      </div>

      {/* テンプレート一覧 */}
      {packTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">テンプレートを追加</h3>
          <p className="text-sm text-gray-600 mb-6">
            このパックで送信するテンプレートを選択してください
          </p>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            テンプレート選択
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="templates">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {packTemplates.map((packTemplate, index) => {
                  const template = getTemplateData(packTemplate)
                  if (!template) return null

                  return (
                    <Draggable 
                      key={packTemplate.id} 
                      draggableId={packTemplate.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white border rounded-lg shadow-sm ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          } ${!packTemplate.isActive ? 'opacity-60' : ''}`}
                        >
                          <TemplateCard
                            packTemplate={packTemplate}
                            template={template}
                            isExpanded={expandedPackTemplate === packTemplate.id}
                            onToggleExpand={() => setExpandedPackTemplate(
                              expandedPackTemplate === packTemplate.id ? null : packTemplate.id
                            )}
                            onPreview={() => {
                              setSelectedTemplate(template)
                              setShowPreview(true)
                            }}
                            onRemove={() => onRemoveTemplate(packTemplate.id)}
                            onUpdateActionRule={(actionRule) => onUpdateActionRule(packTemplate.id, actionRule)}
                            onCreateActionRule={(actionRule) => onCreateActionRule(packTemplate.id, actionRule)}
                            onDeleteActionRule={(actionRuleId) => onDeleteActionRule(packTemplate.id, actionRuleId)}
                            dragHandleProps={provided.dragHandleProps}
                            tags={tags}
                            statuses={statuses}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* テンプレート選択モーダル */}
      {showTemplateSelector && (
        <TemplateSelectionModal
          templates={filteredAvailableTemplates}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTemplate={(templateId) => {
            onAddTemplate(templateId)
            setShowTemplateSelector(false)
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* プレビューモーダル */}
      {showPreview && selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          users={users}
          onTestSend={onTestSend}
          onClose={() => {
            setShowPreview(false)
            setSelectedTemplate(null)
          }}
        />
      )}
    </div>
  )
}

// テンプレートカード
function TemplateCard({
  packTemplate,
  template,
  isExpanded,
  onToggleExpand,
  onPreview,
  onRemove,
  onUpdateActionRule,
  onCreateActionRule,
  onDeleteActionRule,
  dragHandleProps,
  tags,
  statuses
}: {
  packTemplate: PackTemplate
  template: Template
  isExpanded: boolean
  onToggleExpand: () => void
  onPreview: () => void
  onRemove: () => void
  onUpdateActionRule: (actionRule: Partial<ScenarioActionRule>) => void
  onCreateActionRule: (actionRule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteActionRule: (actionRuleId: string) => void
  dragHandleProps: any
  tags: Tag[]
  statuses: Status[]
}) {
  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            {...dragHandleProps}
            className="cursor-move p-1 text-gray-400 hover:text-gray-600"
          >
            <Move className="w-4 h-4" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                template.type === 'TEXT' 
                  ? 'bg-blue-100 text-blue-800' 
                  : template.type === 'FLEX'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {template.type === 'TEXT' ? 'テキスト' : template.type === 'FLEX' ? 'Flex' : template.type}
              </span>
              {!packTemplate.isActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  無効
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {template.content.substring(0, 100)}
              {template.content.length > 100 && '...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {packTemplate.actionRules.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              {packTemplate.actionRules.length}アクション
            </span>
          )}
          
          <button
            onClick={onPreview}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="プレビュー"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleExpand}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="アクション設定"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* アクション設定エリア */}
      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <ActionRuleManager
            packTemplate={packTemplate}
            template={template}
            onUpdateActionRule={onUpdateActionRule}
            onCreateActionRule={onCreateActionRule}
            onDeleteActionRule={onDeleteActionRule}
            tags={tags}
            statuses={statuses}
          />
        </div>
      )}
    </div>
  )
}

// アクションルール管理
function ActionRuleManager({
  packTemplate,
  template,
  onUpdateActionRule,
  onCreateActionRule,
  onDeleteActionRule,
  tags,
  statuses
}: {
  packTemplate: PackTemplate
  template: Template
  onUpdateActionRule: (actionRule: Partial<ScenarioActionRule>) => void
  onCreateActionRule: (actionRule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteActionRule: (actionRuleId: string) => void
  tags: Tag[]
  statuses: Status[]
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  // テンプレートから自動検出できるアクション要素
  const detectActionElements = () => {
    const elements: { type: ActionType; value: string; description: string }[] = []
    
    try {
      if (template.lineMessageJson) {
        const message = JSON.parse(template.lineMessageJson)
        
        // URLを検出
        const urlPattern = /https?:\/\/[^\s]+/g
        const urls = template.content.match(urlPattern) || []
        urls.forEach(url => {
          elements.push({
            type: 'URL_CLICK',
            value: url,
            description: `URL: ${url.substring(0, 30)}...`
          })
        })

        // Flexメッセージのボタンを検出
        if (message.type === 'flex') {
          const extractButtons = (obj: any): void => {
            if (obj && typeof obj === 'object') {
              if (obj.type === 'button' && obj.action?.label) {
                elements.push({
                  type: 'BUTTON_CLICK',
                  value: obj.action.label,
                  description: `ボタン: ${obj.action.label}`
                })
              }
              Object.values(obj).forEach(value => {
                if (Array.isArray(value)) {
                  value.forEach(extractButtons)
                } else if (typeof value === 'object') {
                  extractButtons(value)
                }
              })
            }
          }
          extractButtons(message)
        }
      }
    } catch (error) {
      console.error('Template parsing error:', error)
    }

    return elements
  }

  const actionElements = detectActionElements()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-900">アクションルール</h5>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-1 border border-transparent rounded text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          <Plus className="w-3 h-3 mr-1" />
          ルール追加
        </button>
      </div>

      {/* 既存のアクションルール */}
      {packTemplate.actionRules.map((actionRule) => (
        <ActionRuleCard
          key={actionRule.id}
          actionRule={actionRule}
          tags={tags}
          statuses={statuses}
          onUpdate={(updates) => onUpdateActionRule({ ...actionRule, ...updates })}
          onDelete={() => onDeleteActionRule(actionRule.id)}
        />
      ))}

      {/* 推奨アクション */}
      {actionElements.length > 0 && packTemplate.actionRules.length === 0 && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h6 className="text-sm font-medium text-blue-900 mb-1">推奨アクション</h6>
              <p className="text-xs text-blue-700 mb-2">
                このテンプレートで以下のアクションを設定することをお勧めします：
              </p>
              <div className="space-y-1">
                {actionElements.map((element, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onCreateActionRule({
                        packTemplateId: packTemplate.id,
                        actionType: element.type,
                        actionCondition: {
                          operator: 'equals',
                          value: element.value
                        },
                        tagActions: [{
                          type: 'ADD_TAG',
                          tagId: tags[0]?.id || ''
                        }],
                        isActive: true,
                        priority: 1,
                        description: `${element.description}のアクション追跡`
                      })
                    }}
                    className="block w-full text-left px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 rounded"
                  >
                    + {element.description}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新規作成フォーム */}
      {showCreateForm && (
        <ActionRuleCreateForm
          packTemplate={packTemplate}
          actionElements={actionElements}
          tags={tags}
          statuses={statuses}
          onSubmit={(actionRule) => {
            onCreateActionRule(actionRule)
            setShowCreateForm(false)
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

// アクションルールカード
function ActionRuleCard({
  actionRule,
  tags,
  statuses,
  onUpdate,
  onDelete
}: {
  actionRule: ScenarioActionRule
  tags: Tag[]
  statuses: Status[]
  onUpdate: (updates: Partial<ScenarioActionRule>) => void
  onDelete: () => void
}) {
  return (
    <div className="p-3 bg-white border rounded">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {actionRule.actionType.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
              {actionRule.actionCondition.operator}
            </span>
            {!actionRule.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                無効
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2">
            条件: "{actionRule.actionCondition.value}"
          </p>
          
          <div className="flex flex-wrap gap-1">
            {actionRule.tagActions.map((tagAction, index) => {
              const tag = tags.find(t => t.id === tagAction.tagId)
              const status = statuses.find(s => s.id === tagAction.statusId)
              
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700"
                >
                  {tagAction.type === 'ADD_TAG' && tag && `+${tag.name}`}
                  {tagAction.type === 'REMOVE_TAG' && tag && `-${tag.name}`}
                  {tagAction.type === 'SET_STATUS' && status && `→${status.label}`}
                </span>
              )
            })}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => onUpdate({ isActive: !actionRule.isActive })}
            className={`p-1 rounded ${
              actionRule.isActive
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={actionRule.isActive ? '無効化' : '有効化'}
          >
            <Target className="w-3 h-3" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="削除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// アクションルール作成フォーム
function ActionRuleCreateForm({
  packTemplate,
  actionElements,
  tags,
  statuses,
  onSubmit,
  onCancel
}: {
  packTemplate: PackTemplate
  actionElements: { type: ActionType; value: string; description: string }[]
  tags: Tag[]
  statuses: Status[]
  onSubmit: (actionRule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [actionType, setActionType] = useState<ActionType>('BUTTON_CLICK')
  const [actionValue, setActionValue] = useState('')
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || '')
  const [actionOperation, setActionOperation] = useState<'ADD_TAG' | 'REMOVE_TAG' | 'SET_STATUS'>('ADD_TAG')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tagAction: TagAction = actionOperation === 'SET_STATUS' 
      ? { type: actionOperation, statusId: selectedTagId }
      : { type: actionOperation, tagId: selectedTagId }

    onSubmit({
      packTemplateId: packTemplate.id,
      actionType,
      actionCondition: {
        operator: 'equals',
        value: actionValue
      },
      tagActions: [tagAction],
      isActive: true,
      priority: 1,
      description: `${actionType} - ${actionValue}`
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border rounded-lg space-y-4">
      <h6 className="text-sm font-medium text-gray-900">新しいアクションルール</h6>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            アクションタイプ
          </label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="BUTTON_CLICK">ボタンクリック</option>
            <option value="URL_CLICK">URLクリック</option>
            <option value="REPLY">返信</option>
            <option value="POSTBACK">ポストバック</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            トリガー値
          </label>
          <input
            type="text"
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            placeholder="ボタンテキスト、URLなど"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            アクション
          </label>
          <select
            value={actionOperation}
            onChange={(e) => setActionOperation(e.target.value as any)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="ADD_TAG">タグ追加</option>
            <option value="REMOVE_TAG">タグ削除</option>
            <option value="SET_STATUS">ステータス設定</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {actionOperation === 'SET_STATUS' ? 'ステータス' : 'タグ'}
          </label>
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            required
          >
            {actionOperation === 'SET_STATUS' 
              ? statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))
              : tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))
            }
          </select>
        </div>
      </div>

      {/* 推奨選択 */}
      {actionElements.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            推奨アクション
          </label>
          <div className="space-y-1">
            {actionElements.map((element, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setActionType(element.type)
                  setActionValue(element.value)
                }}
                className="block w-full text-left px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
              >
                {element.description}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          作成
        </button>
      </div>
    </form>
  )
}

// テンプレート選択モーダル
function TemplateSelectionModal({
  templates,
  searchQuery,
  onSearchChange,
  onSelectTemplate,
  onClose
}: {
  templates: Template[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectTemplate: (templateId: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">テンプレート選択</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="テンプレートを検索..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template.id)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      template.type === 'TEXT' 
                        ? 'bg-blue-100 text-blue-800' 
                        : template.type === 'FLEX'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.type === 'TEXT' ? 'テキスト' : template.type === 'FLEX' ? 'Flex' : template.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {template.content.substring(0, 100)}
                    {template.content.length > 100 && '...'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// テンプレートプレビューモーダル
function TemplatePreviewModal({ 
  template, 
  users = [], 
  onTestSend, 
  onClose 
}: {
  template: Template
  users?: any[]
  onTestSend?: (userIds: string[], template: Template) => Promise<void>
  onClose: () => void
}) {
  const getLineMessage = () => {
    try {
      if (template.lineMessageJson) {
        return JSON.parse(template.lineMessageJson)
      }
      return null
    } catch {
      return null
    }
  }

  const lineMessage = getLineMessage()

  const handleTestSend = async (userIds: string[], message: LineMessage) => {
    if (onTestSend) {
      await onTestSend(userIds, template)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">プレビュー</h3>
            <p className="text-sm text-gray-600">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <EnhancedLinePreview 
            message={lineMessage} 
            showTestSend={true}
            showMockChat={true}
            users={users}
            onTestSend={handleTestSend}
          />
        </div>
      </div>
    </div>
  )
}