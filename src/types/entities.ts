// Base entity types that all entities extend from
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface NamedEntity extends BaseEntity {
  name: string
  description?: string
}

export interface FolderableEntity {
  folderId?: string | null
}

// Generic folder type that can be used for any entity
export interface EntityFolder<T extends string = string> extends NamedEntity {
  parentId?: string | null
  entityType: T
}

// Timing configuration - consolidated from multiple similar types
export interface TimingConfig {
  delayValue: number
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months'
  delayDirection?: 'before' | 'after'
  condition?: ExecutionCondition
}

// Execution condition - used across multiple features
export interface ExecutionCondition {
  type: 'always' | 'tag_exists' | 'tag_not_exists' | 'status_is' | 'status_not' | 
        'date_range' | 'user_segment' | 'custom'
  tagId?: string
  tagIds?: string[]
  statusId?: string
  statusIds?: string[]
  startDate?: string
  endDate?: string
  segmentId?: string
  customCondition?: string
}

// Action types - consolidated from multiple definitions
export enum ActionType {
  // Tag actions
  ADD_TAG = 'ADD_TAG',
  REMOVE_TAG = 'REMOVE_TAG',
  
  // Status actions
  CHANGE_STATUS = 'CHANGE_STATUS',
  
  // Message actions
  SEND_MESSAGE = 'SEND_MESSAGE',
  
  // Flow control
  WAIT = 'WAIT',
  CONDITIONAL = 'CONDITIONAL',
  WEBHOOK = 'WEBHOOK',
  
  // User actions
  URL_CLICK = 'URL_CLICK',
  BUTTON_CLICK = 'BUTTON_CLICK',
  IMAGE_CLICK = 'IMAGE_CLICK',
  TEXT_SELECT = 'TEXT_SELECT',
  MESSAGE_SHARE = 'MESSAGE_SHARE',
  REPLY = 'REPLY',
  REACTION = 'REACTION',
  POSTBACK = 'POSTBACK',
  LOCATION_SHARE = 'LOCATION_SHARE',
  CONTACT_SHARE = 'CONTACT_SHARE',
  CUSTOM = 'CUSTOM'
}

// Trigger types - aligned with Prisma schema
export enum TriggerType {
  MANUAL = 'MANUAL',
  SCHEDULE = 'SCHEDULE',
  USER_ACTION = 'USER_ACTION',
  TAG_ADDED = 'TAG_ADDED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  TIME_BASED = 'TIME_BASED'
}

// Filter operators - used in segments and conditions
export enum FilterOperator {
  // Equality
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  
  // String operations
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  
  // Numeric operations
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  BETWEEN = 'between',
  
  // Array operations
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS_ALL = 'contains_all',
  CONTAINS_ANY = 'contains_any',
  NOT_CONTAINS_ANY = 'not_contains_any',
  NOT_CONTAINS_ALL = 'not_contains_all',
  
  // Date operations
  BEFORE = 'before',
  AFTER = 'after',
  
  // Existence
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  
  // Special
  REGEX = 'regex',
  ANY = 'any'
}

// Delivery status - used across multiple features
export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Template types
export enum TemplateType {
  TEXT = 'TEXT',
  FLEX = 'FLEX',
  IMAGE = 'IMAGE',
  PACK = 'PACK'
}

// Common action payload interface
export interface ActionPayload {
  tagIds?: string[]
  statusId?: string
  templateId?: string
  message?: string
  waitMinutes?: number
  conditions?: ActionCondition[]
}

// Action condition interface
export interface ActionCondition {
  type: 'HAS_TAG' | 'NOT_HAS_TAG' | 'STATUS_IS' | 'STATUS_NOT' | 'CUSTOM'
  tagIds?: string[]
  statusIds?: string[]
  customCondition?: string
}