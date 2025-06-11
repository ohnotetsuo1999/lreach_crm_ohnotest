'use client'

import { ActionRule, Tag, Status } from '@/types'
import { Zap, Plus, ShoppingCart, User, Crown, Heart, MessageCircle, Mail } from 'lucide-react'

interface ActionRulePresetsProps {
  templateId?: string
  packId?: string
  tags: Tag[]
  statuses: Status[]
  onCreateRule: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ActionRulePresets({
  templateId,
  packId,
  tags,
  statuses,
  onCreateRule
}: ActionRulePresetsProps) {
  
  const presets = [
    {
      id: 'purchase_button',
      name: '購入ボタンクリック → VIPタグ',
      icon: ShoppingCart,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: '購入ボタンをクリックしたユーザーにVIPタグを付与',
      action: () => createPresetRule({
        description: '購入ボタンクリック者にVIPタグ付与',
        actionType: 'BUTTON_CLICK',
        condition: { operator: 'contains', value: '購入' },
        tagAction: { type: 'ADD_TAG', findTag: 'VIP' }
      })
    },
    {
      id: 'contact_button',
      name: 'お問い合わせ → リード',
      icon: Mail,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'お問い合わせボタンクリック者をリードステータスに変更',
      action: () => createPresetRule({
        description: 'お問い合わせボタンクリック者をリードに変更',
        actionType: 'BUTTON_CLICK',
        condition: { operator: 'contains', value: 'お問い合わせ' },
        statusAction: { type: 'SET_STATUS', findStatus: 'リード' }
      })
    },
    {
      id: 'reply_active',
      name: '返信 → アクティブタグ',
      icon: MessageCircle,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'メッセージに返信したユーザーにアクティブタグを付与',
      action: () => createPresetRule({
        description: 'メッセージ返信者にアクティブタグ付与',
        actionType: 'REPLY',
        condition: { operator: 'any', value: '' },
        tagAction: { type: 'ADD_TAG', findTag: 'アクティブ' }
      })
    },
    {
      id: 'url_click_interested',
      name: 'URLクリック → 興味ありタグ',
      icon: Heart,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'URLをクリックしたユーザーに興味ありタグを付与',
      action: () => createPresetRule({
        description: 'URLクリック者に興味ありタグ付与',
        actionType: 'URL_CLICK',
        condition: { operator: 'any', value: '' },
        tagAction: { type: 'ADD_TAG', findTag: '興味あり' }
      })
    },
    {
      id: 'premium_button',
      name: 'プレミアム → 顧客ステータス',
      icon: Crown,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'プレミアム関連ボタンクリック者を顧客ステータスに変更',
      action: () => createPresetRule({
        description: 'プレミアムボタンクリック者を顧客に変更',
        actionType: 'BUTTON_CLICK',
        condition: { operator: 'contains', value: 'プレミアム' },
        statusAction: { type: 'SET_STATUS', findStatus: '顧客' }
      })
    },
    {
      id: 'profile_button',
      name: 'プロフィール表示 → 見込み客',
      icon: User,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description: 'プロフィール表示ボタンクリック者を見込み客に変更',
      action: () => createPresetRule({
        description: 'プロフィール表示者を見込み客に変更',
        actionType: 'BUTTON_CLICK',
        condition: { operator: 'contains', value: 'プロフィール' },
        statusAction: { type: 'SET_STATUS', findStatus: '見込み客' }
      })
    }
  ]

  interface PresetRuleConfig {
    description: string
    actionType: 'BUTTON_CLICK' | 'URL_CLICK' | 'REPLY'
    condition: { operator: string; value: string }
    tagAction?: { type: 'ADD_TAG'; findTag: string }
    statusAction?: { type: 'SET_STATUS'; findStatus: string }
  }

  const createPresetRule = (config: PresetRuleConfig) => {
    let tagActions: any[] = []

    if (config.tagAction) {
      const tag = tags.find(t => t.name.includes(config.tagAction!.findTag))
      if (tag) {
        tagActions.push({
          type: config.tagAction.type,
          tagId: tag.id
        })
      }
    }

    if (config.statusAction) {
      const status = statuses.find(s => s.label.includes(config.statusAction!.findStatus))
      if (status) {
        tagActions.push({
          type: config.statusAction.type,
          statusId: status.id
        })
      }
    }

    // タグもステータスも見つからない場合は、最初のタグを使用
    if (tagActions.length === 0 && tags.length > 0) {
      tagActions.push({
        type: 'ADD_TAG',
        tagId: tags[0].id
      })
    }

    const rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      description: config.description,
      actionType: config.actionType,
      actionCondition: {
        operator: config.condition.operator as any,
        value: config.condition.value,
        regex: ''
      },
      tagActions,
      isActive: true,
      priority: 7,
      templateId,
      packId
    }

    onCreateRule(rule)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Zap className="w-4 h-4 text-orange-500 mr-2" />
        <h4 className="text-sm font-medium text-gray-900">よく使うアクションルール</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              onClick={preset.action}
              className={`text-left p-3 rounded-lg border transition-all hover:shadow-sm ${preset.color}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">
                    {preset.name}
                  </div>
                  <div className="text-xs opacity-75 line-clamp-2">
                    {preset.description}
                  </div>
                </div>
                <Plus className="w-4 h-4 opacity-50" />
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        💡 <strong>使い方:</strong> よく使うパターンをワンクリックで設定できます。設定後に条件やアクションを調整することも可能です。
      </div>
    </div>
  )
}