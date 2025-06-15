'use client'

import { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
import { Input } from '@/components/Common'
import { Select } from '@/components/Common'
import { TimingConfig } from '@/types/entities'

interface TimingConfigEditorProps {
  value: TimingConfig
  onChange: (config: TimingConfig) => void
  eventType?: 'reservation' | 'birthday' | 'anniversary' | 'contract_expiry' | 'custom'
  showDirection?: boolean
  showCondition?: boolean
  className?: string
}

export function TimingConfigEditor({
  value,
  onChange,
  eventType,
  showDirection = true,
  showCondition = false,
  className = ''
}: TimingConfigEditorProps) {
  const [timingType, setTimingType] = useState<'simple' | 'event_based' | 'specific_time' | 'precise'>('simple')

  const updateField = (field: keyof TimingConfig, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue
    })
  }

  const getTimingPreview = (): string => {
    const unit = value.delayUnit === 'days' ? '日' :
                 value.delayUnit === 'hours' ? '時間' :
                 value.delayUnit === 'weeks' ? '週間' :
                 value.delayUnit === 'months' ? 'ヶ月' : '分'
    
    const direction = showDirection && value.delayDirection ? 
                     (value.delayDirection === 'before' ? '前' : '後') : ''
    
    if (eventType) {
      const eventLabel = eventType === 'reservation' ? '予約' :
                        eventType === 'birthday' ? '誕生日' :
                        eventType === 'anniversary' ? '記念日' :
                        eventType === 'contract_expiry' ? '契約期限' : 'イベント'
      
      return `${eventLabel}の${value.delayValue}${unit}${direction}`
    }
    
    return `${value.delayValue}${unit}${direction}`
  }

  const quickPresets = [
    { label: '1日前', value: 1, unit: 'days', direction: 'before' },
    { label: '3日前', value: 3, unit: 'days', direction: 'before' },
    { label: '1週間前', value: 7, unit: 'days', direction: 'before' },
    { label: '当日', value: 0, unit: 'days', direction: 'before' },
    { label: '1時間後', value: 1, unit: 'hours', direction: 'after' }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Timing Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            現在の設定: {getTimingPreview()}
          </span>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">値</label>
          <Input
            type="number"
            value={value.delayValue}
            onChange={(e) => updateField('delayValue', parseInt(e.target.value) || 0)}
            min={0}
            className="text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">単位</label>
          <Select
            value={value.delayUnit}
            onChange={(e) => updateField('delayUnit', e.target.value)}
            options={[
              { value: 'minutes', label: '分' },
              { value: 'hours', label: '時間' },
              { value: 'days', label: '日' },
              { value: 'weeks', label: '週間' },
              { value: 'months', label: 'ヶ月' }
            ]}
            className="text-sm"
          />
        </div>
        
        {showDirection && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">タイミング</label>
            <Select
              value={value.delayDirection || 'before'}
              onChange={(e) => updateField('delayDirection', e.target.value)}
              options={[
                { value: 'before', label: '前' },
                { value: 'after', label: '後' }
              ]}
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">クイック設定</label>
        <div className="flex flex-wrap gap-1">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onChange({
                  delayValue: preset.value,
                  delayUnit: preset.unit as TimingConfig['delayUnit'],
                  delayDirection: preset.direction as 'before' | 'after'
                })
              }}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Settings */}
      {showCondition && (
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-2">実行条件</label>
          <Select
            value={value.condition?.type || 'always'}
            onChange={(e) => updateField('condition', {
              ...value.condition,
              type: e.target.value
            })}
            options={[
              { value: 'always', label: '常に実行' },
              { value: 'tag_exists', label: 'タグが存在する場合' },
              { value: 'tag_not_exists', label: 'タグが存在しない場合' },
              { value: 'status_is', label: 'ステータスが一致する場合' },
              { value: 'status_not', label: 'ステータスが一致しない場合' },
              { value: 'date_range', label: '日付範囲内の場合' },
              { value: 'user_segment', label: 'セグメント条件' },
              { value: 'custom', label: 'カスタム条件' }
            ]}
            className="text-sm"
          />
        </div>
      )}
    </div>
  )
}