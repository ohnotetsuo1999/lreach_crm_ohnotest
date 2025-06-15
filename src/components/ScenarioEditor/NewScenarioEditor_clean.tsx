'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  Scenario, 
  Template, 
  TemplateFolder,
  Tag, 
  TagFolder,
  Status,
  StatusFolder, 
  BroadcastAction, 
  ActionTriggerType,
  SubAction,
  Segment,
  SegmentFolder,
  User,
  TemplateTimingConfig,
  ConditionalLogic,
  ActionTrigger
} from '@/types'
import { ActionType, TriggerType } from '@/types/entities'
import { 
  Save, Play, ArrowLeft, Plus, MoreHorizontal, Edit, 
  Search, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Clock, Zap, Target, MessageSquare, GitBranch, MousePointer, 
  Timer, Settings, Copy, Trash2, Eye, ArrowUp, ArrowDown,
  TagIcon, Users, ChevronUp, ExternalLink, Link, Split, FileText, UserPlus
} from 'lucide-react'
import { TagSelector, StatusSelector, SegmentSelector } from '@/components/Common/Selectors'

interface NewScenarioEditorProps {
  scenario: Scenario | null
  templates: Template[]
  templateFolders: TemplateFolder[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  statusFolders: StatusFolder[]
  segments: Segment[]
  segmentFolders: SegmentFolder[]
  users: User[]
  onSave: (scenario: Scenario) => void
  onBack: () => void
  onCreateTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
}

interface ScenarioTemplate {
  id: string
  templateId: string
  template: Template
  order: number
  delayMinutes: number
  actions: BroadcastAction[]
  timingConfig?: TemplateTimingConfig
}

export function NewScenarioEditor({
  scenario,
  templates,
  templateFolders,
  tags,
  tagFolders,
  statuses,
  statusFolders,
  segments,
  segmentFolders,
  users,
  onSave,
  onBack,
  onCreateTemplate
}: NewScenarioEditorProps) {
  // Basic scenario data
  const [scenarioData, setScenarioData] = useState({
    name: scenario?.name || '',
    description: scenario?.description || '',
    trigger: scenario?.trigger || TriggerType.MANUAL,
    triggerValue: scenario?.triggerValue || '',
    isActive: scenario?.isActive || false,
    folderId: scenario?.folderId || undefined,
    // Target settings
    targetType: 'all' as 'all' | 'segment',
    targetSegmentId: undefined as string | undefined,
    // Schedule settings
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduledAt: undefined as Date | undefined,
    // Execution timing settings
    executionTiming: 'manual' as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added',
    executionDelay: 0, // minutes
    // Advanced timing settings
    triggerTagId: undefined as string | undefined
  })
  
  // Template management
  const [scenarioTemplates, setScenarioTemplates] = useState<ScenarioTemplate[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  
  
  // UI state
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [showSubActionModal, setShowSubActionModal] = useState(false)
  const [editingAction, setEditingAction] = useState<BroadcastAction | null>(null)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [subActionType, setSubActionType] = useState<'CONDITIONAL' | 'ACTION'>('ACTION')
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [showSubActionMenu, setShowSubActionMenu] = useState(false)
  const [editingSubActionId, setEditingSubActionId] = useState<string | null>(null)
  const [editingConditionType, setEditingConditionType] = useState<'then' | 'else'>('then')
  const [editingTimingTemplateId, setEditingTimingTemplateId] = useState<string | null>(null)
  const [showTimingModal, setShowTimingModal] = useState(false)
  
  // Timing settings state for each template
  const [timingSettings, setTimingSettings] = useState<{[templateId: string]: {
    type: 'immediate' | 'delay' | 'specific_time' | 'next_day' | 'day_after' | 'weekly' | 'precise_delay'
    delayValue: number
    delayUnit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'
    delayTime?: string
    specificDate: 'today' | 'tomorrow' | 'day_after_tomorrow' | 'custom_days' | 'next_week' | 'custom_week'
    specificTime: string
    specificSeconds?: number
    customDays: number
    customWeeks?: number
    dayOfWeek?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
    preciseTiming?: {
      days?: number
      hours?: number
      minutes?: number
      seconds?: number
    }
    condition: 'always' | 'tag_exists' | 'tag_not_exists' | 'status_is'
  }}>({})

  // Branching condition state for each template
  const [branchingConditions, setBranchingConditions] = useState<{[templateId: string]: {
    type: 'none' | 'tag' | 'status' | 'segment'
    selectedTags: string[]
    selectedStatuses: string[]
    selectedSegments: string[]
  }}>({})

  const menuRef = useRef<HTMLDivElement>(null)

  // 階層構造用の型定義
  interface FolderHierarchy extends TemplateFolder {
    children: FolderHierarchy[]
  }

  const triggerOptions: { value: TriggerType, label: string, description: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { 
      value: TriggerType.MANUAL, 
      label: '手動実行', 
      description: '管理者が手動で実行するシナリオ',
      icon: Users
    },
    { 
      value: TriggerType.SCHEDULE, 
      label: 'スケジュール', 
      description: '指定した日時に自動実行',
      icon: Clock
    },
    { 
      value: TriggerType.USER_ACTION, 
      label: 'ユーザーアクション', 
      description: 'ユーザーの特定の行動をトリガーとする',
      icon: MousePointer
    },
    { 
      value: TriggerType.TAG_ADDED, 
      label: 'タグ追加', 
      description: '特定のタグが追加された際に実行',
      icon: TagIcon
    },
    { 
      value: TriggerType.STATUS_CHANGED, 
      label: 'ステータス変更', 
      description: 'ユーザーのステータスが変更された際に実行',
      icon: Target
    },
    { 
      value: TriggerType.TIME_BASED, 
      label: '時間ベース', 
      description: '定期的に条件をチェックして実行',
      icon: Timer
    }
  ]

  const handleTemplateToggle = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (expandedTemplates.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const handleAddTemplate = (template: Template) => {
    const newTemplate: ScenarioTemplate = {
      id: `temp-${Date.now()}`,
      templateId: template.id,
      template,
      order: scenarioTemplates.length,
      delayMinutes: 0,
      actions: [{
        id: `action-${Date.now()}`,
        type: ActionType.SEND_MESSAGE,
        order: 0,
        trigger: { type: 'IMMEDIATE' as ActionTriggerType },
        payload: {
          templateId: template.id
        },
        subActions: []
      }]
    }
    setScenarioTemplates([...scenarioTemplates, newTemplate])
    setShowTemplateModal(false)
  }

  const handleRemoveTemplate = (templateId: string) => {
    setScenarioTemplates(scenarioTemplates.filter(t => t.id !== templateId))
  }

  const handleTemplateOrderChange = (templateId: string, direction: 'up' | 'down') => {
    const index = scenarioTemplates.findIndex(t => t.id === templateId)
    if (index === -1) return

    const newTemplates = [...scenarioTemplates]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newTemplates.length) return

    [newTemplates[index], newTemplates[newIndex]] = [newTemplates[newIndex], newTemplates[index]]
    newTemplates.forEach((t, i) => { t.order = i })
    setScenarioTemplates(newTemplates)
  }

  const handleAddAction = (templateId: string, action: BroadcastAction) => {
    setScenarioTemplates(scenarioTemplates.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          actions: [...t.actions, { ...action, order: t.actions.length }]
        }
      }
      return t
    }))
    setShowActionModal(false)
    setSelectedTemplate(null)
  }

  const handleUpdateAction = (templateId: string, actionId: string, updates: Partial<BroadcastAction>) => {
    setScenarioTemplates(scenarioTemplates.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          actions: t.actions.map(a => 
            a.id === actionId ? { ...a, ...updates } : a
          )
        }
      }
      return t
    }))
  }

  const handleDeleteAction = (templateId: string, actionId: string) => {
    setScenarioTemplates(scenarioTemplates.map(t => {
      if (t.id === templateId) {
        const newActions = t.actions.filter(a => a.id !== actionId)
        newActions.forEach((a, i) => { a.order = i })
        return { ...t, actions: newActions }
      }
      return t
    }))
  }

  const handleActionOrderChange = (templateId: string, actionId: string, direction: 'up' | 'down') => {
    setScenarioTemplates(scenarioTemplates.map(t => {
      if (t.id === templateId) {
        const actionIndex = t.actions.findIndex(a => a.id === actionId)
        if (actionIndex === -1) return t

        const newActions = [...t.actions]
        const newIndex = direction === 'up' ? actionIndex - 1 : actionIndex + 1

        if (newIndex < 0 || newIndex >= newActions.length) return t

        const temp = newActions[actionIndex]
        newActions[actionIndex] = newActions[newIndex]
        newActions[newIndex] = temp
        newActions.forEach((a, i) => { a.order = i })
        
        return { ...t, actions: newActions }
      }
      return t
    }))
  }

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.SEND_MESSAGE:
        return MessageSquare
      case ActionType.ADD_TAG:
        return TagIcon
      case ActionType.REMOVE_TAG:
        return TagIcon
      case ActionType.CHANGE_STATUS:
        return Target
      case ActionType.WAIT:
        return Clock
      case ActionType.WEBHOOK:
        return Zap
      case ActionType.CONDITIONAL:
        return GitBranch
      default:
        return MessageSquare
    }
  }

  const getActionLabel = (action: BroadcastAction): string => {
    switch (action.type) {
      case ActionType.SEND_MESSAGE:
        return 'メッセージ送信'
      case ActionType.ADD_TAG:
        return 'タグ追加'
      case ActionType.REMOVE_TAG:
        return 'タグ削除'
      case ActionType.CHANGE_STATUS:
        return 'ステータス変更'
      case ActionType.WAIT:
        return '待機'
      case ActionType.WEBHOOK:
        return 'Webhook'
      case ActionType.CONDITIONAL:
        return '条件分岐'
      default:
        return 'アクション'
    }
  }

  const handleOpenSubActionMenu = (e: React.MouseEvent, action: BroadcastAction, templateId: string) => {
    e.stopPropagation()
    setEditingAction(action)
    setEditingTemplateId(templateId)
    setShowSubActionMenu(true)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 5,
      left: rect.left
    })
  }

  const handleAddSubAction = (parentId?: string, conditionType?: 'then' | 'else') => {
    setEditingSubActionId(parentId || null)
    setEditingConditionType(conditionType || 'then')
    setShowSubActionModal(true)
    setShowSubActionMenu(false)
  }

  const handleDeleteSubAction = (subActionId: string) => {
    if (!editingAction || !editingTemplateId) return

    const deleteSubActionRecursive = (subActions: SubAction[]): SubAction[] => {
      return subActions
        .filter(sa => sa.id !== subActionId)
        .map(sa => ({
          ...sa,
          subActions: deleteSubActionRecursive(sa.subActions || [])
        }))
    }

    const updatedAction = {
      ...editingAction,
      subActions: deleteSubActionRecursive(editingAction.subActions || [])
    }

    handleUpdateAction(editingTemplateId, editingAction.id, updatedAction)
    setShowSubActionMenu(false)
  }

  const buildFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): FolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const getTemplatesInFolder = (folderId: string | null): Template[] => {
    if (!templates || !Array.isArray(templates)) return []
    return templates.filter(template => template.folderId === folderId)
  }

  // Template Modal Component
  function TemplateModal() {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    const getFilteredTemplates = (): Template[] => {
      if (!searchQuery) {
        if (selectedFolderId !== null) {
          return getTemplatesInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
        }
        return templates
      }
      return templates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const renderFolder = (folder: FolderHierarchy, level: number = 0) => (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
          onClick={() => {
            const newExpanded = new Set(expandedFolders)
            if (expandedFolders.has(folder.id)) {
              newExpanded.delete(folder.id)
            } else {
              newExpanded.add(folder.id)
            }
            setExpandedFolders(newExpanded)
          }}
        >
          <div className="flex items-center gap-2">
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            {expandedFolders.has(folder.id) ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )}
            <span 
              className={`text-sm ${selectedFolderId === folder.id ? 'font-medium text-blue-600' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFolderId(folder.id)
              }}
            >
              {folder.name}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {getTemplatesInFolder(folder.id).length}
          </span>
        </div>
        {expandedFolders.has(folder.id) && (
          <>
            {folder.children.map(child => renderFolder(child, level + 1))}
            {getTemplatesInFolder(folder.id).map(template => (
              <div
                key={template.id}
                style={{ marginLeft: `${(level + 1) * 16 + 20}px` }}
                className="py-2 px-2 hover:bg-gray-50 cursor-pointer rounded"
                onClick={() => handleAddTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    {template.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    )

    const rootFolders = buildFolderHierarchy(templateFolders)
    const uncategorizedTemplates = getTemplatesInFolder(null)
    const filteredTemplates = getFilteredTemplates()

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">テンプレートを選択</h2>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="テンプレートを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery ? (
              filteredTemplates.length > 0 ? (
                <div className="space-y-2">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAddTemplate(template)}
                    >
                      <p className="text-sm font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  該当するテンプレートが見つかりません
                </p>
              )
            ) : (
              <div className="space-y-1">
                <div
                  className={`flex items-center justify-between py-2 px-2 hover:bg-gray-50 cursor-pointer rounded ${
                    selectedFolderId === null ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setSelectedFolderId(null)}
                >
                  <span className="text-sm font-medium">すべてのテンプレート</span>
                  <span className="text-xs text-gray-400">{templates.length}</span>
                </div>
                
                {rootFolders.map(folder => renderFolder(folder))}
                
                {uncategorizedTemplates.length > 0 && (
                  <div
                    className={`flex items-center justify-between py-2 px-2 hover:bg-gray-50 cursor-pointer rounded ${
                      selectedFolderId === 'uncategorized' ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setSelectedFolderId('uncategorized')}
                  >
                    <span className="text-sm">未分類</span>
                    <span className="text-xs text-gray-400">{uncategorizedTemplates.length}</span>
                  </div>
                )}
                
                {selectedFolderId === 'uncategorized' && uncategorizedTemplates.map(template => (
                  <div
                    key={template.id}
                    className="ml-8 py-2 px-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleAddTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Action Modal Component  
  function ActionModal() {
    const [actionType, setActionType] = useState<ActionType>(ActionType.SEND_MESSAGE)
    const [actionData, setActionData] = useState<any>({
      templateId: '',
      tagIds: [],
      statusId: '',
      waitMinutes: 30,
      webhookUrl: '',
      condition: {
        type: 'tag_exists' as 'tag_exists' | 'tag_not_exists' | 'status_is' | 'status_is_not',
        tagIds: [],
        statusId: ''
      }
    })

    const handleCreateAction = () => {
      const newAction: BroadcastAction = {
        id: `action-${Date.now()}`,
        type: actionType,
        order: 0,
        trigger: { type: 'IMMEDIATE' as ActionTriggerType },
        payload: actionData,
        subActions: []
      }
      
      if (selectedTemplate) {
        handleAddAction(selectedTemplate.id, newAction)
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">アクションを追加</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アクションタイプ
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as ActionType)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={ActionType.SEND_MESSAGE}>メッセージ送信</option>
                <option value={ActionType.ADD_TAG}>タグ追加</option>
                <option value={ActionType.REMOVE_TAG}>タグ削除</option>
                <option value={ActionType.CHANGE_STATUS}>ステータス変更</option>
                <option value={ActionType.WAIT}>待機</option>
                <option value={ActionType.WEBHOOK}>Webhook</option>
                <option value={ActionType.CONDITIONAL}>条件分岐</option>
              </select>
            </div>

            {actionType === ActionType.SEND_MESSAGE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  送信するテンプレート
                </label>
                <select
                  value={actionData.templateId}
                  onChange={(e) => setActionData({ ...actionData, templateId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">選択してください</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(actionType === ActionType.ADD_TAG || actionType === ActionType.REMOVE_TAG) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ
                </label>
                <TagSelector
                  tags={tags}
                  tagFolders={tagFolders}
                  selectedTagIds={actionData.tagIds}
                  onChange={(tagIds) => setActionData({ ...actionData, tagIds })}
                />
              </div>
            )}

            {actionType === ActionType.CHANGE_STATUS && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <StatusSelector
                  statuses={statuses}
                  statusFolders={statusFolders}
                  selectedStatusIds={actionData.statusId ? [actionData.statusId] : []}
                  onChange={(statusIds) => setActionData({ ...actionData, statusId: statusIds[0] || '' })}
                  multiple={false}
                />
              </div>
            )}

            {actionType === ActionType.WAIT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  待機時間（分）
                </label>
                <input
                  type="number"
                  value={actionData.waitMinutes}
                  onChange={(e) => setActionData({ ...actionData, waitMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
            )}

            {actionType === ActionType.WEBHOOK && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={actionData.webhookUrl}
                  onChange={(e) => setActionData({ ...actionData, webhookUrl: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://example.com/webhook"
                />
              </div>
            )}

            {actionType === ActionType.CONDITIONAL && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    条件タイプ
                  </label>
                  <select
                    value={actionData.condition.type}
                    onChange={(e) => setActionData({
                      ...actionData,
                      condition: { ...actionData.condition, type: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="tag_exists">タグが存在する</option>
                    <option value="tag_not_exists">タグが存在しない</option>
                    <option value="status_is">ステータスが一致</option>
                    <option value="status_is_not">ステータスが不一致</option>
                  </select>
                </div>

                {(actionData.condition.type === 'tag_exists' || actionData.condition.type === 'tag_not_exists') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ
                    </label>
                    <TagSelector
                      tags={tags}
                      tagFolders={tagFolders}
                      selectedTagIds={actionData.condition.tagIds}
                      onChange={(tagIds) => setActionData({
                        ...actionData,
                        condition: { ...actionData.condition, tagIds }
                      })}
                    />
                  </div>
                )}

                {(actionData.condition.type === 'status_is' || actionData.condition.type === 'status_is_not') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ステータス
                    </label>
                    <StatusSelector
                      statuses={statuses}
                      statusFolders={statusFolders}
                      selectedStatusIds={actionData.condition.statusId ? [actionData.condition.statusId] : []}
                      onChange={(statusIds) => setActionData({
                        ...actionData,
                        condition: { ...actionData.condition, statusId: statusIds[0] || '' }
                      })}
                      multiple={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={() => {
                setShowActionModal(false)
                setSelectedTemplate(null)
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateAction}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    )
  }

  // SubAction Modal Component
  function SubActionModal() {
    const [actionData, setActionData] = useState<any>({
      type: ActionType.SEND_MESSAGE,
      templateId: '',
      tagIds: [],
      statusId: '',
      waitMinutes: 30,
      webhookUrl: '',
      condition: {
        type: 'tag_exists' as 'tag_exists' | 'tag_not_exists' | 'status_is' | 'status_is_not',
        tagIds: [],
        statusId: ''
      }
    })

    const handleCreateSubAction = () => {
      if (!editingAction || !editingTemplateId) return

      const newSubAction: SubAction = {
        id: `subaction-${Date.now()}`,
        type: subActionType === 'CONDITIONAL' ? 'CONDITIONAL' : 'ACTION',
        order: 0,
        action: subActionType === 'ACTION' ? {
          id: `action-${Date.now()}`,
          type: actionData.type,
          order: 0,
          trigger: { type: 'IMMEDIATE' as ActionTriggerType },
          payload: actionData,
          subActions: []
        } : undefined,
        condition: subActionType === 'CONDITIONAL' ? {
          type: actionData.condition.type,
          logic: {
            operator: 'AND',
            conditions: actionData.condition.type.includes('tag') 
              ? actionData.condition.tagIds.map((tagId: string) => ({
                  type: actionData.condition.type,
                  value: tagId
                }))
              : [{
                  type: actionData.condition.type,
                  value: actionData.condition.statusId
                }]
          }
        } : undefined,
        subActions: []
      }

      const addSubActionRecursive = (subActions: SubAction[]): SubAction[] => {
        if (!editingSubActionId) {
          return [...subActions, newSubAction]
        }

        return subActions.map(sa => {
          if (sa.id === editingSubActionId) {
            if (sa.type === 'CONDITIONAL' && editingConditionType) {
              if (editingConditionType === 'then') {
                return {
                  ...sa,
                  subActions: [...(sa.subActions || []), newSubAction]
                }
              } else {
                return {
                  ...sa,
                  elseSubActions: [...(sa.elseSubActions || []), newSubAction]
                }
              }
            }
            return {
              ...sa,
              subActions: [...(sa.subActions || []), newSubAction]
            }
          }
          return {
            ...sa,
            subActions: addSubActionRecursive(sa.subActions || []),
            elseSubActions: sa.elseSubActions ? addSubActionRecursive(sa.elseSubActions) : undefined
          }
        })
      }

      const updatedAction = {
        ...editingAction,
        subActions: addSubActionRecursive(editingAction.subActions || [])
      }

      handleUpdateAction(editingTemplateId, editingAction.id, updatedAction)
      setShowSubActionModal(false)
      setEditingSubActionId(null)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">サブアクションを追加</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サブアクションタイプ
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubActionType('ACTION')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    subActionType === 'ACTION' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  アクション
                </button>
                <button
                  onClick={() => setSubActionType('CONDITIONAL')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    subActionType === 'CONDITIONAL' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  条件分岐
                </button>
              </div>
            </div>

            {subActionType === 'ACTION' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アクションタイプ
                  </label>
                  <select
                    value={actionData.type}
                    onChange={(e) => setActionData({ ...actionData, type: e.target.value as ActionType })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value={ActionType.SEND_MESSAGE}>メッセージ送信</option>
                    <option value={ActionType.ADD_TAG}>タグ追加</option>
                    <option value={ActionType.REMOVE_TAG}>タグ削除</option>
                    <option value={ActionType.CHANGE_STATUS}>ステータス変更</option>
                    <option value={ActionType.WAIT}>待機</option>
                    <option value={ActionType.WEBHOOK}>Webhook</option>
                  </select>
                </div>

                {actionData.type === ActionType.SEND_MESSAGE && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      送信するテンプレート
                    </label>
                    <select
                      value={actionData.templateId}
                      onChange={(e) => setActionData({ ...actionData, templateId: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">選択してください</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(actionData.type === ActionType.ADD_TAG || actionData.type === ActionType.REMOVE_TAG) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ
                    </label>
                    <TagSelector
                      tags={tags}
                      tagFolders={tagFolders}
                      selectedTagIds={actionData.tagIds}
                      onChange={(tagIds) => setActionData({ ...actionData, tagIds })}
                    />
                  </div>
                )}

                {actionData.type === ActionType.CHANGE_STATUS && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ステータス
                    </label>
                    <StatusSelector
                      statuses={statuses}
                      statusFolders={statusFolders}
                      selectedStatusIds={actionData.statusId ? [actionData.statusId] : []}
                      onChange={(statusIds) => setActionData({ ...actionData, statusId: statusIds[0] || '' })}
                      multiple={false}
                    />
                  </div>
                )}

                {actionData.type === ActionType.WAIT && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      待機時間（分）
                    </label>
                    <input
                      type="number"
                      value={actionData.waitMinutes}
                      onChange={(e) => setActionData({ ...actionData, waitMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded-lg px-3 py-2"
                      min="1"
                    />
                  </div>
                )}

                {actionData.type === ActionType.WEBHOOK && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={actionData.webhookUrl}
                      onChange={(e) => setActionData({ ...actionData, webhookUrl: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    条件タイプ
                  </label>
                  <select
                    value={actionData.condition.type}
                    onChange={(e) => setActionData({
                      ...actionData,
                      condition: { ...actionData.condition, type: e.target.value }
                    })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="tag_exists">タグが存在する</option>
                    <option value="tag_not_exists">タグが存在しない</option>
                    <option value="status_is">ステータスが一致</option>
                    <option value="status_is_not">ステータスが不一致</option>
                  </select>
                </div>

                {(actionData.condition.type === 'tag_exists' || actionData.condition.type === 'tag_not_exists') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ
                    </label>
                    <TagSelector
                      tags={tags}
                      tagFolders={tagFolders}
                      selectedTagIds={actionData.condition.tagIds}
                      onChange={(tagIds) => setActionData({
                        ...actionData,
                        condition: { ...actionData.condition, tagIds }
                      })}
                    />
                  </div>
                )}

                {(actionData.condition.type === 'status_is' || actionData.condition.type === 'status_is_not') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ステータス
                    </label>
                    <StatusSelector
                      statuses={statuses}
                      statusFolders={statusFolders}
                      selectedStatusIds={actionData.condition.statusId ? [actionData.condition.statusId] : []}
                      onChange={(statusIds) => setActionData({
                        ...actionData,
                        condition: { ...actionData.condition, statusId: statusIds[0] || '' }
                      })}
                      multiple={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2">
            <button
              onClick={() => {
                setShowSubActionModal(false)
                setEditingSubActionId(null)
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateSubAction}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSubActions = (subActions: SubAction[], level: number = 0, parentType?: 'then' | 'else') => {
    if (!subActions || subActions.length === 0) return null

    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-12 mt-2' : ''}`}>
        {subActions.map((subAction, index) => (
          <div key={subAction.id} className="relative">
            {level > 0 && (
              <div className="absolute -left-8 top-0 bottom-0 w-8 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-gray-300 rounded-full -translate-y-1/2"></div>
              </div>
            )}
            
            {subAction.type === 'ACTION' && subAction.action && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(getActionIcon(subAction.action.type), { className: "w-4 h-4 text-gray-500" })}
                    <span className="text-sm font-medium">{getActionLabel(subAction.action)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubAction(subAction.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {renderSubActions(subAction.subActions || [], level + 1)}
              </div>
            )}

            {subAction.type === 'CONDITIONAL' && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">条件分岐</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubAction(subAction.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-green-700">条件に一致する場合</span>
                      <button
                        onClick={() => handleAddSubAction(subAction.id, 'then')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSubActions(subAction.subActions || [], level + 1, 'then')}
                  </div>
                  
                  <div className="bg-white rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-red-700">条件に一致しない場合</span>
                      <button
                        onClick={() => handleAddSubAction(subAction.id, 'else')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSubActions(subAction.elseSubActions || [], level + 1, 'else')}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // TimingModal Component
  function TimingModal() {
    if (!editingTimingTemplateId) return null

    const template = scenarioTemplates.find(t => t.id === editingTimingTemplateId)
    if (!template) return null

    const currentTiming = timingSettings[template.id] || {
      type: 'immediate',
      delayValue: 1,
      delayUnit: 'minutes',
      specificDate: 'today',
      specificTime: '09:00',
      customDays: 1,
      condition: 'always'
    }

    const handleTimingChange = (updates: any) => {
      setTimingSettings({
        ...timingSettings,
        [template.id]: {
          ...currentTiming,
          ...updates
        }
      })
    }

    const getTimingDescription = () => {
      switch (currentTiming.type) {
        case 'immediate':
          return '即座に送信'
        case 'delay':
          return `${currentTiming.delayValue}${currentTiming.delayUnit === 'minutes' ? '分' : currentTiming.delayUnit === 'hours' ? '時間' : '日'}後に送信`
        case 'specific_time':
          let dateText = ''
          switch (currentTiming.specificDate) {
            case 'today':
              dateText = '本日'
              break
            case 'tomorrow':
              dateText = '明日'
              break
            case 'day_after_tomorrow':
              dateText = '明後日'
              break
            case 'custom_days':
              dateText = `${currentTiming.customDays}日後`
              break
          }
          return `${dateText}の${currentTiming.specificTime}に送信`
        case 'next_day':
          return `翌日の${currentTiming.delayTime || '09:00'}に送信`
        case 'day_after':
          return `翌々日の${currentTiming.delayTime || '09:00'}に送信`
        case 'weekly':
          return `毎週${currentTiming.dayOfWeek || '月曜日'}の${currentTiming.delayTime || '09:00'}に送信`
        case 'precise_delay':
          const parts = []
          if (currentTiming.preciseTiming?.days) parts.push(`${currentTiming.preciseTiming.days}日`)
          if (currentTiming.preciseTiming?.hours) parts.push(`${currentTiming.preciseTiming.hours}時間`)
          if (currentTiming.preciseTiming?.minutes) parts.push(`${currentTiming.preciseTiming.minutes}分`)
          if (currentTiming.preciseTiming?.seconds) parts.push(`${currentTiming.preciseTiming.seconds}秒`)
          return `${parts.join('')}後に送信`
        default:
          return '即座に送信'
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white">
            <h2 className="text-lg font-semibold">送信タイミング設定</h2>
            <p className="text-sm text-gray-500 mt-1">
              テンプレート: {template.template.name}
            </p>
          </div>
          
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                送信タイミング
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTimingChange({ type: 'immediate' })}
                  className={`p-3 rounded-lg border text-left ${
                    currentTiming.type === 'immediate' 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">即座に送信</div>
                  <div className="text-xs text-gray-500 mt-1">アクション実行時に即座に送信</div>
                </button>
                
                <button
                  onClick={() => handleTimingChange({ type: 'delay' })}
                  className={`p-3 rounded-lg border text-left ${
                    currentTiming.type === 'delay' 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">遅延送信</div>
                  <div className="text-xs text-gray-500 mt-1">指定時間後に送信</div>
                </button>
                
                <button
                  onClick={() => handleTimingChange({ type: 'specific_time' })}
                  className={`p-3 rounded-lg border text-left ${
                    currentTiming.type === 'specific_time' 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">指定時刻送信</div>
                  <div className="text-xs text-gray-500 mt-1">特定の日時に送信</div>
                </button>
                
                <button
                  onClick={() => handleTimingChange({ type: 'precise_delay' })}
                  className={`p-3 rounded-lg border text-left ${
                    currentTiming.type === 'precise_delay' 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">詳細遅延</div>
                  <div className="text-xs text-gray-500 mt-1">日時分秒を細かく指定</div>
                </button>
              </div>
            </div>

            {currentTiming.type === 'delay' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={currentTiming.delayValue}
                    onChange={(e) => handleTimingChange({ delayValue: parseInt(e.target.value) || 1 })}
                    className="w-24 px-3 py-2 border rounded-lg"
                    min="1"
                  />
                  <select
                    value={currentTiming.delayUnit}
                    onChange={(e) => handleTimingChange({ delayUnit: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  >
                    <option value="seconds">秒</option>
                    <option value="minutes">分</option>
                    <option value="hours">時間</option>
                    <option value="days">日</option>
                    <option value="weeks">週</option>
                  </select>
                </div>
              </div>
            )}

            {currentTiming.type === 'specific_time' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    送信日
                  </label>
                  <select
                    value={currentTiming.specificDate}
                    onChange={(e) => handleTimingChange({ specificDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="today">本日</option>
                    <option value="tomorrow">明日</option>
                    <option value="day_after_tomorrow">明後日</option>
                    <option value="custom_days">日数指定</option>
                    <option value="next_week">来週</option>
                    <option value="custom_week">週数指定</option>
                  </select>
                </div>
                
                {currentTiming.specificDate === 'custom_days' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      何日後
                    </label>
                    <input
                      type="number"
                      value={currentTiming.customDays}
                      onChange={(e) => handleTimingChange({ customDays: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                    />
                  </div>
                )}
                
                {currentTiming.specificDate === 'custom_week' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        何週間後
                      </label>
                      <input
                        type="number"
                        value={currentTiming.customWeeks || 1}
                        onChange={(e) => handleTimingChange({ customWeeks: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        曜日
                      </label>
                      <select
                        value={currentTiming.dayOfWeek || 'monday'}
                        onChange={(e) => handleTimingChange({ dayOfWeek: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="monday">月曜日</option>
                        <option value="tuesday">火曜日</option>
                        <option value="wednesday">水曜日</option>
                        <option value="thursday">木曜日</option>
                        <option value="friday">金曜日</option>
                        <option value="saturday">土曜日</option>
                        <option value="sunday">日曜日</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    送信時刻
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="time"
                      value={currentTiming.specificTime}
                      onChange={(e) => handleTimingChange({ specificTime: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={currentTiming.specificSeconds || 0}
                      onChange={(e) => handleTimingChange({ specificSeconds: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 border rounded-lg"
                      min="0"
                      max="59"
                      placeholder="秒"
                    />
                    <span className="text-sm text-gray-500">秒</span>
                  </div>
                </div>
              </div>
            )}

            {currentTiming.type === 'precise_delay' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      日
                    </label>
                    <input
                      type="number"
                      value={currentTiming.preciseTiming?.days || 0}
                      onChange={(e) => handleTimingChange({
                        preciseTiming: {
                          ...currentTiming.preciseTiming,
                          days: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      時間
                    </label>
                    <input
                      type="number"
                      value={currentTiming.preciseTiming?.hours || 0}
                      onChange={(e) => handleTimingChange({
                        preciseTiming: {
                          ...currentTiming.preciseTiming,
                          hours: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      max="23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分
                    </label>
                    <input
                      type="number"
                      value={currentTiming.preciseTiming?.minutes || 0}
                      onChange={(e) => handleTimingChange({
                        preciseTiming: {
                          ...currentTiming.preciseTiming,
                          minutes: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      max="59"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      秒
                    </label>
                    <input
                      type="number"
                      value={currentTiming.preciseTiming?.seconds || 0}
                      onChange={(e) => handleTimingChange({
                        preciseTiming: {
                          ...currentTiming.preciseTiming,
                          seconds: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      max="59"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">送信条件</h3>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="always"
                    checked={currentTiming.condition === 'always'}
                    onChange={(e) => handleTimingChange({ condition: e.target.value })}
                  />
                  <span className="text-sm">常に送信</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="tag_exists"
                    checked={currentTiming.condition === 'tag_exists'}
                    onChange={(e) => handleTimingChange({ condition: e.target.value })}
                  />
                  <span className="text-sm">特定のタグが存在する場合のみ送信</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="tag_not_exists"
                    checked={currentTiming.condition === 'tag_not_exists'}
                    onChange={(e) => handleTimingChange({ condition: e.target.value })}
                  />
                  <span className="text-sm">特定のタグが存在しない場合のみ送信</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="status_is"
                    checked={currentTiming.condition === 'status_is'}
                    onChange={(e) => handleTimingChange({ condition: e.target.value })}
                  />
                  <span className="text-sm">特定のステータスの場合のみ送信</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">現在の設定</span>
              </div>
              <p className="text-sm text-blue-700">{getTimingDescription()}</p>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
            <button
              onClick={() => {
                setShowTimingModal(false)
                setEditingTimingTemplateId(null)
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                setShowTimingModal(false)
                setEditingTimingTemplateId(null)
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    const newScenario: Scenario = {
      id: scenario?.id || `scenario-${Date.now()}`,
      name: scenarioData.name,
      description: scenarioData.description,
      trigger: scenarioData.trigger,
      triggerValue: scenarioData.triggerValue,
      isActive: scenarioData.isActive,
      folderId: scenarioData.folderId,
      templates: scenarioTemplates,
      createdAt: scenario?.createdAt || new Date(),
      updatedAt: new Date()
    }
    onSave(newScenario)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">
              {scenario ? 'シナリオを編集' : '新規シナリオ'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2">
              <Play className="w-4 h-4" />
              テスト実行
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    シナリオ名
                  </label>
                  <input
                    type="text"
                    value={scenarioData.name}
                    onChange={(e) => setScenarioData({ ...scenarioData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="シナリオ名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    value={scenarioData.description}
                    onChange={(e) => setScenarioData({ ...scenarioData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="シナリオの説明を入力"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={scenarioData.isActive}
                    onChange={(e) => setScenarioData({ ...scenarioData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    有効化
                  </label>
                </div>
              </div>
            </div>

            {/* トリガー設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">実行トリガー</h2>
              <div className="grid grid-cols-2 gap-3">
                {triggerOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setScenarioData({ ...scenarioData, trigger: option.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      scenarioData.trigger === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <option.icon className={`w-5 h-5 mt-0.5 ${
                        scenarioData.trigger === option.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* トリガー別の追加設定 */}
              {scenarioData.trigger === 'SCHEDULE' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    実行日時
                  </label>
                  <input
                    type="datetime-local"
                    value={scenarioData.triggerValue}
                    onChange={(e) => setScenarioData({ ...scenarioData, triggerValue: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              {scenarioData.trigger === 'TAG_ADDED' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象タグ
                  </label>
                  <TagSelector
                    tags={tags}
                    tagFolders={tagFolders}
                    selectedTagIds={scenarioData.triggerTagId ? [scenarioData.triggerTagId] : []}
                    onChange={(tagIds) => setScenarioData({ ...scenarioData, triggerTagId: tagIds[0] })}
                    multiple={false}
                  />
                </div>
              )}

              {scenarioData.trigger === 'STATUS_CHANGED' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    対象ステータス
                  </label>
                  <StatusSelector
                    statuses={statuses}
                    statusFolders={statusFolders}
                    selectedStatusIds={scenarioData.triggerValue ? [scenarioData.triggerValue] : []}
                    onChange={(statusIds) => setScenarioData({ ...scenarioData, triggerValue: statusIds[0] || '' })}
                    multiple={false}
                  />
                </div>
              )}

              {scenarioData.trigger === 'TIME_BASED' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      実行タイミング
                    </label>
                    <select
                      value={scenarioData.executionTiming}
                      onChange={(e) => setScenarioData({ ...scenarioData, executionTiming: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="automatic">自動判定</option>
                      <option value="friend_added">友だち追加時</option>
                      <option value="tag_added">タグ追加時</option>
                    </select>
                  </div>
                  {scenarioData.executionTiming !== 'automatic' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        実行遅延（分）
                      </label>
                      <input
                        type="number"
                        value={scenarioData.executionDelay}
                        onChange={(e) => setScenarioData({ ...scenarioData, executionDelay: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 対象ユーザー設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">対象ユーザー</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    配信対象
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="all"
                        checked={scenarioData.targetType === 'all'}
                        onChange={(e) => setScenarioData({ ...scenarioData, targetType: 'all' })}
                      />
                      <span className="text-sm">全員</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="segment"
                        checked={scenarioData.targetType === 'segment'}
                        onChange={(e) => setScenarioData({ ...scenarioData, targetType: 'segment' })}
                      />
                      <span className="text-sm">セグメント指定</span>
                    </label>
                  </div>
                </div>

                {scenarioData.targetType === 'segment' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      セグメント
                    </label>
                    <SegmentSelector
                      segments={segments}
                      segmentFolders={segmentFolders}
                      selectedSegmentIds={scenarioData.targetSegmentId ? [scenarioData.targetSegmentId] : []}
                      onChange={(segmentIds) => setScenarioData({ ...scenarioData, targetSegmentId: segmentIds[0] })}
                      multiple={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* テンプレート設定 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">配信コンテンツ</h2>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  テンプレート追加
                </button>
              </div>

              {scenarioTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>テンプレートが追加されていません</p>
                  <p className="text-sm mt-1">テンプレートを追加してシナリオを構築しましょう</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarioTemplates.map((template, index) => (
                    <div key={template.id} className="border rounded-lg">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTemplateToggle(template.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedTemplates.has(template.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{template.template.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTimingTemplateId(template.id)
                                setShowTimingModal(true)
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded"
                            >
                              <Clock className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTemplateOrderChange(template.id, 'up')
                              }}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <ArrowUp className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTemplateOrderChange(template.id, 'down')
                              }}
                              disabled={index === scenarioTemplates.length - 1}
                              className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <ArrowDown className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveTemplate(template.id)
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedTemplates.has(template.id) && (
                        <div className="border-t p-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* 送信タイミング表示 */}
                            {timingSettings[template.id] && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {(() => {
                                    const timing = timingSettings[template.id]
                                    switch (timing.type) {
                                      case 'immediate':
                                        return '即座に送信'
                                      case 'delay':
                                        return `${timing.delayValue}${timing.delayUnit === 'minutes' ? '分' : timing.delayUnit === 'hours' ? '時間' : '日'}後に送信`
                                      case 'specific_time':
                                        let dateText = ''
                                        switch (timing.specificDate) {
                                          case 'today':
                                            dateText = '本日'
                                            break
                                          case 'tomorrow':
                                            dateText = '明日'
                                            break
                                          case 'day_after_tomorrow':
                                            dateText = '明後日'
                                            break
                                          case 'custom_days':
                                            dateText = `${timing.customDays}日後`
                                            break
                                        }
                                        return `${dateText}の${timing.specificTime}に送信`
                                      default:
                                        return '即座に送信'
                                    }
                                  })()}
                                </span>
                              </div>
                            )}

                            {/* 分岐条件表示 */}
                            {branchingConditions[template.id] && branchingConditions[template.id].type !== 'none' && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <GitBranch className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">分岐条件</span>
                                </div>
                                <div className="mt-2 text-sm text-blue-700">
                                  {branchingConditions[template.id].type === 'tag' && (
                                    <>タグによる分岐: {branchingConditions[template.id].selectedTags.length}個のタグ</>
                                  )}
                                  {branchingConditions[template.id].type === 'status' && (
                                    <>ステータスによる分岐: {branchingConditions[template.id].selectedStatuses.length}個のステータス</>
                                  )}
                                  {branchingConditions[template.id].type === 'segment' && (
                                    <>セグメントによる分岐: {branchingConditions[template.id].selectedSegments.length}個のセグメント</>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">アクション</span>
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setShowActionModal(true)
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {template.actions.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">
                                  アクションが設定されていません
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {template.actions.map((action, actionIndex) => (
                                    <div key={action.id} className="bg-white rounded-lg p-3 border">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-gray-500">#{actionIndex + 1}</span>
                                          {React.createElement(getActionIcon(action.type), { className: "w-4 h-4 text-gray-500" })}
                                          <span className="text-sm font-medium">{getActionLabel(action)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={(e) => handleOpenSubActionMenu(e, action, template.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                          >
                                            <Split className="w-4 h-4 text-gray-500" />
                                          </button>
                                          <button
                                            onClick={() => handleActionOrderChange(template.id, action.id, 'up')}
                                            disabled={actionIndex === 0}
                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleActionOrderChange(template.id, action.id, 'down')}
                                            disabled={actionIndex === template.actions.length - 1}
                                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteAction(template.id, action.id)}
                                            className="p-1 hover:bg-gray-100 rounded text-red-500"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* サブアクション表示 */}
                                      {action.subActions && action.subActions.length > 0 && (
                                        <div className="mt-3">
                                          {renderSubActions(action.subActions)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTemplateModal && <TemplateModal />}
      {showActionModal && <ActionModal />}
      {showSubActionModal && <SubActionModal />}
      {showTimingModal && <TimingModal />}
      
      {/* サブアクションメニュー */}
      {showSubActionMenu && editingAction && (
        createPortal(
          <div 
            ref={menuRef}
            className="fixed z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[160px]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            <button
              onClick={() => handleAddSubAction()}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              サブアクション追加
            </button>
            <button
              onClick={() => handleDeleteSubAction(editingAction.id)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              削除
            </button>
          </div>,
          document.body
        )
      )}
    </div>
  )
}