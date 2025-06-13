'use client'

import { useState, useRef } from 'react'
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
  ChevronUp
} from 'lucide-react'
import { 
  Modal,
  Button,
  IconButton,
  FormField,
  Input,
  Select,
  Textarea,
  Checkbox,
  FormActions,
  FormGroup
} from '@/components/Common'

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

    return (
      <Modal
        isOpen={true}
        onClose={() => setShowTemplateModal(false)}
        title="テンプレートを選択"
        size="xl"
      >
        <div className="flex flex-1 overflow-hidden h-96">
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
                            <Button size="sm">
                              追加
                            </Button>
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
      </Modal>
    )
  }

  // Template Timing Modal
  function TemplateTimingModal() {
    const template = reminderTemplates.find(t => t.id === editingTimingTemplateId)
    if (!template) return null

    const timingConfig = template.timingConfig

    return (
      <Modal
        isOpen={true}
        onClose={() => setEditingTimingTemplateId(null)}
        title="リマインダー設定"
      >

          <div className="space-y-4">
            <FormField label="予約からの時間">
              <FormGroup columns={3}>
                <FormField label="値">
                  <Input
                    type="number"
                    value={timingConfig.delayValue.toString()}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayValue', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </FormField>
                <FormField label="単位">
                  <Select
                    value={timingConfig.delayUnit}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayUnit', e.target.value)}
                    options={[
                      { value: 'minutes', label: '分' },
                      { value: 'hours', label: '時間' },
                      { value: 'days', label: '日' }
                    ]}
                  />
                </FormField>
                <FormField label="方向">
                  <Select
                    value={timingConfig.delayDirection}
                    onChange={(e) => updateTemplateTimingConfig(template.id, 'delayDirection', e.target.value)}
                    options={[
                      { value: 'before', label: '前' },
                      { value: 'after', label: '後' }
                    ]}
                  />
                </FormField>
              </FormGroup>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800">
                  最大7日間（10080分）まで設定可能です
                </p>
              </div>
            </FormField>

            <FormField label="実行条件">
              <Select
                value={timingConfig.condition?.type || 'always'}
                onChange={(e) => updateTemplateTimingConfig(template.id, 'condition', {
                  ...timingConfig.condition,
                  type: e.target.value
                })}
                options={[
                  { value: 'always', label: '常に実行' },
                  { value: 'tag_exists', label: '指定タグが存在する場合' },
                  { value: 'tag_not_exists', label: '指定タグが存在しない場合' },
                  { value: 'status_is', label: 'ステータスが指定と一致する場合' },
                  { value: 'status_not', label: 'ステータスが指定と一致しない場合' },
                  { value: 'date_range', label: '日付範囲内の場合' },
                  { value: 'user_segment', label: 'ユーザーセグメント条件' },
                  { value: 'custom', label: 'カスタム条件' }
                ]}
              />
            </FormField>

            {/* 条件の詳細設定 */}
            <TemplateConditionDetail
              template={template}
              condition={timingConfig.condition}
              tags={tags}
              statuses={statuses}
              onConditionUpdate={(updatedCondition) => 
                updateTemplateTimingConfig(template.id, 'condition', updatedCondition)
              }
            />
          </div>

          <FormActions className="mt-6">
            <Button
              variant="outline"
              onClick={() => setEditingTimingTemplateId(null)}
            >
              閉じる
            </Button>
          </FormActions>
      </Modal>
    )
  }

  const isComplete = reminderData.name.trim() && reminderTemplates.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <IconButton
            icon={ArrowLeft}
            onClick={onBack}
            variant="ghost"
            size="lg"
          />
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
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => {/* TODO: Preview */}}
            disabled={!isComplete}
          >
            プレビュー
          </Button>
          
          <Button
            icon={Save}
            onClick={handleSave}
            disabled={!isComplete}
          >
            保存
          </Button>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h2>
        
        <FormGroup columns={2}>
          <FormField label="リマインダー名" required>
            <Input
              value={reminderData.name}
              onChange={(e) => setReminderData({ ...reminderData, name: e.target.value })}
              placeholder="例: 予約前日リマインダー"
            />
          </FormField>

          <FormField label="説明">
            <Input
              value={reminderData.description || ''}
              onChange={(e) => setReminderData({ ...reminderData, description: e.target.value })}
              placeholder="リマインダーの説明"
            />
          </FormField>

          <FormField label="フォルダ">
            <Select
              value={reminderData.folderId || ''}
              onChange={(e) => setReminderData({ ...reminderData, folderId: e.target.value || undefined })}
              options={[
                { value: '', label: 'フォルダを選択（任意）' },
                ...reminderFolders.map(folder => ({
                  value: folder.id,
                  label: folder.name
                }))
              ]}
            />
          </FormField>

          <FormField label="">
            <Checkbox
              checked={reminderData.isActive}
              onChange={(e) => setReminderData({ ...reminderData, isActive: e.target.checked })}
              label="作成後すぐにアクティブにする"
              description="アクティブなリマインダーは条件に応じて自動実行されます"
            />
          </FormField>
        </FormGroup>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">リマインダー設定</h2>
        
        <div className="space-y-4">
          <FormField label="リマインダータイプ">
            <Select
              value={reminderData.reminderType}
              onChange={(e) => setReminderData({
                ...reminderData,
                reminderType: e.target.value as 'reservation' | 'user_field' | 'custom_date'
              })}
              options={[
                { value: 'reservation', label: '予約日時基準' },
                { value: 'user_field', label: 'ユーザー日付フィールド基準' },
                { value: 'custom_date', label: 'カスタム日付基準' }
              ]}
            />
          </FormField>

          {reminderData.reminderType === 'user_field' && (
            <FormField label="ユーザー日付フィールド">
              <Select
                value={reminderData.reminderSettings.userDateField || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  reminderSettings: {
                    ...reminderData.reminderSettings,
                    userDateField: e.target.value
                  }
                })}
                options={[
                  { value: '', label: 'フィールドを選択' },
                  { value: 'birthday', label: '誕生日' },
                  { value: 'anniversary', label: '記念日' },
                  { value: 'contractExpiry', label: '契約期限' },
                  { value: 'subscriptionRenewal', label: 'サブスク更新日' },
                  { value: 'lastPurchaseDate', label: '最終購入日' },
                  { value: 'customDate1', label: 'カスタム日付1' },
                  { value: 'customDate2', label: 'カスタム日付2' }
                ]}
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Event Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">イベント設定</h2>
        
        <div className="space-y-4">
          <FormField label="イベントタイプ">
            <Select
              value={reminderData.eventSettings.eventType}
              onChange={(e) => setReminderData({
                ...reminderData,
                eventSettings: {
                  ...reminderData.eventSettings,
                  eventType: e.target.value as 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
                }
              })}
              options={[
                { value: 'reservation', label: '予約' },
                { value: 'birthday', label: '誕生日' },
                { value: 'anniversary', label: '記念日' },
                { value: 'contract_expiry', label: '契約期限' },
                { value: 'custom', label: 'カスタム' }
              ]}
            />
          </FormField>

          {/* イベント検索・紐付け機能 */}
          <EventSearchSection 
            eventType={reminderData.eventSettings.eventType}
            selectedEventId={reminderData.eventSettings.eventId}
            onEventSelect={(eventId, eventData) => {
              setReminderData({
                ...reminderData,
                eventSettings: {
                  ...reminderData.eventSettings,
                  eventId: eventId,
                  eventName: eventData.name,
                  eventData: eventData
                }
              })
            }}
          />

          {reminderData.eventSettings.eventType !== 'reservation' && (
            <FormField label="イベント名">
              <Input
                value={reminderData.eventSettings.eventName || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  eventSettings: {
                    ...reminderData.eventSettings,
                    eventName: e.target.value
                  }
                })}
                placeholder="例: お客様の誕生日"
              />
            </FormField>
          )}

          {reminderData.eventSettings.eventType === 'custom' && (
            <FormField label="カスタムフィールド">
              <Input
                value={reminderData.eventSettings.customField || ''}
                onChange={(e) => setReminderData({
                  ...reminderData,
                  eventSettings: {
                    ...reminderData.eventSettings,
                    customField: e.target.value
                  }
                })}
                placeholder="フィールド名を入力"
              />
            </FormField>
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
                      <IconButton
                        icon={Trash2}
                        onClick={() => {
                          setReminderData({
                            ...reminderData,
                            eventSettings: {
                              ...reminderData.eventSettings,
                              triggerConditions: reminderData.eventSettings.triggerConditions.filter((_, i) => i !== index)
                            }
                          })
                        }}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  トリガー条件が設定されていません
                </p>
              )}
              <Button
                variant="outline"
                icon={Plus}
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
                className="w-full mt-3"
              >
                条件を追加
              </Button>
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
          <Button
            icon={Plus}
            onClick={() => setShowTemplateModal(true)}
          >
            テンプレートを追加
          </Button>
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
                        <Input
                          type="number"
                          value={reminderTemplate.timingConfig.delayValue.toString()}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayValue', parseInt(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-xs"
                          min={0}
                        />
                        <Select
                          value={reminderTemplate.timingConfig.delayUnit}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayUnit', e.target.value)}
                          className="text-xs px-1 py-1"
                          options={[
                            { value: 'minutes', label: '分' },
                            { value: 'hours', label: '時間' },
                            { value: 'days', label: '日' }
                          ]}
                        />
                        <Select
                          value={reminderTemplate.timingConfig.delayDirection}
                          onChange={(e) => updateTemplateTimingConfig(reminderTemplate.id, 'delayDirection', e.target.value)}
                          className="text-xs px-1 py-1"
                          options={[
                            { value: 'before', label: '前' },
                            { value: 'after', label: '後' }
                          ]}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTimingTemplateId(reminderTemplate.id)}
                          className="text-xs"
                        >
                          詳細
                        </Button>
                      </div>
                      
                      {index > 0 && (
                        <IconButton
                          icon={ArrowUp}
                          onClick={() => moveTemplate(index, index - 1)}
                          variant="ghost"
                          size="sm"
                        />
                      )}
                      
                      {index < reminderTemplates.length - 1 && (
                        <IconButton
                          icon={ArrowDown}
                          onClick={() => moveTemplate(index, index + 1)}
                          variant="ghost"
                          size="sm"
                        />
                      )}

                      <IconButton
                        icon={expandedTemplates.has(reminderTemplate.id) ? ChevronUp : ChevronDown}
                        onClick={() => toggleTemplateExpanded(reminderTemplate.id)}
                        variant="ghost"
                        size="sm"
                      />

                      <IconButton
                        icon={Trash2}
                        onClick={() => removeTemplate(reminderTemplate.id)}
                        variant="ghost"
                        size="sm"
                      />
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
            <Button
              icon={Plus}
              onClick={() => setShowTemplateModal(true)}
            >
              最初のテンプレートを追加
            </Button>
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

// イベント検索・紐付けコンポーネント
interface EventSearchSectionProps {
  eventType: 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
  selectedEventId?: string
  onEventSelect: (eventId: string, eventData: any) => void
}

function EventSearchSection({ eventType, selectedEventId, onEventSelect }: EventSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showEventList, setShowEventList] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // イベントタイプに応じたサンプルデータ（実際の実装では API から取得）
  const getEventsByType = (type: string) => {
    switch (type) {
      case 'reservation':
        return [
          { id: 'res_1', name: '美容院予約', date: '2024-01-15', customer: '田中さん', type: 'カット&カラー' },
          { id: 'res_2', name: 'レストラン予約', date: '2024-01-16', customer: '佐藤さん', type: 'ディナー' },
          { id: 'res_3', name: 'マッサージ予約', date: '2024-01-17', customer: '山田さん', type: '全身マッサージ' }
        ]
      case 'birthday':
        return [
          { id: 'birth_1', name: '田中太郎さんの誕生日', date: '1990-05-15', age: 33 },
          { id: 'birth_2', name: '佐藤花子さんの誕生日', date: '1985-08-22', age: 38 },
          { id: 'birth_3', name: '山田次郎さんの誕生日', date: '1992-12-03', age: 31 }
        ]
      case 'anniversary':
        return [
          { id: 'anni_1', name: '結婚記念日', date: '2010-06-15', years: 13, customer: '田中夫妻' },
          { id: 'anni_2', name: '初回来店記念日', date: '2020-03-20', years: 3, customer: '佐藤さん' }
        ]
      case 'contract_expiry':
        return [
          { id: 'cont_1', name: '年間保守契約', expiryDate: '2024-03-31', customer: 'ABC株式会社' },
          { id: 'cont_2', name: 'サブスクリプション', expiryDate: '2024-02-28', customer: '個人プラン' }
        ]
      default:
        return []
    }
  }

  const searchEvents = async (query: string) => {
    setLoading(true)
    // 実際の実装では API を呼び出し
    setTimeout(() => {
      const allEvents = getEventsByType(eventType)
      const filtered = query 
        ? allEvents.filter(event => 
            event.name.toLowerCase().includes(query.toLowerCase()) ||
            ('customer' in event && event.customer && event.customer.toLowerCase().includes(query.toLowerCase()))
          )
        : allEvents
      setEvents(filtered)
      setLoading(false)
    }, 300)
  }

  const handleSearch = () => {
    setShowEventList(true)
    searchEvents(searchQuery)
  }

  const selectedEvent = events.find(event => event.id === selectedEventId)

  if (eventType === 'reservation') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-800">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">予約イベントは自動的に連携されます</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          システム内のすべての予約に対してこのリマインダーが適用されます
        </p>
      </div>
    )
  }

  return (
    <FormField label={`${eventType === 'birthday' ? '誕生日' : 
                     eventType === 'anniversary' ? '記念日' : 
                     eventType === 'contract_expiry' ? '契約' : 'カスタム'}イベント検索`}>
      <div className="space-y-3">
        {/* 検索フィールド */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={`${eventType === 'birthday' ? 'お客様名や誕生日' : 
                           eventType === 'anniversary' ? '記念日名や顧客名' : 
                           eventType === 'contract_expiry' ? '契約名や顧客名' : 'イベント名'}で検索...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={handleSearch}
            variant="outline"
            icon={Search}
          >
            検索
          </Button>
        </div>

        {/* 選択されたイベント */}
        {selectedEvent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-green-800">{selectedEvent.name}</h4>
                <p className="text-xs text-green-600">
                  {eventType === 'birthday' && `生年月日: ${selectedEvent.date} (${'age' in selectedEvent ? selectedEvent.age : 0}歳)`}
                  {eventType === 'anniversary' && `記念日: ${selectedEvent.date} (${'years' in selectedEvent ? selectedEvent.years : 0}年)`}
                  {eventType === 'contract_expiry' && `期限: ${'expiryDate' in selectedEvent ? selectedEvent.expiryDate : ''}`}
                  {'customer' in selectedEvent && selectedEvent.customer && ` - ${selectedEvent.customer}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEventSelect('', {})}
              >
                解除
              </Button>
            </div>
          </div>
        )}

        {/* 検索結果 */}
        {showEventList && (
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">検索中...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      onEventSelect(event.id, event)
                      setShowEventList(false)
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{event.name}</h4>
                        <p className="text-xs text-gray-500">
                          {eventType === 'birthday' && `生年月日: ${event.date} (${'age' in event ? event.age : 0}歳)`}
                          {eventType === 'anniversary' && `記念日: ${event.date} (${'years' in event ? event.years : 0}年)`}
                          {eventType === 'contract_expiry' && `期限: ${'expiryDate' in event ? event.expiryDate : ''}`}
                          {'customer' in event && event.customer && ` - ${event.customer}`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">検索結果がありません</p>
                <p className="text-xs mt-1">別のキーワードで検索してください</p>
              </div>
            )}
          </div>
        )}

        {/* ヘルプテキスト */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            💡 特定の{eventType === 'birthday' ? '誕生日' : 
                     eventType === 'anniversary' ? '記念日' : 
                     eventType === 'contract_expiry' ? '契約' : 'イベント'}に紐付けることで、
            よりパーソナライズされたリマインダーを設定できます。
            イベントを選択しない場合は、該当するすべての{eventType === 'birthday' ? 'お客様の誕生日' : 
                                                eventType === 'anniversary' ? '記念日' : 
                                                eventType === 'contract_expiry' ? '契約期限' : 'イベント'}に適用されます。
          </p>
        </div>
      </div>
    </FormField>
  )
}

// テンプレート条件詳細設定コンポーネント
interface TemplateConditionDetailProps {
  template: ReminderTemplate
  condition?: any
  tags: Tag[]
  statuses: Status[]
  onConditionUpdate: (condition: any) => void
}

function TemplateConditionDetail({ template, condition, tags, statuses, onConditionUpdate }: TemplateConditionDetailProps) {
  if (!condition || condition.type === 'always') {
    return null
  }

  const updateConditionField = (field: string, value: any) => {
    onConditionUpdate({
      ...condition,
      [field]: value
    })
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">条件詳細設定</h4>
      
      {/* タグ存在条件 */}
      {(condition.type === 'tag_exists' || condition.type === 'tag_not_exists') && (
        <div className="space-y-3">
          <FormField label="対象タグ">
            <Select
              value={condition.tagId || ''}
              onChange={(e) => updateConditionField('tagId', e.target.value)}
              options={[
                { value: '', label: 'タグを選択' },
                ...tags.map(tag => ({
                  value: tag.id,
                  label: tag.name
                }))
              ]}
            />
          </FormField>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              {condition.type === 'tag_exists' 
                ? '指定されたタグがユーザーに付与されている場合のみ、このテンプレートが送信されます。'
                : '指定されたタグがユーザーに付与されていない場合のみ、このテンプレートが送信されます。'
              }
            </p>
          </div>
        </div>
      )}

      {/* ステータス条件 */}
      {(condition.type === 'status_is' || condition.type === 'status_not') && (
        <div className="space-y-3">
          <FormField label="対象ステータス">
            <Select
              value={condition.statusId || ''}
              onChange={(e) => updateConditionField('statusId', e.target.value)}
              options={[
                { value: '', label: 'ステータスを選択' },
                ...statuses.map(status => ({
                  value: status.id,
                  label: status.label
                }))
              ]}
            />
          </FormField>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              {condition.type === 'status_is' 
                ? 'ユーザーのステータスが指定されたステータスと一致する場合のみ、このテンプレートが送信されます。'
                : 'ユーザーのステータスが指定されたステータスと一致しない場合のみ、このテンプレートが送信されます。'
              }
            </p>
          </div>
        </div>
      )}

      {/* 日付範囲条件 */}
      {condition.type === 'date_range' && (
        <div className="space-y-3">
          <FormGroup columns={2}>
            <FormField label="開始日">
              <Input
                type="date"
                value={condition.startDate || ''}
                onChange={(e) => updateConditionField('startDate', e.target.value)}
              />
            </FormField>
            <FormField label="終了日">
              <Input
                type="date"
                value={condition.endDate || ''}
                onChange={(e) => updateConditionField('endDate', e.target.value)}
              />
            </FormField>
          </FormGroup>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              指定された日付範囲内にリマインダーの送信予定日が含まれる場合のみ、このテンプレートが送信されます。
            </p>
          </div>
        </div>
      )}

      {/* ユーザーセグメント条件 */}
      {condition.type === 'user_segment' && (
        <div className="space-y-3">
          <FormField label="セグメント条件">
            <Select
              value={condition.segmentType || ''}
              onChange={(e) => updateConditionField('segmentType', e.target.value)}
              options={[
                { value: '', label: 'セグメントを選択' },
                { value: 'new_customer', label: '新規顧客' },
                { value: 'returning_customer', label: 'リピート顧客' },
                { value: 'vip_customer', label: 'VIP顧客' },
                { value: 'inactive_customer', label: '非アクティブ顧客' },
                { value: 'age_range', label: '年齢範囲' },
                { value: 'gender', label: '性別' },
                { value: 'location', label: '地域' }
              ]}
            />
          </FormField>

          {condition.segmentType === 'age_range' && (
            <FormGroup columns={2}>
              <FormField label="最小年齢">
                <Input
                  type="number"
                  value={condition.minAge || ''}
                  onChange={(e) => updateConditionField('minAge', parseInt(e.target.value) || 0)}
                  placeholder="18"
                />
              </FormField>
              <FormField label="最大年齢">
                <Input
                  type="number"
                  value={condition.maxAge || ''}
                  onChange={(e) => updateConditionField('maxAge', parseInt(e.target.value) || 0)}
                  placeholder="65"
                />
              </FormField>
            </FormGroup>
          )}

          {condition.segmentType === 'gender' && (
            <FormField label="性別">
              <Select
                value={condition.gender || ''}
                onChange={(e) => updateConditionField('gender', e.target.value)}
                options={[
                  { value: '', label: '性別を選択' },
                  { value: 'male', label: '男性' },
                  { value: 'female', label: '女性' },
                  { value: 'other', label: 'その他' }
                ]}
              />
            </FormField>
          )}

          {condition.segmentType === 'location' && (
            <FormField label="地域">
              <Input
                value={condition.location || ''}
                onChange={(e) => updateConditionField('location', e.target.value)}
                placeholder="例: 東京都, 関東地方"
              />
            </FormField>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              指定されたユーザーセグメントに該当するユーザーのみに、このテンプレートが送信されます。
            </p>
          </div>
        </div>
      )}

      {/* カスタム条件 */}
      {condition.type === 'custom' && (
        <div className="space-y-3">
          <FormField label="条件式">
            <Textarea
              value={condition.customCondition || ''}
              onChange={(e) => updateConditionField('customCondition', e.target.value)}
              placeholder="例: user.totalPurchases > 10000 AND user.lastPurchaseDate > '2023-01-01'"
              rows={3}
            />
          </FormField>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h5 className="text-xs font-medium text-yellow-800 mb-1">利用可能な変数：</h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• <code>user.name</code> - ユーザー名</li>
              <li>• <code>user.email</code> - メールアドレス</li>
              <li>• <code>user.totalPurchases</code> - 総購入額</li>
              <li>• <code>user.lastPurchaseDate</code> - 最終購入日</li>
              <li>• <code>user.registrationDate</code> - 登録日</li>
              <li>• <code>reservation.date</code> - 予約日時</li>
              <li>• <code>reservation.service</code> - サービス名</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              JavaScript形式の条件式を記述してください。条件がtrueの場合のみ、このテンプレートが送信されます。
            </p>
          </div>
        </div>
      )}

      {/* 条件プレビュー */}
      <div className="mt-4 p-3 bg-white border border-gray-200 rounded">
        <h5 className="text-xs font-medium text-gray-900 mb-2">条件サマリー</h5>
        <p className="text-xs text-gray-600">
          {getConditionSummary(condition, tags, statuses)}
        </p>
      </div>
    </div>
  )
}

// 条件サマリーを生成するヘルパー関数
function getConditionSummary(condition: any, tags: Tag[], statuses: Status[]): string {
  if (!condition || condition.type === 'always') {
    return 'このテンプレートは常に送信されます。'
  }

  switch (condition.type) {
    case 'tag_exists':
      const existsTag = tags.find(t => t.id === condition.tagId)
      return `「${existsTag?.name || '未選択'}」タグが存在する場合に送信されます。`
    
    case 'tag_not_exists':
      const notExistsTag = tags.find(t => t.id === condition.tagId)
      return `「${notExistsTag?.name || '未選択'}」タグが存在しない場合に送信されます。`
    
    case 'status_is':
      const isStatus = statuses.find(s => s.id === condition.statusId)
      return `ステータスが「${isStatus?.label || '未選択'}」の場合に送信されます。`
    
    case 'status_not':
      const notStatus = statuses.find(s => s.id === condition.statusId)
      return `ステータスが「${notStatus?.label || '未選択'}」以外の場合に送信されます。`
    
    case 'date_range':
      if (condition.startDate && condition.endDate) {
        return `${condition.startDate}から${condition.endDate}の期間内に送信されます。`
      }
      return '日付範囲が設定されていません。'
    
    case 'user_segment':
      if (condition.segmentType === 'age_range') {
        return `年齢が${condition.minAge || 0}歳から${condition.maxAge || 0}歳のユーザーに送信されます。`
      } else if (condition.segmentType === 'gender') {
        const genderLabel = condition.gender === 'male' ? '男性' : condition.gender === 'female' ? '女性' : 'その他'
        return `性別が「${genderLabel}」のユーザーに送信されます。`
      } else if (condition.segmentType === 'location') {
        return `地域が「${condition.location || '未設定'}」のユーザーに送信されます。`
      } else {
        const segmentLabels: { [key: string]: string } = {
          new_customer: '新規顧客',
          returning_customer: 'リピート顧客',
          vip_customer: 'VIP顧客',
          inactive_customer: '非アクティブ顧客'
        }
        return `「${segmentLabels[condition.segmentType] || condition.segmentType}」セグメントのユーザーに送信されます。`
      }
    
    case 'custom':
      return condition.customCondition ? 
        `カスタム条件: ${condition.customCondition}` : 
        'カスタム条件が設定されていません。'
    
    default:
      return '条件が設定されていません。'
  }
}