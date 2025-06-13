'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { User, Segment, SegmentFolder, Template, TemplateFolder, Tag, TagFolder, Status, Broadcast, BroadcastFolder, BroadcastAction, SubAction } from '@/types'
import { 
  Send, Users, Target, FileText, Clock, CheckCircle, AlertCircle, Calendar, Plus, MoreHorizontal, Edit,
  Search, Folder, FolderOpen, ChevronRight, ChevronDown, ChevronUp, Edit2, Copy, Trash2, Play, Pause, BarChart3,
  Settings, Tag as TagIcon, MessageSquare, GitBranch, Zap, ExternalLink, MousePointer, ArrowUp, ArrowDown, Timer, 
  Eye
} from 'lucide-react'


interface BroadcastHistory {
  id: string
  title: string
  description?: string
  targetType: 'all' | 'segment' | 'tags' | 'status'
  targetValue?: string | string[]
  targetDescription: string
  recipientCount: number
  templateId: string
  templateType: string
  templatePreview: string
  scheduleType: 'immediate' | 'scheduled'
  scheduledAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
  sentAt?: Date
  completedAt?: Date
  openRate?: number
  clickRate?: number
  createdAt: Date
  createdBy: string
}

interface BroadcastPageProps {
  users: User[]
  segments: Segment[]
  segmentFolders: SegmentFolder[]
  templates: Template[]
  templateFolders: TemplateFolder[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  broadcasts: Broadcast[]
  broadcastFolders: BroadcastFolder[]
  onSend: (broadcastData: {
    targetType: 'all' | 'segment'
    targetValue?: string
    templateId: string
    scheduleType: 'immediate' | 'scheduled'
    scheduledAt?: Date
    title: string
    description?: string
  }) => void
  onCreateFolder: (folder: Omit<BroadcastFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<BroadcastFolder>) => void
  onDeleteFolder: (folderId: string) => void
  onCreateBroadcast: () => void
  onEditBroadcast: (broadcast: Broadcast) => void
  onDuplicateBroadcast: (broadcast: Broadcast) => void
  onDeleteBroadcast: (broadcastId: string) => void
  onToggleBroadcast: (broadcastId: string, isActive: boolean) => void
  onViewAnalytics: (broadcastId: string) => void
}

// タグ選択コンポーネント
function TagSelector({
  tags,
  tagFolders,
  selectedTagIds,
  onChange,
  multiple = true
}: {
  tags: Tag[]
  tagFolders: TagFolder[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  multiple?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: TagFolder[], parentId: string | null = null): any[] => {
    if (!folders || !Array.isArray(folders)) return []
    
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id),
      tagCount: tags?.filter(tag => tag.folderId === folder.id).length || 0
    }))
  }

  const rootFolders = buildFolderHierarchy(tagFolders || [])

  // フィルタリングされたタグ
  const filteredTags = (tags || []).filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !tag.folderId
    } else if (selectedFolder) {
      matchesFolder = tag.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const handleTagChange = (tagId: string, checked: boolean) => {
    if (multiple) {
      if (checked) {
        onChange([...selectedTagIds, tagId])
      } else {
        onChange(selectedTagIds.filter(id => id !== tagId))
      }
    } else {
      onChange(checked ? [tagId] : [])
    }
  }

  // フォルダアイテムのレンダリング
  const renderFolderItem = (folder: any, level: number = 0) => {
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFolder(folder.id)
                }}
                className="p-0.5 rounded hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <Folder className={`w-4 h-4 ${isSelected ? "text-blue-500" : "text-gray-400"}`} />
            <span className="text-sm font-medium truncate">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {folder.tagCount}
          </span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child: any) => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="タグを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex space-x-4">
        {/* フォルダツリー */}
        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="space-y-1">
            <div
              className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedFolder === null ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <div className="flex items-center space-x-2">
                <Folder className={`w-4 h-4 ${selectedFolder === null ? "text-blue-500" : "text-gray-400"}`} />
                <span className="text-sm font-medium">すべて</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {tags?.length || 0}
              </span>
            </div>

            <div
              className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedFolder === 'null' ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
              onClick={() => setSelectedFolder('null')}
            >
              <div className="flex items-center space-x-2">
                <FolderOpen className={`w-4 h-4 ${selectedFolder === 'null' ? "text-blue-500" : "text-gray-400"}`} />
                <span className="text-sm font-medium">未分類</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {tags?.filter(tag => !tag.folderId).length || 0}
              </span>
            </div>

            {rootFolders.map(folder => renderFolderItem(folder))}
          </div>
        </div>

        {/* タグリスト */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <label key={tag.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "tag-selector"}
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={(e) => handleTagChange(tag.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                      {tag.type && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                          tag.type === 'MANUAL' ? 'bg-blue-100 text-blue-800' :
                          tag.type === 'AUTOMATIC' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {tag.type === 'MANUAL' ? '手動' : 
                           tag.type === 'AUTOMATIC' ? '自動' : '行動'}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TagIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {searchQuery ? '検索結果がありません' : 'タグがありません'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 選択済みタグ表示 */}
      {selectedTagIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <TagIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              選択済み ({selectedTagIds.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              return tag ? (
                <span
                  key={tagId}
                  className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  <span>{tag.name}</span>
                  <button
                    onClick={() => handleTagChange(tagId, false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ステータス選択コンポーネント
function StatusSelector({
  statuses,
  selectedStatusId,
  onChange
}: {
  statuses: Status[]
  selectedStatusId: string
  onChange: (statusId: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  // フィルタリングされたステータス
  const filteredStatuses = statuses.filter(status =>
    status.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    status.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* 検索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="ステータスを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ステータスリスト */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredStatuses.length > 0 ? (
            filteredStatuses.map(status => (
              <label key={status.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="status-selector"
                  checked={selectedStatusId === status.id}
                  onChange={() => onChange(status.id)}
                  className="rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{status.label}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {status.code}
                    </span>
                  </div>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                {searchQuery ? '検索結果がありません' : 'ステータスがありません'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 選択済みステータス表示 */}
      {selectedStatusId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">選択済み:</span>
            {(() => {
              const status = statuses.find(s => s.id === selectedStatusId)
              return status ? (
                <span className="text-sm text-green-800">
                  {status.label} ({status.code})
                </span>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export function BroadcastPage({
  users,
  segments,
  segmentFolders,
  templates,
  templateFolders,
  tags,
  tagFolders,
  statuses,
  broadcasts,
  broadcastFolders,
  onSend,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateBroadcast,
  onEditBroadcast,
  onDuplicateBroadcast,
  onDeleteBroadcast,
  onToggleBroadcast,
  onViewAnalytics
}: BroadcastPageProps) {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'schedule'>('list')
  const [currentStep, setCurrentStep] = useState<'target' | 'template' | 'actions' | 'schedule' | 'confirm'>('target')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<BroadcastFolder | null>(null)
  const [scheduleView, setScheduleView] = useState<'all' | 'scheduled' | 'completed'>('all')
  
  const [broadcastData, setBroadcastData] = useState({
    targetType: 'all' as 'all' | 'segment',
    targetValue: undefined as string | undefined,
    templateId: '',
    actions: [] as BroadcastAction[],
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduledAt: undefined as Date | undefined,
    title: '',
    description: ''
  })

  const steps = [
    { id: 'target', label: '配信対象', icon: Target },
    { id: 'template', label: 'テンプレート', icon: FileText },
    { id: 'actions', label: 'アクション設定', icon: MoreHorizontal },
    { id: 'schedule', label: 'スケジュール', icon: Clock },
    { id: 'confirm', label: '確認・送信', icon: Send }
  ]

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: BroadcastFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(broadcastFolders)

  // Filter broadcasts based on search and folder
  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const matchesSearch = broadcast.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !broadcast.folderId
    } else if (selectedFolder) {
      matchesFolder = broadcast.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const handleDelete = (broadcastId: string, broadcastName: string) => {
    if (confirm(`一斉配信「${broadcastName}」を削除しますか？`)) {
      onDeleteBroadcast(broadcastId)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return '下書き'
      case 'SCHEDULED': return '予約中'
      case 'SENDING': return '送信中'
      case 'COMPLETED': return '完了'
      case 'FAILED': return '失敗'
      default: return status
    }
  }

  const getTargetUserCount = () => {
    switch (broadcastData.targetType) {
      case 'all':
        return users.length
      case 'segment':
        if (!broadcastData.targetValue) return 0
        return Math.floor(users.length * 0.7) // 仮の計算
      default:
        return 0
    }
  }

  const handleNext = () => {
    const stepOrder = ['target', 'template', 'actions', 'schedule', 'confirm']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as any)
    }
  }

  const handleSend = () => {
    onSend(broadcastData)
    // リセット
    setBroadcastData({
      targetType: 'all',
      targetValue: undefined,
      templateId: '',
      actions: [],
      scheduleType: 'immediate',
      scheduledAt: undefined,
      title: '',
      description: ''
    })
    setCurrentStep('target')
    setCurrentView('list') // リストビューに戻る
  }

  const handleCreateNew = () => {
    // リセット
    setBroadcastData({
      targetType: 'all',
      targetValue: undefined,
      templateId: '',
      actions: [],
      scheduleType: 'immediate',
      scheduledAt: undefined,
      title: '',
      description: ''
    })
    setCurrentStep('target')
    setCurrentView('create')
  }

  const handleBack = () => {
    const stepOrder = ['target', 'template', 'actions', 'schedule', 'confirm']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as any)
    } else {
      setCurrentView('list') // 最初のステップで戻るボタンを押した場合はリストに戻る
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 'target':
        if (broadcastData.targetType === 'all') return true
        if (broadcastData.targetType === 'segment') return !!broadcastData.targetValue
        return false
      case 'template':
        return !!broadcastData.templateId
      case 'actions':
        return true // アクションは任意
      case 'schedule':
        if (broadcastData.scheduleType === 'immediate') {
          return true
        }
        if (broadcastData.scheduleType === 'scheduled' && broadcastData.scheduledAt) {
          return new Date(broadcastData.scheduledAt) > new Date()
        }
        return false
      case 'confirm':
        return !!broadcastData.title.trim()
      default:
        return false
    }
  }

  if (currentView === 'create') {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">一斉配信作成</h2>
            <p className="mt-1 text-sm text-gray-600">
              ユーザーセグメントに対する一斉メッセージ配信
            </p>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index
              
              return (
                <div key={step.id} className="flex items-center">
                  {index > 0 && (
                    <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive 
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {currentStep === 'target' && (
            <TargetSelection
              targetType={broadcastData.targetType}
              targetValue={broadcastData.targetValue}
              segments={segments}
              segmentFolders={segmentFolders}
              users={users}
              onChange={(targetType, targetValue) => 
                setBroadcastData({ ...broadcastData, targetType, targetValue })
              }
            />
          )}

          {currentStep === 'template' && (
            <TemplateSelection
              selectedTemplateId={broadcastData.templateId}
              templates={templates}
              templateFolders={templateFolders}
              onChange={(templateId) => 
                setBroadcastData({ ...broadcastData, templateId })
              }
              onBack={() => setCurrentStep('target')}
              onNext={() => setCurrentStep('actions')}
              isNextDisabled={!broadcastData.templateId}
            />
          )}

          {currentStep === 'actions' && (
            <ActionConfiguration
              actions={broadcastData.actions}
              templates={templates}
              tags={tags}
              tagFolders={tagFolders}
              statuses={statuses}
              selectedTemplateId={broadcastData.templateId}
              onChange={(actions) => 
                setBroadcastData({ ...broadcastData, actions })
              }
              onBack={() => setCurrentStep('template')}
              onNext={() => setCurrentStep('schedule')}
              isNextDisabled={false}
            />
          )}

          {currentStep === 'schedule' && (
            <ScheduleSelection
              scheduleType={broadcastData.scheduleType}
              scheduledAt={broadcastData.scheduledAt}
              onChange={(scheduleType: 'immediate' | 'scheduled', scheduledAt?: Date) => 
                setBroadcastData({ ...broadcastData, scheduleType, scheduledAt })
              }
            />
          )}

          {currentStep === 'confirm' && (
            <ConfirmationStep
              broadcastData={broadcastData}
              userCount={getTargetUserCount()}
              segments={segments}
              templates={templates}
              onChange={(title: string, description?: string) => 
                setBroadcastData({ ...broadcastData, title, description: description || '' })
              }
            />
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            戻る
          </button>

          <div className="flex items-center space-x-4">
            {/* 対象ユーザー数表示 */}
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              配信対象: {getTargetUserCount()}名
            </div>

            {currentStep === 'confirm' ? (
              <button
                onClick={handleSend}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {broadcastData.scheduleType === 'immediate' ? '送信' : 'スケジュール'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'schedule') {
    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">配信予定</h2>
            <p className="mt-1 text-sm text-gray-600">
              配信予定と配信履歴を時系列で管理
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('list')}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 hover:text-gray-700"
              >
                一覧
              </button>
              <button
                onClick={() => setCurrentView('schedule')}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white shadow-sm text-blue-600"
              >
                配信予定
              </button>
            </div>
            
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              一斉配信を作成
            </button>
          </div>
        </div>

        <ScheduleView
          broadcasts={broadcasts}
          scheduleView={scheduleView}
          onScheduleViewChange={setScheduleView}
          onEditBroadcast={onEditBroadcast}
          onDeleteBroadcast={(broadcastId) => {
            const broadcast = broadcasts.find(b => b.id === broadcastId)
            if (broadcast && confirm(`一斉配信「${broadcast.name}」を削除しますか？`)) {
              onDeleteBroadcast(broadcastId)
            }
          }}
          onViewAnalytics={onViewAnalytics}
          getStatusLabel={getStatusLabel}
        />
      </div>
    )
  }

  // List view - Main broadcast management page
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">一斉配信</h2>
          <p className="mt-1 text-sm text-gray-600">
            フォルダで整理された一斉配信の管理と新規作成
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('list')}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-white shadow-sm text-blue-600"
            >
              一覧
            </button>
            <button
              onClick={() => setCurrentView('schedule')}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 hover:text-gray-700"
            >
              配信予定
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateFolder(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Folder className="w-4 h-4 mr-2 text-green-600" />
            新しいフォルダ
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            一斉配信を作成
          </button>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左カラム: フォルダツリー */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">フォルダ</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {/* すべての一斉配信 */}
                <div 
                  className={`group flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2" />
                    <Folder className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">すべて</span>
                  </div>
                  <span className="text-sm text-gray-500">{broadcasts.length}</span>
                </div>

                {/* 未分類の一斉配信 */}
                <div 
                  className={`group flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedFolder('null')}
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2" />
                    <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">未分類</span>
                  </div>
                  <span className="text-sm text-gray-500">{broadcasts.filter(b => !b.folderId).length}</span>
                </div>

                {/* フォルダツリー */}
                {rootFolders.map(folder => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    level={0}
                    broadcasts={broadcasts}
                    expandedFolders={expandedFolders}
                    selectedFolder={selectedFolder}
                    onToggleFolder={toggleFolder}
                    onSelectFolder={setSelectedFolder}
                    onEditFolder={setEditingFolder}
                    onDeleteFolder={onDeleteFolder}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム: 一斉配信表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべての一斉配信' 
                    : selectedFolder === 'null'
                    ? '未分類の一斉配信'
                    : broadcastFolders.find(f => f.id === selectedFolder)?.name || '一斉配信'}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* フォルダ内アクションボタン */}
                  {selectedFolder && selectedFolder !== 'null' && (
                    <>
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        フォルダ追加
                      </button>
                      <button
                        onClick={onCreateBroadcast}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        配信追加
                      </button>
                    </>
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="一斉配信を検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredBroadcasts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">一斉配信がありません</h4>
                  <p className="text-gray-600">
                    新しい一斉配信を作成してください。
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBroadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{broadcast.name}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              broadcast.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              broadcast.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                              broadcast.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
                              broadcast.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusLabel(broadcast.status)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {broadcast.description}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>作成: {new Date(broadcast.createdAt).toLocaleDateString('ja-JP')}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>
                                {broadcast.targetType === 'ALL' ? '全ユーザー' :
                                 broadcast.targetType === 'SEGMENT' ? 'セグメント' :
                                 broadcast.targetType === 'TAGS' ? 'タグ' : '不明'}
                              </span>
                            </div>

                            {broadcast.sentCount !== undefined && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>送信: {broadcast.sentCount}件</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => onViewAnalytics(broadcast.id)}
                            className="text-purple-600 hover:text-purple-900 inline-flex items-center p-1 rounded hover:bg-purple-100"
                            title="分析"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditBroadcast(broadcast)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                            title="編集"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDuplicateBroadcast(broadcast)}
                            className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
                            title="複製"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(broadcast.id, broadcast.name)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* フォルダ作成モーダル */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">新しいフォルダを作成</h3>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                placeholder="フォルダ名を入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* フォルダ編集モーダル */}
      {editingFolder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">フォルダを編集</h3>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                defaultValue={editingFolder.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingFolder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => setEditingFolder(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 配信予定ビューコンポーネント
function ScheduleView({
  broadcasts,
  scheduleView,
  onScheduleViewChange,
  onEditBroadcast,
  onDeleteBroadcast,
  onViewAnalytics,
  getStatusLabel
}: {
  broadcasts: Broadcast[]
  scheduleView: 'all' | 'scheduled' | 'completed'
  onScheduleViewChange: (view: 'all' | 'scheduled' | 'completed') => void
  onEditBroadcast: (broadcast: Broadcast) => void
  onDeleteBroadcast: (broadcastId: string) => void
  onViewAnalytics: (broadcastId: string) => void
  getStatusLabel: (status: string) => string
}) {
  // 配信を時系列で並び替え（予定日時または送信日時）
  const sortedBroadcasts = [...broadcasts].sort((a, b) => {
    const dateA = a.scheduledAt || a.sentAt || a.createdAt
    const dateB = b.scheduledAt || b.sentAt || b.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  // フィルタリング
  const filteredBroadcasts = sortedBroadcasts.filter(broadcast => {
    if (scheduleView === 'scheduled') {
      return broadcast.status === 'SCHEDULED' || broadcast.status === 'DRAFT'
    }
    if (scheduleView === 'completed') {
      return broadcast.status === 'COMPLETED' || broadcast.status === 'FAILED'
    }
    return true // all
  })

  const handleDelete = (broadcastId: string, broadcastName: string) => {
    if (confirm(`一斉配信「${broadcastName}」を削除しますか？`)) {
      onDeleteBroadcast(broadcastId)
    }
  }

  return (
    <div className="space-y-6">
      {/* フィルタータブ */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">表示：</span>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onScheduleViewChange('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                scheduleView === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => onScheduleViewChange('scheduled')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                scheduleView === 'scheduled' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              配信予定
            </button>
            <button
              onClick={() => onScheduleViewChange('completed')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                scheduleView === 'completed' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              配信済み
            </button>
          </div>
        </div>
      </div>

      {/* タイムライン表示 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {scheduleView === 'all' ? '配信タイムライン' :
             scheduleView === 'scheduled' ? '配信予定' : '配信済み'}
          </h3>
        </div>
        
        <div className="p-4">
          {filteredBroadcasts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {scheduleView === 'scheduled' ? '配信予定がありません' :
                 scheduleView === 'completed' ? '配信履歴がありません' : '配信がありません'}
              </h4>
              <p className="text-gray-600">
                {scheduleView === 'scheduled' ? '新しい配信をスケジュールしてください。' :
                 scheduleView === 'completed' ? 'まだ配信履歴がありません。' : '新しい配信を作成してください。'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBroadcasts.map((broadcast) => (
                <BroadcastTimelineItem
                  key={broadcast.id}
                  broadcast={broadcast}
                  onEdit={() => onEditBroadcast(broadcast)}
                  onDelete={() => handleDelete(broadcast.id, broadcast.name)}
                  onViewAnalytics={() => onViewAnalytics(broadcast.id)}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// タイムラインアイテムコンポーネント
function BroadcastTimelineItem({
  broadcast,
  onEdit,
  onDelete,
  onViewAnalytics,
  getStatusLabel
}: {
  broadcast: Broadcast
  onEdit: () => void
  onDelete: () => void
  onViewAnalytics: () => void
  getStatusLabel: (status: string) => string
}) {
  const getDisplayDate = () => {
    if (broadcast.scheduledAt) {
      return {
        date: broadcast.scheduledAt,
        label: broadcast.status === 'COMPLETED' ? '配信済み' : '配信予定'
      }
    }
    if (broadcast.sentAt) {
      return {
        date: broadcast.sentAt,
        label: '配信済み'
      }
    }
    return {
      date: broadcast.createdAt,
      label: '作成'
    }
  }

  const { date, label } = getDisplayDate()
  const isUpcoming = broadcast.status === 'SCHEDULED' && new Date(broadcast.scheduledAt!) > new Date()
  const isOverdue = broadcast.status === 'SCHEDULED' && new Date(broadcast.scheduledAt!) < new Date()

  return (
    <div className={`border rounded-lg p-4 ${
      isUpcoming ? 'border-blue-200 bg-blue-50' :
      isOverdue ? 'border-orange-200 bg-orange-50' :
      broadcast.status === 'COMPLETED' ? 'border-green-200 bg-green-50' :
      broadcast.status === 'FAILED' ? 'border-red-200 bg-red-50' :
      'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-gray-900">{broadcast.name}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              broadcast.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              broadcast.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
              broadcast.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
              broadcast.status === 'FAILED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getStatusLabel(broadcast.status)}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                期限超過
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {broadcast.description}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{label}: {new Date(date).toLocaleString('ja-JP')}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>
                {broadcast.targetType === 'ALL' ? '全ユーザー' :
                 broadcast.targetType === 'SEGMENT' ? 'セグメント' :
                 broadcast.targetType === 'TAGS' ? 'タグ' : '不明'}
              </span>
            </div>

            {broadcast.sentCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>送信: {broadcast.sentCount}件</span>
              </div>
            )}

            {broadcast.openedCount !== undefined && broadcast.sentCount && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>開封率: {Math.round((broadcast.openedCount / broadcast.sentCount) * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onViewAnalytics}
            className="text-purple-600 hover:text-purple-900 inline-flex items-center p-1 rounded hover:bg-purple-100"
            title="分析"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 配信対象選択コンポーネント
function TargetSelection({
  targetType,
  targetValue,
  segments,
  segmentFolders,
  users,
  onChange
}: {
  targetType: 'all' | 'segment'
  targetValue?: string
  segments: Segment[]
  segmentFolders: SegmentFolder[]
  users: User[]
  onChange: (targetType: 'all' | 'segment', targetValue?: string) => void
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信対象を選択</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 全ユーザー */}
        <div 
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            targetType === 'all' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}
          onClick={() => onChange('all')}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">全ユーザー</span>
          </div>
          <p className="text-gray-600 mb-2">登録されているすべてのユーザーに配信します</p>
          <p className="text-sm font-medium text-blue-600">{users.length}名のユーザー</p>
        </div>

        {/* セグメント */}
        <div 
          className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
            targetType === 'segment' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}
          onClick={() => onChange('segment')}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">セグメント</span>
          </div>
          <p className="text-gray-600 mb-2">条件に基づいて作成されたセグメントを選択</p>
          <p className="text-sm font-medium text-green-600">{segments.length}個のセグメント</p>
        </div>
      </div>

      {/* セグメント詳細選択 */}
      {targetType === 'segment' && (
        <SegmentSelector
          selectedSegmentId={targetValue}
          segments={segments}
          segmentFolders={segmentFolders}
          onChange={(segmentId: string) => onChange('segment', segmentId)}
          onBack={() => onChange('all')}
          onNext={() => {/* Navigation will be handled by main buttons */}}
          isNextDisabled={!targetValue}
          userCount={targetValue ? Math.floor((users || []).length * 0.7) : 0}
        />
      )}
    </div>
  )
}

// テンプレート選択コンポーネント（2カラム形式）
function TemplateSelection({
  selectedTemplateId,
  templates,
  templateFolders,
  onChange,
  onBack,
  onNext,
  isNextDisabled
}: {
  selectedTemplateId: string
  templates: Template[]
  templateFolders: TemplateFolder[]
  onChange: (templateId: string) => void
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(templateFolders)

  // フィルタリング
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !template.folderId
    } else if (selectedFolder) {
      matchesFolder = template.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const getTemplateCount = (folderId: string): number => {
    return templates.filter(template => template.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const templateCount = getTemplateCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${8 + level * 12}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || templateCount > 0) {
                  toggleFolder(folder.id)
                }
              }}
              className="w-3 h-3 mr-1 flex items-center justify-center"
            >
              {hasChildren || templateCount > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-2 h-2 text-gray-500" />
                ) : (
                  <ChevronRight className="w-2 h-2 text-gray-500" />
                )
              ) : (
                <div className="w-2 h-2" />
              )}
            </button>
            <Folder className="w-3 h-3 mr-1.5 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate text-xs">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">{templateCount}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child: any) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 max-w-full overflow-hidden">
      {/* アクションボタン */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs"
        >
          戻る
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs text-gray-600">
            <FileText className="w-3 h-3 mr-1" />
            選択済み: {selectedTemplateId ? '1件' : '0件'}
          </div>
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            次へ
          </button>
        </div>
      </div>
      
      <label className="block text-xs font-medium text-gray-700 mb-3">送信するテンプレートを選択</label>
      
      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-12 gap-3 h-[400px]">
        {/* 左カラム: フォルダツリー */}
        <div className="col-span-4">
          <div className="bg-white rounded-md border border-gray-200 h-full flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 text-sm">フォルダ</h4>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
              <div className="space-y-1">
                {/* すべてのテンプレート */}
                <div 
                  className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedFolder(null)}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1" />
                    <Folder className="w-3 h-3 mr-1.5 text-green-500" />
                    <span className="font-medium text-xs">すべて</span>
                  </div>
                  <span className="text-xs text-gray-500">{templates.length}</span>
                </div>

                {/* 未分類テンプレート */}
                <div 
                  className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => setSelectedFolder('null')}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 mr-1" />
                    <FolderOpen className="w-3 h-3 mr-1.5 text-gray-500" />
                    <span className="font-medium text-xs">未分類</span>
                  </div>
                  <span className="text-xs text-gray-500">{templates.filter(t => !t.folderId).length}</span>
                </div>

                {/* フォルダツリー */}
                {rootFolders.map(folder => renderFolder(folder))}
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム: テンプレート表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-md border border-gray-200 h-full flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 text-sm">
                  {selectedFolder === null ? 'すべてのテンプレート' : 
                   selectedFolder === 'null' ? '未分類のテンプレート' :
                   templateFolders.find(f => f.id === selectedFolder)?.name || 'テンプレート'}
                </h4>
                {/* 検索 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="テンプレートを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs w-40"
                  />
                </div>
              </div>
            </div>
            <div 
              className="flex-1 overflow-y-scroll overflow-x-hidden p-3" 
              style={{ 
                height: '340px', 
                maxHeight: '340px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium mb-1">テンプレートが見つかりません</p>
                  <p className="text-xs">別のフォルダを選択するか検索条件を変更してください</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => {
                    const messageData = template.lineMessageJson ? JSON.parse(template.lineMessageJson) : null
                    const isSelected = selectedTemplateId === template.id
                    
                    return (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-md cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => onChange(template.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <h5 className="text-xs font-medium text-gray-900 truncate">{template.name}</h5>
                              <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                                template.type === 'FLEX' ? 'bg-purple-100 text-purple-800' :
                                template.type === 'IMAGE' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {template.type === 'TEXT' ? 'テキスト' :
                                 template.type === 'FLEX' ? 'Flex' :
                                 template.type === 'IMAGE' ? '画像' : 'パック'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {messageData?.type === 'text' 
                                ? messageData.text?.substring(0, 60) + (messageData.text?.length > 60 ? '...' : '')
                                : messageData?.altText || template.content?.substring(0, 60) + (template.content?.length > 60 ? '...' : '')
                              }
                            </p>
                            <div className="text-xs text-gray-500 mt-1">
                              作成: {template.createdAt.toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// アクション設定コンポーネント
function ActionConfiguration({
  actions,
  templates,
  tags,
  tagFolders,
  statuses,
  selectedTemplateId,
  onChange,
  onBack,
  onNext,
  isNextDisabled
}: {
  actions: BroadcastAction[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  selectedTemplateId: string
  onChange: (actions: BroadcastAction[]) => void
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
}) {
  const [showAddAction, setShowAddAction] = useState(false)

  const actionTypes = [
    { 
      id: 'ADD_TAG', 
      label: 'タグを追加', 
      description: 'ユーザーに特定のタグを付与します',
      icon: '⚡',
      color: 'bg-blue-100 text-blue-800',
      iconComponent: Zap
    },
    { 
      id: 'REMOVE_TAG', 
      label: 'タグを削除', 
      description: 'ユーザーから特定のタグを削除します',
      icon: '⚡',
      color: 'bg-red-100 text-red-800',
      iconComponent: Zap
    },
    { 
      id: 'CHANGE_STATUS', 
      label: 'ステータス変更', 
      description: 'ユーザーのステータスを変更します',
      icon: '⚡',
      color: 'bg-green-100 text-green-800',
      iconComponent: Zap
    },
    { 
      id: 'SEND_MESSAGE', 
      label: 'メッセージ送信', 
      description: '追加のメッセージを送信します',
      icon: '⚡',
      color: 'bg-purple-100 text-purple-800',
      iconComponent: Zap
    }
  ]

  const triggerTypes = [
    { 
      id: 'IMMEDIATE', 
      label: '即座に実行', 
      description: 'メッセージ送信直後に実行',
      icon: Zap
    },
    { 
      id: 'URL_CLICK', 
      label: 'URL クリック', 
      description: 'メッセージ内のURLがクリックされた場合',
      icon: ExternalLink
    },
    { 
      id: 'BUTTON_CLICK', 
      label: 'ボタン クリック', 
      description: 'メッセージ内のボタンがクリックされた場合',
      icon: MousePointer
    },
    { 
      id: 'TIME_DELAY', 
      label: '時間経過', 
      description: '指定時間が経過した場合',
      icon: Clock
    }
  ]

  const addAction = (actionData: Omit<BroadcastAction, 'id'>) => {
    const newAction: BroadcastAction = {
      ...actionData,
      id: Date.now().toString(),
      order: actions.length,
      isActive: true
    }
    onChange([...actions, newAction])
    setShowAddAction(false)
  }

  const updateAction = (actionId: string, updates: Partial<BroadcastAction>) => {
    onChange(actions.map(action => 
      action.id === actionId ? { ...action, ...updates } : action
    ))
  }

  const removeAction = (actionId: string) => {
    onChange(actions.filter(action => action.id !== actionId))
  }

  const moveAction = (fromIndex: number, toIndex: number) => {
    const newActions = [...actions]
    const [moved] = newActions.splice(fromIndex, 1)
    newActions.splice(toIndex, 0, moved)
    // 順序を更新
    newActions.forEach((action, index) => {
      action.order = index
    })
    onChange(newActions)
  }

  const duplicateAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId)
    if (action) {
      const duplicated = {
        ...action,
        id: Date.now().toString(),
        order: actions.length
      }
      onChange([...actions, duplicated])
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 max-w-full overflow-hidden">
      {/* アクションボタン */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs"
        >
          戻る
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs text-gray-600">
            <Settings className="w-3 h-3 mr-1" />
            アクション: {actions.length}件
          </div>
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            確認画面へ
          </button>
        </div>
      </div>
      
      <label className="block text-xs font-medium text-gray-700 mb-3">アクション設定</label>
      
      <div className="bg-white rounded-md border border-gray-200 min-h-[400px] flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 text-sm">
              メッセージ送信後の自動処理
            </h4>
            <button
              onClick={() => setShowAddAction(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-3 h-3 mr-1" />
              追加
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-3">
          {/* アクション一覧 */}
          {actions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">アクションが設定されていません</h4>
              <div className="text-xs text-gray-600 mb-4 space-y-1">
                <p>メッセージ送信後の自動処理を追加できます。例：</p>
                <p>• URLクリック → タグ追加</p>
                <p>• 30分待機 → フォローアップメッセージ送信</p>
                <p>• 条件分岐 → タグを持たない場合のみアクション実行</p>
              </div>
              <button
                onClick={() => setShowAddAction(true)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-3 h-3 mr-1" />
                最初のアクションを追加
              </button>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-80">
              {actions
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((action, index) => (
                  <div key={action.id}>
                    <ActionCard
                      action={action}
                      index={index}
                      actionTypes={actionTypes}
                      triggerTypes={triggerTypes}
                      templates={templates}
                      tags={tags}
                      tagFolders={tagFolders}
                      statuses={statuses}
                      onUpdate={(updates) => updateAction(action.id, updates)}
                      onRemove={() => removeAction(action.id)}
                      onDuplicate={() => duplicateAction(action.id)}
                      onMoveUp={() => index > 0 && moveAction(index, index - 1)}
                      onMoveDown={() => index < actions.length - 1 && moveAction(index, index + 1)}
                    />
                    {/* アクション間の流れを示す矢印 */}
                    {index < actions.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="absolute mt-3">
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      
      {/* アクション追加モーダル */}
      {showAddAction && (
        <AddActionModal
          actionTypes={actionTypes}
          triggerTypes={triggerTypes}
          templates={templates}
          tags={tags}
          tagFolders={tagFolders}
          statuses={statuses}
          selectedTemplateId={selectedTemplateId}
          onClose={() => setShowAddAction(false)}
          onAdd={addAction}
        />
      )}
    </div>
  )
}

// アクションカードコンポーネント
function ActionCard({
  action,
  index,
  actionTypes,
  triggerTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  onUpdate,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: {
  action: BroadcastAction
  index: number
  actionTypes: any[]
  triggerTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  onUpdate: (updates: Partial<BroadcastAction>) => void
  onRemove: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSubActionMenu, setShowSubActionMenu] = useState(false)
  const [showSubActionModal, setShowSubActionModal] = useState(false)
  const [subActionType, setSubActionType] = useState<'CONDITIONAL' | 'ACTION' | null>(null)
  const [editingSubActionId, setEditingSubActionId] = useState<string | null>(null)
  const [editingConditionType, setEditingConditionType] = useState<'then' | 'else' | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  
  const actionType = actionTypes.find(type => type.id === action.type)

  // Calculate menu position when showing
  useEffect(() => {
    if (showSubActionMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 192 // 192px = w-48
      })
    }
  }, [showSubActionMenu])

  // Close menu when clicking outside
  useEffect(() => {
    if (showSubActionMenu) {
      const handleClickOutside = (event: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          setShowSubActionMenu(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSubActionMenu])
  const triggerType = triggerTypes.find(type => type.id === action.trigger?.type)
  
  const getActionDetails = () => {
    if (!action.payload) return '未設定'
    
    switch (action.type) {
      case 'ADD_TAG':
      case 'REMOVE_TAG':
        const actionTags = action.payload.tagIds?.map(id => 
          tags.find(tag => tag.id === id)?.name
        ).filter(Boolean) || []
        return actionTags.length > 0 ? actionTags.join(', ') : '未設定'
      
      case 'CHANGE_STATUS':
        const status = statuses.find(s => s.id === action.payload?.statusId)
        return status ? status.label : '未設定'
      
      case 'SEND_MESSAGE':
        const template = templates.find(t => t.id === action.payload?.templateId)
        return template ? template.name : '未設定'
      
      
      default:
        return '設定が必要'
    }
  }


  const findTemplateContaining = (targetUrl?: string, buttonText?: string) => {
    if (!targetUrl && !buttonText) return null
    
    for (const template of templates) {
      try {
        if (template.lineMessageJson) {
          const messageJson = JSON.parse(template.lineMessageJson)
          
          // URLクリックの場合
          if (targetUrl && JSON.stringify(messageJson).includes(targetUrl)) {
            return template
          }
          
          // ボタンクリックの場合
          if (buttonText && JSON.stringify(messageJson).includes(buttonText)) {
            return template
          }
        }
      } catch (e) {
        // JSON解析エラーは無視
      }
    }
    return null
  }

  const getTriggerDetails = () => {
    if (!action.trigger || action.trigger.type === 'IMMEDIATE') return '即座に実行'
    
    switch (action.trigger.type) {
      case 'URL_CLICK':
        const urlTemplate = findTemplateContaining(action.trigger.condition?.targetUrl)
        const urlDisplay = action.trigger.condition?.targetUrl || '未設定'
        return urlTemplate 
          ? `URL: ${urlDisplay} (テンプレート: ${urlTemplate.name})`
          : `URL: ${urlDisplay}`
      case 'BUTTON_CLICK':
        const buttonTemplate = findTemplateContaining(undefined, action.trigger.condition?.buttonText)
        const buttonDisplay = action.trigger.condition?.buttonText || '未設定'
        return buttonTemplate
          ? `ボタン: ${buttonDisplay} (テンプレート: ${buttonTemplate.name})`
          : `ボタン: ${buttonDisplay}`
      case 'TIME_DELAY':
        const minutes = action.trigger.delayMinutes || 0
        let timeDisplay = ''
        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60)
          const remainingMinutes = minutes % 60
          timeDisplay = `${hours}時間${remainingMinutes > 0 ? `${remainingMinutes}分` : ''}後`
        } else {
          timeDisplay = `${minutes}分後`
        }
        
        return timeDisplay
      default:
        return triggerType?.label || '未設定'
    }
  }

  const IconComponent = actionType?.iconComponent || Settings

  const getActionModifiers = (action: BroadcastAction) => {
    const modifiers = []
    if (action.delayMinutes && action.delayMinutes > 0) {
      modifiers.push(`${action.delayMinutes}分待機`)
    }
    if (action.condition) {
      const conditionText = action.condition.type === 'HAS_TAG' ? '持っている場合' : '持っていない場合'
      modifiers.push(`条件: タグを${conditionText}`)
    }
    return modifiers
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 relative" style={{ zIndex: 1 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {index + 1}
            </div>
            <div className={`p-1.5 rounded-md ${actionType?.color || 'bg-gray-100 text-gray-800'}`}>
              <IconComponent className="w-3 h-3" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {actionType?.label || action.type}
              </h4>
              {!action.isActive && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  無効
                </span>
              )}
            </div>
            <div className="mt-1 space-y-1">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">トリガー:</span>
                <span className="text-xs text-gray-700 font-medium">
                  {getTriggerDetails()}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">アクション:</span>
                <span className="text-xs text-gray-700 font-medium">
                  {getActionDetails()}
                </span>
              </div>
              {/* 修飾子（待機・条件分岐）を表示 */}
              {getActionModifiers(action).length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">設定:</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {getActionModifiers(action).join(' + ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title={isExpanded ? '閉じる' : '詳細設定'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {/* サブアクション追加ボタン */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowSubActionMenu(!showSubActionMenu)}
              className="p-1 text-gray-400 hover:text-green-600 rounded"
              title="サブアクション追加"
            >
              <Plus className="w-4 h-4" />
            </button>
            
          </div>

          <button
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="複製"
          >
            <Copy className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:text-gray-300 rounded"
              title="上に移動"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={onMoveDown}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:text-gray-300 rounded"
              title="下に移動"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 詳細設定パネル */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <ActionDetailPanel
            action={action}
            actionTypes={actionTypes}
            triggerTypes={triggerTypes}
            templates={templates}
            tags={tags}
            tagFolders={tagFolders}
            statuses={statuses}
            onUpdate={onUpdate}
          />
        </div>
      )}

      {/* サブアクション表示 */}
      {action.subActions && action.subActions.length > 0 && (
        <div className="mt-3 pl-6 border-l-2 border-gray-200">
          <SubActionList 
            subActions={action.subActions}
            actionTypes={actionTypes}
            triggerTypes={triggerTypes}
            templates={templates}
            tags={tags}
            tagFolders={tagFolders}
            statuses={statuses}
            onUpdate={(subActions) => onUpdate({ subActions })}
            onEditSubAction={(subActionId, conditionType, actionType) => {
              setEditingSubActionId(subActionId)
              setEditingConditionType(conditionType)
              setShowSubActionModal(true)
              setSubActionType(actionType)
            }}
            onDeleteConditionalAction={(subActionId, conditionType, actionId) => {
              // Handle deletion of conditional actions
              const updatedSubActions = action.subActions?.map(sub => {
                if (sub.id === subActionId) {
                  if (conditionType === 'then') {
                    return {
                      ...sub,
                      thenActions: sub.thenActions?.filter(ta => ta.id !== actionId)
                    }
                  } else {
                    return {
                      ...sub,
                      elseActions: sub.elseActions?.filter(ea => ea.id !== actionId)
                    }
                  }
                }
                return sub
              })
              onUpdate({ subActions: updatedSubActions })
            }}
            selectedTemplateId={action.payload?.templateId}
          />
        </div>
      )}

      {/* サブアクション追加モーダル */}
      {showSubActionModal && subActionType && (
        <SubActionModal
          type={subActionType}
          actionTypes={actionTypes}
          templates={templates}
          tags={tags}
          tagFolders={tagFolders}
          statuses={statuses}
          editingSubActionId={editingSubActionId || undefined}
          editingConditionType={editingConditionType || undefined}
          onClose={() => {
            setShowSubActionModal(false)
            setSubActionType(null)
            setEditingSubActionId(null)
            setEditingConditionType(null)
          }}
          onAdd={(subAction, editingSubActionId, editingConditionType) => {
            if (editingSubActionId && editingConditionType) {
              // Adding action to conditional branch
              const currentSubActions = action.subActions || []
              const updatedSubActions = currentSubActions.map(sub => {
                if (sub.id === editingSubActionId && sub.type === 'CONDITIONAL') {
                  const newAction = subAction.action!
                  if (editingConditionType === 'then') {
                    return {
                      ...sub,
                      thenActions: [...(sub.thenActions || []), newAction]
                    }
                  } else {
                    return {
                      ...sub,
                      elseActions: [...(sub.elseActions || []), newAction]
                    }
                  }
                }
                return sub
              })
              onUpdate({ subActions: updatedSubActions })
            } else {
              // Adding regular sub-action
              const currentSubActions = action.subActions || []
              onUpdate({ subActions: [...currentSubActions, subAction] })
            }
            setShowSubActionModal(false)
            setSubActionType(null)
            setEditingSubActionId(null)
            setEditingConditionType(null)
          }}
        />
      )}

      {/* Portal メニュー */}
      {showSubActionMenu && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-xl z-[10000]"
          style={{
            top: menuPosition.top,
            left: menuPosition.left
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                setSubActionType('CONDITIONAL')
                setShowSubActionModal(true)
                setShowSubActionMenu(false)
              }}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <GitBranch className="w-4 h-4 mr-2 text-purple-500" />
              条件分岐を追加
            </button>
            <button
              onClick={() => {
                setSubActionType('ACTION')
                setShowSubActionModal(true)
                setShowSubActionMenu(false)
              }}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Zap className="w-4 h-4 mr-2 text-blue-500" />
              アクションを追加
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// アクション詳細設定パネル
function ActionDetailPanel({
  action,
  actionTypes,
  triggerTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  onUpdate
}: {
  action: BroadcastAction
  actionTypes: any[]
  triggerTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  onUpdate: (updates: Partial<BroadcastAction>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* 実行タイミング設定 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">実行タイミング</label>
          <select
            value={action.trigger?.type || 'IMMEDIATE'}
            onChange={(e) => onUpdate({
              trigger: { ...action.trigger, type: e.target.value as any }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {triggerTypes.map(trigger => (
              <option key={trigger.id} value={trigger.id}>
                {trigger.label}
              </option>
            ))}
          </select>
        </div>

        {/* アクティブ/非アクティブ */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">状態</label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={action.isActive !== false}
              onChange={(e) => onUpdate({ isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-xs text-gray-700">アクティブ</span>
          </label>
        </div>
      </div>

      {/* アクション固有の設定 */}
      {action.type === 'ADD_TAG' || action.type === 'REMOVE_TAG' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">対象タグ</label>
          <TagSelector
            tags={tags}
            tagFolders={tagFolders}
            selectedTagIds={action.payload?.tagIds || []}
            onChange={(tagIds) => onUpdate({
              payload: { ...action.payload, tagIds }
            })}
            multiple={true}
          />
        </div>
      ) : action.type === 'CHANGE_STATUS' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">変更先ステータス</label>
          <StatusSelector
            statuses={statuses}
            selectedStatusId={action.payload?.statusId || ''}
            onChange={(statusId) => onUpdate({
              payload: { ...action.payload, statusId }
            })}
          />
        </div>
      ) : action.type === 'SEND_MESSAGE' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">送信テンプレート</label>
          <select
            value={action.payload?.templateId || ''}
            onChange={(e) => onUpdate({
              payload: { ...action.payload, templateId: e.target.value }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      ) : action.type === 'WAIT' ? (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">待機時間（分）</label>
          <input
            type="number"
            min="1"
            value={action.payload?.waitMinutes || ''}
            onChange={(e) => onUpdate({
              payload: { ...action.payload, waitMinutes: parseInt(e.target.value) || 0 }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="待機する分数を入力"
          />
        </div>
      ) : null}

      {/* トリガー固有の設定 */}
      {action.trigger?.type === 'URL_CLICK' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">対象URL</label>
          <input
            type="url"
            value={action.trigger?.condition?.targetUrl || ''}
            onChange={(e) => onUpdate({
              trigger: {
                type: 'URL_CLICK',
                ...action.trigger,
                condition: { operator: 'equals', ...action.trigger?.condition, targetUrl: e.target.value }
              }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>
      )}

      {action.trigger?.type === 'BUTTON_CLICK' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">ボタンテキスト</label>
          <input
            type="text"
            value={action.trigger?.condition?.buttonText || ''}
            onChange={(e) => onUpdate({
              trigger: {
                type: 'BUTTON_CLICK',
                ...action.trigger,
                condition: { operator: 'equals', ...action.trigger?.condition, buttonText: e.target.value }
              }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="詳細を見る"
          />
        </div>
      )}

      {action.trigger?.type === 'TIME_DELAY' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">遅延時間（分）</label>
          <input
            type="number"
            min="0"
            value={action.trigger?.delayMinutes || ''}
            onChange={(e) => onUpdate({
              trigger: {
                type: 'URL_CLICK',
                ...action.trigger,
                delayMinutes: parseInt(e.target.value) || 0
              }
            })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      )}
    </div>
  )
}

// アクション追加モーダル
function AddActionModal({
  actionTypes,
  triggerTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  selectedTemplateId,
  onClose,
  onAdd
}: {
  actionTypes: any[]
  triggerTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  selectedTemplateId: string
  onClose: () => void
  onAdd: (action: Omit<BroadcastAction, 'id'>) => void
}) {
  const [selectedActionType, setSelectedActionType] = useState('')
  const [selectedTriggerType, setSelectedTriggerType] = useState('IMMEDIATE')
  const [selectedUrl, setSelectedUrl] = useState('')
  const [selectedButton, setSelectedButton] = useState('')
  const [delayMinutes, setDelayMinutes] = useState<number>(0)
  const [actionConfig, setActionConfig] = useState<any>({})

  // 選択されているテンプレートからURLを抽出する関数
  const extractUrlsFromSelectedTemplate = () => {
    const urls: { url: string; templateName: string; templateId: string }[] = []
    
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
    if (!selectedTemplate || !selectedTemplate.lineMessageJson) {
      return urls
    }

    try {
      const messageJson = JSON.parse(selectedTemplate.lineMessageJson)
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
      extractUrls(messageJson, selectedTemplate.name, selectedTemplate.id)
    } catch (e) {
      // JSON解析エラーは無視
    }
    
    return urls
  }

  // 選択されているテンプレートからボタンテキストを抽出する関数
  const extractButtonsFromSelectedTemplate = () => {
    const buttons: { text: string; templateName: string; templateId: string }[] = []
    
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)
    if (!selectedTemplate || !selectedTemplate.lineMessageJson) {
      return buttons
    }

    try {
      const messageJson = JSON.parse(selectedTemplate.lineMessageJson)
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
      extractButtons(messageJson, selectedTemplate.name, selectedTemplate.id)
    } catch (e) {
      // JSON解析エラーは無視
    }
    
    return buttons
  }


  const handleAdd = () => {
    if (!selectedActionType) return

    const triggerData: any = {
      type: selectedTriggerType as any
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

    const finalActionConfig = { ...actionConfig }

    onAdd({
      type: selectedActionType as any,
      trigger: triggerData,
      payload: finalActionConfig,
      isActive: true
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                      setSelectedTriggerType(triggerType.id)
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
                      選択中のテンプレート「{templates.find(t => t.id === selectedTemplateId)?.name || '不明'}」内のURLから選択してください
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

          {/* ボタン選択 */}
          {selectedTriggerType === 'BUTTON_CLICK' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <MousePointer className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">ボタンクリック設定</h4>
                    <p className="text-xs text-green-800">
                      選択中のテンプレート「{templates.find(t => t.id === selectedTemplateId)?.name || '不明'}」内のボタンから選択してください
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

          {/* アクションタイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">実行するアクション</label>
            <div className="grid grid-cols-2 gap-3">
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
                  <TagSelector
                    tags={tags}
                    tagFolders={tagFolders}
                    selectedTagIds={actionConfig.tagIds || []}
                    onChange={(tagIds) => setActionConfig({...actionConfig, tagIds})}
                    multiple={true}
                  />
                </div>
              )}

              {/* ステータス変更の設定 */}
              {selectedActionType === 'CHANGE_STATUS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">変更先ステータス</label>
                  <StatusSelector
                    statuses={statuses}
                    selectedStatusId={actionConfig.statusId || ''}
                    onChange={(statusId) => setActionConfig({...actionConfig, statusId})}
                  />
                </div>
              )}

              {/* メッセージ送信の設定 */}
              {selectedActionType === 'SEND_MESSAGE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">送信テンプレート</label>
                  <select
                    value={actionConfig.templateId || ''}
                    onChange={(e) => setActionConfig({...actionConfig, templateId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">テンプレートを選択</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              )}

            </div>
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



// フォルダアイテムコンポーネント
function FolderItem({
  folder,
  level,
  broadcasts,
  expandedFolders,
  selectedFolder,
  onToggleFolder,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder
}: {
  folder: any
  level: number
  broadcasts: Broadcast[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: any) => void
  onDeleteFolder: (folderId: string) => void
}) {
  const broadcastCount = broadcasts.filter(broadcast => broadcast.folderId === folder.id).length
  const hasChildren = folder.children && folder.children.length > 0
  const isExpanded = expandedFolders.includes(folder.id)
  const isSelected = selectedFolder === folder.id

  return (
    <div className="mb-1">
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
          isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelectFolder(folder.id)}
      >
        <div className="flex items-center min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren || broadcastCount > 0) {
                onToggleFolder(folder.id)
              }
            }}
            className="w-4 h-4 mr-2 flex items-center justify-center"
          >
            {hasChildren || broadcastCount > 0 ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </button>
          <Folder className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium truncate">{folder.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{broadcastCount}</span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditFolder(folder)
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              title="編集"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`フォルダ「${folder.name}」を削除しますか？`)) {
                  onDeleteFolder(folder.id)
                }
              }}
              className="text-gray-400 hover:text-red-600 p-1 rounded"
              title="削除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child: any) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              broadcasts={broadcasts}
              expandedFolders={expandedFolders}
              selectedFolder={selectedFolder}
              onToggleFolder={onToggleFolder}
              onSelectFolder={onSelectFolder}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}


// Placeholder components for missing components
function ScheduleSelection({ scheduleType, scheduledAt, onChange }: any) {
  const [scheduleDate, setScheduleDate] = useState<string>('')
  const [scheduleTime, setScheduleTime] = useState<string>('')

  // Initialize date/time inputs when component mounts or scheduledAt changes
  useEffect(() => {
    if (scheduledAt) {
      const date = new Date(scheduledAt)
      setScheduleDate(date.toISOString().split('T')[0])
      setScheduleTime(date.toTimeString().slice(0, 5))
    } else {
      // Set default to current date/time + 1 hour
      const now = new Date()
      now.setHours(now.getHours() + 1)
      setScheduleDate(now.toISOString().split('T')[0])
      setScheduleTime(now.toTimeString().slice(0, 5))
    }
  }, [scheduledAt])

  const handleScheduleTypeChange = (type: 'immediate' | 'scheduled') => {
    if (type === 'immediate') {
      onChange('immediate', undefined)
    } else {
      // Create date from current date/time inputs
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      onChange('scheduled', dateTime)
    }
  }

  const handleDateTimeChange = () => {
    if (scheduleDate && scheduleTime) {
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      onChange('scheduled', dateTime)
    }
  }

  const minDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const minTime = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    if (scheduleDate === today) {
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '00:00'
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信スケジュール</h3>
      <div className="space-y-4">
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={scheduleType === "immediate"}
              onChange={() => handleScheduleTypeChange("immediate")}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">すぐに送信</span>
          </label>
        </div>
        <div className="space-y-3">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={scheduleType === "scheduled"}
              onChange={() => handleScheduleTypeChange("scheduled")}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">スケジュール送信</span>
          </label>
          
          {scheduleType === "scheduled" && (
            <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配信日
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    min={minDateTime()}
                    onChange={(e) => {
                      setScheduleDate(e.target.value)
                      if (e.target.value && scheduleTime) {
                        setTimeout(handleDateTimeChange, 0)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配信時刻
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    min={minTime()}
                    onChange={(e) => {
                      setScheduleTime(e.target.value)
                      if (scheduleDate && e.target.value) {
                        setTimeout(handleDateTimeChange, 0)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {scheduledAt && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-700">
                      配信予定: {new Date(scheduledAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        weekday: 'short'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmationStep({ broadcastData, userCount, segments, templates, onChange }: any) {
  const selectedTemplate = templates.find((t: any) => t.id === broadcastData.templateId)
  const selectedSegment = segments.find((s: any) => s.id === broadcastData.segmentId)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信内容確認</h3>
      
      {/* 配信概要 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-900">配信概要</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">配信先:</span>
            <span className="ml-2 font-medium">{selectedSegment?.name || '全体'}</span>
          </div>
          <div>
            <span className="text-gray-500">対象者数:</span>
            <span className="ml-2 font-medium">{userCount.toLocaleString()}人</span>
          </div>
          <div>
            <span className="text-gray-500">テンプレート:</span>
            <span className="ml-2 font-medium">{selectedTemplate?.name || '未選択'}</span>
          </div>
          <div>
            <span className="text-gray-500">配信方法:</span>
            <span className="ml-2 font-medium">
              {broadcastData.scheduleType === 'immediate' ? 'すぐに送信' : 'スケジュール送信'}
            </span>
          </div>
        </div>
        
        {/* スケジュール送信の場合の詳細 */}
        {broadcastData.scheduleType === 'scheduled' && broadcastData.scheduledAt && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700 font-medium">
                配信予定: {new Date(broadcastData.scheduledAt).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  weekday: 'short'
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配信タイトル</label>
          <input
            type="text"
            value={broadcastData.title}
            onChange={(e) => onChange(e.target.value, broadcastData.description)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="配信タイトルを入力"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
          <textarea
            value={broadcastData.description}
            onChange={(e) => onChange(broadcastData.title, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="配信の説明を入力"
          />
        </div>
      </div>
    </div>
  )
}

function SegmentSelector({ selectedSegmentId, segments, segmentFolders, onChange, onBack, onNext, isNextDisabled, userCount }: any) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: any[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(segmentFolders || [])

  // フィルタリング
  const filteredSegments = segments.filter((segment: Segment) => {
    const matchesSearch = segment.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !segment.folderId
    } else if (selectedFolder) {
      matchesFolder = segment.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const getSegmentCount = (folderId: string): number => {
    return segments.filter((segment: Segment) => segment.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const segmentCount = getSegmentCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${8 + level * 12}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || segmentCount > 0) {
                  toggleFolder(folder.id)
                }
              }}
              className="w-3 h-3 mr-1 flex items-center justify-center"
            >
              {hasChildren || segmentCount > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-2 h-2 text-gray-500" />
                ) : (
                  <ChevronRight className="w-2 h-2 text-gray-500" />
                )
              ) : (
                <div className="w-2 h-2" />
              )}
            </button>
            <Folder className="w-3 h-3 mr-1.5 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate text-xs">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">{segmentCount}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child: any) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="bg-gray-50 rounded-lg p-3 max-w-full overflow-hidden">
        <label className="block text-xs font-medium text-gray-700 mb-3">セグメントを選択</label>
        
        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-12 gap-3 h-[400px]">
          {/* 左カラム: フォルダツリー */}
          <div className="col-span-4">
            <div className="bg-white rounded-md border border-gray-200 h-full flex flex-col min-h-0">
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900 text-sm">フォルダ</h4>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
                <div className="space-y-1">
                  {/* すべてのセグメント */}
                  <div 
                    className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => setSelectedFolder(null)}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-1" />
                      <Folder className="w-3 h-3 mr-1.5 text-green-500" />
                      <span className="font-medium text-xs">すべて</span>
                    </div>
                    <span className="text-xs text-gray-500">{segments.length}</span>
                  </div>

                  {/* 未分類セグメント */}
                  <div 
                    className={`group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => setSelectedFolder('null')}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-1" />
                      <FolderOpen className="w-3 h-3 mr-1.5 text-gray-500" />
                      <span className="font-medium text-xs">未分類</span>
                    </div>
                    <span className="text-xs text-gray-500">{segments.filter((s: Segment) => !s.folderId).length}</span>
                  </div>

                  {/* フォルダツリー */}
                  {rootFolders.map(folder => renderFolder(folder))}
                </div>
              </div>
            </div>
          </div>

          {/* 右カラム: セグメント表示 */}
          <div className="col-span-8">
            <div className="bg-white rounded-md border border-gray-200 h-full flex flex-col min-h-0">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {selectedFolder === null ? 'すべてのセグメント' : 
                     selectedFolder === 'null' ? '未分類のセグメント' :
                     segmentFolders?.find((f: SegmentFolder) => f.id === selectedFolder)?.name || 'セグメント'}
                  </h4>
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                    <input
                      type="text"
                      placeholder="セグメントを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs w-40"
                    />
                  </div>
                </div>
              </div>
              <div 
                className="flex-1 overflow-y-scroll overflow-x-hidden p-3" 
                style={{ 
                  height: '340px', 
                  maxHeight: '340px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {filteredSegments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium mb-1">セグメントが見つかりません</p>
                    <p className="text-xs">別のフォルダを選択するか検索条件を変更してください</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSegments.map((segment: any) => {
                      const isSelected = selectedSegmentId === segment.id
                      
                      return (
                        <div
                          key={segment.id}
                          className={`p-3 border rounded-md cursor-pointer transition-all hover:shadow-sm ${
                            isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => onChange(segment.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <h5 className="text-xs font-medium text-gray-900 truncate">{segment.name}</h5>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {segment.memo || 'セグメントの説明がありません'}
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                作成: {new Date(segment.createdAt).toLocaleDateString('ja-JP')}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {userCount > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            対象ユーザー: {userCount}名
          </div>
        )}
      </div>
    </div>
  )
}

// サブアクション一覧コンポーネント
function SubActionList({
  subActions,
  actionTypes,
  triggerTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  onUpdate,
  onEditSubAction,
  onDeleteConditionalAction,
  selectedTemplateId
}: {
  subActions: SubAction[]
  actionTypes: any[]
  triggerTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  onUpdate: (subActions: SubAction[]) => void
  onEditSubAction?: (subActionId: string, conditionType: 'then' | 'else', actionType: 'CONDITIONAL' | 'ACTION') => void
  onDeleteConditionalAction?: (subActionId: string, conditionType: 'then' | 'else', actionId: string) => void
  selectedTemplateId?: string
}) {
  const removeSubAction = (id: string) => {
    onUpdate(subActions.filter(sa => sa.id !== id))
  }

  const updateSubAction = (id: string, updates: Partial<SubAction>) => {
    onUpdate(subActions.map(sa => sa.id === id ? { ...sa, ...updates } : sa))
  }

  return (
    <div className="space-y-3">
      {subActions.map((subAction, index) => (
        <div key={subAction.id} className="relative">
          {/* 接続線 */}
          <div className="absolute -left-6 top-3 w-4 h-px bg-gray-300"></div>
          
          <SubActionCard
            subAction={subAction}
            index={index}
            actionTypes={actionTypes}
            triggerTypes={triggerTypes}
            templates={templates}
            tags={tags}
            tagFolders={tagFolders}
            statuses={statuses}
            onUpdate={(updates) => updateSubAction(subAction.id, updates)}
            onRemove={() => removeSubAction(subAction.id)}
            onEditSubAction={onEditSubAction}
            onDeleteConditionalAction={onDeleteConditionalAction}
            selectedTemplateId={selectedTemplateId}
          />
        </div>
      ))}
    </div>
  )
}

// サブアクションカードコンポーネント
function SubActionCard({
  subAction,
  index,
  actionTypes,
  triggerTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  onUpdate,
  onRemove,
  onEditSubAction,
  onDeleteConditionalAction,
  selectedTemplateId
}: {
  subAction: SubAction
  index: number
  actionTypes: any[]
  triggerTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  onUpdate: (updates: Partial<SubAction>) => void
  onRemove: () => void
  onEditSubAction?: (subActionId: string, conditionType: 'then' | 'else', actionType: 'CONDITIONAL' | 'ACTION') => void
  onDeleteConditionalAction?: (subActionId: string, conditionType: 'then' | 'else', actionId: string) => void
  selectedTemplateId?: string
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
        const conditionText = subAction.condition?.type === 'has' ? '持っている場合' : '持っていない場合'
        return `${delayText}条件分岐: タグを${conditionText}`
      case 'ACTION':
        const actionLabel = subAction.action?.type ? actionTypes.find(t => t.id === subAction.action?.type)?.label : 'アクション'
        return `${delayText}${actionLabel}`
      default:
        return 'サブアクション'
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex items-center space-x-2">
            {getSubActionIcon()}
            <span className="text-sm font-medium text-gray-900">
              {getSubActionTitle()}
            </span>
          </div>
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
                onClick={() => {
                  onEditSubAction?.(subAction.id, 'then', 'ACTION')
                }}
                className="text-xs text-green-600 hover:text-green-800 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                アクション追加
              </button>
            </div>
            {subAction.thenActions && subAction.thenActions.length > 0 ? (
              subAction.thenActions.map((action, idx) => (
                <ActionCard
                  key={`then-${idx}`}
                  action={action}
                  index={idx}
                  actionTypes={actionTypes}
                  triggerTypes={triggerTypes}
                  templates={templates}
                  tags={tags}
                  tagFolders={tagFolders}
                  statuses={statuses}
                  onUpdate={(updates) => {
                    // TODO: Implement updating conditional actions
                    console.log('Update action:', updates)
                  }}
                  onRemove={() => {
                    onDeleteConditionalAction?.(subAction.id, 'then', action.id)
                  }}
                  onDuplicate={() => {
                    // TODO: Implement duplicating conditional actions
                    console.log('Duplicate action:', action)
                  }}
                  onMoveUp={() => {
                    // TODO: Implement moving conditional actions up
                    console.log('Move up action:', action)
                  }}
                  onMoveDown={() => {
                    // TODO: Implement moving conditional actions down
                    console.log('Move down action:', action)
                  }}
                />
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
                onClick={() => {
                  onEditSubAction?.(subAction.id, 'else', 'ACTION')
                }}
                className="text-xs text-red-600 hover:text-red-800 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                アクション追加
              </button>
            </div>
            {subAction.elseActions && subAction.elseActions.length > 0 ? (
              subAction.elseActions.map((action, idx) => (
                <ActionCard
                  key={`else-${idx}`}
                  action={action}
                  index={idx}
                  actionTypes={actionTypes}
                  triggerTypes={triggerTypes}
                  templates={templates}
                  tags={tags}
                  tagFolders={tagFolders}
                  statuses={statuses}
                  onUpdate={(updates) => {
                    // TODO: Implement updating conditional actions
                    console.log('Update action:', updates)
                  }}
                  onRemove={() => {
                    onDeleteConditionalAction?.(subAction.id, 'else', action.id)
                  }}
                  onDuplicate={() => {
                    // TODO: Implement duplicating conditional actions
                    console.log('Duplicate action:', action)
                  }}
                  onMoveUp={() => {
                    // TODO: Implement moving conditional actions up
                    console.log('Move up action:', action)
                  }}
                  onMoveDown={() => {
                    // TODO: Implement moving conditional actions down
                    console.log('Move down action:', action)
                  }}
                />
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

// サブアクション追加モーダル
function SubActionModal({
  type,
  actionTypes,
  templates,
  tags,
  tagFolders,
  statuses,
  onClose,
  onAdd,
  editingSubActionId,
  editingConditionType
}: {
  type: 'CONDITIONAL' | 'ACTION'
  actionTypes: any[]
  templates: Template[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  onClose: () => void
  onAdd: (subAction: SubAction, editingSubActionId?: string, editingConditionType?: 'then' | 'else') => void
  editingSubActionId?: string
  editingConditionType?: 'then' | 'else'
}) {
  const [delayMinutes, setDelayMinutes] = useState(0)
  const [conditionType, setConditionType] = useState<'has' | 'not_has'>('has')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [actionType, setActionType] = useState('')
  const [actionConfig, setActionConfig] = useState<any>({})

  const handleAdd = () => {
    const newSubAction: SubAction = {
      id: Date.now().toString(),
      type
    }

    switch (type) {
      case 'CONDITIONAL':
        newSubAction.condition = {
          type: conditionType,
          tagIds: selectedTagIds
        }
        newSubAction.delayMinutes = delayMinutes
        newSubAction.thenActions = []
        newSubAction.elseActions = []
        break
      case 'ACTION':
        newSubAction.action = {
          id: Date.now().toString(),
          type: actionType as any,
          payload: actionConfig,
          trigger: { type: 'IMMEDIATE' },
          isActive: true
        }
        newSubAction.delayMinutes = delayMinutes
        break
    }

    onAdd(newSubAction, editingSubActionId, editingConditionType)
  }

  const getModalTitle = () => {
    switch (type) {
      case 'CONDITIONAL':
        return '条件分岐設定'
      case 'ACTION':
        return 'アクション設定'
      default:
        return 'サブアクション設定'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{getModalTitle()}</h3>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* 共通の待機時間設定 */}
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

          {type === 'CONDITIONAL' && (
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
                <TagSelector
                  tags={tags}
                  tagFolders={tagFolders}
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                  multiple={true}
                />
              </div>
            </>
          )}

          {type === 'ACTION' && (
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
                  <TagSelector
                    tags={tags}
                    tagFolders={tagFolders}
                    selectedTagIds={actionConfig.tagIds || []}
                    onChange={(tagIds) => setActionConfig({ ...actionConfig, tagIds })}
                    multiple={true}
                  />
                </div>
              ) : actionType === 'SEND_MESSAGE' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">送信テンプレート</label>
                  <select
                    value={actionConfig.templateId || ''}
                    onChange={(e) => setActionConfig({ ...actionConfig, templateId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">選択してください</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              ) : actionType === 'CHANGE_STATUS' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">変更先ステータス</label>
                  <StatusSelector
                    statuses={statuses}
                    selectedStatusId={actionConfig.statusId || ''}
                    onChange={(statusId) => setActionConfig({ ...actionConfig, statusId })}
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
              (type === 'CONDITIONAL' && selectedTagIds.length === 0) ||
              (type === 'ACTION' && !actionType) ||
              (type === 'ACTION' && actionType === 'ADD_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0)) ||
              (type === 'ACTION' && actionType === 'REMOVE_TAG' && (!actionConfig.tagIds || actionConfig.tagIds.length === 0)) ||
              (type === 'ACTION' && actionType === 'SEND_MESSAGE' && !actionConfig.templateId) ||
              (type === 'ACTION' && actionType === 'CHANGE_STATUS' && !actionConfig.statusId)
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

