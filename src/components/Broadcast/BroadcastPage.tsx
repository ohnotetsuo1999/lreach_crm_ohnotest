'use client'

import { useState } from 'react'
import { User, Segment, Template, Tag, Status } from '@/types'
import { Send, Users, Target, FileText, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

interface BroadcastPageProps {
  users: User[]
  segments: Segment[]
  templates: Template[]
  tags: Tag[]
  statuses: Status[]
  onSend: (broadcastData: {
    targetType: 'all' | 'segment' | 'tags' | 'status'
    targetValue?: string | string[]
    templateId: string
    scheduleType: 'immediate' | 'scheduled'
    scheduledAt?: Date
    title: string
    description?: string
  }) => void
}

export function BroadcastPage({
  users,
  segments,
  templates,
  tags,
  statuses,
  onSend
}: BroadcastPageProps) {
  const [currentStep, setCurrentStep] = useState<'target' | 'template' | 'schedule' | 'confirm'>('target')
  const [broadcastData, setBroadcastData] = useState({
    targetType: 'all' as 'all' | 'segment' | 'tags' | 'status',
    targetValue: undefined as string | string[] | undefined,
    templateId: '',
    scheduleType: 'immediate' as 'immediate' | 'scheduled',
    scheduledAt: undefined as Date | undefined,
    title: '',
    description: ''
  })

  const steps = [
    { id: 'target', label: '配信対象', icon: Target },
    { id: 'template', label: 'テンプレート', icon: FileText },
    { id: 'schedule', label: 'スケジュール', icon: Clock },
    { id: 'confirm', label: '確認・送信', icon: Send }
  ]

  const getTargetUserCount = () => {
    switch (broadcastData.targetType) {
      case 'all':
        return users.length
      case 'segment':
        if (!broadcastData.targetValue) return 0
        const segment = segments.find(s => s.id === broadcastData.targetValue)
        // TODO: セグメントの実際のユーザー数を計算
        return Math.floor(users.length * 0.7) // 仮の計算
      case 'tags':
        if (!Array.isArray(broadcastData.targetValue) || broadcastData.targetValue.length === 0) return 0
        return users.filter(user => 
          user.tags.some(tag => (broadcastData.targetValue as string[]).includes(tag.id))
        ).length
      case 'status':
        if (!broadcastData.targetValue) return 0
        return users.filter(user => 
          user.statusHistory.length > 0 && 
          user.statusHistory[user.statusHistory.length - 1].statusId === broadcastData.targetValue
        ).length
      default:
        return 0
    }
  }

  const handleNext = () => {
    const stepOrder = ['target', 'template', 'schedule', 'confirm']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as any)
    }
  }

  const handleBack = () => {
    const stepOrder = ['target', 'template', 'schedule', 'confirm']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as any)
    }
  }

  const handleSend = () => {
    onSend(broadcastData)
    // リセット
    setBroadcastData({
      targetType: 'all',
      targetValue: undefined,
      templateId: '',
      scheduleType: 'immediate',
      scheduledAt: undefined,
      title: '',
      description: ''
    })
    setCurrentStep('target')
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 'target':
        if (broadcastData.targetType === 'all') return true
        if (broadcastData.targetType === 'segment') return !!broadcastData.targetValue
        if (broadcastData.targetType === 'tags') return Array.isArray(broadcastData.targetValue) && broadcastData.targetValue.length > 0
        if (broadcastData.targetType === 'status') return !!broadcastData.targetValue
        return false
      case 'template':
        return !!broadcastData.templateId
      case 'schedule':
        return broadcastData.scheduleType === 'immediate' || !!broadcastData.scheduledAt
      case 'confirm':
        return !!broadcastData.title.trim()
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">一斉配信</h2>
          <p className="mt-1 text-sm text-gray-600">
            ユーザーセグメントに対する一斉メッセージ配信
          </p>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index
            
            return (
              <div key={step.id} className="flex items-center">
                {index > 0 && (
                  <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive 
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {currentStep === 'target' && (
          <TargetSelection
            targetType={broadcastData.targetType}
            targetValue={broadcastData.targetValue}
            segments={segments}
            tags={tags}
            statuses={statuses}
            users={users}
            onChange={(targetType, targetValue) => 
              setBroadcastData({ ...broadcastData, targetType, targetValue })
            }
          />
        )}

        {currentStep === 'template' && (
          <TemplateSelection
            selectedTemplateId={broadcastData.templateId}
            templates={templates}
            onChange={(templateId) => 
              setBroadcastData({ ...broadcastData, templateId })
            }
          />
        )}

        {currentStep === 'schedule' && (
          <ScheduleSelection
            scheduleType={broadcastData.scheduleType}
            scheduledAt={broadcastData.scheduledAt}
            onChange={(scheduleType, scheduledAt) => 
              setBroadcastData({ ...broadcastData, scheduleType, scheduledAt })
            }
          />
        )}

        {currentStep === 'confirm' && (
          <ConfirmationStep
            broadcastData={broadcastData}
            userCount={getTargetUserCount()}
            segments={segments}
            templates={templates}
            tags={tags}
            statuses={statuses}
            onChange={(title, description) => 
              setBroadcastData({ ...broadcastData, title, description })
            }
          />
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 'target'}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          戻る
        </button>

        <div className="flex items-center space-x-4">
          {/* 対象ユーザー数表示 */}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            配信対象: {getTargetUserCount()}名
          </div>

          {currentStep === 'confirm' ? (
            <button
              onClick={handleSend}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-5 h-5 mr-2" />
              {broadcastData.scheduleType === 'immediate' ? '送信' : 'スケジュール'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 配信対象選択コンポーネント
function TargetSelection({
  targetType,
  targetValue,
  segments,
  tags,
  statuses,
  users,
  onChange
}: {
  targetType: 'all' | 'segment' | 'tags' | 'status'
  targetValue?: string | string[]
  segments: Segment[]
  tags: Tag[]
  statuses: Status[]
  users: User[]
  onChange: (targetType: 'all' | 'segment' | 'tags' | 'status', targetValue?: string | string[]) => void
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信対象を選択</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 全ユーザー */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            targetType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('all')}
        >
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium">全ユーザー</span>
          </div>
          <p className="text-sm text-gray-600">登録されているすべてのユーザーに配信</p>
          <p className="text-xs text-gray-500 mt-1">{users.length}名</p>
        </div>

        {/* セグメント */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            targetType === 'segment' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('segment')}
        >
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            <span className="font-medium">セグメント</span>
          </div>
          <p className="text-sm text-gray-600">作成済みのセグメントを選択</p>
          <p className="text-xs text-gray-500 mt-1">{segments.length}個のセグメント</p>
        </div>

        {/* タグ */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            targetType === 'tags' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('tags')}
        >
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2 text-purple-500" />
            <span className="font-medium">タグ</span>
          </div>
          <p className="text-sm text-gray-600">特定のタグを持つユーザーに配信</p>
          <p className="text-xs text-gray-500 mt-1">{tags.length}個のタグ</p>
        </div>

        {/* ステータス */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            targetType === 'status' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('status')}
        >
          <div className="flex items-center mb-2">
            <CheckCircle className="w-5 h-5 mr-2 text-orange-500" />
            <span className="font-medium">ステータス</span>
          </div>
          <p className="text-sm text-gray-600">特定のステータスのユーザーに配信</p>
          <p className="text-xs text-gray-500 mt-1">{statuses.length}個のステータス</p>
        </div>
      </div>

      {/* 詳細選択 */}
      {targetType === 'segment' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">セグメントを選択</label>
          <select
            value={targetValue || ''}
            onChange={(e) => onChange('segment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">セグメントを選択してください</option>
            {segments.map((segment) => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
        </div>
      )}

      {targetType === 'tags' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">タグを選択</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {tags.map((tag) => {
              const isSelected = Array.isArray(targetValue) && targetValue.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    const currentTags = Array.isArray(targetValue) ? targetValue : []
                    const newTags = isSelected
                      ? currentTags.filter(id => id !== tag.id)
                      : [...currentTags, tag.id]
                    onChange('tags', newTags)
                  }}
                  className={`p-2 text-sm rounded border transition-all ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {targetType === 'status' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ステータスを選択</label>
          <select
            value={targetValue || ''}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">ステータスを選択してください</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// テンプレート選択コンポーネント
function TemplateSelection({
  selectedTemplateId,
  templates,
  onChange
}: {
  selectedTemplateId: string
  templates: Template[]
  onChange: (templateId: string) => void
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">送信するテンプレートを選択</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const messageData = JSON.parse(template.lineMessageJson)
          const isSelected = selectedTemplateId === template.id
          
          return (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onChange(template.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {messageData.type === 'text' ? 'テキストメッセージ' : 'Flexメッセージ'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {messageData.type === 'text' 
                      ? messageData.text.substring(0, 100) + (messageData.text.length > 100 ? '...' : '')
                      : messageData.altText
                    }
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-gray-500">
                作成日: {template.createdAt.toLocaleDateString('ja-JP')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// スケジュール選択コンポーネント
function ScheduleSelection({
  scheduleType,
  scheduledAt,
  onChange
}: {
  scheduleType: 'immediate' | 'scheduled'
  scheduledAt?: Date
  onChange: (scheduleType: 'immediate' | 'scheduled', scheduledAt?: Date) => void
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信スケジュールを設定</h3>
      
      <div className="space-y-4">
        {/* 即座に配信 */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            scheduleType === 'immediate' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('immediate')}
        >
          <div className="flex items-center mb-2">
            <Send className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium">即座に配信</span>
          </div>
          <p className="text-sm text-gray-600">確認後すぐにメッセージを配信します</p>
        </div>

        {/* スケジュール配信 */}
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            scheduleType === 'scheduled' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onChange('scheduled')}
        >
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 mr-2 text-green-500" />
            <span className="font-medium">スケジュール配信</span>
          </div>
          <p className="text-sm text-gray-600">指定した日時にメッセージを配信します</p>
        </div>
      </div>

      {scheduleType === 'scheduled' && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">配信日時</label>
          <input
            type="datetime-local"
            value={scheduledAt ? scheduledAt.toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange('scheduled', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      )}
    </div>
  )
}

// 確認・送信コンポーネント
function ConfirmationStep({
  broadcastData,
  userCount,
  segments,
  templates,
  tags,
  statuses,
  onChange
}: {
  broadcastData: any
  userCount: number
  segments: Segment[]
  templates: Template[]
  tags: Tag[]
  statuses: Status[]
  onChange: (title: string, description: string) => void
}) {
  const getTargetDescription = () => {
    switch (broadcastData.targetType) {
      case 'all':
        return '全ユーザー'
      case 'segment':
        const segment = segments.find(s => s.id === broadcastData.targetValue)
        return segment ? `セグメント: ${segment.name}` : 'セグメント（未選択）'
      case 'tags':
        if (Array.isArray(broadcastData.targetValue)) {
          const selectedTags = tags.filter(tag => broadcastData.targetValue!.includes(tag.id))
          return `タグ: ${selectedTags.map(t => t.name).join(', ')}`
        }
        return 'タグ（未選択）'
      case 'status':
        const status = statuses.find(s => s.id === broadcastData.targetValue)
        return status ? `ステータス: ${status.label}` : 'ステータス（未選択）'
      default:
        return '未設定'
    }
  }

  const template = templates.find(t => t.id === broadcastData.templateId)
  const messageData = template ? JSON.parse(template.lineMessageJson) : null

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">配信内容の確認</h3>
      
      {/* タイトルと説明 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配信タイトル（必須）</label>
          <input
            type="text"
            value={broadcastData.title}
            onChange={(e) => onChange(e.target.value, broadcastData.description)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="配信のタイトルを入力してください"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">配信説明（任意）</label>
          <textarea
            value={broadcastData.description}
            onChange={(e) => onChange(broadcastData.title, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="配信の説明を入力してください"
          />
        </div>
      </div>

      {/* 配信サマリー */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">配信サマリー</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">配信対象</h5>
            <p className="text-sm text-gray-600">{getTargetDescription()}</p>
            <p className="text-sm text-blue-600 font-medium">{userCount}名に配信</p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">配信スケジュール</h5>
            <p className="text-sm text-gray-600">
              {broadcastData.scheduleType === 'immediate' 
                ? '即座に配信' 
                : `${broadcastData.scheduledAt?.toLocaleString('ja-JP')}に配信`
              }
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-700 mb-2">メッセージ内容</h5>
          {messageData && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">
                {messageData.type === 'text' ? 'テキストメッセージ' : 'Flexメッセージ'}
              </div>
              <div className="text-sm text-gray-900">
                {messageData.type === 'text' 
                  ? messageData.text 
                  : messageData.altText
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-yellow-800">注意事項</h5>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• 配信後の取り消しはできません</li>
              <li>• スケジュール配信は指定時刻の5分前まで変更可能です</li>
              <li>• 大量配信の場合、完了まで時間がかかる場合があります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}