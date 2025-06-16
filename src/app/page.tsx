'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { UserManagement } from '@/components/UserManagement/UserManagement'
import { SegmentBuilder } from '@/components/SegmentBuilder/SegmentBuilder'
import { SegmentList } from '@/components/SegmentBuilder/SegmentList'
import { ScenarioList } from '@/components/ScenarioList/ScenarioList'
import { NewScenarioEditor } from '@/components/ScenarioEditor/NewScenarioEditor'
import { TemplateEditor } from '@/components/TemplateEditor/TemplateEditor'
import { TagManagement } from '@/components/TagManagement/TagManagement'
import { TemplateManagement } from '@/components/TemplateManagement/TemplateManagement'
import { 
  User, 
  Tag, 
  TagFolder,
  Status,
  StatusFolder, 
  Segment, 
  SegmentFolder,
  Campaign, 
  Scenario, 
  ScenarioFolder,
  Pack,
  Template, 
  TemplateFolder,
  TemplatePack,
  DeliveryLog,
  ScenarioActionRule,
  Broadcast,
  BroadcastFolder,
  ReservationReminder,
  ReminderFolder
} from '@/types'
import { LayoutDashboard, Users, Target, List, BarChart3, Settings2, Tags, Send, Bell, Database, Columns3, Calendar, FileText, FileCheck, UserCog } from 'lucide-react'
import { Reports } from '@/components/Reports/Reports'
import { BroadcastPage } from '@/components/Broadcast/BroadcastPage'
import { ReminderList } from '@/components/ReminderManagement/ReminderList'
import { ReminderEditor } from '@/components/ReminderManagement/ReminderEditor'
import { SupabaseTest } from '@/components/SupabaseTest/SupabaseTest'
import { DatabaseSchema } from '@/components/DatabaseSchema/DatabaseSchema'
import { BulkTestSendModal } from '@/components/Common/BulkTestSendModal'
import {
  InterviewDashboard,
  BookingFormSettings,
  FormTemplateSettings,
  InterviewBooking,
  AccountSettings
} from '@/components/InterviewBooking'

export default function LineMarketingApp() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'segments' | 'scenarios' | 'templates' | 'tags' | 'reports' | 'broadcast' | 'reminders' | 'supabase-test' | 'database-schema' | 'interview-dashboard' | 'booking-form' | 'form-template' | 'interview-booking' | 'account-settings'>('dashboard')
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list')
  const [editingItem, setEditingItem] = useState<Scenario | Template | User | null>(null)
  const [editingPack, setEditingPack] = useState<TemplatePack | null>(null)
  const [packView, setPackView] = useState<'list' | 'detail'>('list')
  const [segmentView, setSegmentView] = useState<'list' | 'builder'>('list')
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  
  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tagFolders, setTagFolders] = useState<TagFolder[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [statusFolders, setStatusFolders] = useState<StatusFolder[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [segmentFolders, setSegmentFolders] = useState<SegmentFolder[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [scenarioFolders, setScenarioFolders] = useState<ScenarioFolder[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateFolders, setTemplateFolders] = useState<TemplateFolder[]>([])
  const [templatePacks, setTemplatePacks] = useState<TemplatePack[]>([])
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([])
  const [actionRules, setActionRules] = useState<ScenarioActionRule[]>([])
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [broadcastFolders, setBroadcastFolders] = useState<BroadcastFolder[]>([])
  const [reminders, setReminders] = useState<ReservationReminder[]>([])
  const [reminderFolders, setReminderFolders] = useState<ReminderFolder[]>([])
  const [editingReminder, setEditingReminder] = useState<ReservationReminder | null>(null)
  const [showBulkTestSendModal, setShowBulkTestSendModal] = useState(false)

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

    const mockSegmentFolders: SegmentFolder[] = [
      { id: '1', name: '顧客ランク', description: '顧客ランク別のセグメント', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'エンゲージメント', description: '行動別のセグメント', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: '新規ユーザー', description: '新規登録者のセグメント', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: 'アクティブユーザー', description: 'アクティブユーザーのセグメント', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '5', name: 'キャンペーン', description: 'キャンペーン関連のセグメント', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockSegments: Segment[] = [
      {
        id: '1',
        name: 'VIPユーザー',
        memo: '高価値顧客向けの特別セグメント',
        folderId: '1',
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
        memo: 'ウェルカムメッセージ配信対象',
        folderId: '3',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'アクティブユーザー',
        memo: '過去30日にアクティビティがあるユーザー',
        folderId: '4',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'lastActivity', operator: 'greater_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: '休眠ユーザー',
        memo: '60日以上アクティビティがないユーザー',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'lastActivity', operator: 'less_than', value: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'キャンペーン参加者',
        memo: '春のキャンペーンに参加したユーザー',
        folderId: '5',
        filterJson: JSON.stringify({
          conditions: [
            { field: 'tags', operator: 'in', value: ['campaign_2024_spring'], logic: undefined }
          ],
          logic: 'AND'
        }),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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

    const mockTemplateFolders: TemplateFolder[] = [
      { id: '1', name: '未分類', description: '未分類のテンプレート', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: '営業・動画オンボーディング', description: '営業とオンボーディング用', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: '自動配信', description: '自動配信用テンプレート', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: 'LINE リマインド', description: 'リマインド系テンプレート', createdAt: new Date(), updatedAt: new Date() },
      { id: '5', name: 'セミナー案内2024', description: 'セミナー案内用', parentId: '4', createdAt: new Date(), updatedAt: new Date() },
      { id: '6', name: 'クリスマスキャンペーン', description: 'クリスマス関連', createdAt: new Date(), updatedAt: new Date() },
      { id: '7', name: '全キャンペーン', description: '各種キャンペーン', createdAt: new Date(), updatedAt: new Date() },
      { id: '8', name: 'ロコミキャンペーン', description: '口コミキャンペーン', parentId: '7', createdAt: new Date(), updatedAt: new Date() },
      { id: '9', name: 'ギフトカードキャンペーン', description: 'ギフトカード関連', parentId: '7', createdAt: new Date(), updatedAt: new Date() },
      { id: '10', name: '新生活準備キャンペーン', description: '新生活応援', parentId: '7', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockTemplates: Template[] = [
      {
        id: '1',
        name: 'テンプレートa',
        type: 'TEXT',
        content: 'こんにちは！\n\nサンプルテキストメッセージです。\nこちらはテンプレートaの内容です。',
        folderId: '2',
        createdAt: new Date('2025-06-11'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'こんにちは！\n\nサンプルテキストメッセージです。\nこちらはテンプレートaの内容です。'
        })
      },
      {
        id: '2',
        name: 'る',
        type: 'FLEX',
        content: 'シンプルなフレックスメッセージ',
        folderId: '3',
        createdAt: new Date('2025-02-04'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'シンプルフレックスメッセージ',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'お知らせ',
                  weight: 'bold',
                  size: 'lg',
                  color: '#333333'
                },
                {
                  type: 'text',
                  text: 'こちらはシンプルなフレックスメッセージのサンプルです。',
                  wrap: true,
                  color: '#666666',
                  size: 'sm'
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
                    uri: 'https://example.com'
                  },
                  style: 'primary'
                }
              ]
            }
          }
        })
      },
      {
        id: '3',
        name: '参加者へのイベント案内',
        type: 'TEXT',
        content: 'イベント参加者の皆様\n\n明日のイベントについてご案内します。\n時間：10:00-12:00\n場所：東京会議室',
        folderId: '3',
        createdAt: new Date('2025-01-21'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'イベント参加者の皆様\n\n明日のイベントについてご案内します。\n時間：10:00-12:00\n場所：東京会議室'
        })
      },
      {
        id: '4',
        name: 'お知リマインド_明日',
        type: 'TEXT',
        content: '明日のイベントのリマインダーです。\n\nお忘れのないようにお願いします。',
        folderId: '5',
        createdAt: new Date('2025-01-21'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '明日のイベントのリマインダーです。\n\nお忘れのないようにお願いします。'
        })
      },
      {
        id: '5',
        name: '当日_ZOOMリンク(9:40配信)',
        type: 'TEXT',
        content: 'いよいよイベント開始です！\n\nZOOMリンク：https://zoom.us/j/123456789\nパスコード：123456',
        folderId: '5',
        createdAt: new Date('2024-12-24'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'いよいよイベント開始です！\n\nZOOMリンク：https://zoom.us/j/123456789\nパスコード：123456'
        })
      },
      {
        id: '6',
        name: '開始10分後_ZOOMリンク(10:10配信)',
        type: 'TEXT',
        content: 'イベントが始まっています！\n\nまだ間に合います。\nZOOMリンク：https://zoom.us/j/123456789',
        folderId: '5',
        createdAt: new Date('2024-12-24'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'イベントが始まっています！\n\nまだ間に合います。\nZOOMリンク：https://zoom.us/j/123456789'
        })
      },
      {
        id: '7',
        name: '2/1_ユリボセミナー感想アンケート',
        type: 'FLEX',
        content: 'セミナー感想アンケート用フレックス',
        folderId: '5',
        createdAt: new Date('2025-02-02'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'セミナー感想アンケート',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'セミナーお疲れ様でした！',
                  weight: 'bold',
                  size: 'lg'
                },
                {
                  type: 'text',
                  text: '簡単なアンケートにご協力ください',
                  wrap: true,
                  size: 'sm',
                  color: '#666666'
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
                    label: 'アンケートに回答する',
                    uri: 'https://forms.google.com/survey'
                  },
                  style: 'primary'
                }
              ]
            }
          }
        })
      },
      {
        id: '8',
        name: '2/1_ユリボセミナー感想アンケート_回答済',
        type: 'TEXT',
        content: 'アンケートのご回答ありがとうございました！\n\n今後ともよろしくお願いします。',
        folderId: '5',
        createdAt: new Date('2025-02-02'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'アンケートのご回答ありがとうございました！\n\n今後ともよろしくお願いします。'
        })
      },
      {
        id: '9',
        name: 'ウェルカムパック',
        type: 'PACK',
        content: '新規登録者向けの基本パック - テンプレートa、る を含む',
        folderId: '2',
        packId: '1',
        createdAt: new Date('2025-01-15'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '🎉 ようこそ！\n\nご登録ありがとうございます。\nこちらはウェルカムパックのプレビューです。\n\n実際は複数のメッセージが順次配信されます。'
        })
      },
      {
        id: '10',
        name: 'セミナー案内パック',
        type: 'PACK',
        content: 'セミナー関連のテンプレート一式 - リマインド、ZOOMリンク、アンケート を含む',
        folderId: '5',
        packId: '2',
        createdAt: new Date('2025-01-10'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '📅 セミナー案内パック\n\nセミナーに関する以下のメッセージが配信されます：\n・リマインド通知\n・ZOOMリンク案内\n・アンケートのご依頼\n\nお楽しみに！'
        })
      },
      {
        id: '11',
        name: 'キャンペーン告知パック',
        type: 'PACK',
        content: 'キャンペーン告知用のテンプレート集',
        folderId: '6',
        packId: '3',
        createdAt: new Date('2024-12-20'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '🎪 キャンペーン告知\n\nお得なキャンペーン情報をお届けします！\n\n詳細は続くメッセージでご確認ください。'
        })
      },
      {
        id: '12',
        name: '商品紹介画像セット',
        type: 'IMAGE',
        content: '商品紹介用の画像テンプレート',
        folderId: '8',
        createdAt: new Date('2024-12-15'),
        lineMessageJson: JSON.stringify({
          type: 'image',
          originalContentUrl: 'https://example.com/product-image.jpg',
          previewImageUrl: 'https://example.com/product-image-thumb.jpg'
        })
      },
      {
        id: '13',
        name: 'プロフィール画像テンプレート',
        type: 'IMAGE',
        content: 'プロフィール紹介用画像',
        folderId: '8',
        createdAt: new Date('2024-12-10'),
        lineMessageJson: JSON.stringify({
          type: 'image',
          originalContentUrl: 'https://example.com/profile-image.jpg',
          previewImageUrl: 'https://example.com/profile-image-thumb.jpg'
        })
      },
      // 追加のダミーテンプレート（スクロールテスト用）
      {
        id: '14',
        name: '新年挨拶メッセージ',
        type: 'TEXT',
        content: '新年あけましておめでとうございます！\n今年もよろしくお願いします。',
        folderId: '6',
        createdAt: new Date('2024-12-28'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '新年あけましておめでとうございます！\n今年もよろしくお願いします。'
        })
      },
      {
        id: '15',
        name: 'バレンタインキャンペーン告知',
        type: 'FLEX',
        content: 'バレンタイン特別企画のお知らせ',
        folderId: '7',
        createdAt: new Date('2025-01-25'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'バレンタインキャンペーン',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'バレンタイン特別企画',
                  weight: 'bold',
                  size: 'lg',
                  color: '#D84A75'
                }
              ]
            }
          }
        })
      },
      {
        id: '16',
        name: 'お客様アンケート_満足度調査',
        type: 'TEXT',
        content: 'いつもご利用ありがとうございます。\nサービス向上のため、簡単なアンケートにご協力ください。',
        folderId: '2',
        createdAt: new Date('2025-01-20'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'いつもご利用ありがとうございます。\nサービス向上のため、簡単なアンケートにご協力ください。'
        })
      },
      {
        id: '17',
        name: 'セミナー_AI活用術_申込開始',
        type: 'FLEX',
        content: 'AI活用術セミナーの申込み開始のお知らせ',
        folderId: '5',
        createdAt: new Date('2025-01-18'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'AI活用術セミナー申込開始',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'AI活用術セミナー',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '18',
        name: '商品紹介_スマートフォンケース',
        type: 'IMAGE',
        content: '新商品のスマートフォンケースの紹介',
        folderId: '8',
        createdAt: new Date('2025-01-15'),
        lineMessageJson: JSON.stringify({
          type: 'image',
          originalContentUrl: 'https://example.com/phone-case.jpg',
          previewImageUrl: 'https://example.com/phone-case-thumb.jpg'
        })
      },
      {
        id: '19',
        name: 'お誕生日おめでとうメッセージ',
        type: 'TEXT',
        content: 'お誕生日おめでとうございます！\n特別なクーポンをプレゼントします🎂',
        folderId: '2',
        createdAt: new Date('2025-01-12'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'お誕生日おめでとうございます！\n特別なクーポンをプレゼントします🎂'
        })
      },
      {
        id: '20',
        name: 'フォローアップ_購入後1週間',
        type: 'TEXT',
        content: 'ご購入ありがとうございました。\n商品の調子はいかがですか？',
        folderId: '3',
        createdAt: new Date('2025-01-10'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'ご購入ありがとうございました。\n商品の調子はいかがですか？'
        })
      },
      {
        id: '21',
        name: 'メンテナンス通知_システム更新',
        type: 'TEXT',
        content: 'システムメンテナンスのお知らせ\n日時：2025年2月15日 2:00-4:00',
        folderId: '4',
        createdAt: new Date('2025-01-08'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'システムメンテナンスのお知らせ\n日時：2025年2月15日 2:00-4:00'
        })
      },
      {
        id: '22',
        name: 'キャンペーン_友達紹介',
        type: 'FLEX',
        content: '友達紹介キャンペーンのご案内',
        folderId: '9',
        createdAt: new Date('2025-01-05'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: '友達紹介キャンペーン',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '友達紹介で特典GET!',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '23',
        name: 'イベント_春祭り_開催告知',
        type: 'TEXT',
        content: '春祭りイベント開催のお知らせ\n3月20日(土) 10:00-16:00',
        folderId: '10',
        createdAt: new Date('2025-01-03'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '春祭りイベント開催のお知らせ\n3月20日(土) 10:00-16:00'
        })
      },
      {
        id: '24',
        name: 'サポート_よくある質問',
        type: 'FLEX',
        content: 'よくある質問への回答集',
        folderId: '2',
        createdAt: new Date('2025-01-01'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'よくある質問',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'よくある質問',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '25',
        name: 'ニュースレター_月刊配信',
        type: 'TEXT',
        content: '月刊ニュースレター1月号をお届けします。',
        folderId: '2',
        createdAt: new Date('2024-12-30'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '月刊ニュースレター1月号をお届けします。'
        })
      },
      {
        id: '26',
        name: 'オンライン説明会_予約開始',
        type: 'FLEX',
        content: 'オンライン説明会の予約受付開始',
        folderId: '5',
        createdAt: new Date('2024-12-28'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'オンライン説明会予約開始',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'オンライン説明会',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '27',
        name: 'コミュニティ_参加招待',
        type: 'TEXT',
        content: '限定コミュニティへのご招待\nあなただけの特別なご案内です。',
        folderId: '2',
        createdAt: new Date('2024-12-25'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '限定コミュニティへのご招待\nあなただけの特別なご案内です。'
        })
      },
      {
        id: '28',
        name: 'プレミアム会員_アップグレード案内',
        type: 'FLEX',
        content: 'プレミアム会員へのアップグレードのご案内',
        folderId: '2',
        createdAt: new Date('2024-12-22'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'プレミアム会員アップグレード',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'プレミアム会員特典',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '29',
        name: '季節限定_夏のセール前夜祭',
        type: 'TEXT',
        content: '夏のセール前夜祭開催！\n明日から3日間限定の特別価格です。',
        folderId: '3',
        createdAt: new Date('2024-12-20'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '夏のセール前夜祭開催！\n明日から3日間限定の特別価格です。'
        })
      },
      {
        id: '30',
        name: 'フィードバック_サービス改善',
        type: 'TEXT',
        content: 'サービス改善のためのフィードバックをお聞かせください。',
        folderId: '2',
        createdAt: new Date('2024-12-18'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'サービス改善のためのフィードバックをお聞かせください。'
        })
      },
      {
        id: '31',
        name: 'ギフトカード_特別プレゼント',
        type: 'FLEX',
        content: '特別なギフトカードプレゼント企画',
        folderId: '9',
        createdAt: new Date('2024-12-15'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'ギフトカードプレゼント',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'ギフトカードプレゼント',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '32',
        name: 'アプリ更新_新機能紹介',
        type: 'TEXT',
        content: 'アプリを最新バージョンに更新しました。\n新機能をお試しください！',
        folderId: '2',
        createdAt: new Date('2024-12-12'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'アプリを最新バージョンに更新しました。\n新機能をお試しください！'
        })
      },
      {
        id: '33',
        name: 'VIP限定_先行販売開始',
        type: 'TEXT',
        content: 'VIP会員様限定！\n新商品の先行販売を開始いたします。',
        folderId: '2',
        createdAt: new Date('2024-12-10'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'VIP会員様限定！\n新商品の先行販売を開始いたします。'
        })
      },
      {
        id: '34',
        name: 'ロイヤルティ_ポイント2倍',
        type: 'FLEX',
        content: 'ロイヤルティポイント2倍キャンペーン',
        folderId: '8',
        createdAt: new Date('2024-12-08'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: 'ポイント2倍キャンペーン',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'ポイント2倍デー',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '35',
        name: '年末年始_営業時間変更',
        type: 'TEXT',
        content: '年末年始の営業時間変更のお知らせ\n12/29-1/3は短縮営業いたします。',
        folderId: '4',
        createdAt: new Date('2024-12-05'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '年末年始の営業時間変更のお知らせ\n12/29-1/3は短縮営業いたします。'
        })
      },
      {
        id: '36',
        name: 'ブログ更新_記事紹介',
        type: 'TEXT',
        content: '新しいブログ記事を投稿しました。\nぜひお読みください！',
        folderId: '2',
        createdAt: new Date('2024-12-03'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: '新しいブログ記事を投稿しました。\nぜひお読みください！'
        })
      },
      {
        id: '37',
        name: 'コラボ商品_限定発売',
        type: 'IMAGE',
        content: '人気ブランドとのコラボ商品限定発売',
        folderId: '8',
        createdAt: new Date('2024-12-01'),
        lineMessageJson: JSON.stringify({
          type: 'image',
          originalContentUrl: 'https://example.com/collab-product.jpg',
          previewImageUrl: 'https://example.com/collab-product-thumb.jpg'
        })
      },
      {
        id: '38',
        name: '週末限定_タイムセール',
        type: 'FLEX',
        content: '週末限定のタイムセール開催',
        folderId: '3',
        createdAt: new Date('2024-11-29'),
        lineMessageJson: JSON.stringify({
          type: 'flex',
          altText: '週末限定タイムセール',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '週末限定タイムセール',
                  weight: 'bold'
                }
              ]
            }
          }
        })
      },
      {
        id: '39',
        name: 'カスタマーサクセス_成功事例',
        type: 'TEXT',
        content: 'お客様の成功事例をご紹介します。\nあなたのビジネスの参考にしてください。',
        folderId: '2',
        createdAt: new Date('2024-11-27'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'お客様の成功事例をご紹介します。\nあなたのビジネスの参考にしてください。'
        })
      },
      {
        id: '40',
        name: 'サンクスギビング_感謝メッセージ',
        type: 'TEXT',
        content: 'いつもご利用いただき、ありがとうございます。\n心より感謝申し上げます。',
        createdAt: new Date('2024-11-25'),
        lineMessageJson: JSON.stringify({
          type: 'text',
          text: 'いつもご利用いただき、ありがとうございます。\n心より感謝申し上げます。'
        })
      }
    ]

    const mockTemplatePacks: TemplatePack[] = [
      {
        id: '1',
        name: 'ウェルカムパック',
        description: '新規登録者向けの基本パック',
        templateIds: ['1', '2'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'セミナー案内パック',
        description: 'セミナー関連のテンプレート一式',
        templateIds: ['4', '5', '6', '7'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'キャンペーン告知パック',
        description: 'キャンペーン告知用のテンプレート集',
        templateIds: ['3', '8'],
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-20')
      }
    ]

    const mockScenarioFolders: ScenarioFolder[] = [
      { id: '1', name: 'オンボーディング', description: '新規登録者向けシナリオ', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'マーケティング', description: 'マーケティング用シナリオ', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'リテンション', description: '顧客維持用シナリオ', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: 'キャンペーン', description: 'キャンペーン関連', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockScenarios: Scenario[] = [
      {
        id: '1',
        campaignId: '2',
        name: '新規登録ウェルカムシリーズ',
        trigger: 'TAG_ADDED',
        triggerValue: '新規',
        isActive: true,
        folderId: '1',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: '2',
        campaignId: '1',
        name: '春のキャンペーン告知',
        trigger: 'SCHEDULE',
        triggerValue: '2024-03-01 10:00',
        isActive: true,
        folderId: '4',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: '3',
        campaignId: '1',
        name: 'VIP限定オファー',
        trigger: 'MANUAL',
        isActive: false,
        folderId: '2',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
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
    setSegmentFolders(mockSegmentFolders)
    setScenarios(mockScenarios)
    setTemplates(mockTemplates)
    setTemplateFolders(mockTemplateFolders)
    setTemplatePacks(mockTemplatePacks)
    setCampaigns(mockCampaigns)
    setDeliveryLogs(mockDeliveryLogs)

    // Mock Action Rules
    const mockActionRules: ScenarioActionRule[] = [
      {
        id: '1',
        packTemplateId: 'pt1',
        actionType: 'URL_CLICK' as const,
        actionCondition: {
          operator: 'contains' as const,
          value: 'shop.example.com/product'
        },
        tagActions: [
          {
            type: 'ADD_TAG' as const,
            tagId: '1' // VIPタグ
          }
        ],
        isActive: true,
        priority: 10,
        description: '商品ページURL閲覧者にVIPタグ付与',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        packTemplateId: 'pt2',
        actionType: 'BUTTON_CLICK' as const,
        actionCondition: {
          operator: 'equals' as const,
          value: 'お問い合わせ'
        },
        tagActions: [
          {
            type: 'SET_STATUS' as const,
            statusId: '1' // リードステータス
          }
        ],
        isActive: true,
        priority: 8,
        description: 'お問い合わせボタンクリック者にリード変更',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        packTemplateId: 'pt3',
        actionType: 'REPLY' as const,
        actionCondition: {
          operator: 'any' as const,
          value: ''
        },
        tagActions: [
          {
            type: 'ADD_TAG' as const,
            tagId: '5', // アクティブタグ
            condition: {
              ifNotHasTag: ['1'] // VIPタグを持っていない場合のみ
            }
          }
        ],
        isActive: true,
        priority: 5,
        description: 'アンケート返信者に特別タグ付与',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ]

    const mockBroadcastFolders: BroadcastFolder[] = [
      { id: '1', name: 'お知らせ', description: 'お知らせ配信', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'プロモーション', description: 'プロモーション配信', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'セール', description: 'セール告知', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: 'リマインダー', description: 'リマインダー配信', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockBroadcasts: Broadcast[] = [
      {
        id: '1',
        name: '春のセール開始のお知らせ',
        description: '春のセール開始をお知らせする一斉配信',
        folderId: '3',
        targetType: 'ALL',
        templateId: '1',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sentCount: 150,
        deliveredCount: 145,
        openedCount: 98,
        clickedCount: 23
      },
      {
        id: '2',
        name: 'VIP会員限定キャンペーン',
        description: 'VIP会員向けの特別キャンペーン',
        folderId: '2',
        targetType: 'TAGS',
        targetTagIds: ['1'],
        templateId: '2',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: '新商品のご案内',
        description: '新商品発売のお知らせ',
        folderId: '1',
        targetType: 'SEGMENT',
        targetSegmentIds: ['1', '3'],
        templateId: '3',
        status: 'DRAFT',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]

    const mockReminderFolders: ReminderFolder[] = [
      { id: '1', name: '予約関連', description: '予約に関するリマインダー', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'イベント', description: 'イベント関連のリマインダー', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: '契約・更新', description: '契約更新関連のリマインダー', parentId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', name: 'プロモーション', description: 'プロモーション関連のリマインダー', createdAt: new Date(), updatedAt: new Date() }
    ]

    const mockReminders: ReservationReminder[] = [
      {
        id: '1',
        name: '予約前日リマインダー',
        description: '予約の前日にリマインドメッセージを送信',
        folderId: '1',
        isActive: true,
        reminderType: 'reservation',
        reminderSettings: {
          type: 'reservation',
          offsetValue: 1,
          offsetUnit: 'days',
          offsetDirection: 'before'
        },
        eventSettings: {
          eventType: 'reservation',
          selectedEventIds: []
        },
        templates: [
          {
            id: 'rt1',
            templateId: '4',
            template: mockTemplates[3], // お知リマインド_明日
            order: 0,
            timingConfig: {
              delayValue: 1,
              delayUnit: 'days',
              delayDirection: 'before'
            },
            actions: []
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: '予約当日リマインダー',
        description: '予約当日の朝にリマインドメッセージを送信',
        isActive: true,
        reminderType: 'reservation',
        reminderSettings: {
          type: 'reservation',
          offsetValue: 2,
          offsetUnit: 'hours',
          offsetDirection: 'before'
        },
        eventSettings: {
          eventType: 'reservation',
          selectedEventIds: []
        },
        templates: [
          {
            id: 'rt2',
            templateId: '5',
            template: mockTemplates[4], // 当日_ZOOMリンク(9:40配信)
            order: 0,
            timingConfig: {
              delayValue: 2,
              delayUnit: 'hours',
              delayDirection: 'before'
            },
            actions: []
          },
          {
            id: 'rt3',
            templateId: '6',
            template: mockTemplates[5], // 開始10分後_ZOOMリンク(10:10配信)
            order: 1,
            timingConfig: {
              delayValue: 10,
              delayUnit: 'minutes',
              delayDirection: 'after'
            },
            actions: []
          }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: '誕生日リマインダー',
        description: 'ユーザーの誕生日にお祝いメッセージを送信',
        folderId: '2',
        isActive: false,
        reminderType: 'user_field',
        reminderSettings: {
          type: 'user_field',
          offsetValue: 0,
          offsetUnit: 'days',
          offsetDirection: 'before',
          userDateField: 'birthday'
        },
        eventSettings: {
          eventType: 'birthday',
          eventName: 'お客様の誕生日',
          selectedEventIds: []
        },
        templates: [
          {
            id: 'rt4',
            templateId: '19',
            template: mockTemplates[18], // お誕生日おめでとうメッセージ
            order: 0,
            timingConfig: {
              delayValue: 0,
              delayUnit: 'days',
              delayDirection: 'before'
            },
            actions: []
          }
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ]
    
    setActionRules(mockActionRules)
    setScenarioFolders(mockScenarioFolders)
    setBroadcastFolders(mockBroadcastFolders)
    setBroadcasts(mockBroadcasts)
    setReminders(mockReminders)
    setReminderFolders(mockReminderFolders)
  }, [])

  // Navigation handlers
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
    setCurrentView('list')
    setEditingItem(null)
    setEditingReminder(null)
    if (tab === 'segments') {
      setSegmentView('list')
      setEditingSegment(null)
    }
  }
  
  const handleEdit = (item: Scenario | Template) => {
    setEditingItem(item)
    setCurrentView('edit')
  }
  
  const handleBack = () => {
    setCurrentView('list')
    setEditingItem(null)
  }

  
  // User Management handlers
  const handleCreateUser = () => {
    // TODO: Implement user creation
  }
  
  const handleEditUser = (user: User) => {
    setEditingItem(user)
    setCurrentView('edit')
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
    // TODO: Implement tag creation for user
  }
  
  const bulkActions = {
    addTags: (userIds: string[], tagIds: string[]) => {
      // TODO: Implement bulk tag addition
    },
    removeTags: (userIds: string[], tagIds: string[]) => {
      // TODO: Implement bulk tag removal
    },
    changeStatus: (userIds: string[], statusId: string) => {
      // TODO: Implement bulk status change
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
    // TODO: Implement segment loading
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
    // TODO: Implement analytics view
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
    // TODO: Implement template addition to pack
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
    // TODO: Implement scenario preview
  }
  



  // Action Rule handlers
  const handleCreateActionRule = (rule: Omit<ScenarioActionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setActionRules([...actionRules, newRule])
  }

  const handleUpdateActionRule = (ruleId: string, rule: Partial<ScenarioActionRule>) => {
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

  // Pack handlers
  const handleCreateTemplatePack = () => {
    // TODO: Implement pack creation modal
  }

  const handleEditTemplatePack = (pack: TemplatePack) => {
    // TODO: Implement pack editing modal
  }

  const handleDeleteTemplatePack = (packId: string) => {
    setTemplatePacks(templatePacks.filter(pack => pack.id !== packId))
  }

  const handleViewPackDetail = (pack: TemplatePack) => {
    setEditingPack(pack)
    setPackView('detail')
  }

  const handleBackToPackList = () => {
    setEditingPack(null)
    setPackView('list')
  }

  const handleUpdateTemplatePack = (packId: string, updates: Partial<TemplatePack>) => {
    setTemplatePacks(templatePacks.map(pack => 
      pack.id === packId ? { ...pack, ...updates, updatedAt: new Date() } : pack
    ))
  }

  const handleUpdateTemplate = (templateId: string, updates: Partial<Template>) => {
    setTemplates(templates.map(template => 
      template.id === templateId ? { ...template, ...updates, updatedAt: new Date() } : template
    ))
  }

  // Reminder handlers
  const handleCreateReminder = () => {
    setEditingReminder(null)
    setCurrentView('edit')
  }

  const handleEditReminder = (reminder: ReservationReminder) => {
    setEditingReminder(reminder)
    setCurrentView('edit')
  }

  const handleSaveReminder = (reminder: ReservationReminder) => {
    if (reminder.id && reminders.find(r => r.id === reminder.id)) {
      setReminders(reminders.map(r => r.id === reminder.id ? reminder : r))
    } else {
      const newReminder = {
        ...reminder,
        id: `reminder_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setReminders([...reminders, newReminder])
    }
    setCurrentView('list')
    setEditingReminder(null)
  }

  const handleDuplicateReminder = (reminder: ReservationReminder) => {
    const duplicatedReminder: ReservationReminder = {
      ...reminder,
      id: `reminder_${Date.now()}`,
      name: `${reminder.name} (コピー)`,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setReminders([...reminders, duplicatedReminder])
  }

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(reminders.filter(r => r.id !== reminderId))
  }

  const handleToggleReminderActive = (reminderId: string, isActive: boolean) => {
    setReminders(reminders.map(r => 
      r.id === reminderId ? { ...r, isActive, updatedAt: new Date() } : r
    ))
  }

  const handleViewReminderAnalytics = (reminderId: string) => {
    // TODO: Implement analytics view
  }

  const handleCreateReminderFolder = (folder: Omit<ReminderFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFolder: ReminderFolder = {
      ...folder,
      id: `reminder_folder_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setReminderFolders([...reminderFolders, newFolder])
  }

  const handleUpdateReminderFolder = (folderId: string, updates: Partial<ReminderFolder>) => {
    setReminderFolders(reminderFolders.map(folder => 
      folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
    ))
  }

  const handleDeleteReminderFolder = (folderId: string) => {
    // Move reminders in this folder to uncategorized
    setReminders(reminders.map(reminder => 
      reminder.folderId === folderId ? { ...reminder, folderId: undefined } : reminder
    ))
    // Remove subfolders or move them to parent
    const folderToDelete = reminderFolders.find(f => f.id === folderId)
    setReminderFolders(reminderFolders.filter(folder => folder.id !== folderId).map(folder =>
      folder.parentId === folderId 
        ? { ...folder, parentId: folderToDelete?.parentId }
        : folder
    ))
  }

  // テスト送信ハンドラー
  const handleScenarioTestSend = async (scenarioId: string, userIds: string[], message?: string) => {
    console.log('シナリオテスト送信:', { scenarioId, userIds, message })
    // 実際の送信処理をここに実装
    alert(`シナリオのテスト送信が完了しました。\n送信先: ${userIds.length}名`)
  }

  const handleTemplateTestSend = async (templateId: string, userIds: string[], message?: string) => {
    console.log('テンプレートテスト送信:', { templateId, userIds, message })
    // 実際の送信処理をここに実装
    alert(`テンプレートのテスト送信が完了しました。\n送信先: ${userIds.length}名`)
  }

  const handleReminderTestSend = async (reminderId: string, userIds: string[], message?: string) => {
    console.log('リマインダーテスト送信:', { reminderId, userIds, message })
    // 実際の送信処理をここに実装
    alert(`リマインダーのテスト送信が完了しました。\n送信先: ${userIds.length}名`)
  }

  const handleBulkTestSend = async (userIds: string[], items: any[], message?: string) => {
    console.log('一括テスト送信:', { userIds, items, message })
    // 実際の送信処理をここに実装
    alert(`一括テスト送信が完了しました。\n送信先: ${userIds.length}名\nコンテンツ: ${items.length}件`)
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
  
  const navigationCategories = [
    {
      title: 'マーケティング関連',
      items: [
        { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
        { id: 'users', label: 'ユーザー管理', icon: Users },
        { id: 'segments', label: 'セグメント', icon: Target },
        { id: 'scenarios', label: 'シナリオ', icon: List },
        { id: 'broadcast', label: '一斉配信', icon: Send },
        { id: 'reminders', label: 'リマインダー', icon: Bell },
        { id: 'templates', label: 'テンプレート', icon: Settings2 },
        { id: 'tags', label: 'タグ管理', icon: Tags },
        { id: 'reports', label: 'レポート', icon: BarChart3 }
      ]
    },
    {
      title: '予約・イベント関連',
      items: [
        { id: 'interview-dashboard', label: '面談予約ダッシュボード', icon: Calendar },
        { id: 'booking-form', label: '予約フォーム設定', icon: FileText },
        { id: 'form-template', label: 'フォームテンプレート設定', icon: FileCheck },
        { id: 'interview-booking', label: '面談予約', icon: Calendar }
      ]
    },
    {
      title: 'その他',
      items: [
        { id: 'account-settings', label: 'アカウント設定', icon: UserCog },
        { id: 'supabase-test', label: 'Supabaseテスト', icon: Database },
        { id: 'database-schema', label: 'DBスキーマ', icon: Columns3 }
      ]
    }
  ] as const

  const renderMainContent = () => {
    if (activeTab === 'scenarios' && currentView === 'edit') {
      return (
        <NewScenarioEditor
          scenario={editingItem as Scenario}
          templates={templates}
          templateFolders={templateFolders}
          tags={tags}
          tagFolders={tagFolders}
          statuses={statuses}
          statusFolders={statusFolders}
          segments={segments}
          segmentFolders={segmentFolders}
          users={users}
          onSave={handleSaveScenario}
          onBack={handleBack}
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
          template={editingItem as Template}
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="text-gray-600 mt-1">システム全体の状況を確認</p>
              </div>
              <button
                onClick={() => setShowBulkTestSendModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                title="シナリオ、テンプレート、リマインダーを一括でテスト送信"
              >
                <Send className="w-4 h-4 mr-2" />
                一括テスト送信
              </button>
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
                segmentFolders={segmentFolders}
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
            segmentFolders={segmentFolders}
            tags={tags}
            statuses={statuses}
            users={users}
            onCreateSegment={handleCreateSegment}
            onEditSegment={handleEditSegment}
            onDuplicateSegment={handleDuplicateSegment}
            onDeleteSegment={handleDeleteSegment}
            onCreateFolder={(folder) => {
              const newFolder: SegmentFolder = {
                ...folder,
                id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setSegmentFolders([...segmentFolders, newFolder])
            }}
            onUpdateFolder={(folderId, updates) => {
              setSegmentFolders(segmentFolders.map(folder => 
                folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
              ))
            }}
            onDeleteFolder={(folderId) => {
              // フォルダ内のセグメントを未分類に移動
              setSegments(segments.map(segment => 
                segment.folderId === folderId ? { ...segment, folderId: undefined } : segment
              ))
              // サブフォルダを親フォルダまたは未分類に移動
              const folderToDelete = segmentFolders.find(f => f.id === folderId)
              setSegmentFolders(segmentFolders.filter(folder => folder.id !== folderId).map(folder =>
                folder.parentId === folderId 
                  ? { ...folder, parentId: folderToDelete?.parentId }
                  : folder
              ))
            }}
            onReorderSegments={(reorderedSegments) => {
              setSegments(reorderedSegments)
            }}
            onReorderFolders={(reorderedFolders) => {
              setSegmentFolders(reorderedFolders)
            }}
            onMoveSegment={(segmentId, targetFolderId) => {
              setSegments(segments.map(segment =>
                segment.id === segmentId ? { ...segment, folderId: targetFolderId || undefined } : segment
              ))
            }}
          />
        )
        
      case 'scenarios':
        return (
          <ScenarioList
            scenarios={scenarios}
            scenarioFolders={scenarioFolders}
            campaigns={campaigns}
            users={users}
            onCreateScenario={handleCreateScenario}
            onEditScenario={handleEditScenario}
            onDuplicateScenario={handleDuplicateScenario}
            onDeleteScenario={handleDeleteScenario}
            onToggleActive={handleToggleActive}
            onViewAnalytics={handleViewAnalytics}
            onTestSend={handleScenarioTestSend}
            onCreateFolder={(folder) => {
              const newFolder: ScenarioFolder = {
                ...folder,
                id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setScenarioFolders([...scenarioFolders, newFolder])
            }}
            onUpdateFolder={(folderId, updates) => {
              setScenarioFolders(scenarioFolders.map(folder => 
                folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
              ))
            }}
            onDeleteFolder={(folderId) => {
              // フォルダ内のシナリオを未分類に移動
              setScenarios(scenarios.map(scenario => 
                scenario.folderId === folderId ? { ...scenario, folderId: undefined } : scenario
              ))
              // サブフォルダを親フォルダまたは未分類に移動
              const folderToDelete = scenarioFolders.find(f => f.id === folderId)
              setScenarioFolders(scenarioFolders.filter(folder => folder.id !== folderId).map(folder =>
                folder.parentId === folderId 
                  ? { ...folder, parentId: folderToDelete?.parentId }
                  : folder
              ))
            }}
            onReorderScenarios={(reorderedScenarios) => {
              setScenarios(reorderedScenarios)
            }}
            onReorderFolders={(reorderedFolders) => {
              setScenarioFolders(reorderedFolders)
            }}
            onMoveScenario={(scenarioId, targetFolderId) => {
              setScenarios(scenarios.map(scenario =>
                scenario.id === scenarioId ? { ...scenario, folderId: targetFolderId || undefined } : scenario
              ))
            }}
          />
        )
        
      case 'templates':
        return (
          <TemplateManagement
            templates={templates}
            templateFolders={templateFolders}
            templatePacks={templatePacks}
            users={users}
            onCreateTemplate={(template) => {
              const newTemplate: Template = {
                ...template,
                id: Date.now().toString(),
                createdAt: new Date(),
              }
              setTemplates([...templates, newTemplate])
            }}
            onUpdateTemplate={(templateId, updates) => {
              setTemplates(templates.map(template => 
                template.id === templateId ? { ...template, ...updates } : template
              ))
            }}
            onDeleteTemplate={(templateId) => {
              setTemplates(templates.filter(template => template.id !== templateId))
            }}
            onDuplicateTemplate={(template) => {
              const duplicatedTemplate: Template = {
                ...template,
                id: Date.now().toString(),
                name: `${template.name} (コピー)`,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setTemplates([...templates, duplicatedTemplate])
            }}
            onCreateFolder={(folder) => {
              const newFolder: TemplateFolder = {
                ...folder,
                id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setTemplateFolders([...templateFolders, newFolder])
            }}
            onUpdateFolder={(folderId, updates) => {
              setTemplateFolders(templateFolders.map(folder => 
                folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
              ))
            }}
            onDeleteFolder={(folderId) => {
              setTemplateFolders(templateFolders.filter(folder => folder.id !== folderId))
              // フォルダ内のテンプレートをルートに移動
              setTemplates(templates.map(template => 
                template.folderId === folderId ? { ...template, folderId: undefined } : template
              ))
            }}
            onReorderFolders={(folders) => {
              setTemplateFolders(folders)
            }}
            onReorderTemplates={(reorderedTemplates) => {
              setTemplates(reorderedTemplates)
            }}
            onMoveTemplate={(templateId, targetFolderId) => {
              setTemplates(templates.map(template =>
                template.id === templateId ? { ...template, folderId: targetFolderId || undefined } : template
              ))
            }}
            onCreatePack={(pack) => {
              const packId = Date.now().toString()
              const newPack: TemplatePack = {
                ...pack,
                id: packId,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              // パックタイプのテンプレートも同時に作成
              const packTemplate: Template = {
                id: `pack_template_${packId}`,
                name: pack.name,
                type: 'PACK',
                content: pack.description || `パック「${pack.name}」`,
                packId: packId,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              setTemplatePacks([...templatePacks, newPack])
              setTemplates([...templates, packTemplate])
            }}
            onUpdatePack={(packId, updates) => {
              setTemplatePacks(templatePacks.map(pack => 
                pack.id === packId ? { ...pack, ...updates, updatedAt: new Date() } : pack
              ))
              
              // 対応するパックテンプレートも更新
              if (updates.name || updates.description) {
                setTemplates(templates.map(template => 
                  template.packId === packId ? {
                    ...template,
                    name: updates.name || template.name,
                    content: updates.description || template.content,
                    updatedAt: new Date()
                  } : template
                ))
              }
            }}
            onDeletePack={(packId) => {
              // パックと対応するテンプレートを削除
              setTemplatePacks(templatePacks.filter(pack => pack.id !== packId))
              setTemplates(templates.filter(template => template.packId !== packId))
            }}
            onNavigateToPackDetail={(packId) => {
              // パック詳細表示機能は TemplateDrawer 内で処理されるため、何もしない
            }}
            onTestSend={handleTemplateTestSend}
          />
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
            onReorderTags={(reorderedTags) => {
              setTags(reorderedTags)
            }}
            onReorderFolders={(reorderedFolders) => {
              setTagFolders(reorderedFolders)
            }}
          />
        )
        
      case 'broadcast':
        return (
          <BroadcastPage
            users={users}
            segments={segments}
            segmentFolders={segmentFolders}
            templates={templates}
            templateFolders={templateFolders}
            tags={tags}
            tagFolders={tagFolders}
            statuses={statuses}
            broadcasts={broadcasts}
            broadcastFolders={broadcastFolders}
            onSend={(broadcastData) => {
              // TODO: Implement broadcast sending
            }}
            onCreateFolder={(folder) => {
              const newFolder: BroadcastFolder = {
                ...folder,
                id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setBroadcastFolders([...broadcastFolders, newFolder])
            }}
            onUpdateFolder={(folderId, updates) => {
              setBroadcastFolders(broadcastFolders.map(folder => 
                folder.id === folderId ? { ...folder, ...updates, updatedAt: new Date() } : folder
              ))
            }}
            onDeleteFolder={(folderId) => {
              // フォルダ内の一斉配信を未分類に移動
              setBroadcasts(broadcasts.map(broadcast => 
                broadcast.folderId === folderId ? { ...broadcast, folderId: undefined } : broadcast
              ))
              // サブフォルダを親フォルダまたは未分類に移動
              const folderToDelete = broadcastFolders.find(f => f.id === folderId)
              setBroadcastFolders(broadcastFolders.filter(folder => folder.id !== folderId).map(folder =>
                folder.parentId === folderId 
                  ? { ...folder, parentId: folderToDelete?.parentId }
                  : folder
              ))
            }}
            onCreateBroadcast={() => {
              // TODO: Implement broadcast creation
            }}
            onEditBroadcast={(broadcast) => {
              // TODO: Implement broadcast editing
            }}
            onDuplicateBroadcast={(broadcast) => {
              const duplicatedBroadcast: Broadcast = {
                ...broadcast,
                id: Date.now().toString(),
                name: `${broadcast.name} (コピー)`,
                status: 'DRAFT',
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setBroadcasts([...broadcasts, duplicatedBroadcast])
            }}
            onDeleteBroadcast={(broadcastId) => {
              setBroadcasts(broadcasts.filter(b => b.id !== broadcastId))
            }}
            onToggleBroadcast={(broadcastId, isActive) => {
              setBroadcasts(broadcasts.map(broadcast => 
                broadcast.id === broadcastId 
                  ? { ...broadcast, status: isActive ? 'SCHEDULED' : 'DRAFT', updatedAt: new Date() }
                  : broadcast
              ))
            }}
            onViewAnalytics={(broadcastId) => {
              // TODO: Implement analytics view
            }}
            onReorderBroadcasts={(reorderedBroadcasts) => {
              setBroadcasts(reorderedBroadcasts)
            }}
            onReorderFolders={(reorderedFolders) => {
              setBroadcastFolders(reorderedFolders)
            }}
            onMoveBroadcast={(broadcastId, targetFolderId) => {
              setBroadcasts(broadcasts.map(broadcast =>
                broadcast.id === broadcastId ? { ...broadcast, folderId: targetFolderId || undefined } : broadcast
              ))
            }}
          />
        )
        
      case 'supabase-test':
        return <SupabaseTest />
        
      case 'database-schema':
        return <DatabaseSchema />
        
      case 'reports':
        return <Reports />
        
      case 'reminders':
        if (currentView === 'edit') {
          return (
            <ReminderEditor
              reminder={editingReminder}
              templates={templates}
              templateFolders={templateFolders}
              reminderFolders={reminderFolders}
              tags={tags}
              tagFolders={tagFolders}
              statuses={statuses}
              statusFolders={statusFolders}
              segments={segments}
              segmentFolders={segmentFolders}
              users={users}
              onSave={handleSaveReminder}
              onBack={() => setCurrentView('list')}
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
        return (
          <ReminderList
            reminders={reminders}
            reminderFolders={reminderFolders}
            users={users}
            onCreateReminder={handleCreateReminder}
            onEditReminder={handleEditReminder}
            onDuplicateReminder={(reminder) => {
              const duplicatedReminder = {
                ...reminder,
                id: `reminder_${Date.now()}`,
                name: `${reminder.name} (コピー)`,
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              setReminders([...reminders, duplicatedReminder])
            }}
            onDeleteReminder={(reminderId) => {
              setReminders(reminders.filter(r => r.id !== reminderId))
            }}
            onToggleActive={(reminderId, isActive) => {
              setReminders(reminders.map(r => 
                r.id === reminderId ? { ...r, isActive, updatedAt: new Date() } : r
              ))
            }}
            onViewAnalytics={(reminderId) => {
              // TODO: Implement analytics view for reminders
              console.log('View analytics for reminder:', reminderId)
            }}
            onTestSend={handleReminderTestSend}
            onCreateFolder={handleCreateReminderFolder}
            onUpdateFolder={handleUpdateReminderFolder}
            onDeleteFolder={handleDeleteReminderFolder}
            onReorderReminders={(reorderedReminders) => {
              setReminders(reorderedReminders)
            }}
            onReorderFolders={(reorderedFolders) => {
              setReminderFolders(reorderedFolders)
            }}
            onMoveReminder={(reminderId, targetFolderId) => {
              setReminders(reminders.map(reminder =>
                reminder.id === reminderId ? { ...reminder, folderId: targetFolderId || undefined } : reminder
              ))
            }}
          />
        )
        
      case 'interview-dashboard':
        return <InterviewDashboard />
        
      case 'booking-form':
        return <BookingFormSettings />
        
      case 'form-template':
        return <FormTemplateSettings />
        
      case 'interview-booking':
        return <InterviewBooking />
        
      case 'account-settings':
        return <AccountSettings />
        
      default:
        return <div>Unknown tab</div>
    }
  }




  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-full z-10 flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">LリーチHUB</h1>
          <p className="text-sm text-gray-600 mt-1">自動化プラットフォーム</p>
        </div>
        
        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-4 py-4">
            <div className="space-y-6">
            {navigationCategories.map((category, categoryIndex) => (
              <div key={category.title}>
                {/* カテゴリタイトル */}
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
                
                {/* カテゴリアイテム */}
                <div className="space-y-1">
                  {category.items.map((item) => {
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
              </div>
            ))}
            </div>
          </div>
        </nav>
        
        {/* 管理者情報 (固定) */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white">
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

      {/* 一括テスト送信モーダル */}
      {showBulkTestSendModal && (
        <BulkTestSendModal
          isOpen={showBulkTestSendModal}
          onClose={() => setShowBulkTestSendModal(false)}
          users={users}
          scenarios={scenarios}
          templates={templates}
          reminders={reminders}
          onSend={handleBulkTestSend}
        />
      )}
    </div>
  )
}
