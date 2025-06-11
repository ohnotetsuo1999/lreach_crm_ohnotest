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
  filterJson: string
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
  createdAt: Date
  updatedAt: Date
  packs: Pack[]
}

export interface Pack {
  id: string
  scenarioId: string
  order: number
  offsetMinutes: number
  conditionJson?: string
  createdAt: Date
  templates: Template[]
  packType?: 'normal' | 'reminder'
  reminderSettings?: ReminderSettings
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
  packId: string
  order: number
  lineMessageJson: string
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

export type ActionType = 'URL_CLICK' | 'BUTTON_CLICK' | 'IMAGE_CLICK' | 'TEXT_SELECT' | 'MESSAGE_SHARE' | 'REPLY' | 'REACTION' | 'POSTBACK' | 'LOCATION_SHARE' | 'CONTACT_SHARE' | 'CUSTOM'

export interface UserAction {
  id: string
  userId: string
  templateId: string
  deliveryLogId: string
  actionType: ActionType
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
  actionType: ActionType
  actionCondition: {
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'any'
    value: string
    regex: string
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

export type LineMessage = LineTextMessage | LineFlexMessage