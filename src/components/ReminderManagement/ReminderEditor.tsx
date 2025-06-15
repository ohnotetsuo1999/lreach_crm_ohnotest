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
  StatusFolder,
  Segment,
  SegmentFolder,
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
  ChevronUp, Split, TagIcon, Users, Target
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
  statusFolders: StatusFolder[]
  segments: Segment[]
  segmentFolders: SegmentFolder[]
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
  statusFolders,
  segments,
  segmentFolders,
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
      selectedEventIds: []
    }
  })
  
  // Template management
  const [reminderTemplates, setReminderTemplates] = useState<ReminderTemplate[]>(reminder?.templates || [])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTimingTemplateId, setEditingTimingTemplateId] = useState<string | null>(null)
  
  // UI state
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  
  // Timing settings state for each template
  const [timingSettings, setTimingSettings] = useState<{[templateId: string]: {
    type: 'event_based' | 'immediate' | 'delay' | 'specific_time' | 'precise_delay'
    eventType?: 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'subscription_renewal' | 'last_purchase' | 'custom'
    eventDays?: number
    eventDirection?: 'before' | 'after'
    customEventField?: string
    delayValue?: number
    delayUnit?: 'minutes' | 'hours' | 'days'
    specificDate?: 'event_day' | 'day_before' | 'week_before' | 'month_before' | 'custom_days'
    customDays?: number
    specificTime?: string
    preciseTiming?: {
      days?: number
      hours?: number
      minutes?: number
      seconds?: number
    }
  }}>({})
  
  // Branching condition state for each template
  const [branchingConditions, setBranchingConditions] = useState<{[templateId: string]: {
    type: 'none' | 'tag' | 'status' | 'segment'
    selectedTags: string[]
    selectedStatuses: string[]
    selectedSegments: string[]
  }}>({})

  // Get available events
  const getAvailableEvents = (): Event[] => {
    // Sample data - in production, this would come from an API
    return [
      // Reservations
      { id: 'res_1', name: '美容院予約', type: 'reservation', date: '2024-01-15', description: 'カット&カラー', folderId: 'folder_res' },
      { id: 'res_2', name: 'レストラン予約', type: 'reservation', date: '2024-01-16', description: 'ディナー', folderId: 'folder_res' },
      { id: 'res_3', name: 'マッサージ予約', type: 'reservation', date: '2024-01-17', description: '全身マッサージ', folderId: 'folder_res' },
      { id: 'res_4', name: '歯科医院予約', type: 'reservation', date: '2024-01-20', description: '定期検診', folderId: 'folder_medical' },
      { id: 'res_5', name: '病院予約', type: 'reservation', date: '2024-01-22', description: '健康診断', folderId: 'folder_medical' },
      
      // Birthdays
      { id: 'birth_1', name: '田中太郎さんの誕生日', type: 'birthday', date: '1990-05-15', description: '33歳', folderId: 'folder_birth' },
      { id: 'birth_2', name: '佐藤花子さんの誕生日', type: 'birthday', date: '1985-08-22', description: '38歳', folderId: 'folder_birth' },
      { id: 'birth_3', name: '山田次郎さんの誕生日', type: 'birthday', date: '1992-12-03', description: '31歳', folderId: 'folder_birth' },
      
      // Anniversaries
      { id: 'anni_1', name: '結婚記念日', type: 'anniversary', date: '2010-06-15', description: '田中夫妻 - 13年', folderId: 'folder_anni' },
      { id: 'anni_2', name: '初回来店記念日', type: 'anniversary', date: '2020-03-20', description: '佐藤さん - 3年', folderId: 'folder_anni' },
      { id: 'anni_3', name: '会員登録記念日', type: 'anniversary', date: '2019-01-10', description: '山田さん - 5年', folderId: 'folder_anni' },
      
      // Contract expiry
      { id: 'cont_1', name: '年間保守契約', type: 'contract_expiry', date: '2024-03-31', description: 'ABC株式会社', folderId: 'folder_contract' },
      { id: 'cont_2', name: 'サブスクリプション', type: 'contract_expiry', date: '2024-02-28', description: '個人プラン', folderId: 'folder_contract' },
      
      // Custom events
      { id: 'custom_1', name: 'セール開始', type: 'custom', date: '2024-02-01', description: '春の大セール' },
      { id: 'custom_2', name: 'キャンペーン', type: 'custom', date: '2024-03-01', description: '新規顧客獲得キャンペーン' }
    ]
  }

  // Get event folders
  const getEventFolders = (): EventFolder[] => {
    return [
      { id: 'folder_res', name: '予約', description: '各種予約イベント', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'folder_medical', name: '医療関連', description: '医療・健康関連の予約', parentId: 'folder_res', createdAt: new Date(), updatedAt: new Date() },
      { id: 'folder_birth', name: '誕生日', description: 'お客様の誕生日', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'folder_anni', name: '記念日', description: '各種記念日', parentId: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'folder_contract', name: '契約', description: '契約期限・更新', parentId: null, createdAt: new Date(), updatedAt: new Date() }
    ]
  }

  const handleSave = () => {
    if (!reminderData.name.trim()) {
      alert('リマインダー名を入力してください')
      return
    }

    if (reminderTemplates.length === 0) {
      alert('少なくとも1つのテンプレートを追加してください')
      return
    }

    // Merge timing settings and branching conditions with templates
    const templatesWithSettings = reminderTemplates.map(template => {
      const timing = timingSettings[template.id]
      const branching = branchingConditions[template.id]
      
      return {
        ...template,
        timingConfig: {
          ...template.timingConfig,
          // Add advanced timing settings
          advancedTiming: timing,
          // Add branching conditions
          branchingConditions: branching
        }
      }
    })

    const savedReminder: ReservationReminder = {
      id: reminder?.id || `reminder_${Date.now()}`,
      name: reminderData.name,
      description: reminderData.description,
      folderId: reminderData.folderId,
      isActive: reminderData.isActive,
      reminderType: reminderData.reminderType,
      reminderSettings: reminderData.reminderSettings,
      eventSettings: reminderData.eventSettings,
      templates: templatesWithSettings,
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

  // Get timing preview text
  const getTimingPreview = (templateId: string): string => {
    const settings = timingSettings[templateId]
    const template = reminderTemplates.find(t => t.id === templateId)
    
    if (!settings || !template) {
      return `${template?.timingConfig.delayValue || 1}${
        template?.timingConfig.delayUnit === 'days' ? '日' :
        template?.timingConfig.delayUnit === 'hours' ? '時間' :
        '分'
      }${template?.timingConfig.delayDirection === 'before' ? '前' : '後'}`
    }

    switch (settings.type) {
      case 'event_based':
        const eventTypeLabels: Record<string, string> = {
          reservation: '予約',
          birthday: '誕生日',
          anniversary: '記念日',
          contract_expiry: '契約期限',
          subscription_renewal: '契約更新日',
          last_purchase: '最終購入日',
          custom: 'カスタムイベント'
        }
        const eventLabel = eventTypeLabels[settings.eventType || 'reservation']
        const days = settings.eventDays || 1
        const direction = settings.eventDirection === 'before' ? '前' : '後'
        return `${eventLabel}の${days}日${direction}`
        
      case 'immediate':
        return '即座に送信'
        
      case 'delay':
        const delayUnit = settings.delayUnit === 'days' ? '日' : 
                         settings.delayUnit === 'hours' ? '時間' : '分'
        return `${settings.delayValue || 1}${delayUnit}後`
        
      case 'specific_time':
        const dateLabel = settings.specificDate === 'event_day' ? 'イベント当日' :
                         settings.specificDate === 'day_before' ? '前日' :
                         settings.specificDate === 'week_before' ? '1週間前' :
                         settings.specificDate === 'month_before' ? '1ヶ月前' :
                         `${settings.customDays || 1}日前`
        return `${dateLabel}の${settings.specificTime || '10:00'}`
        
      case 'precise_delay':
        const parts = []
        if (settings.preciseTiming?.days) parts.push(`${settings.preciseTiming.days}日`)
        if (settings.preciseTiming?.hours) parts.push(`${settings.preciseTiming.hours}時間`)
        if (settings.preciseTiming?.minutes) parts.push(`${settings.preciseTiming.minutes}分`)
        if (settings.preciseTiming?.seconds) parts.push(`${settings.preciseTiming.seconds}秒`)
        const direction2 = settings.eventDirection === 'before' ? '前' : '後'
        return parts.length > 0 ? `${parts.join('')}${direction2}` : '設定なし'
        
      default:
        return '設定なし'
    }
  }

  // Update timing settings
  const updateTimingSetting = (templateId: string, key: string, value: any) => {
    setTimingSettings(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [key]: value
      }
    }))
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

    interface TagFolderHierarchy extends TagFolder {
      children: TagFolderHierarchy[]
    }

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
              </label>
            ))}
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    const folderHierarchy = buildFolderHierarchy(tagFolders || [])
    const filteredTags = getFilteredTags()

    return (
      <div className="flex flex-col h-96">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                <Folder className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{tags.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
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
                    <span className="text-sm text-gray-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Status selector with folder hierarchy
  function StatusSelector({
    statuses, statusFolders, selectedStatusIds, onChange, multiple = true
  }: {
    statuses: Status[], statusFolders: StatusFolder[], selectedStatusIds: string[]
    onChange: (statusIds: string[]) => void, multiple?: boolean
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    interface StatusFolderHierarchy extends StatusFolder {
      children: StatusFolderHierarchy[]
    }

    const buildFolderHierarchy = (folders: StatusFolder[], parentId: string | null = null): StatusFolderHierarchy[] => {
      if (!folders || !Array.isArray(folders)) return []
      const filtered = folders.filter(folder => folder.parentId === parentId)
      return filtered.map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
      }))
    }

    const getStatusesInFolder = (folderId: string | null): Status[] => {
      if (!statuses || !Array.isArray(statuses)) return []
      return statuses.filter(status => status.folderId === folderId)
    }

    const getFilteredStatuses = (): Status[] => {
      if (!searchQuery) {
        if (selectedFolderId !== null) {
          return getStatusesInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
        }
        return statuses || []
      }
      return (statuses || []).filter(status => 
        status.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const renderFolder = (folder: StatusFolderHierarchy, level: number = 0) => (
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
            {(getStatusesInFolder(folder.id) || []).length}
          </span>
        </div>
        
        {expandedFolders.has(folder.id) && (
          <div>
            {(getStatusesInFolder(folder.id) || []).map(status => (
              <label
                key={status.id}
                className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                style={{ marginLeft: `${(level + 1) * 16}px` }}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "status-selector"}
                  checked={selectedStatusIds.includes(status.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedStatusIds, status.id])
                      } else {
                        onChange(selectedStatusIds.filter(id => id !== status.id))
                      }
                    } else {
                      onChange([status.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </label>
            ))}
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    const folderHierarchy = buildFolderHierarchy(statusFolders || [])
    const filteredStatuses = getFilteredStatuses()

    return (
      <div className="flex flex-col h-96">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ステータスを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                <Folder className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{statuses.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredStatuses.map(status => (
                  <label
                    key={status.id}
                    className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "status-selector"}
                      checked={selectedStatusIds.includes(status.id)}
                      onChange={(e) => {
                        if (multiple) {
                          if (e.target.checked) {
                            onChange([...selectedStatusIds, status.id])
                          } else {
                            onChange(selectedStatusIds.filter(id => id !== status.id))
                          }
                        } else {
                          onChange([status.id])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{status.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">コード: {status.code}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Segment selector with folder hierarchy
  function SegmentSelector({
    segments, segmentFolders, selectedSegmentIds, onChange, multiple = true
  }: {
    segments: Segment[], segmentFolders: SegmentFolder[], selectedSegmentIds: string[]
    onChange: (segmentIds: string[]) => void, multiple?: boolean
  }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

    interface SegmentFolderHierarchy extends SegmentFolder {
      children: SegmentFolderHierarchy[]
    }

    const buildFolderHierarchy = (folders: SegmentFolder[], parentId: string | null = null): SegmentFolderHierarchy[] => {
      if (!folders || !Array.isArray(folders)) return []
      const filtered = folders.filter(folder => folder.parentId === parentId)
      return filtered.map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
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
        segment.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const renderFolder = (folder: SegmentFolderHierarchy, level: number = 0) => (
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
            {(getSegmentsInFolder(folder.id) || []).length}
          </span>
        </div>
        
        {expandedFolders.has(folder.id) && (
          <div>
            {(getSegmentsInFolder(folder.id) || []).map(segment => (
              <label
                key={segment.id}
                className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                style={{ marginLeft: `${(level + 1) * 16}px` }}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "segment-selector"}
                  checked={selectedSegmentIds.includes(segment.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedSegmentIds, segment.id])
                      } else {
                        onChange(selectedSegmentIds.filter(id => id !== segment.id))
                      }
                    } else {
                      onChange([segment.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{segment.name}</span>
              </label>
            ))}
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )

    const folderHierarchy = buildFolderHierarchy(segmentFolders || [])
    const filteredSegments = getFilteredSegments()

    return (
      <div className="flex flex-col h-96">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="セグメントを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                <Folder className="w-4 h-4 mr-2" />
                <span className="text-sm">すべて</span>
                <span className="ml-auto text-xs text-gray-500">{segments.length}</span>
              </div>
              {folderHierarchy.map(folder => renderFolder(folder))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredSegments.map(segment => (
                  <label
                    key={segment.id}
                    className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "segment-selector"}
                      checked={selectedSegmentIds.includes(segment.id)}
                      onChange={(e) => {
                        if (multiple) {
                          if (e.target.checked) {
                            onChange([...selectedSegmentIds, segment.id])
                          } else {
                            onChange(selectedSegmentIds.filter(id => id !== segment.id))
                          }
                        } else {
                          onChange([segment.id])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                      {segment.memo && (
                        <div className="text-xs text-gray-500 mt-0.5">{segment.memo}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
          <FormField label="イベント選択">
            <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
              <EventSelector
                events={getAvailableEvents()}
                eventFolders={getEventFolders()}
                selectedEventIds={reminderData.eventSettings.selectedEventIds || []}
                onChange={(eventIds) => {
                  setReminderData({
                    ...reminderData,
                    eventSettings: {
                      ...reminderData.eventSettings,
                      selectedEventIds: eventIds
                    }
                  })
                }}
                multiple={true}
              />
            </div>
          </FormField>

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
                            {getTimingPreview(reminderTemplate.id)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                    <div className="p-4 space-y-4">
                      {/* Timing Settings (送信タイミング設定) */}
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <h4 className="text-sm font-medium text-purple-700">送信タイミング設定</h4>
                        </div>
                        
                        {/* Current Timing Preview */}
                        <div className="mb-4 p-2 bg-white rounded border border-purple-300">
                          <div className="text-xs font-medium text-purple-700 mb-1">現在の設定</div>
                          <div className="text-sm text-purple-600">
                            {getTimingPreview(reminderTemplate.id)}
                          </div>
                        </div>

                        {/* Timing Type Selection */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            タイミングタイプ
                          </label>
                          <select 
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={timingSettings[reminderTemplate.id]?.type || 'event_based'}
                            onChange={(e) => updateTimingSetting(reminderTemplate.id, 'type', e.target.value)}
                          >
                            <option value="event_based">イベント基準</option>
                            <option value="immediate">即座に送信</option>
                            <option value="delay">遅延送信</option>
                            <option value="specific_time">特定時刻</option>
                            <option value="precise_delay">詳細時間設定</option>
                          </select>
                        </div>

                        {/* Event-based timing */}
                        {timingSettings[reminderTemplate.id]?.type === 'event_based' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                イベントタイプ
                              </label>
                              <select 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                value={timingSettings[reminderTemplate.id]?.eventType || 'reservation'}
                                onChange={(e) => updateTimingSetting(reminderTemplate.id, 'eventType', e.target.value)}
                              >
                                <option value="reservation">予約</option>
                                <option value="birthday">誕生日</option>
                                <option value="anniversary">記念日</option>
                                <option value="contract_expiry">契約期限</option>
                                <option value="subscription_renewal">契約更新日</option>
                                <option value="last_purchase">最終購入日</option>
                                <option value="custom">カスタムフィールド</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  何日
                                </label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                  value={timingSettings[reminderTemplate.id]?.eventDays || 1}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'eventDays', parseInt(e.target.value) || 1)}
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  タイミング
                                </label>
                                <select 
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                  value={timingSettings[reminderTemplate.id]?.eventDirection || 'before'}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'eventDirection', e.target.value)}
                                >
                                  <option value="before">前</option>
                                  <option value="after">後</option>
                                </select>
                              </div>
                            </div>

                            {timingSettings[reminderTemplate.id]?.eventType === 'custom' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  カスタムフィールド名
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                  value={timingSettings[reminderTemplate.id]?.customEventField || ''}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'customEventField', e.target.value)}
                                  placeholder="例: nextCheckupDate"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delay timing */}
                        {timingSettings[reminderTemplate.id]?.type === 'delay' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">値</label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.delayValue || 1}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'delayValue', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
                                <select
                                  value={timingSettings[reminderTemplate.id]?.delayUnit || 'days'}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'delayUnit', e.target.value)}
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                >
                                  <option value="minutes">分</option>
                                  <option value="hours">時間</option>
                                  <option value="days">日</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Specific time */}
                        {timingSettings[reminderTemplate.id]?.type === 'specific_time' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                日付設定
                              </label>
                              <select
                                value={timingSettings[reminderTemplate.id]?.specificDate || 'event_day'}
                                onChange={(e) => updateTimingSetting(reminderTemplate.id, 'specificDate', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                              >
                                <option value="event_day">イベント当日</option>
                                <option value="day_before">前日</option>
                                <option value="week_before">1週間前</option>
                                <option value="month_before">1ヶ月前</option>
                                <option value="custom_days">カスタム日数</option>
                              </select>
                            </div>

                            {timingSettings[reminderTemplate.id]?.specificDate === 'custom_days' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  何日前
                                </label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.customDays || 1}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'customDays', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                  min="1"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                送信時刻
                              </label>
                              <input
                                type="time"
                                value={timingSettings[reminderTemplate.id]?.specificTime || '10:00'}
                                onChange={(e) => updateTimingSetting(reminderTemplate.id, 'specificTime', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        )}

                        {/* Precise delay timing */}
                        {timingSettings[reminderTemplate.id]?.type === 'precise_delay' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">日</label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.preciseTiming?.days || 0}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'preciseTiming', {
                                    ...timingSettings[reminderTemplate.id]?.preciseTiming,
                                    days: parseInt(e.target.value) || 0
                                  })}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">時間</label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.preciseTiming?.hours || 0}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'preciseTiming', {
                                    ...timingSettings[reminderTemplate.id]?.preciseTiming,
                                    hours: parseInt(e.target.value) || 0
                                  })}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  min="0"
                                  max="23"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">分</label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.preciseTiming?.minutes || 0}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'preciseTiming', {
                                    ...timingSettings[reminderTemplate.id]?.preciseTiming,
                                    minutes: parseInt(e.target.value) || 0
                                  })}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  min="0"
                                  max="59"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">秒</label>
                                <input
                                  type="number"
                                  value={timingSettings[reminderTemplate.id]?.preciseTiming?.seconds || 0}
                                  onChange={(e) => updateTimingSetting(reminderTemplate.id, 'preciseTiming', {
                                    ...timingSettings[reminderTemplate.id]?.preciseTiming,
                                    seconds: parseInt(e.target.value) || 0
                                  })}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md"
                                  min="0"
                                  max="59"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                タイミング
                              </label>
                              <select 
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md"
                                value={timingSettings[reminderTemplate.id]?.eventDirection || 'before'}
                                onChange={(e) => updateTimingSetting(reminderTemplate.id, 'eventDirection', e.target.value)}
                              >
                                <option value="before">前</option>
                                <option value="after">後</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Quick presets */}
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <div className="text-xs font-medium text-gray-700 mb-2">クイック設定</div>
                          <div className="flex flex-wrap gap-1">
                            <button 
                              onClick={() => {
                                updateTimingSetting(reminderTemplate.id, 'type', 'event_based')
                                updateTimingSetting(reminderTemplate.id, 'eventDays', 1)
                                updateTimingSetting(reminderTemplate.id, 'eventDirection', 'before')
                              }}
                              className="px-2 py-1 text-xs bg-white border border-purple-300 rounded hover:bg-purple-100 text-purple-700"
                            >
                              1日前
                            </button>
                            <button 
                              onClick={() => {
                                updateTimingSetting(reminderTemplate.id, 'type', 'event_based')
                                updateTimingSetting(reminderTemplate.id, 'eventDays', 3)
                                updateTimingSetting(reminderTemplate.id, 'eventDirection', 'before')
                              }}
                              className="px-2 py-1 text-xs bg-white border border-purple-300 rounded hover:bg-purple-100 text-purple-700"
                            >
                              3日前
                            </button>
                            <button 
                              onClick={() => {
                                updateTimingSetting(reminderTemplate.id, 'type', 'event_based')
                                updateTimingSetting(reminderTemplate.id, 'eventDays', 7)
                                updateTimingSetting(reminderTemplate.id, 'eventDirection', 'before')
                              }}
                              className="px-2 py-1 text-xs bg-white border border-purple-300 rounded hover:bg-purple-100 text-purple-700"
                            >
                              1週間前
                            </button>
                            <button 
                              onClick={() => {
                                updateTimingSetting(reminderTemplate.id, 'type', 'specific_time')
                                updateTimingSetting(reminderTemplate.id, 'specificDate', 'day_before')
                                updateTimingSetting(reminderTemplate.id, 'specificTime', '18:00')
                              }}
                              className="px-2 py-1 text-xs bg-white border border-orange-300 rounded hover:bg-orange-100 text-orange-700"
                            >
                              前日18時
                            </button>
                            <button 
                              onClick={() => {
                                updateTimingSetting(reminderTemplate.id, 'type', 'specific_time')
                                updateTimingSetting(reminderTemplate.id, 'specificDate', 'event_day')
                                updateTimingSetting(reminderTemplate.id, 'specificTime', '09:00')
                              }}
                              className="px-2 py-1 text-xs bg-white border border-green-300 rounded hover:bg-green-100 text-green-700"
                            >
                              当日9時
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Conditional Branching Settings */}
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Split className="w-4 h-4 text-yellow-600" />
                          <h4 className="text-sm font-medium text-yellow-700">条件分岐設定</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              分岐条件タイプ
                            </label>
                            <select 
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              value={branchingConditions[reminderTemplate.id]?.type || 'none'}
                              onChange={(e) => {
                                setBranchingConditions({
                                  ...branchingConditions,
                                  [reminderTemplate.id]: {
                                    ...branchingConditions[reminderTemplate.id],
                                    type: e.target.value as 'none' | 'tag' | 'status' | 'segment',
                                    selectedTags: [],
                                    selectedStatuses: [],
                                    selectedSegments: []
                                  }
                                })
                              }}
                            >
                              <option value="none">条件なし（全員に配信）</option>
                              <option value="tag">タグによる分岐</option>
                              <option value="status">ステータスによる分岐</option>
                              <option value="segment">セグメントによる分岐</option>
                            </select>
                          </div>

                          {/* Tag selection */}
                          {branchingConditions[reminderTemplate.id]?.type === 'tag' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                対象タグを選択
                              </label>
                              <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                                <TagSelector
                                  tags={tags}
                                  tagFolders={tagFolders}
                                  selectedTagIds={branchingConditions[reminderTemplate.id]?.selectedTags || []}
                                  onChange={(tagIds) => {
                                    setBranchingConditions({
                                      ...branchingConditions,
                                      [reminderTemplate.id]: {
                                        ...branchingConditions[reminderTemplate.id],
                                        type: 'tag',
                                        selectedTags: tagIds,
                                        selectedStatuses: [],
                                        selectedSegments: []
                                      }
                                    })
                                  }}
                                  multiple={true}
                                />
                              </div>
                            </div>
                          )}

                          {/* Status selection */}
                          {branchingConditions[reminderTemplate.id]?.type === 'status' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                対象ステータスを選択
                              </label>
                              <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                                <StatusSelector
                                  statuses={statuses}
                                  statusFolders={statusFolders}
                                  selectedStatusIds={branchingConditions[reminderTemplate.id]?.selectedStatuses || []}
                                  onChange={(statusIds) => {
                                    setBranchingConditions({
                                      ...branchingConditions,
                                      [reminderTemplate.id]: {
                                        ...branchingConditions[reminderTemplate.id],
                                        type: 'status',
                                        selectedTags: [],
                                        selectedStatuses: statusIds,
                                        selectedSegments: []
                                      }
                                    })
                                  }}
                                  multiple={true}
                                />
                              </div>
                            </div>
                          )}

                          {/* Segment selection */}
                          {branchingConditions[reminderTemplate.id]?.type === 'segment' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                対象セグメントを選択
                              </label>
                              <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                                <SegmentSelector
                                  segments={segments}
                                  segmentFolders={segmentFolders}
                                  selectedSegmentIds={branchingConditions[reminderTemplate.id]?.selectedSegments || []}
                                  onChange={(segmentIds) => {
                                    setBranchingConditions({
                                      ...branchingConditions,
                                      [reminderTemplate.id]: {
                                        ...branchingConditions[reminderTemplate.id],
                                        type: 'segment',
                                        selectedTags: [],
                                        selectedStatuses: [],
                                        selectedSegments: segmentIds
                                      }
                                    })
                                  }}
                                  multiple={true}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Template Preview */}
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

// Tag selector with folder hierarchy
interface TagFolderHierarchy extends TagFolder {
  children: TagFolderHierarchy[]
}

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
          setSelectedFolderId(folder.id)
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
    <div className="p-3">
      <div className="mb-3">
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
      </div>

      <div className="space-y-1">
        {searchQuery ? (
          filteredTags.length > 0 ? (
            filteredTags.map(tag => (
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TagIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">検索結果がありません</p>
            </div>
          )
        ) : (
          <>
            {folderHierarchy.map(folder => renderFolder(folder))}
            {uncategorizedTags.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">未分類</div>
                {uncategorizedTags.map(tag => (
                  <label
                    key={tag.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
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
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Status selector with folder hierarchy
interface StatusFolderHierarchy extends StatusFolder {
  children: StatusFolderHierarchy[]
}

function StatusSelector({
  statuses, statusFolders, selectedStatusIds, onChange, multiple = true
}: {
  statuses: Status[], statusFolders: StatusFolder[], selectedStatusIds: string[]
  onChange: (statusIds: string[]) => void, multiple?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const buildFolderHierarchy = (folders: StatusFolder[], parentId: string | null = null): StatusFolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const getStatusesInFolder = (folderId: string | null): Status[] => {
    if (!statuses || !Array.isArray(statuses)) return []
    return statuses.filter(status => status.folderId === folderId)
  }

  const getFilteredStatuses = (): Status[] => {
    if (!searchQuery) {
      if (selectedFolderId !== null) {
        return getStatusesInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
      }
      return statuses || []
    }
    return (statuses || []).filter(status => 
      status.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderFolder = (folder: StatusFolderHierarchy, level: number = 0) => (
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
          setSelectedFolderId(folder.id)
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
          {(getStatusesInFolder(folder.id) || []).length}
        </span>
      </div>
      
      {expandedFolders.has(folder.id) && (
        <div>
          {(getStatusesInFolder(folder.id) || []).map(status => (
            <label
              key={status.id}
              className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
              style={{ marginLeft: `${(level + 1) * 16}px` }}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : "status-selector"}
                checked={selectedStatusIds.includes(status.id)}
                onChange={(e) => {
                  if (multiple) {
                    if (e.target.checked) {
                      onChange([...selectedStatusIds, status.id])
                    } else {
                      onChange(selectedStatusIds.filter(id => id !== status.id))
                    }
                  } else {
                    onChange([status.id])
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">{status.label}</span>
            </label>
          ))}
          {folder.children.map((child) => renderFolder(child, level + 1))}
        </div>
      )}
    </div>
  )

  const folderHierarchy = buildFolderHierarchy(statusFolders || [])
  const uncategorizedStatuses = getStatusesInFolder(null)
  const filteredStatuses = getFilteredStatuses()

  return (
    <div className="p-3">
      <div className="mb-3">
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
      </div>

      <div className="space-y-1">
        {searchQuery ? (
          filteredStatuses.length > 0 ? (
            filteredStatuses.map(status => (
              <label
                key={status.id}
                className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "status-selector"}
                  checked={selectedStatusIds.includes(status.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedStatusIds, status.id])
                      } else {
                        onChange(selectedStatusIds.filter(id => id !== status.id))
                      }
                    } else {
                      onChange([status.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{status.label}</div>
                  <div className="text-xs text-gray-500">コード: {status.code}</div>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">検索結果がありません</p>
            </div>
          )
        ) : (
          <>
            {folderHierarchy.map(folder => renderFolder(folder))}
            {uncategorizedStatuses.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">未分類</div>
                {uncategorizedStatuses.map(status => (
                  <label
                    key={status.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "status-selector"}
                      checked={selectedStatusIds.includes(status.id)}
                      onChange={(e) => {
                        if (multiple) {
                          if (e.target.checked) {
                            onChange([...selectedStatusIds, status.id])
                          } else {
                            onChange(selectedStatusIds.filter(id => id !== status.id))
                          }
                        } else {
                          onChange([status.id])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Segment selector with folder hierarchy
interface SegmentFolderHierarchy extends SegmentFolder {
  children: SegmentFolderHierarchy[]
}

function SegmentSelector({
  segments, segmentFolders, selectedSegmentIds, onChange, multiple = true
}: {
  segments: Segment[], segmentFolders: SegmentFolder[], selectedSegmentIds: string[]
  onChange: (segmentIds: string[]) => void, multiple?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const buildFolderHierarchy = (folders: SegmentFolder[], parentId: string | null = null): SegmentFolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
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
      segment.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderFolder = (folder: SegmentFolderHierarchy, level: number = 0) => (
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
          setSelectedFolderId(folder.id)
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
          {(getSegmentsInFolder(folder.id) || []).length}
        </span>
      </div>
      
      {expandedFolders.has(folder.id) && (
        <div>
          {(getSegmentsInFolder(folder.id) || []).map(segment => (
            <label
              key={segment.id}
              className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
              style={{ marginLeft: `${(level + 1) * 16}px` }}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : "segment-selector"}
                checked={selectedSegmentIds.includes(segment.id)}
                onChange={(e) => {
                  if (multiple) {
                    if (e.target.checked) {
                      onChange([...selectedSegmentIds, segment.id])
                    } else {
                      onChange(selectedSegmentIds.filter(id => id !== segment.id))
                    }
                  } else {
                    onChange([segment.id])
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">{segment.name}</span>
            </label>
          ))}
          {folder.children.map((child) => renderFolder(child, level + 1))}
        </div>
      )}
    </div>
  )

  const folderHierarchy = buildFolderHierarchy(segmentFolders || [])
  const uncategorizedSegments = getSegmentsInFolder(null)
  const filteredSegments = getFilteredSegments()

  return (
    <div className="p-3">
      <div className="mb-3">
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
      </div>

      <div className="space-y-1">
        {searchQuery ? (
          filteredSegments.length > 0 ? (
            filteredSegments.map(segment => (
              <label
                key={segment.id}
                className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "segment-selector"}
                  checked={selectedSegmentIds.includes(segment.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedSegmentIds, segment.id])
                      } else {
                        onChange(selectedSegmentIds.filter(id => id !== segment.id))
                      }
                    } else {
                      onChange([segment.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{segment.name}</div>
                  {segment.memo && (
                    <div className="text-xs text-gray-500 mt-0.5">{segment.memo}</div>
                  )}
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">検索結果がありません</p>
            </div>
          )
        ) : (
          <>
            {folderHierarchy.map(folder => renderFolder(folder))}
            {uncategorizedSegments.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">未分類</div>
                {uncategorizedSegments.map(segment => (
                  <label
                    key={segment.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "segment-selector"}
                      checked={selectedSegmentIds.includes(segment.id)}
                      onChange={(e) => {
                        if (multiple) {
                          if (e.target.checked) {
                            onChange([...selectedSegmentIds, segment.id])
                          } else {
                            onChange(selectedSegmentIds.filter(id => id !== segment.id))
                          }
                        } else {
                          onChange([segment.id])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{segment.name}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Event type definition
interface Event {
  id: string
  name: string
  type: 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
  date?: string
  description?: string
  folderId?: string
}

interface EventFolder {
  id: string
  name: string
  description?: string
  parentId?: string | null
  createdAt: Date
  updatedAt: Date
}

interface EventFolderHierarchy extends EventFolder {
  children: EventFolderHierarchy[]
}

// Event selector with folder hierarchy
function EventSelector({
  events, eventFolders, selectedEventIds, onChange, multiple = true
}: {
  events: Event[], eventFolders: EventFolder[], selectedEventIds: string[]
  onChange: (eventIds: string[]) => void, multiple?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const buildFolderHierarchy = (folders: EventFolder[], parentId: string | null = null): EventFolderHierarchy[] => {
    if (!folders || !Array.isArray(folders)) return []
    const filtered = folders.filter(folder => folder.parentId === parentId)
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const getEventsInFolder = (folderId: string | null): Event[] => {
    if (!events || !Array.isArray(events)) return []
    return events.filter(event => event.folderId === folderId)
  }

  const getFilteredEvents = (): Event[] => {
    if (!searchQuery) {
      if (selectedFolderId !== null) {
        return getEventsInFolder(selectedFolderId === 'uncategorized' ? null : selectedFolderId)
      }
      return events || []
    }
    return (events || []).filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderFolder = (folder: EventFolderHierarchy, level: number = 0) => (
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
          setSelectedFolderId(folder.id)
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
          {(getEventsInFolder(folder.id) || []).length}
        </span>
      </div>
      
      {expandedFolders.has(folder.id) && (
        <div>
          {(getEventsInFolder(folder.id) || []).map(event => (
            <label
              key={event.id}
              className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
              style={{ marginLeft: `${(level + 1) * 16}px` }}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : "event-selector"}
                checked={selectedEventIds.includes(event.id)}
                onChange={(e) => {
                  if (multiple) {
                    if (e.target.checked) {
                      onChange([...selectedEventIds, event.id])
                    } else {
                      onChange(selectedEventIds.filter(id => id !== event.id))
                    }
                  } else {
                    onChange([event.id])
                  }
                }}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <span className="text-sm text-gray-700">{event.name}</span>
              {event.type && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  event.type === 'reservation' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'birthday' ? 'bg-green-100 text-green-800' :
                  event.type === 'anniversary' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'contract_expiry' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.type === 'reservation' ? '予約' :
                   event.type === 'birthday' ? '誕生日' :
                   event.type === 'anniversary' ? '記念日' :
                   event.type === 'contract_expiry' ? '契約期限' :
                   'カスタム'}
                </span>
              )}
            </label>
          ))}
          {folder.children.map((child) => renderFolder(child, level + 1))}
        </div>
      )}
    </div>
  )

  const folderHierarchy = buildFolderHierarchy(eventFolders || [])
  const uncategorizedEvents = getEventsInFolder(null)
  const filteredEvents = getFilteredEvents()

  return (
    <div className="p-3">
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="イベントを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        {searchQuery ? (
          filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <label
                key={event.id}
                className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded border border-gray-200"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={multiple ? undefined : "event-selector"}
                  checked={selectedEventIds.includes(event.id)}
                  onChange={(e) => {
                    if (multiple) {
                      if (e.target.checked) {
                        onChange([...selectedEventIds, event.id])
                      } else {
                        onChange(selectedEventIds.filter(id => id !== event.id))
                      }
                    } else {
                      onChange([event.id])
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{event.name}</div>
                  {event.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{event.description}</div>
                  )}
                </div>
                {event.type && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    event.type === 'reservation' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'birthday' ? 'bg-green-100 text-green-800' :
                    event.type === 'anniversary' ? 'bg-purple-100 text-purple-800' :
                    event.type === 'contract_expiry' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type === 'reservation' ? '予約' :
                     event.type === 'birthday' ? '誕生日' :
                     event.type === 'anniversary' ? '記念日' :
                     event.type === 'contract_expiry' ? '契約期限' :
                     'カスタム'}
                  </span>
                )}
              </label>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">検索結果がありません</p>
            </div>
          )
        ) : (
          <>
            {folderHierarchy.map(folder => renderFolder(folder))}
            {uncategorizedEvents.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">未分類</div>
                {uncategorizedEvents.map(event => (
                  <label
                    key={event.id}
                    className="flex items-center py-1 px-2 hover:bg-gray-50 cursor-pointer rounded"
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={multiple ? undefined : "event-selector"}
                      checked={selectedEventIds.includes(event.id)}
                      onChange={(e) => {
                        if (multiple) {
                          if (e.target.checked) {
                            onChange([...selectedEventIds, event.id])
                          } else {
                            onChange(selectedEventIds.filter(id => id !== event.id))
                          }
                        } else {
                          onChange([event.id])
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{event.name}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
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