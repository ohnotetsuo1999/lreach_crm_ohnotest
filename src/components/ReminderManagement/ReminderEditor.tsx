'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  ReservationReminder, 
  ReminderTemplate,
  Template, 
  TemplateFolder,
  Tag, 
  TagFolder,
  Status,
  ReminderConfiguration,
  ReminderTimingConfig,
  ReminderEventSettings,
  ReminderTriggerCondition,
  ReminderFolder,
  BroadcastAction,
  User
} from '@/types'
import { 
  Save, ArrowLeft, Plus, Clock, Calendar, Bell, 
  Search, Folder, FolderOpen, ChevronRight, ChevronDown, 
  MessageSquare, Trash2, Eye, ArrowUp, ArrowDown,
  Settings, ChevronUp
} from 'lucide-react'

interface ReminderEditorProps {
  reminder: ReservationReminder | null
  templates: Template[]
  templateFolders: TemplateFolder[]
  reminderFolders: ReminderFolder[]
  tags: Tag[]
  tagFolders: TagFolder[]
  statuses: Status[]
  users: User[]
  onSave: (reminder: ReservationReminder) => void
  onBack: () => void
  onCreateTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ReminderEditor({
  reminder,
  templates,
  templateFolders,
  reminderFolders,
  tags,
  tagFolders,
  statuses,
  users,
  onSave,
  onBack,
  onCreateTemplate
}: ReminderEditorProps) {
  // Basic reminder data
  const [reminderData, setReminderData] = useState({
    name: reminder?.name || '',
    description: reminder?.description || '',
    isActive: reminder?.isActive || false,
    folderId: reminder?.folderId || undefined,
    reminderType: (reminder?.reminderType || 'reservation') as 'reservation' | 'user_field' | 'custom_date',
    reminderSettings: reminder?.reminderSettings || {
      type: 'reservation' as 'reservation' | 'user_field' | 'custom_date',
      offsetValue: 1,
      offsetUnit: 'days' as 'minutes' | 'hours' | 'days',
      offsetDirection: 'before' as 'before' | 'after'
    },
    eventSettings: reminder?.eventSettings || {
      eventType: 'reservation' as 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom',
      eventName: '',
      customField: '',
      triggerConditions: []
    }
  })
  
  // Template management
  const [reminderTemplates, setReminderTemplates] = useState<ReminderTemplate[]>(reminder?.templates || [])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTimingTemplateId, setEditingTimingTemplateId] = useState<string | null>(null)
  
  // UI state
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())

  const handleSave = () => {
    if (!reminderData.name.trim()) {
      alert('リマインダー名を入力してください')
      return
    }

    if (reminderTemplates.length === 0) {
      alert('少なくとも1つのテンプレートを追加してください')
      return
    }

    const savedReminder: ReservationReminder = {
      id: reminder?.id || `reminder_${Date.now()}`,
      name: reminderData.name,
      description: reminderData.description,
      folderId: reminderData.folderId,
      isActive: reminderData.isActive,
      reminderType: reminderData.reminderType,
      reminderSettings: reminderData.reminderSettings,
      eventSettings: reminderData.eventSettings,
      templates: reminderTemplates,
      createdAt: reminder?.createdAt || new Date(),
      updatedAt: new Date()
    }

    onSave(savedReminder)
  }

  const updateTemplateTimingConfig = (templateId: string, field: string, value: any) => {
    setReminderTemplates(reminderTemplates.map(template => {
      if (template.id === templateId) {
        const currentConfig = template.timingConfig || {
          delayValue: 1,
          delayUnit: 'days' as 'minutes' | 'hours' | 'days',
          delayDirection: 'before' as 'before' | 'after'
        }
        
        const updatedConfig = { ...currentConfig, [field]: value }
        
        return {
          ...template,
          timingConfig: updatedConfig
        }
      }
      return template
    }))
  }

  const removeTemplate = (templateId: string) => {
    const updatedTemplates = reminderTemplates
      .filter(template => template.id !== templateId)
      .map((template, index) => ({
        ...template,
        order: index
      }))
    setReminderTemplates(updatedTemplates)
  }

  const moveTemplate = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= reminderTemplates.length) return
    
    const updatedTemplates = [...reminderTemplates]
    const [movedTemplate] = updatedTemplates.splice(fromIndex, 1)
    updatedTemplates.splice(toIndex, 0, movedTemplate)
    
    // Update order
    const reorderedTemplates = updatedTemplates.map((template, index) => ({
      ...template,
      order: index
    }))
    
    setReminderTemplates(reorderedTemplates)
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

  // Template Selection Modal
  function TemplateSelectionModal() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    const buildTemplateFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): any[] => {
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

    const renderFolder = (folder: any, level: number = 0) => (
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
        {expandedFolders.has(folder.id) && folder.children.map((child: any) => renderFolder(child, level + 1))}
      </div>
    )

    const addTemplate = (template: Template) => {
      const newReminderTemplate: ReminderTemplate = {
        id: `reminder_template_${Date.now()}`,
        templateId: template.id,
        template,
        order: reminderTemplates.length,
        timingConfig: {
          delayValue: reminderTemplates.length === 0 ? 1 : 1,
          delayUnit: 'days' as 'minutes' | 'hours' | 'days',
          delayDirection: 'before' as 'before' | 'after'
        },
        actions: []
      }
      setReminderTemplates([...reminderTemplates, newReminderTemplate])
      setShowTemplateModal(false)
    }

    const folderHierarchy = buildTemplateFolderHierarchy(templateFolders || [])
    const uncategorizedTemplates = getTemplatesInFolder(null)
    const filteredTemplates = getFilteredTemplates()

    return createPortal(
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => addTemplate(template)}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">{template.name}</h3>
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
                          </div>
                          <div className="ml-4">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                              追加
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">テンプレートが見つかりません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // Template Timing Modal
  function TemplateTimingModal() {
    const template = reminderTemplates.find(t => t.id === editingTimingTemplateId)
    if (!template) return null

    const timingConfig = template.timingConfig

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">リマインダー設定</h3>
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
                予約からの時間
              </label>
              <div className="grid gap-3 grid-cols-3">
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
                <div>
                  <label className="block text-xs text-gray-500 mb-1">方向</label>
                  <select
                    value={timingConfig.delayDirection}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayDirection', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="before">前</option>
                    <option value="after">後</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800">
                  最大7日間（10080分）まで設定可能です
                </p>
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

  const isComplete = reminderData.name.trim() && reminderTemplates.length > 0

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
              {reminder ? 'リマインダー編集' : '新規リマインダー作成'}
            </h1>
            <p className="text-sm text-gray-600">
              予約に基づく自動リマインダーを設定
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
              リマインダー名 *
            </label>
            <input
              type="text"
              value={reminderData.name}
              onChange={(e) => setReminderData({ ...reminderData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 予約前日リマインダー"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明
            </label>
            <input
              type="text"
              value={reminderData.description || ''}
              onChange={(e) => setReminderData({ ...reminderData, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="リマインダーの説明"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フォルダ
            </label>
            <select
              value={reminderData.folderId || ''}
              onChange={(e) => setReminderData({ ...reminderData, folderId: e.target.value || undefined })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">フォルダを選択（任意）</option>
              {reminderFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={reminderData.isActive}
                onChange={(e) => setReminderData({ ...reminderData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                作成後すぐにアクティブにする
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              アクティブなリマインダーは条件に応じて自動実行されます
            </p>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">リマインダー設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">リマインダータイプ</label>
            <select
              value={reminderData.reminderType}
              onChange={(e) => setReminderData({
                ...reminderData,
                reminderType: e.target.value as 'reservation' | 'user_field' | 'custom_date'
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="reservation">予約日時基準</option>
              <option value="user_field">ユーザー日付フィールド基準</option>
              <option value="custom_date">カスタム日付基準</option>
            </select>
          </div>

          {reminderData.reminderType === 'user_field' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ユーザー日付フィールド</label>
              <select
                value={reminderData.reminderSettings.userDateField || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  reminderSettings: {
                    ...reminderData.reminderSettings,
                    userDateField: e.target.value
                  }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">フィールドを選択</option>
                <option value="birthday">誕生日</option>
                <option value="anniversary">記念日</option>
                <option value="contractExpiry">契約期限</option>
                <option value="subscriptionRenewal">サブスク更新日</option>
                <option value="lastPurchaseDate">最終購入日</option>
                <option value="customDate1">カスタム日付1</option>
                <option value="customDate2">カスタム日付2</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Event Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">イベント設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">イベントタイプ</label>
            <select
              value={reminderData.eventSettings.eventType}
              onChange={(e) => setReminderData({
                ...reminderData,
                eventSettings: {
                  ...reminderData.eventSettings,
                  eventType: e.target.value as 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
                }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="reservation">予約</option>
              <option value="birthday">誕生日</option>
              <option value="anniversary">記念日</option>
              <option value="contract_expiry">契約期限</option>
              <option value="custom">カスタム</option>
            </select>
          </div>

          {reminderData.eventSettings.eventType !== 'reservation' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                イベント名
              </label>
              <input
                type="text"
                value={reminderData.eventSettings.eventName || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  eventSettings: {
                    ...reminderData.eventSettings,
                    eventName: e.target.value
                  }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: お客様の誕生日"
              />
            </div>
          )}

          {reminderData.eventSettings.eventType === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カスタムフィールド
              </label>
              <input
                type="text"
                value={reminderData.eventSettings.customField || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  eventSettings: {
                    ...reminderData.eventSettings,
                    customField: e.target.value
                  }
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="フィールド名を入力"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トリガー条件
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              {reminderData.eventSettings.triggerConditions.length > 0 ? (
                <div className="space-y-2">
                  {reminderData.eventSettings.triggerConditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">
                        {condition.type === 'date_based' ? '日付基準' :
                         condition.type === 'user_action' ? 'ユーザーアクション' :
                         condition.type === 'tag_based' ? 'タグ基準' :
                         condition.type === 'status_based' ? 'ステータス基準' : condition.type}
                      </span>
                      <button
                        onClick={() => {
                          setReminderData({
                            ...reminderData,
                            eventSettings: {
                              ...reminderData.eventSettings,
                              triggerConditions: reminderData.eventSettings.triggerConditions.filter((_, i) => i !== index)
                            }
                          })
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  トリガー条件が設定されていません
                </p>
              )}
              <button
                onClick={() => {
                  const newCondition: ReminderTriggerCondition = {
                    id: `condition_${Date.now()}`,
                    type: 'date_based',
                    condition: {
                      operator: 'equals',
                      dateOffset: {
                        value: 1,
                        unit: 'days',
                        direction: 'before'
                      }
                    },
                    isActive: true
                  }
                  setReminderData({
                    ...reminderData,
                    eventSettings: {
                      ...reminderData.eventSettings,
                      triggerConditions: [...reminderData.eventSettings.triggerConditions, newCondition]
                    }
                  })
                }}
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                条件を追加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Flow */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">リマインダーフロー</h2>
            <p className="text-sm text-gray-600">時系列順にリマインダーテンプレートを設定</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            テンプレートを追加
          </button>
        </div>

        {reminderTemplates.length > 0 ? (
          <div className="space-y-4">
            {reminderTemplates.map((reminderTemplate, index) => (
              <div key={reminderTemplate.id} className="relative">
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
                          <h3 className="font-medium text-gray-900">{reminderTemplate.template.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reminderTemplate.template.type === 'TEXT' ? 'bg-blue-100 text-blue-800' :
                            reminderTemplate.template.type === 'FLEX' ? 'bg-green-100 text-green-800' :
                            reminderTemplate.template.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {reminderTemplate.template.type}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Bell className="w-4 h-4 mr-1" />
                          <span>
                            予約の{reminderTemplate.timingConfig.delayValue}
                            {reminderTemplate.timingConfig.delayUnit === 'hours' ? '時間' : 
                             reminderTemplate.timingConfig.delayUnit === 'days' ? '日' : '分'}
                            {reminderTemplate.timingConfig.delayDirection === 'after' ? '後' : '前'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 mr-2">
                        <label className="text-xs text-gray-500">予約の</label>
                        <input
                          type="number"
                          value={reminderTemplate.timingConfig.delayValue}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayValue', parseInt(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-xs border border-gray-300 rounded"
                          min="0"
                        />
                        <select
                          value={reminderTemplate.timingConfig.delayUnit}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayUnit', e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                        >
                          <option value="minutes">分</option>
                          <option value="hours">時間</option>
                          <option value="days">日</option>
                        </select>
                        <select
                          value={reminderTemplate.timingConfig.delayDirection}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayDirection', e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                        >
                          <option value="before">前</option>
                          <option value="after">後</option>
                        </select>
                        <button
                          onClick={() => setEditingTimingTemplateId(reminderTemplate.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          詳細
                        </button>
                      </div>
                      
                      {index > 0 && (
                        <button
                          onClick={() => moveTemplate(index, index - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      
                      {index < reminderTemplates.length - 1 && (
                        <button
                          onClick={() => moveTemplate(index, index + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleTemplateExpanded(reminderTemplate.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        {expandedTemplates.has(reminderTemplate.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => removeTemplate(reminderTemplate.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedTemplates.has(reminderTemplate.id) && (
                    <div className="p-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {reminderTemplate.template.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">リマインダーテンプレートなし</h3>
            <p className="text-sm text-gray-500 mb-4">
              リマインダーを作成するにはテンプレートを追加してください
            </p>
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

      {/* Modals */}
      {showTemplateModal && <TemplateSelectionModal />}
      {editingTimingTemplateId && <TemplateTimingModal />}

      {/* Completion status */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">完了するには</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!reminderData.name.trim() && (
              <li>• リマインダー名を入力してください</li>
            )}
            {reminderTemplates.length === 0 && (
              <li>• 少なくとも1つのテンプレートを追加してください</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}