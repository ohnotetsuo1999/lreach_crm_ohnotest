// メッセージフロー用の型定義

export interface MessageFlowNode {
  id: string
  type: 'template' | 'condition' | 'delay' | 'action'
  position: { x: number; y: number }
  data: MessageFlowNodeData
}

export interface MessageFlowNodeData {
  // テンプレートノード
  templateId?: string
  template?: {
    id: string
    name: string
    content: string
    type: 'TEXT' | 'FLEX' | 'IMAGE' | 'PACK'
  }
  
  // 条件分岐ノード
  condition?: {
    type: 'tag' | 'action' | 'time' | 'segment'
    operator: 'has' | 'not_has' | 'equals' | 'not_equals'
    value: string
    tagId?: string
    timeValue?: number
    timeUnit?: 'minutes' | 'hours' | 'days'
  }
  
  // 遅延ノード
  delay?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
    condition?: 'always' | 'business_hours' | 'weekdays'
  }
  
  // アクションノード
  action?: {
    type: 'add_tag' | 'remove_tag' | 'change_status' | 'send_notification'
    tagId?: string
    statusId?: string
    message?: string
  }
}

export interface MessageFlowEdge {
  id: string
  source: string
  target: string
  type: 'default' | 'condition_true' | 'condition_false'
  label?: string
}

export interface MessageFlow {
  nodes: MessageFlowNode[]
  edges: MessageFlowEdge[]
}

// 条件設定用の型
export interface FlowCondition {
  id: string
  type: 'tag_exists' | 'tag_not_exists' | 'user_action' | 'time_based' | 'segment_match'
  description: string
  config: {
    tagId?: string
    actionType?: 'click' | 'reply' | 'view'
    timeValue?: number
    timeUnit?: 'minutes' | 'hours' | 'days'
    segmentId?: string
    operator?: 'and' | 'or'
  }
}

// タイミング設定用の型
export interface FlowTiming {
  id: string
  type: 'immediate' | 'delay' | 'scheduled' | 'trigger_based'
  delay?: {
    value: number
    unit: 'minutes' | 'hours' | 'days'
    condition?: 'always' | 'business_hours' | 'weekdays_only'
  }
  schedule?: {
    time: string // HH:MM
    timezone: string
    recurring?: 'none' | 'daily' | 'weekly' | 'monthly'
  }
  trigger?: {
    event: 'user_action' | 'tag_added' | 'status_changed'
    conditions: FlowCondition[]
  }
}