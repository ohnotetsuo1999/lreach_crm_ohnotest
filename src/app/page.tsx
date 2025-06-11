'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { UserManagement } from '@/components/UserManagement/UserManagement'
import { SegmentBuilder } from '@/components/SegmentBuilder/SegmentBuilder'
import { ScenarioList } from '@/components/ScenarioList/ScenarioList'
import { ScenarioEditor } from '@/components/ScenarioEditor/ScenarioEditor'
import { TemplateEditor } from '@/components/TemplateEditor/TemplateEditor'
import { DeliveryReport } from '@/components/DeliveryReport/DeliveryReport'
import { 
  User, 
  Tag, 
  Status, 
  Segment, 
  Campaign, 
  Scenario, 
  Template, 
  DeliveryLog 
} from '@/types'
import { LayoutDashboard, Users, Target, List, BarChart3, Settings2, Brain, Zap } from 'lucide-react'
import { AIInsights } from '@/components/AI/AIInsights'
import { AIChatAssistant } from '@/components/AI/AIChatAssistant'
import { AIPredictiveAnalytics } from '@/components/AI/AIPredictiveAnalytics'
import { AISmartAlerts } from '@/components/AI/AISmartAlerts'
import { ActionRuleManager } from '@/components/ActionRules/ActionRuleManager'

export default function LineMarketingApp() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'segments' | 'scenarios' | 'templates' | 'reports' | 'ai-insights' | 'ai-analytics' | 'action-rules'>('dashboard')
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list')
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([])
  const [actionRules, setActionRules] = useState<any[]>([])

  // Initialize data
  useEffect(() => {
    // Initialize with mock data
    const mockTags: Tag[] = [
      { id: '1', name: 'VIP', type: 'MANUAL', createdAt: new Date() },
      { id: '2', name: 'プレミアム', type: 'MANUAL', createdAt: new Date() },
      { id: '3', name: '新規', type: 'AUTOMATIC', createdAt: new Date() },
      { id: '4', name: '休眠', type: 'BEHAVIORAL', createdAt: new Date() },
      { id: '5', name: 'アクティブ', type: 'BEHAVIORAL', createdAt: new Date() }
    ]
    
    const mockStatuses: Status[] = [
      { id: '1', code: 'lead', label: 'リード' },
      { id: '2', code: 'prospect', label: '見込み客' },
      { id: '3', code: 'customer', label: '顧客' },
      { id: '4', code: 'churned', label: '離脱' }
    ]
    
    const mockUsers: User[] = [
      {
        id: '1',
        name: '田中太郎',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        lineUid: 'U1234567890',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: [mockTags[0], mockTags[4]],
        statusHistory: [
          {
            id: '1',
            userId: '1',
            statusId: '3',
            changedAt: new Date(),
            status: mockStatuses[2]
          }
        ]
      },
      {
        id: '2',
        name: '佐藤花子',
        email: 'sato@example.com',
        phone: '080-9876-5432',
        lineUid: 'U0987654321',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: [mockTags[1], mockTags[2]],
        statusHistory: [
          {
            id: '2',
            userId: '2',
            statusId: '2',
            changedAt: new Date(),
            status: mockStatuses[1]
          }
        ]
      },
      {
        id: '3',
        name: '鈴木一郎',
        email: 'suzuki@example.com',
        phone: '070-1111-2222',
        lineUid: 'U1111222233',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: [mockTags[3]],
        statusHistory: [
          {
            id: '3',
            userId: '3',
            statusId: '4',
            changedAt: new Date(),
            status: mockStatuses[3]
          }
        ]
      },
      {
        id: '4',
        name: '高橋美咲',
        email: 'takahashi@example.com',
        lineUid: 'U4444555566',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: [mockTags[2], mockTags[4]],
        statusHistory: [
          {
            id: '4',
            userId: '4',
            statusId: '1',
            changedAt: new Date(),
            status: mockStatuses[0]
          }
        ]
      },
      {
        id: '5',
        name: '山田次郎',
        email: 'yamada@example.com',
        phone: '090-5555-6666',
        lineUid: 'U5555666677',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: [mockTags[0], mockTags[1]],
        statusHistory: [
          {
            id: '5',
            userId: '5',
            statusId: '3',
            changedAt: new Date(),
            status: mockStatuses[2]
          }
        ]
      }
    ]

    const mockSegments: Segment[] = [
      {
        id: '1',
        name: 'VIPユーザー',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'tags', operator: 'in', value: ['1'], logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: '新規登録者（過去7日）',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ]

    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: '春のキャンペーン',
        startAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        scenarios: []
      },
      {
        id: '2',
        name: '新規登録ウェルカムシリーズ',
        startAt: new Date(),
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        scenarios: []
      }
    ]

    const mockTemplates: Template[] = [
      {
        id: '1',
        packId: '1',
        order: 1,
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'こんにちは{{user.name}}さん！\n\nLINE公式アカウントにご登録いただき、ありがとうございます。\n\n特別なお知らせをお届けしますので、お楽しみに！'
        }),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        packId: '2',
        order: 1,
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: '特別オファーのご案内',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '🎉 特別オファー',
                  weight: 'bold',
                  size: 'xl',
                  color: '#1DB446'
                },
                {
                  type: 'text',
                  text: '{{user.name}}様限定',
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: '今なら30%オフでご利用いただけます！',
                  wrap: true,
                  margin: 'md'
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    label: '詳細を見る',
                    uri: 'https://example.com/offer'
                  },
                  style: 'primary',
                  color: '#1DB446'
                }
              ]
            }
          }
        }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        packId: '2',
        order: 2,
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '📋 アンケートにご協力ください\n\nより良いサービス提供のため、簡単なアンケートにお答えください。\n\n回答者には特別クーポンをプレゼント🎁'
        }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '4',
        packId: '3',
        order: 1,
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '🌸 春のキャンペーン開始！\n\n期間限定で全商品20%オフ！\n詳細は公式サイトをチェック✨'
        }),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '5',
        packId: '4',
        order: 1,
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'VIP限定スペシャルオファー',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '👑 VIP限定',
                  weight: 'bold',
                  size: 'xl',
                  color: '#FFD700'
                },
                {
                  type: 'text',
                  text: 'スペシャルオファー',
                  size: 'lg',
                  weight: 'bold',
                  margin: 'sm'
                },
                {
                  type: 'text',
                  text: '{{user.name}}様だけの特別価格でご提供',
                  size: 'sm',
                  color: '#666666',
                  margin: 'md'
                }
              ]
            }
          }
        }),
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ]

    const mockScenarios: Scenario[] = [
      {
        id: '1',
        campaignId: '2',
        name: '新規登録ウェルカムシリーズ',
        trigger: 'TAG_ADDED',
        triggerValue: '新規',
        isActive: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        packs: [
          {
            id: '1',
            scenarioId: '1',
            order: 1,
            offsetMinutes: 0,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            templates: [mockTemplates[0]] // ウェルカムメッセージ
          },
          {
            id: '2',
            scenarioId: '1',
            order: 2,
            offsetMinutes: 1440, // 24時間後
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            templates: [mockTemplates[1], mockTemplates[2]] // 特別オファー + アンケート
          }
        ]
      },
      {
        id: '2',
        campaignId: '1',
        name: '春のキャンペーン告知',
        trigger: 'SCHEDULE',
        triggerValue: '2024-03-01 10:00',
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        packs: [
          {
            id: '3',
            scenarioId: '2',
            order: 1,
            offsetMinutes: 0,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            templates: [mockTemplates[3]] // 春のキャンペーン
          }
        ]
      },
      {
        id: '3',
        campaignId: '1',
        name: 'VIP限定オファー',
        trigger: 'MANUAL',
        isActive: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        packs: [
          {
            id: '4',
            scenarioId: '3',
            order: 1,
            offsetMinutes: 0,
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            templates: [mockTemplates[4]] // VIP限定オファー
          }
        ]
      }
    ]

    const mockDeliveryLogs: DeliveryLog[] = [
      {
        id: '1',
        templateId: '1',
        userId: '1',
        status: 'OPENED',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        template: mockTemplates[0],
        user: mockUsers[0]
      },
      {
        id: '2',
        templateId: '1',
        userId: '2',
        status: 'CLICKED',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        clickedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        template: mockTemplates[0],
        user: mockUsers[1]
      },
      {
        id: '3',
        templateId: '2',
        userId: '3',
        status: 'DELIVERED',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        template: mockTemplates[1],
        user: mockUsers[2]
      },
      {
        id: '4',
        templateId: '1',
        userId: '4',
        status: 'OPENED',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        openedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        template: mockTemplates[0],
        user: mockUsers[3]
      },
      {
        id: '5',
        templateId: '2',
        userId: '5',
        status: 'FAILED',
        sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        error: 'ユーザーがブロックしています',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        template: mockTemplates[1],
        user: mockUsers[4]
      },
      {
        id: '6',
        templateId: '1',
        userId: '1',
        status: 'CLICKED',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        openedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        clickedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        template: mockTemplates[0],
        user: mockUsers[0]
      }
    ]
    
    setTags(mockTags)
    setStatuses(mockStatuses)
    setUsers(mockUsers)
    setSegments(mockSegments)
    setScenarios(mockScenarios)
    setTemplates(mockTemplates)
    setCampaigns(mockCampaigns)
    setDeliveryLogs(mockDeliveryLogs)

    // Mock Action Rules
    const mockActionRules = [
      {
        id: '1',
        description: '商品ページURL閲覧者にVIPタグ付与',
        actionType: 'URL_CLICK',
        actionCondition: {
          operator: 'contains',
          value: 'shop.example.com/product',
          regex: ''
        },
        tagActions: [
          {
            type: 'ADD_TAG',
            tagId: '1' // VIPタグ
          }
        ],
        isActive: true,
        priority: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        description: 'お問い合わせボタンクリック者にリード変更',
        actionType: 'BUTTON_CLICK',
        actionCondition: {
          operator: 'equals',
          value: 'お問い合わせ',
          regex: ''
        },
        tagActions: [
          {
            type: 'SET_STATUS',
            statusId: '1' // リードステータス
          }
        ],
        isActive: true,
        priority: 8,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        description: 'アンケート返信者に特別タグ付与',
        actionType: 'REPLY',
        actionCondition: {
          operator: 'any',
          value: '',
          regex: ''
        },
        tagActions: [
          {
            type: 'ADD_TAG',
            tagId: '5', // アクティブタグ
            condition: {
              ifNotHasTag: ['1'] // VIPタグを持っていない場合のみ
            }
          }
        ],
        templateId: '3', // アンケートテンプレート
        isActive: true,
        priority: 5,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ]
    
    setActionRules(mockActionRules)
  }, [])

  // Navigation handlers
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentView('list')
    setEditingItem(null)
  }
  
  const handleEdit = (item: any) => {
    setEditingItem(item)
    setCurrentView('edit')
  }
  
  const handleBack = () => {
    setCurrentView('list')
    setEditingItem(null)
  }
  
  // User Management handlers
  const handleCreateUser = () => {
    console.log('Create user')
  }
  
  const handleImportUsers = () => {
    console.log('Import users')
  }
  
  const handleExportUsers = () => {
    console.log('Export users')
  }
  
  const handleEditUser = (user: User) => {
    handleEdit(user)
  }
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
  }
  
  const handleAddTag = (userId: string, tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (!tag) return
    
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, tags: [...user.tags, tag] }
        : user
    ))
  }
  
  const handleRemoveTag = (userId: string, tagId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, tags: user.tags.filter(t => t.id !== tagId) }
        : user
    ))
  }
  
  const handleCreateTag = () => {
    console.log('Create tag')
  }
  
  const bulkActions = {
    addTags: (userIds: string[], tagIds: string[]) => {
      console.log('Bulk add tags', userIds, tagIds)
    },
    removeTags: (userIds: string[], tagIds: string[]) => {
      console.log('Bulk remove tags', userIds, tagIds)
    },
    changeStatus: (userIds: string[], statusId: string) => {
      console.log('Bulk change status', userIds, statusId)
    },
    delete: (userIds: string[]) => {
      setUsers(users.filter(u => !userIds.includes(u.id)))
    },
    export: (userIds: string[]) => {
      console.log('Bulk export', userIds)
    },
    sendMessage: (userIds: string[]) => {
      console.log('Bulk send message', userIds)
    }
  }
  
  // Segment handlers
  const handleSaveSegment = (segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSegment: Segment = {
      ...segment,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSegments([...segments, newSegment])
  }
  
  const handleLoadSegment = (segment: Segment) => {
    console.log('Load segment', segment)
  }
  
  // Scenario handlers
  const handleCreateScenario = () => {
    setEditingItem(null)
    setCurrentView('edit')
  }
  
  const handleEditScenario = (scenario: Scenario) => {
    handleEdit(scenario)
  }
  
  const handleDuplicateScenario = (scenario: Scenario) => {
    const newScenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (コピー)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setScenarios([...scenarios, newScenario])
  }
  
  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(scenarios.filter(s => s.id !== scenarioId))
  }
  
  const handleToggleActive = (scenarioId: string, isActive: boolean) => {
    setScenarios(scenarios.map(s => 
      s.id === scenarioId ? { ...s, isActive } : s
    ))
  }
  
  const handleViewAnalytics = (scenarioId: string) => {
    console.log('View analytics', scenarioId)
  }
  
  const handleSaveScenario = (scenario: Scenario) => {
    if (scenario.id) {
      setScenarios(scenarios.map(s => s.id === scenario.id ? scenario : s))
    } else {
      const newScenario = {
        ...scenario,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setScenarios([...scenarios, newScenario])
    }
    handleBack()
  }
  
  // Template handlers
  const handleAddTemplate = (packId: string) => {
    console.log('Add template to pack', packId)
  }
  
  const handleEditTemplate = (template: Template) => {
    handleEdit(template)
  }
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
  }
  
  const handleSaveTemplate = (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTemplates([...templates, newTemplate])
    handleBack()
  }
  
  const handlePreviewScenario = (scenario: Scenario) => {
    console.log('Preview scenario', scenario)
  }
  
  const handleReorderTemplates = (packId: string, templates: Template[]) => {
    setScenarios(scenarios.map(scenario => ({
      ...scenario,
      packs: scenario.packs.map(pack => 
        pack.id === packId ? { ...pack, templates } : pack
      )
    })))
  }
  
  // Report handlers
  const handleExportReport = () => {
    console.log('Export report')
  }
  
  const handleRetryDelivery = (logId: string) => {
    console.log('Retry delivery', logId)
  }
  
  const handleViewLogDetails = (log: DeliveryLog) => {
    console.log('View log details', log)
  }

  // AI handlers
  const handleApplySuggestion = (suggestion: any) => {
    console.log('Apply AI suggestion:', suggestion)
    
    switch (suggestion.action?.type) {
      case 'create_segment':
        console.log('Creating segment:', suggestion.action.name)
        break
      case 'create_scenario':
        console.log('Creating scenario:', suggestion.action.name)
        break
      case 'update_timing':
        console.log('Updating timing to hour:', suggestion.action.recommendedHour)
        break
      case 'improve_template':
        console.log('Improving template:', suggestion.action.templateId)
        break
      default:
        console.log('Generic action applied')
    }
  }

  const handleAIAction = (action: string, data: any) => {
    console.log('AI Action:', action, data)
    
    switch (action) {
      case 'テンプレート見直し':
        setActiveTab('templates')
        break
      case 'VIPセグメント作成':
        setActiveTab('segments')
        break
      case 'シナリオ見直し':
        setActiveTab('scenarios')
        break
      default:
        console.log('Action not implemented:', action)
    }
  }

  // Action Rule handlers
  const handleCreateActionRule = (rule: any) => {
    const newRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setActionRules([...actionRules, newRule])
  }

  const handleUpdateActionRule = (ruleId: string, rule: any) => {
    setActionRules(actionRules.map(r => 
      r.id === ruleId ? { ...r, ...rule, updatedAt: new Date() } : r
    ))
  }

  const handleDeleteActionRule = (ruleId: string) => {
    setActionRules(actionRules.filter(r => r.id !== ruleId))
  }

  const handleToggleActionRule = (ruleId: string, isActive: boolean) => {
    setActionRules(actionRules.map(r => 
      r.id === ruleId ? { ...r, isActive, updatedAt: new Date() } : r
    ))
  }

  // Calculate dashboard stats
  const dashboardStats = {
    totalUsers: users.length,
    totalSent: deliveryLogs.length,
    totalOpened: deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length,
    totalClicked: deliveryLogs.filter(log => log.status === 'CLICKED').length,
    openRate: deliveryLogs.length > 0 ? (deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / deliveryLogs.length) * 100 : 0,
    clickRate: deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length > 0 ? (deliveryLogs.filter(log => log.status === 'CLICKED').length / deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length) * 100 : 0
  }
  
  const navigationItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'users', label: 'ユーザー管理', icon: Users },
    { id: 'segments', label: 'セグメント', icon: Target },
    { id: 'scenarios', label: 'シナリオ', icon: List },
    { id: 'templates', label: 'テンプレート', icon: Settings2 },
    { id: 'action-rules', label: 'アクションルール', icon: Zap },
    { id: 'reports', label: 'レポート', icon: BarChart3 },
    { id: 'ai-insights', label: 'AIインサイト', icon: Brain },
    { id: 'ai-analytics', label: 'AI予測分析', icon: Brain }
  ] as const

  const renderMainContent = () => {
    if (activeTab === 'scenarios' && currentView === 'edit') {
      return (
        <ScenarioEditor
          scenario={editingItem}
          onSave={handleSaveScenario}
          onBack={handleBack}
          onAddTemplate={handleAddTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onPreviewScenario={handlePreviewScenario}
          onReorderTemplates={handleReorderTemplates}
          actionRules={actionRules}
          tags={tags}
          statuses={statuses}
          onCreateActionRule={handleCreateActionRule}
          onUpdateActionRule={handleUpdateActionRule}
          onDeleteActionRule={handleDeleteActionRule}
          templates={templates}
          onCreateTemplate={(template) => {
            const newTemplate = {
              ...template,
              id: `template_${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            setTemplates([...templates, newTemplate])
          }}
        />
      )
    }
    
    if (activeTab === 'templates' && currentView === 'edit') {
      return (
        <TemplateEditor
          template={editingItem}
          onSave={handleSaveTemplate}
          onBack={handleBack}
          actionRules={actionRules}
          tags={tags}
          statuses={statuses}
          onCreateActionRule={handleCreateActionRule}
          onDeleteActionRule={handleDeleteActionRule}
        />
      )
    }
    
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            deliveries={deliveryLogs}
            totalUsers={dashboardStats.totalUsers}
            totalSent={dashboardStats.totalSent}
            totalOpened={dashboardStats.totalOpened}
            totalClicked={dashboardStats.totalClicked}
            openRate={dashboardStats.openRate}
            clickRate={dashboardStats.clickRate}
            users={users}
            scenarios={scenarios}
            onAIActionClick={handleAIAction}
          />
        )
        
      case 'users':
        return (
          <UserManagement
            users={users}
            tags={tags}
            statuses={statuses}
            onCreateUser={handleCreateUser}
            onImportUsers={handleImportUsers}
            onExportUsers={handleExportUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onCreateTag={handleCreateTag}
            onBulkActions={bulkActions}
          />
        )
        
      case 'segments':
        return (
          <SegmentBuilder
            segments={segments}
            users={users}
            tags={tags}
            statuses={statuses}
            onSaveSegment={handleSaveSegment}
            onLoadSegment={handleLoadSegment}
          />
        )
        
      case 'scenarios':
        return (
          <ScenarioList
            scenarios={scenarios}
            campaigns={campaigns}
            onCreateScenario={handleCreateScenario}
            onEditScenario={handleEditScenario}
            onDuplicateScenario={handleDuplicateScenario}
            onDeleteScenario={handleDeleteScenario}
            onToggleActive={handleToggleActive}
            onViewAnalytics={handleViewAnalytics}
          />
        )
        
      case 'templates':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">テンプレート管理</h2>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setCurrentView('edit')
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                新規テンプレート
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-500">テンプレート一覧がここに表示されます。</p>
            </div>
          </div>
        )
        
      case 'reports':
        return (
          <DeliveryReport
            deliveryLogs={deliveryLogs}
            templates={templates}
            onExportReport={handleExportReport}
            onRetryDelivery={handleRetryDelivery}
            onViewLogDetails={handleViewLogDetails}
          />
        )
        
      case 'ai-insights':
        return (
          <AIInsights
            users={users}
            deliveryLogs={deliveryLogs}
            scenarios={scenarios}
            templates={templates}
            onApplySuggestion={handleApplySuggestion}
          />
        )
        
      case 'ai-analytics':
        return (
          <AIPredictiveAnalytics
            deliveryLogs={deliveryLogs}
            users={users}
            scenarios={scenarios}
          />
        )
        
      case 'action-rules':
        return (
          <ActionRuleManager
            actionRules={actionRules}
            tags={tags}
            statuses={statuses}
            scenarios={scenarios}
            templates={templates}
            onCreateRule={handleCreateActionRule}
            onUpdateRule={handleUpdateActionRule}
            onDeleteRule={handleDeleteActionRule}
            onToggleRule={handleToggleActionRule}
          />
        )
        
      default:
        return <div>Unknown tab</div>
    }
  }




  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">LINE Marketing</h1>
          <p className="text-sm text-gray-600 mt-1">自動化プラットフォーム</p>
        </div>
        
        <nav className="px-4 pb-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'dashboard' && 'システム全体の状況を確認'}
                  {activeTab === 'users' && 'ユーザー情報の管理とセグメンテーション'}
                  {activeTab === 'segments' && 'ユーザーセグメントの作成と管理'}
                  {activeTab === 'scenarios' && '自動配信シナリオの設定'}
                  {activeTab === 'templates' && 'メッセージテンプレートの管理'}
                  {activeTab === 'action-rules' && 'ユーザーアクションに基づく自動タグ付与ルール'}
                  {activeTab === 'reports' && '配信結果の分析とレポート'}
                  {activeTab === 'ai-insights' && 'AIによるスマートな改善提案'}
                  {activeTab === 'ai-analytics' && '機械学習による予測分析'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <AISmartAlerts
                  users={users}
                  deliveryLogs={deliveryLogs}
                  scenarios={scenarios}
                  onActionClick={handleAIAction}
                />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    管理者
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">管</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderMainContent()}
        </main>
      </div>
      
      {/* AI Chat Assistant */}
      <AIChatAssistant
        users={users}
        scenarios={scenarios}
        deliveryLogs={deliveryLogs}
        onExecuteAction={handleAIAction}
      />
    </div>
  )
}
