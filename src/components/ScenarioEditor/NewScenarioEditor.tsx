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
  TriggerType, 
  BroadcastAction, 
  ActionType,
  ActionTriggerType,
  SubAction,
  Segment,
  SegmentFolder,
  User,
  TemplateTimingConfig,
  Pack,
  PackTemplate,
  ConditionalLogic,
  ActionTrigger
} from '@/types'
import { 
  Save, Play, ArrowLeft, Plus, MoreHorizontal, Edit, 
  Search, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Clock, Zap, Target, MessageSquare, GitBranch, MousePointer, 
  Timer, Settings, Copy, Trash2, Eye, ArrowUp, ArrowDown,
  TagIcon, Users, ChevronUp, ExternalLink, Link, Split, FileText, UserPlus,
  Package, Layers
} from 'lucide-react'
import { PackEditor } from '@/components/Common/PackEditor'

interface NewScenarioEditorProps {
  scenario: Scenario | null
  templates: Template[]
  templateFolders: TemplateFolder[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
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
    trigger: (scenario?.trigger || 'MANUAL') as TriggerType,
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
  
  // Pack management
  const [scenarioPacks, setScenarioPacks] = useState<Pack[]>([])
  const [showPackEditor, setShowPackEditor] = useState(false)
  const [editingPack, setEditingPack] = useState<Pack | null>(null)
  const [packViewMode, setPackViewMode] = useState<'list' | 'flow'>('list')
  
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

  const menuRef = useRef<HTMLDivElement>(null)

  // 階層構造用の型定義
  interface FolderHierarchy extends TemplateFolder {
    children: FolderHierarchy[]
  }

  interface TagFolderHierarchy extends TagFolder {
    children: TagFolderHierarchy[]
  }

  interface SegmentFolderHierarchy extends SegmentFolder {
    children: SegmentFolderHierarchy[]
  }

  const triggerOptions: { value: TriggerType, label: string, description: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { 
      value: 'MANUAL', 
      label: '手動実行', 
      description: '管理者が手動で実行するシナリオ',
      icon: Users
    },
    { 
      value: 'SCHEDULE', 
      label: 'スケジュール', 
      description: '指定した日時に自動実行',
      icon: Clock
    },
    { 
      value: 'USER_ACTION', 
      label: 'ユーザーアクション', 
      description: 'ユーザーの特定の行動をトリガーとする',
      icon: MousePointer
    },
    { 
      value: 'TAG_ADDED', 
      label: 'タグ追加', 
      description: '特定のタグが追加された際に実行',
      icon: TagIcon
    },
    { 
      value: 'STATUS_CHANGED', 
      label: 'ステータス変更', 
      description: 'ユーザーのステータスが変更された際に実行',
      icon: Target
    },
    { 
      value: 'TIME_BASED', 
      label: '時間ベース', 
      description: '定期的に条件をチェックして実行',
      icon: Timer
    }
  ]

  // Template folder hierarchy
  const buildTemplateFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): FolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildTemplateFolderHierarchy(folders, folder.id)
    }))
  }

  const getTemplatesInFolder = (folderId: string | null): Template[] => {
    return templates.filter(template => template.folderId === folderId)
  }

  // Tag selector with folder hierarchy
  function TagSelector({
    tags, tagFolders, selectedTagIds, onChange, multiple = true
  }: {
    tags: Tag[], tagFolders: TagFolder[], selectedTagIds: string[]
    onChange: (tagIds: string[]) => void, multiple?: boolean
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    const buildFolderHierarchy = (folders: TagFolder[], parentId: string | null = null): TagFolderHierarchy[] => {
      if (!folders || !Array.isArray(folders)) return []
      const filtered = folders.filter(folder => folder.parentId === parentId)
      return filtered.map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
      }))
    }

    const getTagsInFolder = (folderId: string | null): Tag[] => {
      if (!tags || !Array.isArray(tags)) return []
      return tags.filter(tag => tag.folderId === folderId)
    }

    const getFilteredTags = (): Tag[] => {
      if (!searchQuery) {
        // フォルダが選択されている場合は、そのフォルダのタグのみ表示
        if (selectedFolderId !== null) {
          return getTagsInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
        }
        return tags || []
      }
      return (tags || []).filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const renderFolder = (folder: TagFolderHierarchy, level: number = 0) => (
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
          <div className="flex items-center space-x-2">
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <Folder className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {(getTagsInFolder(folder.id) || []).length}
          </span>
        </div>
        
        {expandedFolders.has(folder.id) && (
          <div>
            {(getTagsInFolder(folder.id) || []).map(tag => (
              <label
                key={tag.id}
                className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                style={{ marginLeft: `${(level + 1) * 16}px` }}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "tag-selector"}
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedTagIds, tag.id])
                      } else {
                        onChange(selectedTagIds.filter(id => id !== tag.id))
                      }
                    } else {
                      onChange([tag.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
                {tag.type && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                    tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                  </span>
                )}
              </label>
            ))}
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    const folderHierarchy = buildFolderHierarchy(tagFolders || [])
    const uncategorizedTags = getTagsInFolder(null)
    const filteredTags = getFilteredTags()

    return (
      <div className="max-h-80 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {selectedTagIds.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">選択済み: {selectedTagIds.length}個</div>
              <div className="flex flex-wrap gap-1">
                {selectedTagIds.slice(0, 3).map(tagId => {
                  const tag = (tags || []).find(t => t.id === tagId)
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                    </span>
                  ) : null
                })}
                {selectedTagIds.length > 3 && (
                  <span className="text-xs text-gray-500">...他{selectedTagIds.length - 3}個</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - フォルダ一覧 */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">フォルダ</h3>
              <div
                className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                  selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                <Folder className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{tags.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
              
              {getTagsInFolder(null).length > 0 && (
                <div
                  className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mt-2 ${
                    selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => setSelectedFolderId('uncategorized')}
                >
                  <Folder className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">未分類</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {getTagsInFolder(null).length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right content - タグ一覧 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                filteredTags.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTags.map(tag => (
                      <label
                        key={tag.id}
                        className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                      >
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          name={multiple ? undefined : "tag-selector"}
                          checked={selectedTagIds.includes(tag.id)}
                          onChange={(e) => {
                            if (multiple) {
                              if (e.target.checked) {
                                onChange([...selectedTagIds, tag.id])
                              } else {
                                onChange(selectedTagIds.filter(id => id !== tag.id))
                              }
                            } else {
                              onChange([tag.id])
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                          {tag.note && (
                            <div className="text-xs text-gray-500 mt-0.5">{tag.note}</div>
                          )}
                        </div>
                        {tag.type && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                            tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TagIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">検索結果がありません</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {filteredTags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                    >
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={multiple ? undefined : "tag-selector"}
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (multiple) {
                            if (e.target.checked) {
                              onChange([...selectedTagIds, tag.id])
                            } else {
                              onChange(selectedTagIds.filter(id => id !== tag.id))
                            }
                          } else {
                            onChange([tag.id])
                          }
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                        {tag.note && (
                          <div className="text-xs text-gray-500 mt-0.5">{tag.note}</div>
                        )}
                      </div>
                      {tag.type && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                          tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {tag.type === 'MANUAL' ? '手動' : tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 選択済みタグ表示 - フッター */}
        {selectedTagIds.length > 0 && (
          <div className="bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TagIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  選択済み ({selectedTagIds.length})
                </span>
              </div>
              {multiple && (
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  すべて解除
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedTagIds.map(tagId => {
                const tag = (tags || []).find(t => t.id === tagId)
                return tag ? (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.name}
                    {multiple && (
                      <button
                        onClick={() => onChange(selectedTagIds.filter(id => id !== tagId))}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Template selector with folder hierarchy
  function TemplateSelector({
    templates, templateFolders, selectedTemplateId, onChange
  }: {
    templates: Template[], templateFolders: TemplateFolder[], selectedTemplateId: string | null
    onChange: (templateId: string | null) => void
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    const buildTemplateFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): FolderHierarchy[] => {
      if (!folders || !Array.isArray(folders)) return []
      const filtered = folders.filter(folder => folder.parentId === parentId)
      return filtered.map(folder => ({
        ...folder,
        children: buildTemplateFolderHierarchy(folders, folder.id)
      }))
    }

    const getTemplatesInFolder = (folderId: string | null): Template[] => {
      if (!templates || !Array.isArray(templates)) return []
      return templates.filter(template => template.folderId === folderId)
    }

    const getFilteredTemplates = (): Template[] => {
      if (!searchQuery) {
        // フォルダが選択されている場合は、そのフォルダのテンプレートのみ表示
        if (selectedFolderId !== null) {
          return getTemplatesInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
        }
        return templates || []
      }
      return (templates || []).filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const renderFolder = (folder: FolderHierarchy, level: number = 0) => (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
            selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : ''
          }`}
          onClick={() => {
            setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)
            const newExpanded = new Set(expandedFolders)
            if (expandedFolders.has(folder.id)) {
              newExpanded.delete(folder.id)
            } else {
              newExpanded.add(folder.id)
            }
            setExpandedFolders(newExpanded)
          }}
        >
          <div className="flex items-center space-x-2">
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {expandedFolders.has(folder.id) ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {(getTemplatesInFolder(folder.id) || []).length}
          </span>
        </div>
        {expandedFolders.has(folder.id) && folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    )

    const folderHierarchy = buildTemplateFolderHierarchy(templateFolders || [])
    const uncategorizedTemplates = getTemplatesInFolder(null)
    const filteredTemplates = getFilteredTemplates()

    return (
      <div className="max-h-80 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="テンプレートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {selectedTemplateId && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">選択済み</div>
              {(() => {
                const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
                return selectedTemplate ? (
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {selectedTemplate.name}
                  </div>
                ) : null
              })()} 
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - フォルダ一覧 */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">フォルダ</h3>
              <div
                className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                  selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                <Folder className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{templates.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
              
              {getTemplatesInFolder(null).length > 0 && (
                <div
                  className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mt-2 ${
                    selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => setSelectedFolderId('uncategorized')}
                >
                  <Folder className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">未分類</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {getTemplatesInFolder(null).length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right content - テンプレート一覧 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                filteredTemplates.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTemplates.map(template => (
                      <label
                        key={template.id}
                        className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                      >
                        <input
                          type="radio"
                          name="template-selector"
                          checked={selectedTemplateId === template.id}
                          onChange={() => onChange(template.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{template.content}</div>
                        </div>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                          template.type === 'FLEX' ? 'bg-green-100 text-green-800' :
                          template.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {template.type}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">検索結果がありません</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map(template => (
                    <label
                      key={template.id}
                      className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                    >
                      <input
                        type="radio"
                        name="template-selector"
                        checked={selectedTemplateId === template.id}
                        onChange={() => onChange(template.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{template.content}</div>
                      </div>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                        template.type === 'FLEX' ? 'bg-green-100 text-green-800' :
                        template.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {template.type}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 選択済みテンプレート表示 - フッター */}
        {selectedTemplateId && (
          <div className="bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">選択済みテンプレート</span>
              </div>
              <button
                onClick={() => onChange(null)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                解除
              </button>
            </div>
            {(() => {
              const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
              return selectedTemplate ? (
                <div className="flex items-center space-x-2 p-2 bg-blue-100 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-900">{selectedTemplate.name}</div>
                    <div className="text-xs text-blue-700 truncate">{selectedTemplate.content}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedTemplate.type === 'TEXT' ? 'bg-blue-200 text-blue-900' :
                    selectedTemplate.type === 'FLEX' ? 'bg-green-200 text-green-900' :
                    selectedTemplate.type === 'IMAGE' ? 'bg-purple-200 text-purple-900' :
                    'bg-orange-200 text-orange-900'
                  }`}>
                    {selectedTemplate.type}
                  </span>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>
    )
  }

  // Status selector
  function StatusSelector({
    statuses, selectedStatusId, onChange
  }: {
    statuses: Status[], selectedStatusId: string | null
    onChange: (statusId: string | null) => void
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

    // Create status categories for better organization
    const statusCategories = [
      { id: 'active', name: 'アクティブ', codes: ['lead', 'prospect', 'customer'] },
      { id: 'inactive', name: '非アクティブ', codes: ['churned'] },
      { id: 'other', name: 'その他', codes: [] }
    ]

    const getFilteredStatuses = (): Status[] => {
      let filtered = statuses
      
      // Filter by category if selected
      if (selectedCategoryId !== null) {
        const category = statusCategories.find(cat => cat.id === selectedCategoryId)
        if (category) {
          if (category.id === 'other') {
            // "その他" category includes statuses not in other categories
            const knownCodes = statusCategories.flatMap(cat => cat.codes)
            filtered = statuses.filter(status => !knownCodes.includes(status.code))
          } else {
            filtered = statuses.filter(status => category.codes.includes(status.code))
          }
        }
      }
      
      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(status =>
          status.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          status.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      return filtered
    }

    const filteredStatuses = getFilteredStatuses()

    return (
      <div className="max-h-80 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ステータスを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {selectedStatusId && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">選択済み</div>
              {(() => {
                const selectedStatus = statuses.find(s => s.id === selectedStatusId)
                return selectedStatus ? (
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <Target className="w-3 h-3 mr-1" />
                    {selectedStatus.label}
                  </div>
                ) : null
              })()}
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - カテゴリ一覧 */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">カテゴリ</h3>
              <div
                className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                  selectedCategoryId === null ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setSelectedCategoryId(null)}
              >
                <Target className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{statuses.length}</span>
              </div>
              
              {statusCategories.map(category => {
                const categoryStatuses = category.id === 'other' 
                  ? statuses.filter(status => !statusCategories.flatMap(cat => cat.codes).includes(status.code))
                  : statuses.filter(status => category.codes.includes(status.code))
                
                return (
                  <div
                    key={category.id}
                    className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                      selectedCategoryId === category.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      category.id === 'active' ? 'bg-green-400' :
                      category.id === 'inactive' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}></div>
                    <span className="text-sm">{category.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{categoryStatuses.length}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right content - ステータス一覧 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {filteredStatuses.length > 0 ? (
                <div className="space-y-2">
                  {filteredStatuses.map(status => (
                    <label
                      key={status.id}
                      className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                    >
                      <input
                        type="radio"
                        name="status-selector"
                        checked={selectedStatusId === status.id}
                        onChange={() => onChange(status.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            status.code === 'lead' ? 'bg-yellow-400' :
                            status.code === 'prospect' ? 'bg-blue-400' :
                            status.code === 'customer' ? 'bg-green-400' :
                            status.code === 'churned' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{status.label}</div>
                          <div className="text-xs text-gray-500 font-mono">{status.code}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {searchQuery ? '検索結果がありません' : 'ステータスがありません'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 選択済みステータス表示 - フッター */}
        {selectedStatusId && (
          <div className="bg-green-50 border-t border-green-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">選択済みステータス</span>
              </div>
              <button
                onClick={() => onChange(null)}
                className="text-xs text-green-600 hover:text-green-800"
              >
                解除
              </button>
            </div>
            {(() => {
              const selectedStatus = statuses.find(s => s.id === selectedStatusId)
              return selectedStatus ? (
                <div className="mt-2 flex items-center space-x-2 p-2 bg-green-100 rounded">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedStatus.code === 'lead' ? 'bg-yellow-400' :
                    selectedStatus.code === 'prospect' ? 'bg-blue-400' :
                    selectedStatus.code === 'customer' ? 'bg-green-400' :
                    selectedStatus.code === 'churned' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-900">{selectedStatus.label}</div>
                    <div className="text-xs text-green-700 font-mono">{selectedStatus.code}</div>
                  </div>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>
    )
  }

  // Segment selector with folder hierarchy
  function SegmentSelector({
    segments, segmentFolders, selectedSegmentId, onChange
  }: {
    segments: Segment[], segmentFolders: SegmentFolder[], selectedSegmentId: string | null
    onChange: (segmentId: string | null) => void
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const buildSegmentFolderHierarchy = (folders: SegmentFolder[], parentId: string | null = null): SegmentFolderHierarchy[] => {
      if (!folders || !Array.isArray(folders)) return []
      const filtered = folders.filter(folder => folder.parentId === parentId)
      return filtered.map(folder => ({
        ...folder,
        children: buildSegmentFolderHierarchy(folders, folder.id)
      }))
    }

    const getSegmentsInFolder = (folderId: string | null): Segment[] => {
      if (!segments || !Array.isArray(segments)) return []
      return segments.filter(segment => segment.folderId === folderId)
    }

    const getFilteredSegments = (): Segment[] => {
      if (!searchQuery) {
        if (selectedFolderId !== null) {
          return getSegmentsInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
        }
        return segments || []
      }
      return (segments || []).filter(segment => 
        segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (segment.memo && segment.memo.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    const renderFolder = (folder: SegmentFolderHierarchy, level: number = 0) => (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
            selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : ''
          }`}
          onClick={() => {
            setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)
            const newExpanded = new Set(expandedFolders)
            if (expandedFolders.has(folder.id)) {
              newExpanded.delete(folder.id)
            } else {
              newExpanded.add(folder.id)
            }
            setExpandedFolders(newExpanded)
          }}
        >
          <div className="flex items-center space-x-2">
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {expandedFolders.has(folder.id) ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {(getSegmentsInFolder(folder.id) || []).length}
          </span>
        </div>
        {expandedFolders.has(folder.id) && folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    )

    const folderHierarchy = buildSegmentFolderHierarchy(segmentFolders || [])
    const filteredSegments = getFilteredSegments()

    return (
      <div className="max-h-80 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="セグメントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {selectedSegmentId && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">選択済み</div>
              {(() => {
                const selectedSegment = segments.find(s => s.id === selectedSegmentId)
                return selectedSegment ? (
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <Target className="w-3 h-3 mr-1" />
                    {selectedSegment.name}
                  </div>
                ) : null
              })()} 
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">フォルダ</h3>
              <div
                className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                  selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setSelectedFolderId(null)}
              >
                <Target className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{segments.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
              
              {getSegmentsInFolder(null).length > 0 && (
                <div
                  className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mt-2 ${
                    selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => setSelectedFolderId('uncategorized')}
                >
                  <Folder className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">未分類</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {getSegmentsInFolder(null).length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                filteredSegments.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSegments.map(segment => (
                      <label
                        key={segment.id}
                        className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                      >
                        <input
                          type="radio"
                          name="segment-selector"
                          checked={selectedSegmentId === segment.id}
                          onChange={() => onChange(segment.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                          {segment.memo && (
                            <div className="text-xs text-gray-500 mt-0.5">{segment.memo}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">検索結果がありません</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {filteredSegments.map(segment => (
                    <label
                      key={segment.id}
                      className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                    >
                      <input
                        type="radio"
                        name="segment-selector"
                        checked={selectedSegmentId === segment.id}
                        onChange={() => onChange(segment.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                        {segment.memo && (
                          <div className="text-xs text-gray-500 mt-0.5">{segment.memo}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSegmentId && (
          <div className="bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">選択済みセグメント</span>
              </div>
              <button
                onClick={() => onChange(null)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                解除
              </button>
            </div>
            {(() => {
              const selectedSegment = segments.find(s => s.id === selectedSegmentId)
              return selectedSegment ? (
                <div className="mt-2 flex items-center space-x-2 p-2 bg-blue-100 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-blue-900">{selectedSegment.name}</div>
                    {selectedSegment.memo && (
                      <div className="text-xs text-blue-700 truncate">{selectedSegment.memo}</div>
                    )}
                  </div>
                </div>
              ) : null
            })()} 
          </div>
        )}
      </div>
    )
  }

  // Template selection modal
  function TemplateSelectionModal() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const filteredTemplates = templates.filter(template => {
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFolder = !selectedFolderId || template.folderId === selectedFolderId
      return matchesSearch && matchesFolder
    })

    const folderHierarchy = buildTemplateFolderHierarchy(templateFolders)

    const renderFolder = (folder: FolderHierarchy, level: number = 0) => (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 cursor-pointer rounded ${
            selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : ''
          }`}
          onClick={() => {
            setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)
            const newExpanded = new Set(expandedFolders)
            if (expandedFolders.has(folder.id)) {
              newExpanded.delete(folder.id)
            } else {
              newExpanded.add(folder.id)
            }
            setExpandedFolders(newExpanded)
          }}
        >
          <div className="flex items-center space-x-2">
            {expandedFolders.has(folder.id) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {expandedFolders.has(folder.id) ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">
            {getTemplatesInFolder(folder.id).length}
          </span>
        </div>
        {expandedFolders.has(folder.id) && folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    )

    const addTemplate = (template: Template) => {
      const newScenarioTemplate: ScenarioTemplate = {
        id: `scenario_template_${Date.now()}`,
        templateId: template.id,
        template,
        order: scenarioTemplates.length,
        delayMinutes: scenarioTemplates.length === 0 ? 0 : 60, // First template has no delay
        actions: []
      }
      setScenarioTemplates([...scenarioTemplates, newScenarioTemplate])
      setShowTemplateModal(false)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">テンプレートを選択</h2>
            <button
              onClick={() => setShowTemplateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Folder sidebar */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">フォルダ</h3>
                <div
                  className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mb-1 ${
                    selectedFolderId === null ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => setSelectedFolderId(null)}
                >
                  <Folder className="w-4 h-4 mr-2" />
                  <span className="text-sm">すべて</span>
                  <span className="ml-auto text-xs text-gray-500">{templates.length}</span>
                </div>
                {folderHierarchy.map(folder => renderFolder(folder))}
                
                {getTemplatesInFolder(null).length > 0 && (
                  <div
                    className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded mt-2 ${
                      selectedFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    onClick={() => setSelectedFolderId('uncategorized')}
                  >
                    <Folder className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">未分類</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {getTemplatesInFolder(null).length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Template list */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="テンプレートを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                        onClick={() => addTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                            template.type === 'FLEX' ? 'bg-green-100 text-green-800' :
                            template.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {template.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                        {template.createdAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(template.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">テンプレートが見つかりません</p>
                    <p className="text-sm">検索条件を変更してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Advanced Action Configuration Modal - similar to BroadcastPage
  function ActionModal() {
    const [selectedActionType, setSelectedActionType] = useState('')
    const [selectedTriggerType, setSelectedTriggerType] = useState<ActionTriggerType>('IMMEDIATE')
    const [selectedUrl, setSelectedUrl] = useState('')
    const [selectedButton, setSelectedButton] = useState('')
    const [delayMinutes, setDelayMinutes] = useState<number>(0)
    const [actionConfig, setActionConfig] = useState<any>({})

    const actionTypes = [
      { 
        id: 'ADD_TAG', 
        label: 'タグを追加', 
        description: 'ユーザーに特定のタグを付与します',
        icon: TagIcon,
        color: 'bg-green-100 text-green-800',
        iconComponent: TagIcon
      },
      { 
        id: 'REMOVE_TAG', 
        label: 'タグを削除', 
        description: 'ユーザーから特定のタグを削除します',
        icon: TagIcon,
        color: 'bg-red-100 text-red-800',
        iconComponent: TagIcon
      },
      { 
        id: 'CHANGE_STATUS', 
        label: 'ステータス変更', 
        description: 'ユーザーのステータスを変更します',
        icon: Target,
        color: 'bg-blue-100 text-blue-800',
        iconComponent: Target
      },
      { 
        id: 'SEND_MESSAGE', 
        label: 'メッセージ送信', 
        description: '追加のメッセージを送信します',
        icon: MessageSquare,
        color: 'bg-purple-100 text-purple-800',
        iconComponent: MessageSquare
      },
      { 
        id: 'WAIT', 
        label: '待機', 
        description: '指定した時間待機します',
        icon: Timer,
        color: 'bg-yellow-100 text-yellow-800',
        iconComponent: Timer
      }
    ]

    const triggerTypes = [
      { 
        id: 'IMMEDIATE', 
        label: '即座に実行', 
        description: 'テンプレート送信直後に実行',
        icon: Zap
      },
      { 
        id: 'URL_CLICK', 
        label: 'URL クリック', 
        description: 'テンプレート内のURLがクリックされた場合',
        icon: ExternalLink
      },
      { 
        id: 'BUTTON_CLICK', 
        label: 'ボタン クリック', 
        description: 'テンプレート内のボタンがクリックされた場合',
        icon: MousePointer
      },
      { 
        id: 'TIME_DELAY', 
        label: '時間経過', 
        description: '指定時間が経過した場合',
        icon: Clock
      }
    ]

    // 選択されているテンプレートからURLを抽出する関数
    const extractUrlsFromSelectedTemplate = () => {
      const urls: { url: string; templateName: string; templateId: string }[] = []
      
      if (!selectedTemplate?.template.lineMessageJson) {
        return urls
      }

      try {
        const messageJson = JSON.parse(selectedTemplate.template.lineMessageJson)
        const extractUrls = (obj: any, templateName: string, templateId: string) => {
          if (typeof obj === 'object' && obj !== null) {
            if (obj.uri && typeof obj.uri === 'string') {
              urls.push({ url: obj.uri, templateName, templateId })
            }
            if (obj.action && obj.action.uri) {
              urls.push({ url: obj.action.uri, templateName, templateId })
            }
            // 再帰的に検索
            Object.values(obj).forEach(value => {
              if (typeof value === 'object') {
                extractUrls(value, templateName, templateId)
              }
            })
          }
        }
        extractUrls(messageJson, selectedTemplate.template.name, selectedTemplate.template.id)
      } catch (e) {
        // JSON解析エラーは無視
      }
      
      return urls
    }

    // 選択されているテンプレートからボタンテキストを抽出する関数
    const extractButtonsFromSelectedTemplate = () => {
      const buttons: { text: string; templateName: string; templateId: string }[] = []
      
      if (!selectedTemplate?.template.lineMessageJson) {
        return buttons
      }

      try {
        const messageJson = JSON.parse(selectedTemplate.template.lineMessageJson)
        const extractButtons = (obj: any, templateName: string, templateId: string) => {
          if (typeof obj === 'object' && obj !== null) {
            if (obj.type === 'button' && obj.action && obj.action.label) {
              buttons.push({ text: obj.action.label, templateName, templateId })
            }
            if (obj.label && obj.action) {
              buttons.push({ text: obj.label, templateName, templateId })
            }
            // 再帰的に検索
            Object.values(obj).forEach(value => {
              if (typeof value === 'object') {
                extractButtons(value, templateName, templateId)
              }
            })
          }
        }
        extractButtons(messageJson, selectedTemplate.template.name, selectedTemplate.template.id)
      } catch (e) {
        // JSON解析エラーは無視
      }
      
      return buttons
    }

    const handleSave = () => {
      if (!selectedTemplate) return

      const triggerData: any = {
        type: selectedTriggerType
      }

      // URL_CLICKの場合、選択されたURLの情報を追加
      if (selectedTriggerType === 'URL_CLICK' && selectedUrl) {
        const urlInfo = extractUrlsFromSelectedTemplate().find(u => u.url === selectedUrl)
        triggerData.condition = {
          targetUrl: selectedUrl
        }
        if (urlInfo) {
          triggerData.templateId = urlInfo.templateId
          triggerData.templateName = urlInfo.templateName
        }
      }

      // BUTTON_CLICKの場合、選択されたボタンの情報を追加
      if (selectedTriggerType === 'BUTTON_CLICK' && selectedButton) {
        const buttonInfo = extractButtonsFromSelectedTemplate().find(b => b.text === selectedButton)
        triggerData.condition = {
          buttonText: selectedButton
        }
        if (buttonInfo) {
          triggerData.templateId = buttonInfo.templateId
          triggerData.templateName = buttonInfo.templateName
        }
      }

      // TIME_DELAYの場合、遅延時間を追加
      if (selectedTriggerType === 'TIME_DELAY') {
        triggerData.delayMinutes = delayMinutes
      }

      const newAction: BroadcastAction = {
        id: Date.now().toString(),
        type: selectedActionType as ActionType,
        trigger: triggerData,
        payload: actionConfig,
        order: selectedTemplate.actions.length,
        isActive: true
      }

      const updatedTemplate = {
        ...selectedTemplate,
        actions: [...selectedTemplate.actions, newAction]
      }

      setScenarioTemplates(scenarioTemplates.map(t => 
        t.id === selectedTemplate.id ? updatedTemplate : t
      ))

      setShowActionModal(false)
      setSelectedTemplate(null)
    }

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">アクションを追加</h3>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* 実行タイミング選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">実行タイミング</label>
              <div className="grid grid-cols-2 gap-3">
                {triggerTypes.map(triggerType => {
                  const IconComponent = triggerType.icon
                  return (
                    <div
                      key={triggerType.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTriggerType === triggerType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedTriggerType(triggerType.id as ActionTriggerType)
                        setSelectedUrl('')
                        setSelectedButton('')
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{triggerType.label}</h4>
                          <p className="text-xs text-gray-600">{triggerType.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* URL選択 */}
            {selectedTriggerType === 'URL_CLICK' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-3">
                    <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">URLクリック設定</h4>
                      <p className="text-xs text-blue-800">
                        選択中のテンプレート「{selectedTemplate?.template.name || '不明'}」内のURLから選択してください
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">対象URL</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {extractUrlsFromSelectedTemplate().map((urlInfo, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedUrl === urlInfo.url
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedUrl(urlInfo.url)}
                        >
                          <div className="flex items-start space-x-2">
                            <input
                              type="radio"
                              checked={selectedUrl === urlInfo.url}
                              onChange={() => setSelectedUrl(urlInfo.url)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {urlInfo.url}
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <FileText className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{urlInfo.templateName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {extractUrlsFromSelectedTemplate().length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          テンプレート内にURLが見つかりません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ボタン選択 */}
            {selectedTriggerType === 'BUTTON_CLICK' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-3">
                    <MousePointer className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">ボタンクリック設定</h4>
                      <p className="text-xs text-green-800">
                        選択中のテンプレート「{selectedTemplate?.template.name || '不明'}」内のボタンから選択してください
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">対象ボタン</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {extractButtonsFromSelectedTemplate().map((buttonInfo, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedButton === buttonInfo.text
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                          onClick={() => setSelectedButton(buttonInfo.text)}
                        >
                          <div className="flex items-start space-x-2">
                            <input
                              type="radio"
                              checked={selectedButton === buttonInfo.text}
                              onChange={() => setSelectedButton(buttonInfo.text)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {buttonInfo.text}
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <FileText className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">{buttonInfo.templateName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {extractButtonsFromSelectedTemplate().length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          テンプレート内にボタンが見つかりません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 時間経過設定 */}
            {selectedTriggerType === 'TIME_DELAY' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2 mb-3">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-900">時間経過設定</h4>
                      <p className="text-xs text-orange-800">
                        指定した時間後にアクションを実行します
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">待機時間</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max="10080"
                        value={delayMinutes}
                        onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">分後</span>
                      <div className="text-xs text-gray-500">
                        ({delayMinutes >= 60 ? `${Math.floor(delayMinutes / 60)}時間${delayMinutes % 60 > 0 ? `${delayMinutes % 60}分` : ''}` : `${delayMinutes}分`})
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      最大7日間（10080分）まで設定可能です
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* アクションタイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">実行するアクション</label>
              <div className="grid grid-cols-1 gap-3">
                {actionTypes.map(actionType => {
                  const IconComponent = actionType.iconComponent
                  return (
                    <div
                      key={actionType.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedActionType === actionType.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedActionType(actionType.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${actionType.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{actionType.label}</h4>
                          <p className="text-xs text-gray-600">{actionType.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* アクション詳細設定 */}
            {selectedActionType && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">アクション設定</h4>
                
                {/* タグ追加・削除の設定 */}
                {(selectedActionType === 'ADD_TAG' || selectedActionType === 'REMOVE_TAG') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">対象タグ</label>
                    <div className="border border-gray-300 rounded-md">
                      <TagSelector
                        tags={tags}
                        tagFolders={tagFolders}
                        selectedTagIds={actionConfig.tagIds || []}
                        onChange={(tagIds) => setActionConfig({...actionConfig, tagIds})}
                        multiple={true}
                      />
                    </div>
                  </div>
                )}

                {/* ステータス変更の設定 */}
                {selectedActionType === 'CHANGE_STATUS' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">変更先ステータス</label>
                    <div className="border border-gray-300 rounded-md">
                      <StatusSelector
                        statuses={statuses}
                        selectedStatusId={actionConfig.statusId || ''}
                        onChange={(statusId) => setActionConfig({...actionConfig, statusId})}
                      />
                    </div>
                  </div>
                )}

                {/* メッセージ送信の設定 */}
                {selectedActionType === 'SEND_MESSAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">送信テンプレート</label>
                    <div className="border border-gray-300 rounded-md">
                      <TemplateSelector
                        templates={templates}
                        templateFolders={templateFolders}
                        selectedTemplateId={actionConfig.templateId || null}
                        onChange={(templateId) => setActionConfig({...actionConfig, templateId})}
                      />
                    </div>
                  </div>
                )}

                {/* 待機時間の設定 */}
                {selectedActionType === 'WAIT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">待機時間（分）</label>
                    <input
                      type="number"
                      min="1"
                      value={actionConfig.waitMinutes || ''}
                      onChange={(e) => setActionConfig({...actionConfig, waitMinutes: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="待機する分数を入力"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowActionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={
                !selectedActionType || 
                (selectedTriggerType === 'URL_CLICK' && !selectedUrl) ||
                (selectedTriggerType === 'BUTTON_CLICK' && !selectedButton) ||
                (selectedActionType === 'CHANGE_STATUS' && !actionConfig.statusId) ||
                (selectedActionType === 'SEND_MESSAGE' && !actionConfig.templateId) ||
                (selectedActionType === 'ADD_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0)) ||
                (selectedActionType === 'REMOVE_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0))
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sub Action Modal for conditional branching
  function SubActionModal({
    onClose,
    onAdd
  }: {
    onClose: () => void
    onAdd: (subAction: SubAction) => void
  }) {
    const [subActionType, setSubActionType] = useState<'CONDITIONAL' | 'ACTION'>(
      editingSubActionId && editingConditionType ? 'ACTION' : 'CONDITIONAL'
    )
    const [delayMinutes, setDelayMinutes] = useState(0)
    const [conditionType, setConditionType] = useState<'has' | 'not_has'>('has')
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
    const [actionType, setActionType] = useState('')
    const [actionConfig, setActionConfig] = useState<any>({})

    const actionTypes = [
      { id: 'ADD_TAG', label: 'タグを追加', iconComponent: TagIcon },
      { id: 'REMOVE_TAG', label: 'タグを削除', iconComponent: TagIcon },
      { id: 'CHANGE_STATUS', label: 'ステータス変更', iconComponent: Target },
      { id: 'SEND_MESSAGE', label: 'メッセージ送信', iconComponent: MessageSquare },
      { id: 'WAIT', label: '待機', iconComponent: Timer }
    ]

    const handleAdd = () => {
      // If we're editing a conditional and adding to then/else branch
      if (editingSubActionId && editingConditionType && subActionType === 'ACTION') {
        const newAction: BroadcastAction = {
          id: Date.now().toString(),
          type: actionType as ActionType,
          payload: actionConfig,
          trigger: { type: 'IMMEDIATE' },
          isActive: true
        }

        // Find the conditional sub-action and add the action to the appropriate branch
        if (editingAction && editingTemplateId) {
          const updatedActions = scenarioTemplates.map(template => {
            if (template.id === editingTemplateId) {
              return {
                ...template,
                actions: template.actions.map(action => {
                  if (action.id === editingAction.id) {
                    return {
                      ...action,
                      subActions: action.subActions?.map(subAction => {
                        if (subAction.id === editingSubActionId && subAction.type === 'CONDITIONAL') {
                          return {
                            ...subAction,
                            thenActions: editingConditionType === 'then' 
                              ? [...(subAction.thenActions || []), newAction]
                              : subAction.thenActions,
                            elseActions: editingConditionType === 'else'
                              ? [...(subAction.elseActions || []), newAction] 
                              : subAction.elseActions
                          }
                        }
                        return subAction
                      })
                    }
                  }
                  return action
                })
              }
            }
            return template
          })
          
          setScenarioTemplates(updatedActions)
        }
        
        onClose()
        return
      }

      // Regular sub-action creation
      const newSubAction: SubAction = {
        id: Date.now().toString(),
        type: subActionType
      }

      if (subActionType === 'CONDITIONAL') {
        newSubAction.condition = {
          type: conditionType,
          tagIds: selectedTagIds
        }
        newSubAction.delayMinutes = delayMinutes
        newSubAction.thenActions = []
        newSubAction.elseActions = []
      } else if (subActionType === 'ACTION') {
        newSubAction.action = {
          id: Date.now().toString(),
          type: actionType as ActionType,
          payload: actionConfig,
          trigger: { type: 'IMMEDIATE' },
          isActive: true
        }
        newSubAction.delayMinutes = delayMinutes
      }

      onAdd(newSubAction)
    }

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {editingSubActionId && editingConditionType ? 
                `条件分岐の${editingConditionType === 'then' ? '条件満たす場合' : '条件満たさない場合'}のアクション追加` :
                subActionType === 'CONDITIONAL' ? '条件分岐設定' : 'アクション設定'
              }
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* サブアクションタイプ選択 - 条件分岐編集時は非表示 */}
            {!editingSubActionId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subActionType"
                      value="CONDITIONAL"
                      checked={subActionType === 'CONDITIONAL'}
                      onChange={(e) => setSubActionType(e.target.value as 'CONDITIONAL')}
                      className="mr-2"
                    />
                    <GitBranch className="w-4 h-4 mr-2 text-purple-500" />
                    条件分岐
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subActionType"
                      value="ACTION"
                      checked={subActionType === 'ACTION'}
                      onChange={(e) => setSubActionType(e.target.value as 'ACTION')}
                      className="mr-2"
                    />
                    <Zap className="w-4 h-4 mr-2 text-blue-500" />
                    アクション
                  </label>
                </div>
              </div>
            )}

            {/* 実行タイミング設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実行タイミング</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10080"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">分後に実行</span>
                <span className="text-xs text-gray-500">
                  (0分 = 即座に実行)
                </span>
              </div>
            </div>

            {(subActionType === 'CONDITIONAL' && !editingSubActionId) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">条件タイプ</label>
                  <select
                    value={conditionType}
                    onChange={(e) => setConditionType(e.target.value as 'has' | 'not_has')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="has">指定したタグを持っている場合</option>
                    <option value="not_has">指定したタグを持っていない場合</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">対象タグ</label>
                  <div className="border border-gray-300 rounded-md">
                    <TagSelector
                      tags={tags}
                      tagFolders={tagFolders}
                      selectedTagIds={selectedTagIds}
                      onChange={setSelectedTagIds}
                      multiple={true}
                    />
                  </div>
                </div>
              </>
            )}

            {(subActionType === 'ACTION' || editingSubActionId) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">アクションタイプ</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">選択してください</option>
                    {actionTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* アクション詳細設定 */}
                {actionType === 'ADD_TAG' || actionType === 'REMOVE_TAG' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">対象タグ</label>
                    <div className="border border-gray-300 rounded-md">
                      <TagSelector
                        tags={tags}
                        tagFolders={tagFolders}
                        selectedTagIds={actionConfig.tagIds || []}
                        onChange={(tagIds) => setActionConfig({ ...actionConfig, tagIds })}
                        multiple={true}
                      />
                    </div>
                  </div>
                ) : actionType === 'SEND_MESSAGE' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">送信テンプレート</label>
                    <div className="border border-gray-300 rounded-md">
                      <TemplateSelector
                        templates={templates}
                        templateFolders={templateFolders}
                        selectedTemplateId={actionConfig.templateId || null}
                        onChange={(templateId) => setActionConfig({ ...actionConfig, templateId })}
                      />
                    </div>
                  </div>
                ) : actionType === 'CHANGE_STATUS' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">変更先ステータス</label>
                    <div className="border border-gray-300 rounded-md">
                      <StatusSelector
                        statuses={statuses}
                        selectedStatusId={actionConfig.statusId || ''}
                        onChange={(statusId) => setActionConfig({ ...actionConfig, statusId })}
                      />
                    </div>
                  </div>
                ) : actionType === 'WAIT' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">待機時間（分）</label>
                    <input
                      type="number"
                      min="1"
                      value={actionConfig.waitMinutes || ''}
                      onChange={(e) => setActionConfig({ ...actionConfig, waitMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={
                (subActionType === 'CONDITIONAL' && selectedTagIds.length === 0) ||
                (subActionType === 'ACTION' && !actionType) ||
                (subActionType === 'ACTION' && actionType === 'ADD_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0)) ||
                (subActionType === 'ACTION' && actionType === 'REMOVE_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0)) ||
                (subActionType === 'ACTION' && actionType === 'SEND_MESSAGE' && !actionConfig.templateId) ||
                (subActionType === 'ACTION' && actionType === 'CHANGE_STATUS' && !actionConfig.statusId)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingSubActionId && editingConditionType ? 'アクションを追加' : '追加'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Helper functions
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'ADD_TAG': return TagIcon
      case 'REMOVE_TAG': return TagIcon  
      case 'CHANGE_STATUS': return Target
      case 'SEND_MESSAGE': return MessageSquare
      case 'WAIT': return Timer
      default: return Settings
    }
  }

  const getActionColor = (type: ActionType) => {
    switch (type) {
      case 'ADD_TAG': return 'text-green-600 bg-green-50 border-green-200'
      case 'REMOVE_TAG': return 'text-red-600 bg-red-50 border-red-200'
      case 'CHANGE_STATUS': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'SEND_MESSAGE': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'WAIT': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getActionDescription = (action: BroadcastAction): string => {
    switch (action.type) {
      case 'ADD_TAG':
        const addTagNames = action.payload?.tagIds?.map(id => tags.find(t => t.id === id)?.name).filter(Boolean).join(', ')
        return `タグを追加: ${addTagNames || '未設定'}`
      case 'REMOVE_TAG':
        const removeTagNames = action.payload?.tagIds?.map(id => tags.find(t => t.id === id)?.name).filter(Boolean).join(', ')
        return `タグを削除: ${removeTagNames || '未設定'}`
      case 'CHANGE_STATUS':
        const statusName = statuses.find(s => s.id === action.payload?.statusId)?.label
        return `ステータス変更: ${statusName || '未設定'}`
      case 'SEND_MESSAGE':
        const templateName = templates.find(t => t.id === action.payload?.templateId)?.name
        return `メッセージ送信: ${templateName || '未設定'}`
      case 'WAIT':
        return `${action.payload?.waitMinutes || 0}分待機`
      default:
        return '未設定'
    }
  }

  const getTriggerDescription = (action: BroadcastAction): string => {
    if (!action.trigger || action.trigger.type === 'IMMEDIATE') return '即座に実行'
    
    switch (action.trigger.type) {
      case 'URL_CLICK':
        return `URL クリック: ${action.trigger.condition?.targetUrl || '未設定'}`
      case 'BUTTON_CLICK':
        return `ボタン クリック: ${action.trigger.condition?.buttonText || '未設定'}`
      case 'TIME_DELAY':
        const minutes = action.trigger.delayMinutes || 0
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60)
          const remainingMinutes = minutes % 60
          return `${hours}時間${remainingMinutes > 0 ? `${remainingMinutes}分` : ''}後`
        } else {
          return `${minutes}分後`
        }
      default:
        return '未設定'
    }
  }

  // Sub Action Component
  function SubActionCard({
    subAction,
    onRemove,
    onAddToConditional
  }: {
    subAction: SubAction
    onRemove: () => void
    onAddToConditional?: (type: 'then' | 'else') => void
  }) {
    const getSubActionIcon = () => {
      switch (subAction.type) {
        case 'CONDITIONAL':
          return <GitBranch className="w-4 h-4 text-purple-500" />
        case 'ACTION':
          return <Zap className="w-4 h-4 text-blue-500" />
        default:
          return <Settings className="w-4 h-4 text-gray-500" />
      }
    }

    const getSubActionTitle = () => {
      const delayText = subAction.delayMinutes ? `${subAction.delayMinutes}分後に ` : ''
      
      switch (subAction.type) {
        case 'CONDITIONAL':
          const conditionText = subAction.condition?.type === 'has' ? 'を持っている場合' : 'を持っていない場合'
          const tagNames = subAction.condition?.tagIds?.map(id => tags.find(t => t.id === id)?.name).filter(Boolean).join(', ') || '未設定'
          return `${delayText}条件分岐: ${tagNames}${conditionText}`
        case 'ACTION':
          if (subAction.action) {
            return `${delayText}${getActionDescription(subAction.action)}`
          }
          return `${delayText}アクション`
        default:
          return 'サブアクション'
      }
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 ml-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            {getSubActionIcon()}
            <span className="text-sm font-medium text-gray-900">
              {getSubActionTitle()}
            </span>
          </div>
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="削除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* 条件分岐の then/else アクション表示 */}
        {subAction.type === 'CONDITIONAL' && (
          <div className="mt-3 space-y-3">
            {/* THEN Actions */}
            <div className="pl-4 border-l-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-green-700">条件を満たす場合:</div>
                <button
                  onClick={() => onAddToConditional?.('then')}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  アクション追加
                </button>
              </div>
              {subAction.thenActions && subAction.thenActions.length > 0 ? (
                subAction.thenActions.map((action, idx) => (
                  <div key={`then-${idx}`} className="text-xs text-gray-600 p-2 bg-green-50 rounded mb-1">
                    {getActionDescription(action)}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">アクションなし</div>
              )}
            </div>
            
            {/* ELSE Actions */}
            <div className="pl-4 border-l-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-red-700">条件を満たさない場合:</div>
                <button
                  onClick={() => onAddToConditional?.('else')}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  アクション追加
                </button>
              </div>
              {subAction.elseActions && subAction.elseActions.length > 0 ? (
                subAction.elseActions.map((action, idx) => (
                  <div key={`else-${idx}`} className="text-xs text-gray-600 p-2 bg-red-50 rounded mb-1">
                    {getActionDescription(action)}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">アクションなし</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const moveTemplate = (fromIndex: number, toIndex: number) => {
    const newTemplates = [...scenarioTemplates]
    const [movedTemplate] = newTemplates.splice(fromIndex, 1)
    newTemplates.splice(toIndex, 0, movedTemplate)
    
    // Update order
    const updatedTemplates = newTemplates.map((template, index) => ({
      ...template,
      order: index
    }))
    
    setScenarioTemplates(updatedTemplates)
  }

  const removeTemplate = (templateId: string) => {
    setScenarioTemplates(scenarioTemplates.filter(t => t.id !== templateId))
  }

  const removeAction = (templateId: string, actionId: string) => {
    setScenarioTemplates(scenarioTemplates.map(template => 
      template.id === templateId 
        ? {
            ...template,
            actions: template.actions.filter(action => action.id !== actionId)
          }
        : template
    ))
  }

  const updateTemplateDelay = (templateId: string, delayMinutes: number) => {
    setScenarioTemplates(scenarioTemplates.map(template => 
      template.id === templateId 
        ? { ...template, delayMinutes }
        : template
    ))
  }

  const updateTemplateTimingConfig = (templateId: string, field: string, value: any) => {
    setScenarioTemplates(scenarioTemplates.map(template => {
      if (template.id === templateId) {
        const currentConfig = template.timingConfig || {
          delayValue: template.delayMinutes,
          delayUnit: 'minutes' as 'minutes' | 'hours' | 'days'
        }
        
        const updatedConfig = { ...currentConfig, [field]: value }
        
        // Update delayMinutes based on timing config
        const delayMultiplier = updatedConfig.delayUnit === 'hours' ? 60 : 
                               updatedConfig.delayUnit === 'days' ? 1440 : 1
        const delayMinutes = updatedConfig.delayValue * delayMultiplier
        
        return {
          ...template,
          timingConfig: updatedConfig,
          delayMinutes
        }
      }
      return template
    }))
  }

  const toggleTemplateExpanded = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (expandedTemplates.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const handleSave = () => {
    if (!scenarioData.name.trim()) {
      alert('シナリオ名を入力してください')
      return
    }

    if (scenarioTemplates.length === 0) {
      alert('少なくとも1つのテンプレートを追加してください')
      return
    }

    // Convert scenario templates to packs format for compatibility
    const packs = scenarioTemplates.map((scenarioTemplate, index) => ({
      id: scenarioTemplate.id,
      scenarioId: scenario?.id || '',
      order: index + 1,
      offsetMinutes: scenarioTemplate.delayMinutes,
      createdAt: new Date(),
      // Store template and actions info in conditionJson for now
      conditionJson: JSON.stringify({
        templateId: scenarioTemplate.templateId,
        actions: scenarioTemplate.actions
      })
    }))

    const savedScenario: Scenario = {
      id: scenario?.id || Date.now().toString(),
      campaignId: scenario?.campaignId || '',
      name: scenarioData.name,
      description: scenarioData.description,
      trigger: scenarioData.trigger,
      triggerValue: scenarioData.triggerValue,
      isActive: scenarioData.isActive,
      folderId: scenarioData.folderId,
      createdAt: scenario?.createdAt || new Date(),
      updatedAt: new Date(),
      packs,
      // Target settings
      targetType: scenarioData.targetType,
      targetSegmentId: scenarioData.targetSegmentId,
      // Schedule settings
      scheduleType: scenarioData.scheduleType,
      scheduledAt: scenarioData.scheduledAt,
      // Execution timing settings
      executionTiming: scenarioData.executionTiming,
      executionDelay: scenarioData.executionDelay,
      // Advanced timing settings
      triggerTagId: scenarioData.triggerTagId
    }

    onSave(savedScenario)
  }

  // Template Timing Configuration Modal
  function TemplateTimingModal() {
    const template = scenarioTemplates.find(t => t.id === editingTimingTemplateId)
    if (!template) return null

    const timingConfig = template.timingConfig || {
      delayValue: template.delayMinutes,
      delayUnit: 'minutes' as 'minutes' | 'hours' | 'days'
    }

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">テンプレート実行タイミング</h3>
            <button
              onClick={() => setEditingTimingTemplateId(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                前のテンプレートからの実行間隔
              </label>
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">値</label>
                  <input
                    type="number"
                    value={timingConfig.delayValue}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayValue', parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">単位</label>
                  <select
                    value={timingConfig.delayUnit}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayUnit', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="minutes">分</option>
                    <option value="hours">時間</option>
                    <option value="days">日</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実行条件</label>
              <select
                value={timingConfig.condition?.type || 'always'}
                onChange={(e) => updateTemplateTimingConfig(template.id, 'condition', {
                  ...timingConfig.condition,
                  type: e.target.value
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="always">常に実行</option>
                <option value="tag_exists">指定タグが存在する場合</option>
                <option value="tag_not_exists">指定タグが存在しない場合</option>
                <option value="status_is">ステータスが指定と一致する場合</option>
                <option value="custom">カスタム条件</option>
              </select>
            </div>

            {(timingConfig.condition?.type === 'tag_exists' || timingConfig.condition?.type === 'tag_not_exists') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対象タグ</label>
                <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                  <TagSelector
                    tags={tags}
                    tagFolders={tagFolders}
                    selectedTagIds={timingConfig.condition?.tagIds || []}
                    onChange={(tagIds) => updateTemplateTimingConfig(template.id, 'condition', {
                      ...timingConfig.condition,
                      tagIds: tagIds
                    })}
                    multiple={false}
                  />
                </div>
              </div>
            )}

            {timingConfig.condition?.type === 'status_is' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対象ステータス</label>
                <select
                  value={timingConfig.condition?.statusIds?.[0] || ''}
                  onChange={(e) => updateTemplateTimingConfig(template.id, 'condition', {
                    ...timingConfig.condition,
                    statusIds: e.target.value ? [e.target.value] : []
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">ステータスを選択</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.label}</option>
                  ))}
                </select>
              </div>
            )}

            {timingConfig.condition?.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カスタム条件</label>
                <textarea
                  value={timingConfig.condition?.customCondition || ''}
                  onChange={(e) => updateTemplateTimingConfig(template.id, 'condition', {
                    ...timingConfig.condition,
                    customCondition: e.target.value
                  })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="カスタム実行条件を入力..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setEditingTimingTemplateId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const isComplete = scenarioData.name.trim() && scenarioTemplates.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {scenario ? 'シナリオ編集' : '新規シナリオ作成'}
            </h1>
            <p className="text-sm text-gray-600">
              テンプレートと自動化アクションで構成されるメッセージフローを作成
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {/* TODO: Preview */}}
            disabled={!isComplete}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4 mr-2" />
            プレビュー
          </button>
          
          <button
            onClick={handleSave}
            disabled={!isComplete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              シナリオ名 *
            </label>
            <input
              type="text"
              value={scenarioData.name}
              onChange={(e) => setScenarioData({ ...scenarioData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 新規登録ウェルカムシリーズ"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <textarea
              value={scenarioData.description || ''}
              onChange={(e) => setScenarioData({ ...scenarioData, description: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="このシナリオの目的や内容について説明してください..."
            />
            <p className="mt-1 text-xs text-gray-500">
              シナリオの目的、対象ユーザー、実行タイミングなどを記載することで、後から管理しやすくなります。
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={scenarioData.isActive}
                onChange={(e) => setScenarioData({ ...scenarioData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                作成後すぐにアクティブにする
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              アクティブなシナリオは条件に応じて自動実行されます
            </p>
          </div>
        </div>
      </div>

      {/* Target Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">配信対象設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">配信対象</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={scenarioData.targetType === 'all'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    targetType: e.target.value as 'all' | 'segment',
                    targetSegmentId: undefined 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">全ユーザー</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">登録されている全ユーザーに配信</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="targetType"
                  value="segment"
                  checked={scenarioData.targetType === 'segment'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    targetType: e.target.value as 'all' | 'segment' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">セグメント指定</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">条件に合致するユーザーに配信</p>
                </div>
              </label>
            </div>
          </div>

          {scenarioData.targetType === 'segment' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">対象セグメント</label>
              <div className="border border-gray-300 rounded-lg">
                <SegmentSelector
                  segments={segments}
                  segmentFolders={segmentFolders}
                  selectedSegmentId={scenarioData.targetSegmentId || null}
                  onChange={(segmentId) => setScenarioData({ 
                    ...scenarioData, 
                    targetSegmentId: segmentId || undefined 
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">スケジュール設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">実行タイミング</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scheduleType"
                  value="immediate"
                  checked={scenarioData.scheduleType === 'immediate'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    scheduleType: e.target.value as 'immediate' | 'scheduled',
                    scheduledAt: undefined 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">即座に実行</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">条件が満たされたらすぐに実行</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scheduleType"
                  value="scheduled"
                  checked={scenarioData.scheduleType === 'scheduled'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    scheduleType: e.target.value as 'immediate' | 'scheduled' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">日時指定</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">指定した日時に実行</p>
                </div>
              </label>
            </div>
          </div>

          {scenarioData.scheduleType === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実行日時</label>
              <input
                type="datetime-local"
                value={scenarioData.scheduledAt ? 
                  new Date(scenarioData.scheduledAt.getTime() - scenarioData.scheduledAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : 
                  ''
                }
                onChange={(e) => setScenarioData({ 
                  ...scenarioData, 
                  scheduledAt: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Execution Timing Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">実行タイミング詳細</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">実行方式</label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="executionTiming"
                  value="manual"
                  checked={scenarioData.executionTiming === 'manual'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionTiming: e.target.value as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">手動実行</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">管理者が手動でシナリオを開始</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="executionTiming"
                  value="automatic"
                  checked={scenarioData.executionTiming === 'automatic'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionTiming: e.target.value as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">自動実行</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">トリガー条件が満たされたら自動実行</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="executionTiming"
                  value="time_based"
                  checked={scenarioData.executionTiming === 'time_based'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionTiming: e.target.value as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">時間ベース</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">指定した遅延時間後に実行</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="executionTiming"
                  value="friend_added"
                  checked={scenarioData.executionTiming === 'friend_added'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionTiming: e.target.value as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">LINE友達追加時</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ユーザーがLINE公式アカウントを友達追加した時に実行</p>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="executionTiming"
                  value="tag_added"
                  checked={scenarioData.executionTiming === 'tag_added'}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionTiming: e.target.value as 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added' 
                  })}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">タグ追加時</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">指定したタグがユーザーに追加された時に実行</p>
                </div>
              </label>

            </div>
          </div>

          {/* Tag selection for tag_added trigger */}
          {scenarioData.executionTiming === 'tag_added' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">トリガータグ</label>
              <div className="border border-gray-300 rounded-lg">
                <TagSelector
                  tags={tags}
                  tagFolders={tagFolders}
                  selectedTagIds={scenarioData.triggerTagId ? [scenarioData.triggerTagId] : []}
                  onChange={(tagIds) => setScenarioData({ 
                    ...scenarioData, 
                    triggerTagId: tagIds[0] || undefined 
                  })}
                  multiple={false}
                />
              </div>
            </div>
          )}


          {/* Delay settings for time-based and friend_added */}
          {(scenarioData.executionTiming === 'time_based' || scenarioData.executionTiming === 'friend_added') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">実行遅延時間</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={scenarioData.executionDelay}
                  onChange={(e) => setScenarioData({ 
                    ...scenarioData, 
                    executionDelay: parseInt(e.target.value) || 0 
                  })}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="0"
                />
                <span className="text-sm text-gray-600">分後</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {scenarioData.executionTiming === 'friend_added' 
                  ? 'LINE友達追加から実際に実行するまでの遅延時間' 
                  : 'トリガー条件が満たされてから実際に実行するまでの遅延時間'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Template Flow */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">メッセージフロー</h2>
            <p className="text-sm text-gray-600">テンプレートとアクションでシナリオを構成</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            テンプレートを追加
          </button>
        </div>

        {scenarioTemplates.length > 0 ? (
          <div className="space-y-4">
            {scenarioTemplates.map((scenarioTemplate, index) => (
              <div key={scenarioTemplate.id} className="relative">
                {/* Timeline connector */}
                {index > 0 && (
                  <div className="absolute -top-4 left-6 w-0.5 h-4 bg-gray-300"></div>
                )}

                <div className="border border-gray-200 rounded-lg">
                  {/* Template header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{scenarioTemplate.template.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            scenarioTemplate.template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                            scenarioTemplate.template.type === 'FLEX' ? 'bg-green-100 text-green-800' :
                            scenarioTemplate.template.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {scenarioTemplate.template.type}
                          </span>
                        </div>
                        {index > 0 && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{scenarioTemplate.delayMinutes}分後</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <div className="flex items-center space-x-1 mr-2">
                          <label className="text-xs text-gray-500">間隔:</label>
                          <input
                            type="number"
                            value={scenarioTemplate.timingConfig?.delayValue || Math.floor(scenarioTemplate.delayMinutes / (scenarioTemplate.timingConfig?.delayUnit === 'hours' ? 60 : scenarioTemplate.timingConfig?.delayUnit === 'days' ? 1440 : 1)) || 0}
                            onChange={(e) => updateTemplateTimingConfig(scenarioTemplate.id, 'delayValue', parseInt(e.target.value) || 0)}
                            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                            min="0"
                          />
                          <select
                            value={scenarioTemplate.timingConfig?.delayUnit || 'minutes'}
                            onChange={(e) => updateTemplateTimingConfig(scenarioTemplate.id, 'delayUnit', e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                          >
                            <option value="minutes">分</option>
                            <option value="hours">時間</option>
                            <option value="days">日</option>
                          </select>
                          <button
                            onClick={() => setEditingTimingTemplateId(scenarioTemplate.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            詳細
                          </button>
                        </div>
                      )}
                      
                      {index > 0 && (
                        <button
                          onClick={() => moveTemplate(index, index - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      
                      {index < scenarioTemplates.length - 1 && (
                        <button
                          onClick={() => moveTemplate(index, index + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleTemplateExpanded(scenarioTemplate.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        {expandedTemplates.has(scenarioTemplate.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => removeTemplate(scenarioTemplate.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedTemplates.has(scenarioTemplate.id) && (
                    <div className="p-4 space-y-4">
                      {/* Template preview */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {scenarioTemplate.template.content}
                        </p>
                      </div>

                      {/* Actions */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">自動アクション</h4>
                          <button
                            onClick={() => {
                              setSelectedTemplate(scenarioTemplate)
                              setShowActionModal(true)
                            }}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            アクションを追加
                          </button>
                        </div>

                        {scenarioTemplate.actions.length > 0 ? (
                          <div className="space-y-2">
                            {scenarioTemplate.actions.map((action) => {
                              const Icon = getActionIcon(action.type)
                              return (
                                <div key={action.id} className="space-y-2">
                                  <div
                                    className={`border rounded-md ${getActionColor(action.type)}`}
                                  >
                                    <div className="flex items-center justify-between p-3">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <Icon className="w-4 h-4" />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium">
                                            {action.type === 'ADD_TAG' ? 'タグを追加' :
                                             action.type === 'REMOVE_TAG' ? 'タグを削除' :
                                             action.type === 'CHANGE_STATUS' ? 'ステータス変更' :
                                             action.type === 'SEND_MESSAGE' ? 'メッセージ送信' :
                                             action.type === 'WAIT' ? '待機' : 'アクション'}
                                          </div>
                                          <div className="space-y-1 mt-1">
                                            <div className="text-xs opacity-75">
                                              トリガー: {getTriggerDescription(action)}
                                            </div>
                                            <div className="text-xs opacity-75">
                                              アクション: {getActionDescription(action)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => {
                                            setEditingAction(action)
                                            setEditingTemplateId(scenarioTemplate.id)
                                            setShowSubActionModal(true)
                                          }}
                                          className="p-1 text-gray-400 hover:text-green-600 rounded"
                                          title="サブアクション追加"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => removeAction(scenarioTemplate.id, action.id)}
                                          className="p-1 text-red-400 hover:text-red-600 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* サブアクション表示 */}
                                    {action.subActions && action.subActions.length > 0 && (
                                      <div className="px-3 pb-3">
                                        <div className="space-y-2">
                                          {action.subActions.map((subAction) => (
                                            <SubActionCard
                                              key={subAction.id}
                                              subAction={subAction}
                                              onRemove={() => {
                                                const updatedActions = scenarioTemplate.actions.map(a => 
                                                  a.id === action.id 
                                                    ? { ...a, subActions: a.subActions?.filter(sa => sa.id !== subAction.id) }
                                                    : a
                                                )
                                                const updatedTemplate = { ...scenarioTemplate, actions: updatedActions }
                                                setScenarioTemplates(scenarioTemplates.map(t => 
                                                  t.id === scenarioTemplate.id ? updatedTemplate : t
                                                ))
                                              }}
                                              onAddToConditional={(type) => {
                                                setEditingSubActionId(subAction.id)
                                                setEditingConditionType(type)
                                                setEditingAction(action)
                                                setEditingTemplateId(scenarioTemplate.id)
                                                setShowSubActionModal(true)
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">アクションが設定されていません</p>
                            <p className="text-xs">ユーザーの行動に応じた自動化を設定できます</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">テンプレートが追加されていません</p>
            <p className="text-sm mb-4">シナリオにメッセージテンプレートを追加してください</p>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初のテンプレートを追加
            </button>
          </div>
        )}
      </div>

      {/* Completion status */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">完了するには</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!scenarioData.name.trim() && (
              <li>• シナリオ名を入力してください</li>
            )}
            {scenarioTemplates.length === 0 && (
              <li>• 少なくとも1つのテンプレートを追加してください</li>
            )}
          </ul>
        </div>
      )}

      {/* Pack Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Pack管理</h2>
            <span className="text-sm text-gray-500">
              ({scenarioPacks.length} Pack)
            </span>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setPackViewMode('list')}
                className={`p-1 rounded ${packViewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPackViewMode('flow')}
                className={`p-1 rounded ${packViewMode === 'flow' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPack(null)
              setShowPackEditor(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            <Plus className="w-4 h-4" />
            Packを追加
          </button>
        </div>

        {scenarioPacks.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">まだPackが作成されていません</p>
            <button
              onClick={() => {
                setEditingPack(null)
                setShowPackEditor(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4" />
              最初のPackを作成
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarioPacks
              .sort((a, b) => a.order - b.order)
              .map((pack) => (
                <div key={pack.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">Pack {pack.order + 1}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {pack.packType === 'normal' ? '通常' : 
                           pack.packType === 'conditional' ? '条件分岐' : 'リマインダー'}
                        </span>
                      </div>
                      {pack.offsetMinutes > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {pack.offsetMinutes}分後
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPack(pack)
                          setShowPackEditor(true)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setScenarioPacks(prev => prev.filter(p => p.id !== pack.id))
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {pack.conditionalLogic && pack.conditionalLogic.conditions.length > 0 && (
                    <div className="mt-3 pl-7">
                      <div className="text-xs text-gray-500 mb-2">条件分岐:</div>
                      {pack.conditionalLogic.conditions.map((branch) => (
                        <div key={branch.id} className="text-xs text-gray-600 mb-1">
                          • {branch.name} ({branch.condition.comparison} {branch.condition.tagId ? tags.find(t => t.id === branch.condition.tagId)?.name : String(branch.condition.value || '')})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showTemplateModal && <TemplateSelectionModal />}
      {showActionModal && <ActionModal />}
      {editingTimingTemplateId && <TemplateTimingModal />}
      {showSubActionModal && (
        <SubActionModal
          onClose={() => {
            setShowSubActionModal(false)
            setEditingSubActionId(null)
            setEditingConditionType('then')
          }}
          onAdd={(subAction) => {
            if (editingAction && editingTemplateId) {
              const updatedTemplate = scenarioTemplates.find(t => t.id === editingTemplateId)
              if (updatedTemplate) {
                const updatedActions = updatedTemplate.actions.map(action => 
                  action.id === editingAction.id 
                    ? { ...action, subActions: [...(action.subActions || []), subAction] }
                    : action
                )
                const newTemplate = { ...updatedTemplate, actions: updatedActions }
                setScenarioTemplates(scenarioTemplates.map(t => 
                  t.id === editingTemplateId ? newTemplate : t
                ))
              }
            }
            setShowSubActionModal(false)
            setEditingSubActionId(null)
            setEditingConditionType('then')
          }}
        />
      )}
      
      {/* Pack Editor Modal */}
      {showPackEditor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PackEditor
              pack={editingPack}
              templates={templates}
              tags={tags}
              statuses={statuses}
              onSave={(pack) => {
                if (editingPack) {
                  setScenarioPacks(prev => prev.map(p => p.id === pack.id ? pack : p))
                } else {
                  setScenarioPacks(prev => [...prev, pack])
                }
                setShowPackEditor(false)
                setEditingPack(null)
              }}
              onCancel={() => {
                setShowPackEditor(false)
                setEditingPack(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}