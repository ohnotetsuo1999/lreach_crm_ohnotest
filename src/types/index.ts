export interface User {
  id: string
  name: string
  lineUid?: string
  address?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
  statusHistory: UserStatusLog[]
  reservations?: Reservation[]
  customFields?: {
    birthday?: Date
    anniversary?: Date
    contractExpiry?: Date
    subscriptionRenewal?: Date
    lastPurchaseDate?: Date
    customDate1?: Date
    customDate2?: Date
  }
}

export interface Tag {
  id: string
  name: string
  type: 'MANUAL' | 'AUTOMATIC' | 'BEHAVIORAL'
  folderId?: string
  note?: string
  createdAt: Date
}

export interface TagFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Status {
  id: string
  code: string
  label: string
}

export interface UserStatusLog {
  id: string
  userId: string
  statusId: string
  changedAt: Date
  status: Status
}

export interface Segment {
  id: string
  name: string
  memo?: string
  folderId?: string
  filterJson: string
  createdAt: Date
  updatedAt: Date
}

export interface SegmentFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  name: string
  startAt?: Date
  endAt?: Date
  createdBy?: string
  createdAt: Date
  updatedAt: Date
  scenarios: Scenario[]
}

export interface Scenario {
  id: string
  campaignId: string
  name: string
  trigger: TriggerType
  triggerValue?: string
  isActive: boolean
  folderId?: string
  createdAt: Date
  updatedAt: Date
  packs: Pack[]
}

export interface ScenarioFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

// Packと関連するテンプレート情報を含む拡張Pack
export interface PackWithTemplates extends Pack {
  packTemplates: PackTemplate[]
  templates: Template[] // populateされたテンプレート
}

export interface Pack {
  id: string
  scenarioId: string
  order: number
  offsetMinutes: number
  conditionJson?: string
  createdAt: Date
  packType?: 'normal' | 'reminder'
  reminderSettings?: ReminderSettings
}

// 多対多関係: Pack-Template の中間テーブル
export interface PackTemplate {
  id: string
  packId: string
  templateId: string
  order: number
  isActive: boolean
  createdAt: Date
  // このPack-Template関係でのアクションルール
  actionRules: ScenarioActionRule[]
}

// シナリオ固有のアクションルール（テンプレートとシナリオの組み合わせ毎）
export interface ScenarioActionRule {
  id: string
  packTemplateId: string // PackTemplateのID
  actionType: UserActionType
  actionCondition: {
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'any'
    value: string
    regex?: string
  }
  tagActions: TagAction[]
  isActive: boolean
  priority: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ReminderSettings {
  targetType: 'manual' | 'reservation' | 'user_field' // 基準日時の種類
  targetDate?: string // ISO date string for absolute date (manual用)
  targetTime?: string // HH:MM format (manual用)
  reservationField?: string // 予約フィールド名 (reservation用)
  userField?: string // ユーザーフィールド名 (user_field用)
  offsetMinutes: number // Negative for "before", positive for "after"
  offsetType: 'before' | 'after'
  description?: string
}

export interface Reservation {
  id: string
  userId: string
  serviceId: string
  reservationDate: Date
  reservationTime: string
  status: 'confirmed' | 'pending' | 'cancelled'
  serviceName: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  name: string
  type: 'TEXT' | 'FLEX' | 'IMAGE' | 'PACK'
  content: string
  notes?: string
  folderId?: string
  packId?: string
  order?: number
  lineMessageJson?: string
  buttons?: TemplateButton[]
  createdAt: Date
  updatedAt?: Date
  scenarioContext?: TemplateUsageContext
  usageStats?: {
    usedInScenarios: number
    totalDeliveries: number
    lastUsed?: Date
  }
  suggestedActionRules?: SuggestedActionRule[]
}

export interface TemplateFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplatePack {
  id: string
  name: string
  description?: string
  templateIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface DeliveryLog {
  id: string
  templateId: string
  userId: string
  status: DeliveryStatus
  sentAt?: Date
  openedAt?: Date
  clickedAt?: Date
  error?: string
  createdAt: Date
  template: Template
  user: User
  actions?: UserAction[]
}

export type UserActionType = 'URL_CLICK' | 'BUTTON_CLICK' | 'IMAGE_CLICK' | 'TEXT_SELECT' | 'MESSAGE_SHARE' | 'REPLY' | 'REACTION' | 'POSTBACK' | 'LOCATION_SHARE' | 'CONTACT_SHARE' | 'CUSTOM'

export interface UserAction {
  id: string
  userId: string
  templateId: string
  deliveryLogId: string
  actionType: UserActionType
  actionValue: string // URL, button text, postback data, etc.
  metadata?: Record<string, any> // Additional data like coordinates, custom fields
  timestamp: Date
  processed: boolean
}

export interface ActionRule {
  id: string
  templateId?: string // If null, applies to all templates
  scenarioId?: string // If null, applies to all scenarios
  packId?: string // If null, applies to all packs
  actionType: UserActionType
  actionCondition: {
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'any'
    value: string
    regex?: string
  }
  tagActions: TagAction[]
  isActive: boolean
  priority: number // Higher number = higher priority
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface TagAction {
  type: 'ADD_TAG' | 'REMOVE_TAG' | 'SET_STATUS'
  tagId?: string
  statusId?: string
  condition?: {
    ifHasTag?: string[]
    ifNotHasTag?: string[]
    ifStatus?: string
  }
}

export interface Broadcast {
  id: string
  name: string
  description?: string
  folderId?: string
  targetType: 'ALL' | 'SEGMENT' | 'TAGS'
  targetSegmentIds?: string[]
  targetTagIds?: string[]
  templateId: string
  scheduledAt?: Date
  sentAt?: Date
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
  updatedAt: Date
  sentCount?: number
  deliveredCount?: number
  openedCount?: number
  clickedCount?: number
}

export interface BroadcastFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

// アクション設定関連の型定義
export interface BroadcastAction {
  id: string
  type: ActionType
  trigger?: ActionTrigger
  payload?: ActionPayload
  condition?: ActionCondition
  order?: number
  delayMinutes?: number
  isActive?: boolean
  subActions?: SubAction[]
  level?: number
  parentId?: string
}

export interface SubAction {
  id: string
  type: 'CONDITIONAL' | 'ACTION'
  delayMinutes?: number
  condition?: {
    type: 'has' | 'not_has'
    tagIds: string[]
  }
  thenActions?: BroadcastAction[]
  elseActions?: BroadcastAction[]
  action?: BroadcastAction
}

export type ActionType = 
  | 'ADD_TAG'           // タグを追加
  | 'REMOVE_TAG'        // タグを削除
  | 'CHANGE_STATUS'     // ステータス変更
  | 'SEND_MESSAGE'      // メッセージ送信
  | 'WAIT'              // 待機
  | 'CONDITIONAL'       // 条件分岐

export interface ActionTrigger {
  type: ActionTriggerType
  condition?: TriggerCondition
  delayMinutes?: number
}

export type ActionTriggerType = 
  | 'URL_CLICK'         // URL クリック
  | 'BUTTON_CLICK'      // ボタン クリック
  | 'MESSAGE_OPEN'      // メッセージ開封
  | 'MESSAGE_REPLY'     // メッセージ返信
  | 'TIME_DELAY'        // 時間経過
  | 'IMMEDIATE'         // 即座に実行

export interface TriggerCondition {
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'any'
  value?: string | number
  targetUrl?: string
  buttonText?: string
}

export interface ActionPayload {
  tagIds?: string[]
  statusId?: string
  templateId?: string
  message?: string
  waitMinutes?: number
  conditions?: ActionCondition[]
}

export interface ActionCondition {
  type: 'HAS_TAG' | 'NOT_HAS_TAG' | 'STATUS_IS' | 'STATUS_NOT' | 'CUSTOM'
  tagIds?: string[]
  statusIds?: string[]
  customCondition?: string
}

export type TriggerType = 
  | 'MANUAL'
  | 'SCHEDULE'
  | 'USER_ACTION'
  | 'TAG_ADDED'
  | 'STATUS_CHANGED'
  | 'TIME_BASED'

export type DeliveryStatus = 
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'FAILED'
  | 'CANCELLED'

// UI Component Props
export interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export interface FilterCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'contains_all' | 'contains_any' | 'between' | 'before' | 'after'
  value: any
  logic?: 'AND' | 'OR'
  title?: string // Custom title for the condition
}

export interface SegmentFilter {
  conditions: FilterCondition[]
  logic: 'AND' | 'OR'
}

// LINE Message Types
export interface LineTextMessage {
  type: 'text'
  text: string
  quickReply?: QuickReply
}

export interface LineFlexMessage {
  type: 'flex'
  altText: string
  contents: FlexContainer
  quickReply?: QuickReply
}

export interface LineImageMessage {
  type: 'image'
  originalContentUrl: string
  previewImageUrl: string
  quickReply?: QuickReply
}

export interface FlexContainer {
  type: 'bubble' | 'carousel'
  body?: FlexBox
  header?: FlexBox
  hero?: FlexComponent
  footer?: FlexBox
}

export interface FlexBox {
  type: 'box'
  layout: 'vertical' | 'horizontal' | 'baseline'
  contents: FlexComponent[]
  spacing?: string
  margin?: string
  paddingAll?: string
}

export interface FlexComponent {
  type: 'text' | 'button' | 'image' | 'spacer' | 'separator'
  text?: string
  action?: Action
  url?: string
  size?: string
  weight?: string
  color?: string
}

export interface Action {
  type: 'uri' | 'message' | 'postback'
  uri?: string
  label?: string
  data?: string
  text?: string
}

export interface QuickReply {
  items: QuickReplyItem[]
}

export interface QuickReplyItem {
  type: 'action'
  action: Action
}

export type LineMessage = LineTextMessage | LineFlexMessage | LineImageMessage

// テンプレート用ボタン情報
export interface TemplateButton {
  id: string
  text: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  action: {
    type: 'uri' | 'postback' | 'message'
    data: string
  }
  order: number
}

// スマートアクションルール推奨用の型
export interface SuggestedActionRule {
  id: string
  actionType: UserActionType
  triggerElement: string // ボタンテキスト、URL等
  suggestedTagActions: TagAction[]
  confidence: number // 0-1の推奨度
  reason: string // 推奨理由
  isApplied?: boolean
}

// テンプレート利用コンテキスト
export interface TemplateUsageContext {
  scenarioId?: string
  scenarioName?: string
  campaignId?: string
  campaignName?: string
  targetSegmentId?: string
  targetSegmentName?: string
  purpose?: TemplatePurpose
  stage?: ScenarioStage
}

export type TemplatePurpose = 
  | 'WELCOME' // ウェルカムメッセージ
  | 'NOTIFICATION' // お知らせ
  | 'REMINDER' // リマインダー
  | 'PROMOTION' // プロモーション
  | 'SURVEY' // アンケート
  | 'FOLLOW_UP' // フォローアップ
  | 'SUPPORT' // サポート
  | 'ENGAGEMENT' // エンゲージメント
  | 'CONVERSION' // コンバージョン
  | 'RETENTION' // リテンション
  | 'OTHER' // その他

export type ScenarioStage = 
  | 'AWARENESS' // 認知
  | 'INTEREST' // 興味
  | 'CONSIDERATION' // 検討
  | 'INTENT' // 意向
  | 'EVALUATION' // 評価
  | 'PURCHASE' // 購入
  | 'RETENTION' // 維持
  | 'ADVOCACY' // 推奨

// テンプレート選択用のフィルター
export interface TemplateFilter {
  type?: Template['type'][]
  purpose?: TemplatePurpose[]
  stage?: ScenarioStage[]
  folderId?: string
  hasActions?: boolean
  usageFrequency?: 'high' | 'medium' | 'low'
  recentlyUsed?: boolean
  searchTerm?: string
}

// テンプレート推奨システム用
export interface TemplateRecommendation {
  template: Template
  score: number // 0-1の推奨スコア
  reasons: string[] // 推奨理由のリスト
  matchingCriteria: {
    purposeMatch?: boolean
    stageMatch?: boolean
    segmentMatch?: boolean
    contentSimilarity?: number
    performanceScore?: number
  }
}