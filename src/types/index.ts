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

// Import common types
import { BaseFolder } from './common'

export interface TagFolder extends BaseFolder {}

export interface Status {
  id: string
  code: string
  label: string
  folderId?: string
}

export interface StatusFolder extends BaseFolder {}

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

export interface SegmentFolder extends BaseFolder {}

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
  description?: string // 説明フィールドを追加
  trigger: TriggerType
  triggerValue?: string
  isActive: boolean
  folderId?: string
  createdAt: Date
  updatedAt: Date
  // Message flow data (stored as JSON)
  messageFlow?: Record<string, unknown>
  // Target settings
  targetType?: 'all' | 'segment'
  targetSegmentId?: string
  // Schedule settings
  scheduleType?: 'immediate' | 'scheduled'
  scheduledAt?: Date
  // Execution timing settings
  executionTiming?: 'manual' | 'automatic' | 'time_based' | 'friend_added' | 'tag_added'
  executionDelay?: number // minutes
  // Advanced timing settings
  triggerTagId?: string // For tag_added trigger
}

// Separate interface for reservation reminders
export interface ReservationReminder {
  id: string
  name: string
  description?: string
  folderId?: string
  isActive: boolean
  reminderType: 'reservation' | 'user_field' | 'custom_date'
  reminderSettings: ReminderConfiguration
  eventSettings?: ReminderEventSettings
  templates: ReminderTemplate[]
  createdAt: Date
  updatedAt: Date
}

export interface ReminderFolder extends BaseFolder {}

export interface ReminderEventSettings {
  eventType: 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
  eventName?: string
  customField?: string
  eventId?: string // 特定のイベントに紐付ける場合のイベントID
  eventData?: Record<string, unknown> // 選択されたイベントの詳細データ
  selectedEventIds?: string[] // 選択されたイベントIDのリスト
}

export interface ReminderTriggerCondition {
  id: string
  type: 'date_based' | 'user_action' | 'tag_based' | 'status_based'
  condition: {
    field?: string
    operator: 'equals' | 'before' | 'after' | 'between' | 'exists' | 'not_exists'
    value?: string | number | boolean | Date
    dateOffset?: {
      value: number
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
      direction: 'before' | 'after'
    }
  }
  isActive: boolean
}

export interface ReminderTemplate {
  id: string
  templateId: string
  template: Template
  order: number
  timingConfig: ReminderTimingConfig
  actions: BroadcastAction[]
}

export interface ScenarioFolder extends BaseFolder {}

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
  packType?: 'normal' | 'reminder' | 'conditional'
  reminderSettings?: ReminderSettings
  // Enhanced conditional logic
  conditionalLogic?: ConditionalLogic
  // Action trigger settings
  actionTriggers?: ActionTrigger[]
  // Execution flow control
  executionMode?: 'sequential' | 'parallel' | 'conditional'
  // Pack-level actions
  packActions?: BroadcastAction[]
}

// Enhanced conditional logic structure
export interface ConditionalLogic {
  id: string
  type: 'if_then_else' | 'switch' | 'loop'
  conditions: ConditionalBranch[]
  defaultBranch?: ConditionalBranch
  evaluationOrder: 'first_match' | 'all_match' | 'priority'
}

export interface ConditionalBranch {
  id: string
  name: string
  condition: ConditionalExpression
  actions: BroadcastAction[]
  nextPackId?: string // For flow control
  priority?: number
  isActive: boolean
}

export interface ConditionalExpression {
  type: 'simple' | 'compound'
  operator?: 'AND' | 'OR' | 'NOT'
  conditions?: ConditionalExpression[]
  // Simple condition properties
  field?: string
  comparison: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'greater_than' | 'less_than' | 'between'
  value?: string | number | boolean | Date
  tagId?: string
  statusId?: string
  userField?: string
  customFunction?: string
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

// Enhanced reminder configuration for scenarios
export interface ReminderConfiguration {
  type: 'reservation' | 'user_field' | 'custom_date'
  offsetValue: number
  offsetUnit: 'minutes' | 'hours' | 'days'
  offsetDirection: 'before' | 'after'
  reservationField?: string // For reservation type
  userDateField?: string // For user_field type
}

// Template timing configuration
export interface TemplateTimingConfig {
  delayValue: number
  delayUnit: 'minutes' | 'hours' | 'days'
  delayDirection?: 'before' | 'after' // オプショナルにして既存コードとの互換性を保つ
  condition?: TemplateExecutionCondition
}

// Reminder specific timing configuration
export interface ReminderTimingConfig {
  delayValue: number
  delayUnit: 'minutes' | 'hours' | 'days'
  delayDirection: 'before' | 'after'
  condition?: TemplateExecutionCondition
}

// Template execution condition
export interface TemplateExecutionCondition {
  type: 'always' | 'tag_exists' | 'tag_not_exists' | 'status_is' | 'status_not' | 'date_range' | 'user_segment' | 'custom'
  tagId?: string
  statusId?: string
  tagIds?: string[]
  statusIds?: string[]
  startDate?: string
  endDate?: string
  segmentType?: string
  minAge?: number
  maxAge?: number
  gender?: string
  location?: string
  customCondition?: string
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

export interface TemplateFolder extends BaseFolder {}

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

export interface BroadcastFolder extends BaseFolder {}

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
  | 'WEBHOOK'           // Webhook

export interface ActionTrigger {
  type: ActionTriggerType
  condition?: TriggerCondition
  delayMinutes?: number
  eventIntegration?: EventIntegration
  tagFilter?: TagFilter
  userFilter?: UserFilter
}

export type ActionTriggerType = 
  | 'URL_CLICK'         // URL クリック
  | 'BUTTON_CLICK'      // ボタン クリック
  | 'MESSAGE_OPEN'      // メッセージ開封
  | 'MESSAGE_REPLY'     // メッセージ返信
  | 'TIME_DELAY'        // 時間経過
  | 'IMMEDIATE'         // 即座に実行
  | 'FRIEND_ADDED'      // 友達追加時
  | 'TAG_ADDED'         // タグ追加時
  | 'TAG_REMOVED'       // タグ削除時
  | 'STATUS_CHANGED'    // ステータス変更時
  | 'RESERVATION_MADE'  // 予約作成時
  | 'RESERVATION_CANCELLED' // 予約キャンセル時
  | 'EVENT_TRIGGER'     // カスタムイベント
  | 'RECURRING'         // 定期実行

// Event integration for external systems
export interface EventIntegration {
  type: 'reservation_system' | 'calendar' | 'webhook' | 'api_call'
  endpoint?: string
  apiKey?: string
  eventMapping: EventFieldMapping[]
  triggerConditions?: EventTriggerCondition[]
}

export interface EventFieldMapping {
  sourceField: string
  targetField: string
  transformation?: 'date_format' | 'text_format' | 'number_format' | 'custom'
  customFunction?: string
}

export interface EventTriggerCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'exists' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

// Enhanced tag and user filtering
export interface TagFilter {
  includeTagIds?: string[]
  excludeTagIds?: string[]
  tagLogic: 'AND' | 'OR'
  requireAllTags?: boolean
}

export interface UserFilter {
  userFields?: Record<string, any>
  statusIds?: string[]
  segmentIds?: string[]
  customConditions?: string[]
}

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
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'contains_all' | 'contains_any' | 'not_contains_any' | 'not_contains_all' | 'between' | 'before' | 'after'
  value: string | number | boolean | string[] | number[] | { from: string; to: string }
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

// ========== CRM (Customer Relationship Management) 関連の型定義 ==========

// 求職者情報
export interface JobSeeker {
  id: string
  name: string
  email?: string
  phone: string
  lineUserId?: string
  profileImageUrl?: string
  
  // 基本情報
  birthDate?: Date
  age?: number
  gender?: 'male' | 'female' | 'other'
  address?: string
  
  // 職歴・学歴
  currentCompany?: string
  currentPosition?: string
  yearsOfExperience?: number
  education?: Education[]
  workHistory?: WorkHistory[]
  experiences?: WorkHistory[] // エイリアスとして追加
  
  // スキル・資格
  skills: Skill[]
  certifications: Certification[]
  languages: Language[]
  
  // 希望条件
  desiredPositions: string[]
  desiredSalary?: {
    min: number
    max: number
    currency: string
  }
  desiredLocation?: string[]
  availableFrom?: Date
  workStyle?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'intern'
  
  // 書類
  resumeUrl?: string
  portfolioUrl?: string
  attachments?: Attachment[]
  
  // ステータス
  status: JobSeekerStatus
  tags: string[]
  notes?: string
  
  // 応募履歴
  applications?: JobApplication[]
  
  // システム情報
  source?: 'lp' | 'ad' | 'organic' | 'qr' | 'referral' | 'direct' | 'sns' | 'email'
  lineStatus?: 'connected' | 'not_connected' | 'blocked'
  createdAt: Date
  updatedAt: Date
  lastContactedAt?: Date
}

export type JobSeekerStatus = 
  | 'new'              // 新規
  | 'screening'        // スクリーニング中
  | 'qualified'        // 適格
  | 'interviewing'     // 面接中
  | 'offer_pending'    // オファー検討中
  | 'hired'           // 採用
  | 'rejected'        // 不採用
  | 'on_hold'         // 保留
  | 'withdrawn'       // 辞退

export interface Education {
  id: string
  school: string
  degree?: string
  field?: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
}

export interface WorkHistory {
  id: string
  company: string
  position: string
  startDate: Date
  endDate?: Date
  isCurrent: boolean
  description?: string
  achievements?: string[]
}

export interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  url?: string
}

export interface Language {
  id: string
  name: string
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic'
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: 'resume' | 'portfolio' | 'certificate' | 'other'
  uploadedAt: Date
}

// 求人情報
export interface JobPosting {
  id: string
  title: string
  companyId: string
  company?: Company // Populated company object
  companyName?: string // For backward compatibility
  department?: string
  
  // 求人詳細
  description: string
  requirements: string[]
  responsibilities: string[]
  preferredQualifications?: string[]
  
  // 雇用条件
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'intern'
  jobType: JobType
  location: string
  locationType: JobLocation
  remoteOption?: 'onsite' | 'remote' | 'hybrid'
  salary?: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  salaryRange?: {
    min: number
    max: number
    currency: string
    period: 'hourly' | 'monthly' | 'yearly'
  }
  salaryDetails?: string
  benefits?: string[]
  
  // 求めるスキル
  requiredSkills: string[]
  preferredSkills?: string[]
  requiredExperience?: number // years
  experienceRequired?: number // years alias
  requiredEducation?: string
  educationRequired?: string // alias
  
  // ステータス
  status: JobPostingStatus
  publishedAt?: Date
  postedAt: Date
  expiresAt?: Date
  closingDate?: Date
  
  // 採用プロセス
  hiringProcess: HiringStage[]
  targetHiringDate?: Date
  numberOfOpenings: number
  
  // 担当者
  hiringManagerId?: string
  recruiterId?: string
  interviewers?: string[]
  
  // 応募者
  applications?: JobApplication[]
  
  // 勤務条件
  workingHours?: string
  
  // フラグ
  isUrgent?: boolean
  isFeatured?: boolean
  
  // システム情報
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  internalNotes?: string
}

export type JobPostingStatus = 
  | 'draft'           // 下書き
  | 'published'       // 公開中
  | 'active'          // アクティブ（公開中のエイリアス）
  | 'closed'          // 募集終了
  | 'on_hold'         // 一時停止
  | 'filled'          // 採用済み

// 求人タイプ
export type JobType = 
  | 'full_time'       // 正社員
  | 'part_time'       // パート・アルバイト
  | 'contract'        // 契約社員
  | 'internship'      // インターン
  | 'temporary'       // 派遣

// 勤務地タイプ
export type JobLocation = 
  | 'onsite'          // オンサイト
  | 'remote'          // リモート
  | 'hybrid'          // ハイブリッド

export interface HiringStage {
  id: string
  name: string
  order: number
  description?: string
  estimatedDuration?: number // days
}

// エージェント情報
export interface Agent {
  id: string
  name: string
  email: string
  phone: string
  profileImageUrl?: string
  
  // エージェント情報
  company?: string
  department?: string
  position?: string
  specializations?: string[]
  specialties?: string[] // エイリアス
  
  // パフォーマンス
  successfulPlacements?: number
  activeJobSeekers?: number
  rating?: number
  performanceMetrics?: {
    totalRecommendations: number
    successfulPlacements: number
    averageTimeToHire: number
    clientSatisfactionScore: number
  }
  
  // 権限
  permissions: AgentPermission[]
  
  // システム情報
  status: AgentStatus
  isActive?: boolean // 互換性のため
  joinedAt: Date
  lastActiveAt?: Date
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export type AgentStatus = 
  | 'active'          // アクティブ
  | 'inactive'        // 非アクティブ
  | 'suspended'       // 停止中

export type AgentPermission = 
  | 'view_all_candidates'
  | 'edit_candidates'
  | 'view_all_jobs'
  | 'create_jobs'
  | 'manage_applications'
  | 'send_messages'
  | 'export_data'

// 応募情報
export interface JobApplication {
  id: string
  jobSeekerId: string
  jobPostingId: string
  
  // 応募情報
  appliedAt: Date
  coverLetter?: string
  expectedSalary?: number
  availableFrom?: Date
  
  // ステータス
  status: ApplicationStatus
  stage: string // Current hiring stage ID
  
  // 評価
  ratings?: ApplicationRating[]
  averageRating?: number
  
  // 面接
  interviews?: Interview[]
  
  // オファー
  offer?: JobOffer
  
  // アクティビティ
  activities?: ApplicationActivity[]
  
  // システム情報
  source?: 'direct' | 'agent' | 'referral' | 'job_board'
  agentId?: string
  referrerId?: string
  updatedAt: Date
  notes?: string
}

export type ApplicationStatus = 
  | 'new'             // 新規
  | 'applied'         // 応募済み
  | 'reviewing'       // 審査中
  | 'shortlisted'     // 候補者リスト入り
  | 'interviewing'    // 面接中
  | 'offered'         // オファー済み
  | 'accepted'        // 承諾
  | 'rejected'        // 不採用
  | 'withdrawn'       // 辞退

export interface ApplicationRating {
  id: string
  evaluatorId: string
  rating: number // 1-5
  criteria: string
  comments?: string
  createdAt: Date
}

export interface Interview {
  id: string
  applicationId: string
  
  // 面接情報
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'final'
  scheduledAt: Date
  duration: number // minutes
  location?: string
  meetingUrl?: string
  
  // 参加者
  interviewers: string[]
  
  // 結果
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  feedback?: InterviewFeedback[]
  overallRating?: number
  decision?: 'pass' | 'fail' | 'maybe'
  
  // システム情報
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface InterviewFeedback {
  id: string
  interviewerId: string
  rating: number // 1-5
  strengths?: string[]
  weaknesses?: string[]
  comments: string
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no'
  createdAt: Date
}

export interface JobOffer {
  id: string
  applicationId: string
  
  // オファー詳細
  position: string
  salary: number
  currency: string
  startDate: Date
  expiryDate: Date
  
  // 条件
  employmentType: string
  location: string
  benefits?: string[]
  additionalTerms?: string
  
  // ステータス
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'withdrawn'
  sentAt?: Date
  respondedAt?: Date
  
  // システム情報
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ApplicationActivity {
  id: string
  applicationId: string
  type: ActivityType
  description: string
  performedBy: string
  createdAt: Date
  metadata?: Record<string, any>
}

export type ActivityType = 
  | 'status_changed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'rating_added'
  | 'offer_sent'
  | 'offer_responded'
  | 'note_added'
  | 'document_uploaded'

// チャット関連
export interface ChatConversation {
  id: string
  participants: ChatParticipant[]
  type: 'jobseeker_line' | 'agent_internal'
  
  // 会話情報
  lastMessageAt?: Date
  lastMessage?: ChatMessage
  unreadCount?: number
  
  // コンテキスト
  contextType?: 'job_application' | 'general_inquiry' | 'interview_schedule'
  contextId?: string // applicationId, jobPostingId, etc.
  
  // システム情報
  status: 'active' | 'archived' | 'closed'
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export interface ChatParticipant {
  id: string
  type: 'jobseeker' | 'agent' | 'system'
  name: string
  profileImageUrl?: string
  lastSeenAt?: Date
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  
  // メッセージ内容
  type: 'text' | 'image' | 'file' | 'template' | 'system'
  content: string
  attachments?: ChatAttachment[]
  
  // メタデータ
  metadata?: {
    templateId?: string
    quickReplies?: string[]
    buttons?: ChatButton[]
  }
  
  // ステータス
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
  
  // システム情報
  isDeleted: boolean
  editedAt?: Date
}

export interface ChatAttachment {
  id: string
  type: 'image' | 'document' | 'video'
  url: string
  name: string
  size: number
  mimeType: string
}

export interface ChatButton {
  id: string
  text: string
  action: 'url' | 'postback' | 'call'
  value: string
}

// CRM ダッシュボード用の統計
export interface CRMStats {
  totalJobSeekers: number
  activeApplications: number
  openPositions: number
  placementsThisMonth: number
  averageTimeToHire: number // days
  applicationsByStatus: Record<ApplicationStatus, number>
  topSkillsInDemand: Array<{ skill: string; count: number }>
  hiringFunnel: Array<{ stage: string; count: number }>
  sourceEffectiveness: Array<{ source: string; applications: number; hires: number }>
}

// ========== CRM/ATS Integration Types ==========

// マスク化されたプロファイル（個人情報を隠した履歴書）
export interface MaskedProfile {
  id: string
  jobSeekerId: string // 元の求職者ID（CRM側のみ参照可能）
  
  // 公開情報（個人情報なし）
  profileCode: string // 匿名化されたコード（例："JP-2024-001"）
  
  // 職務要約（個人情報を除外）
  careerSummary: string
  yearsOfExperience: number
  currentIndustry?: string
  currentJobLevel?: string // "Junior", "Mid", "Senior", "Manager", etc.
  
  // スキル情報
  skills: Array<{
    category: string
    items: string[]
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }>
  
  // 経歴（会社名は業界・規模で表現）
  experiences: Array<{
    industry: string
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
    position: string
    duration: string // "2年3ヶ月" など
    achievements: string[]
  }>
  
  // 学歴（学校名は伏せる）
  education: Array<{
    level: string // "Bachelor", "Master", "PhD", etc.
    field: string
    graduationYear?: number
  }>
  
  // 資格・認定
  certifications: string[]
  languages: Array<{
    language: string
    proficiency: 'native' | 'fluent' | 'conversational' | 'basic'
  }>
  
  // 希望条件
  preferences: {
    desiredRoles: string[]
    salaryRange?: {
      min: number
      max: number
      currency: string
    }
    locations: string[]
    workStyle: ('full-time' | 'part-time' | 'contract' | 'remote')[]
    availabilityPeriod: string // "即日", "1ヶ月以内", "3ヶ月以内" など
  }
  
  // CA（キャリアアドバイザー）所感
  advisorInsights: {
    personalityTraits: string[]
    strengths: string[]
    developmentAreas?: string[]
    recommendations: string
    fitForRoles: string[]
    notes: string
  }
  
  // メタ情報
  isPublished: boolean
  publishedAt?: Date
  lastUpdatedAt: Date
  viewCount?: number
  requestCount?: number
  tags: string[]
  
  // システム情報
  createdBy: string // Agent ID
  createdAt: Date
  updatedAt: Date
}

// 推薦リクエスト（ATS側からCRM側へ）
export interface RecommendationRequest {
  id: string
  
  // リクエスト元（ATS側）
  requesterId: string // HR担当者ID
  requesterName: string
  requesterCompany: string
  requesterEmail?: string
  
  // 対象
  maskedProfileId: string
  maskedProfile?: MaskedProfile // Populated
  jobPostingId: string
  jobPosting?: JobPosting // Populated
  
  // リクエスト詳細
  message: string // HR担当者からのメッセージ
  requirements?: string[] // 追加要件
  preferredSkills?: string[] // 希望スキル
  
  // 提示条件
  offeredSalary?: {
    min: number
    max: number
    currency: string
    negotiable: boolean
  }
  benefits?: string[]
  startDate?: Date
  
  // 優先度・緊急度
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  
  // 添付資料
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: 'pitch_deck' | 'job_description' | 'company_profile' | 'video' | 'other'
  }>
  
  // ステータス管理
  status: RecommendationRequestStatus
  
  // レスポンス情報
  agentId?: string // 担当エージェントID
  agentResponse?: {
    respondedAt: Date
    message: string
    candidateStatus: 'interested' | 'considering' | 'declined' | 'unavailable'
    candidateFeedback?: string
    expectedFollowUp?: Date
  }
  
  // LINE送信情報
  lineSentAt?: Date
  lineMessageId?: string
  candidateLineResponse?: {
    respondedAt: Date
    response: 'interested' | 'declined'
    message?: string
  }
  
  // システム情報
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  notes?: string
}

export type RecommendationRequestStatus = 
  | 'new'                    // 新着
  | 'viewed'                  // 既読
  | 'in_progress'            // 対応中
  | 'sent_to_candidate'      // 候補者に送信済み
  | 'candidate_interested'   // 候補者が興味あり
  | 'candidate_declined'     // 候補者が辞退
  | 'completed'              // 完了
  | 'expired'                // 期限切れ
  | 'cancelled'              // キャンセル

// マスクプロファイル検索条件
export interface MaskedProfileSearchCriteria {
  keywords?: string[]
  skills?: string[]
  industries?: string[]
  jobLevels?: string[]
  yearsOfExperience?: {
    min?: number
    max?: number
  }
  salaryRange?: {
    min?: number
    max?: number
  }
  locations?: string[]
  workStyles?: ('full-time' | 'part-time' | 'contract' | 'remote')[]
  availability?: string[]
  languages?: string[]
  certifications?: string[]
  tags?: string[]
  
  // ソート・フィルタ
  sortBy?: 'relevance' | 'experience' | 'updated' | 'viewed'
  sortOrder?: 'asc' | 'desc'
  isPublished?: boolean
  publishedAfter?: Date
  limit?: number
  offset?: number
}

// LINE メッセージテンプレート（推薦用）
export interface RecommendationLineTemplate {
  id: string
  name: string
  
  // メッセージ構成
  greeting: string
  jobSummary: string // 求人要約のテンプレート
  companyIntroduction: string
  benefitsHighlight: string
  callToAction: string
  
  // 動的フィールド（置換用）
  variables: Array<{
    key: string // {{company_name}}, {{position}}, {{salary_range}} など
    description: string
    required: boolean
    defaultValue?: string
  }>
  
  // クイックリプライボタン
  quickReplies: Array<{
    label: string
    action: 'interested' | 'declined' | 'ask_more'
    postbackData?: string
  }>
  
  // 使用統計
  usageCount?: number
  successRate?: number // 興味ありの割合
  
  createdAt: Date
  updatedAt: Date
}

// Webhook ペイロード（LINE応答受信用）
export interface LineRecommendationWebhook {
  event: 'postback' | 'message'
  userId: string // LINE User ID
  timestamp: Date
  
  // Postback データ（ボタン押下時）
  postback?: {
    data: string // JSON string containing action and recommendationRequestId
    params?: Record<string, any>
  }
  
  // メッセージデータ（テキスト返信時）
  message?: {
    type: 'text'
    text: string
  }
  
  // 解析後のデータ
  parsed?: {
    action: 'interested' | 'declined' | 'ask_more'
    recommendationRequestId: string
    additionalInfo?: string
  }
}

// ========== ATS Functions Types ==========

// 企業情報
export interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  description: string
  website?: string
  location: string
  foundedYear?: number
  employeeCount?: number
  culture?: string
  benefits?: string[]
  
  // 連絡先情報
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  
  // 採用関連
  hiringStatus: 'active' | 'inactive' | 'paused'
  activeJobPostings?: number
  totalHires?: number
  
  // システム情報
  createdAt: Date
  updatedAt: Date
  notes?: string
}