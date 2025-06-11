'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { UserManagement } from '@/components/UserManagement/UserManagement'
import { SegmentBuilder } from '@/components/SegmentBuilder/SegmentBuilder'
import { SegmentList } from '@/components/SegmentBuilder/SegmentList'
import { ScenarioList } from '@/components/ScenarioList/ScenarioList'
import { ScenarioEditor } from '@/components/ScenarioEditor/ScenarioEditor'
import { TemplateEditor } from '@/components/TemplateEditor/TemplateEditor'
import { TagManagement } from '@/components/TagManagement/TagManagement'
import { 
  User, 
  Tag, 
  TagFolder,
  Status, 
  Segment, 
  Campaign, 
  Scenario, 
  Template, 
  DeliveryLog 
} from '@/types'
import { LayoutDashboard, Users, Target, List, BarChart3, Settings2, Zap, Tags, Send, Plus } from 'lucide-react'
import { ActionRuleManager } from '@/components/ActionRules/ActionRuleManager'
import { Reports } from '@/components/Reports/Reports'
import { BroadcastPage } from '@/components/Broadcast/BroadcastPage'

export default function LineMarketingApp() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'segments' | 'scenarios' | 'templates' | 'tags' | 'reports' | 'action-rules' | 'broadcast'>('dashboard')
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [segmentView, setSegmentView] = useState<'list' | 'builder'>('list')
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  
  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tagFolders, setTagFolders] = useState<TagFolder[]>([])
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
    const mockTagFolders: TagFolder[] = [
      { id: '1', name: 'プロジェクト', description: 'プロジェクト関連のタグ', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'ウェブサイト', description: 'ウェブ開発技術', parentId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'モバイルアプリ', description: 'モバイル開発技術', parentId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: '個人', description: '個人的なタグ', createdAt: new Date(), updatedAt: new Date() },
      { id: '5', name: '趣味', description: '趣味・娯楽関連', parentId: '4', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockTags: Tag[] = [
      { id: '1', name: 'JavaScript', type: 'MANUAL', folderId: '2', note: 'フロントエンド開発で使用', createdAt: new Date() },
      { id: '2', name: 'React', type: 'MANUAL', folderId: '2', note: 'UIライブラリ、SPAに最適', createdAt: new Date() },
      { id: '3', name: 'Vue.js', type: 'MANUAL', folderId: '2', note: 'プログレッシブフレームワーク', createdAt: new Date() },
      { id: '4', name: 'Swift', type: 'MANUAL', folderId: '3', note: 'iOS開発言語', createdAt: new Date() },
      { id: '5', name: 'Kotlin', type: 'MANUAL', folderId: '3', note: 'Android開発に使用', createdAt: new Date() },
      { id: '6', name: '写真', type: 'AUTOMATIC', folderId: '5', note: '趣味の写真撮影', createdAt: new Date() },
      { id: '7', name: '旅行', type: 'BEHAVIORAL', folderId: '5', note: '国内外の旅行記録', createdAt: new Date() },
      { id: '8', name: 'その他', type: 'MANUAL', note: '分類が決まっていないタグ', createdAt: new Date() } // 未分類タグ
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
        address: '東京都渋谷区渋谷2-24-12',
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
        address: '大阪府大阪市北区梅田3-1-3',
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
        address: '愛知県名古屋市中区栄3-15-33',
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
        address: '福岡県福岡市博多区博多駅前2-1-1',
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
        address: '神奈川県横浜市西区高島2-19-12',
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
    setTagFolders(mockTagFolders)
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
    if (tab === 'segments') {
      setSegmentView('list')
      setEditingSegment(null)
    }
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
  
  const handleCreateTagForUser = () => {
    console.log('Create tag for user')
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
    }
  }
  
  // Segment handlers
  const handleSaveSegment = (segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSegment) {
      // Update existing segment
      const updatedSegment: Segment = {
        ...editingSegment,
        ...segment,
        updatedAt: new Date()
      }
      setSegments(segments.map(s => s.id === editingSegment.id ? updatedSegment : s))
    } else {
      // Create new segment
      const newSegment: Segment = {
        ...segment,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setSegments([...segments, newSegment])
    }
    
    // Return to list view
    setSegmentView('list')
    setEditingSegment(null)
  }
  
  const handleLoadSegment = (segment: Segment) => {
    console.log('Load segment', segment)
  }

  const handleCreateSegment = () => {
    setEditingSegment(null)
    setSegmentView('builder')
  }

  const handleEditSegment = (segment: Segment) => {
    setEditingSegment(segment)
    setSegmentView('builder')
  }

  const handleDuplicateSegment = (segment: Segment) => {
    const duplicatedSegment: Segment = {
      ...segment,
      id: Date.now().toString(),
      name: `${segment.name} (コピー)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSegments([...segments, duplicatedSegment])
  }

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter(s => s.id !== segmentId))
  }

  const handleBackToSegmentList = () => {
    setSegmentView('list')
    setEditingSegment(null)
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

  // Tag Management handlers
  const handleCreateTag = (tag: Omit<Tag, 'id' | 'createdAt'>) => {
    const newTag: Tag = {
      ...tag,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setTags([...tags, newTag])
  }

  const handleUpdateTag = (tagId: string, updates: Partial<Tag>) => {
    setTags(tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ))
  }

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId))
    // Remove tag from all users
    setUsers(users.map(user => ({
      ...user,
      tags: user.tags.filter(tag => tag.id !== tagId)
    })))
  }

  const handleCreateFolder = (folder: Omit<TagFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFolder: TagFolder = {
      ...folder,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTagFolders([...tagFolders, newFolder])
  }

  const handleUpdateFolder = (folderId: string, updates: Partial<TagFolder>) => {
    setTagFolders(tagFolders.map(folder => 
      folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
    ))
  }

  const handleDeleteFolder = (folderId: string) => {
    // Move tags in this folder to uncategorized
    setTags(tags.map(tag => 
      tag.folderId === folderId ? { ...tag, folderId: undefined } : tag
    ))
    // Move subfolders to parent or uncategorized
    const folderToDelete = tagFolders.find(f => f.id === folderId)
    setTagFolders(tagFolders.filter(folder => folder.id !== folderId).map(folder =>
      folder.parentId === folderId 
        ? { ...folder, parentId: folderToDelete?.parentId }
        : folder
    ))
  }

  const handleMoveTag = (tagId: string, folderId: string | null) => {
    setTags(tags.map(tag => 
      tag.id === tagId ? { ...tag, folderId: folderId || undefined } : tag
    ))
  }

  // Calculate dashboard stats
  const dashboardStats = {
    totalUsers: users.length,
    totalSent: deliveryLogs.length,
    totalOpened: deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length,
    totalClicked: deliveryLogs.filter(log => log.status === 'CLICKED').length,
    totalReservations: 18, // Mock data - replace with real reservation count
    reservationRate: 0.93, // Mock data - replace with real reservation rate
    todayReservations: 5, // Mock data - today's reservations
    openRate: deliveryLogs.length > 0 ? (deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / deliveryLogs.length) * 100 : 0,
    clickRate: deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length > 0 ? (deliveryLogs.filter(log => log.status === 'CLICKED').length / deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length) * 100 : 0
  }
  
  const navigationItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'users', label: 'ユーザー管理', icon: Users },
    { id: 'segments', label: 'セグメント', icon: Target },
    { id: 'scenarios', label: 'シナリオ', icon: List },
    { id: 'broadcast', label: '一斉配信', icon: Send },
    { id: 'templates', label: 'テンプレート', icon: Settings2 },
    { id: 'tags', label: 'タグ管理', icon: Tags },
    { id: 'action-rules', label: 'アクションルール', icon: Zap },
    { id: 'reports', label: 'レポート', icon: BarChart3 }
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
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="text-gray-600 mt-1">システム全体の状況を確認</p>
            </div>
            <Dashboard
              deliveries={deliveryLogs}
              totalUsers={dashboardStats.totalUsers}
              totalSent={dashboardStats.totalSent}
              totalOpened={dashboardStats.totalOpened}
              totalClicked={dashboardStats.totalClicked}
              totalReservations={dashboardStats.totalReservations}
              reservationRate={dashboardStats.reservationRate}
              todayReservations={dashboardStats.todayReservations}
              openRate={dashboardStats.openRate}
              clickRate={dashboardStats.clickRate}
              users={users}
              scenarios={scenarios}
            />
          </div>
        )
        
      case 'users':
        return (
          <UserManagement
            users={users}
            tags={tags}
            statuses={statuses}
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onCreateTag={handleCreateTagForUser}
            onBulkActions={bulkActions}
          />
        )
        
      case 'segments':
        if (segmentView === 'builder') {
          return (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={handleBackToSegmentList}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-4"
                >
                  ← セグメント一覧に戻る
                </button>
                <h2 className="text-lg font-medium text-gray-900">
                  {editingSegment ? `${editingSegment.name} を編集` : '新規セグメント作成'}
                </h2>
              </div>
              <SegmentBuilder
                segments={segments}
                users={users}
                tags={tags}
                statuses={statuses}
                onSaveSegment={handleSaveSegment}
                onLoadSegment={handleLoadSegment}
                editingSegment={editingSegment}
              />
            </div>
          )
        }
        
        return (
          <SegmentList
            segments={segments}
            tags={tags}
            statuses={statuses}
            onCreateSegment={handleCreateSegment}
            onEditSegment={handleEditSegment}
            onDuplicateSegment={handleDuplicateSegment}
            onDeleteSegment={handleDeleteSegment}
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
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">テンプレート一覧</h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>全0件</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null)
                  setCurrentView('edit')
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新規テンプレート
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <p className="text-gray-500">テンプレート一覧がここに表示されます。</p>
            </div>
          </div>
        )
        
      case 'tags':
        return (
          <TagManagement
            tags={tags}
            tagFolders={tagFolders}
            onCreateTag={handleCreateTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
            onCreateFolder={handleCreateFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveTag={handleMoveTag}
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
        
      case 'broadcast':
        return (
          <BroadcastPage
            users={users}
            segments={segments}
            templates={templates}
            tags={tags}
            statuses={statuses}
            onSend={(broadcastData) => {
              console.log('Sending broadcast:', broadcastData)
            }}
          />
        )
        
      case 'reports':
        return <Reports />
        
      default:
        return <div>Unknown tab</div>
    }
  }




  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-full z-10 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">LINE Marketing</h1>
          <p className="text-sm text-gray-600 mt-1">自動化プラットフォーム</p>
        </div>
        
        <nav className="px-4 pb-4 flex-1">
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
        
        {/* 管理者情報 */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">管</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                管理者
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50">
          <div className="p-6 h-full">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
