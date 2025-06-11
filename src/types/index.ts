export interface User {
  id: string
  name: string
  lineUid?: string
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
  tags: Tag[]
  statusHistory: UserStatusLog[]
}

export interface Tag {
  id: string
  name: string
  type: 'MANUAL' | 'AUTOMATIC' | 'BEHAVIORAL'
  createdAt: Date
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
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  logic?: 'AND' | 'OR'
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