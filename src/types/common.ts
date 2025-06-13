'use client'

// 共通の基底型定義

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface BaseFolder extends BaseEntity {
  name: string
  description?: string
  parentId?: string | null
}

export interface BaseTimingConfig {
  delayValue: number
  delayUnit: 'minutes' | 'hours' | 'days'
}

export interface BaseCondition {
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'any'
  value?: string | number
}

// 特定の型の拡張
export interface ReminderTimingConfig extends BaseTimingConfig {
  delayDirection: 'before' | 'after'
  condition?: TemplateExecutionCondition
}

export interface TemplateExecutionCondition {
  type: 'always' | 'tag_exists' | 'tag_not_exists' | 'status_is' | 'custom'
  tagIds?: string[]
  statusIds?: string[]
  customCondition?: string
}