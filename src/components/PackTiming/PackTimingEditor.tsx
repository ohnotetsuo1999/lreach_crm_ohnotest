'use client'

import { useState, useEffect } from 'react'
import { Pack, ReminderSettings } from '@/types'
import { Clock, Calendar, AlertCircle, Timer, RotateCcw, BookOpen, User } from 'lucide-react'

interface PackTimingEditorProps {
  pack: Pack
  onUpdate: (updates: Partial<Pack>) => void
}

export function PackTimingEditor({ pack, onUpdate }: PackTimingEditorProps) {
  const [packType, setPackType] = useState<'normal' | 'reminder'>(pack.packType || 'normal')
  const [normalOffset, setNormalOffset] = useState(pack.offsetMinutes)
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(
    pack.reminderSettings || {
      targetType: 'manual',
      targetDate: '',
      targetTime: '',
      reservationField: '',
      userField: '',
      offsetMinutes: 60,
      offsetType: 'before',
      description: ''
    }
  )

  useEffect(() => {
    setPackType(pack.packType || 'normal')
    setNormalOffset(pack.offsetMinutes)
    if (pack.reminderSettings) {
      setReminderSettings(pack.reminderSettings)
    }
  }, [pack])

  const handlePackTypeChange = (type: 'normal' | 'reminder') => {
    setPackType(type)
    
    const updates: Partial<Pack> = {
      packType: type
    }

    if (type === 'normal') {
      updates.offsetMinutes = normalOffset
      updates.reminderSettings = undefined
    } else {
      updates.offsetMinutes = 0 // リマインダーの場合は通常のオフセットは0
      updates.reminderSettings = reminderSettings
    }

    onUpdate(updates)
  }

  const handleNormalOffsetChange = (minutes: number) => {
    setNormalOffset(minutes)
    if (packType === 'normal') {
      onUpdate({ offsetMinutes: minutes })
    }
  }

  const handleReminderSettingsChange = (settings: Partial<ReminderSettings>) => {
    const newSettings = { ...reminderSettings, ...settings }
    setReminderSettings(newSettings)
    
    if (packType === 'reminder') {
      onUpdate({ reminderSettings: newSettings })
    }
  }

  const formatTimeInput = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return { hours, minutes: mins }
  }

  const parseTimeInput = (hours: number, minutes: number) => {
    return hours * 60 + minutes
  }

  const normalTimeInput = formatTimeInput(normalOffset)
  const reminderTimeInput = formatTimeInput(Math.abs(reminderSettings.offsetMinutes))

  const getPreviewText = () => {
    if (packType === 'normal') {
      if (normalOffset === 0) return '前のPackの直後に実行'
      const hours = Math.floor(normalOffset / 60)
      const mins = normalOffset % 60
      if (hours === 0) return `前のPackから${mins}分後に実行`
      if (mins === 0) return `前のPackから${hours}時間後に実行`
      return `前のPackから${hours}時間${mins}分後に実行`
    } else {
      let baseText = ''
      
      switch (reminderSettings.targetType) {
        case 'manual':
          baseText = reminderSettings.targetDate && reminderSettings.targetTime
            ? `${reminderSettings.targetDate} ${reminderSettings.targetTime}`
            : '指定日時'
          break
        case 'reservation':
          baseText = reminderSettings.reservationField 
            ? `予約（${reminderSettings.reservationField}）`
            : '予約日時'
          break
        case 'user_field':
          baseText = reminderSettings.userField
            ? `ユーザー項目（${reminderSettings.userField}）`
            : 'ユーザー指定日時'
          break
      }
      
      const hours = Math.floor(Math.abs(reminderSettings.offsetMinutes) / 60)
      const mins = Math.abs(reminderSettings.offsetMinutes) % 60
      let offsetText = ''
      
      if (hours === 0) {
        offsetText = `${mins}分`
      } else if (mins === 0) {
        offsetText = `${hours}時間`
      } else {
        offsetText = `${hours}時間${mins}分`
      }
      
      return `${baseText}の${offsetText}${reminderSettings.offsetType === 'before' ? '前' : '後'}に実行`
    }
  }

  return (
    <div className="space-y-6">
      {/* Pack種別選択 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">実行タイミングの種類</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePackTypeChange('normal')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              packType === 'normal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900">順次実行</span>
            </div>
            <p className="text-xs text-gray-600">
              前のPackから指定時間後に実行
            </p>
          </button>

          <button
            onClick={() => handlePackTypeChange('reminder')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              packType === 'reminder'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="font-medium text-gray-900">リマインダー</span>
            </div>
            <p className="text-xs text-gray-600">
              指定日時の前後に実行
            </p>
          </button>
        </div>
      </div>

      {/* 設定エリア */}
      {packType === 'normal' ? (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            順次実行設定
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                時間
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={normalTimeInput.hours}
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 0
                  handleNormalOffsetChange(parseTimeInput(hours, normalTimeInput.minutes))
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={normalTimeInput.minutes}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0
                  handleNormalOffsetChange(parseTimeInput(normalTimeInput.hours, minutes))
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* プリセット */}
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">クイック設定</div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'すぐに', minutes: 0 },
                { label: '5分後', minutes: 5 },
                { label: '30分後', minutes: 30 },
                { label: '1時間後', minutes: 60 },
                { label: '1日後', minutes: 1440 },
                { label: '1週間後', minutes: 10080 }
              ].map((preset) => (
                <button
                  key={preset.minutes}
                  onClick={() => handleNormalOffsetChange(preset.minutes)}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    normalOffset === preset.minutes
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            リマインダー設定
          </h4>
          
          {/* 基準日時の種類選択 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                基準日時の種類
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleReminderSettingsChange({ targetType: 'manual' })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    reminderSettings.targetType === 'manual'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">手動指定</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    日時を直接指定
                  </p>
                </button>

                <button
                  onClick={() => handleReminderSettingsChange({ targetType: 'reservation' })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    reminderSettings.targetType === 'reservation'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">予約連動</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    予約日時を基準
                  </p>
                </button>

                <button
                  onClick={() => handleReminderSettingsChange({ targetType: 'user_field' })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    reminderSettings.targetType === 'user_field'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">ユーザー項目</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    ユーザー情報から取得
                  </p>
                </button>
              </div>
            </div>

            {/* 基準日時詳細設定 */}
            {reminderSettings.targetType === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日時指定
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={reminderSettings.targetDate || ''}
                      onChange={(e) => handleReminderSettingsChange({ targetDate: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={reminderSettings.targetTime || ''}
                      onChange={(e) => handleReminderSettingsChange({ targetTime: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {reminderSettings.targetType === 'reservation' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  予約フィールド選択
                </label>
                <select
                  value={reminderSettings.reservationField || ''}
                  onChange={(e) => handleReminderSettingsChange({ reservationField: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">予約フィールドを選択</option>
                  <option value="next_appointment">次回予約</option>
                  <option value="consultation_date">相談予定日</option>
                  <option value="delivery_date">配送予定日</option>
                  <option value="event_date">イベント参加日</option>
                  <option value="trial_date">体験予約日</option>
                  <option value="follow_up_date">フォローアップ予定</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  ユーザーの予約情報から自動的に日時を取得します
                </p>
              </div>
            )}

            {reminderSettings.targetType === 'user_field' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザーフィールド選択
                </label>
                <select
                  value={reminderSettings.userField || ''}
                  onChange={(e) => handleReminderSettingsChange({ userField: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">ユーザーフィールドを選択</option>
                  <option value="birthday">誕生日</option>
                  <option value="anniversary">記念日</option>
                  <option value="contract_expiry">契約期限</option>
                  <option value="subscription_renewal">更新日</option>
                  <option value="last_purchase_date">最終購入日</option>
                  <option value="custom_date_1">カスタム日付1</option>
                  <option value="custom_date_2">カスタム日付2</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  ユーザープロフィールの日付フィールドを基準にします
                </p>
              </div>
            )}

            {/* オフセット設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                実行タイミング
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    value={reminderSettings.offsetType}
                    onChange={(e) => handleReminderSettingsChange({ 
                      offsetType: e.target.value as 'before' | 'after'
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="before">前</option>
                    <option value="after">後</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={reminderTimeInput.hours}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0
                      const totalMinutes = parseTimeInput(hours, reminderTimeInput.minutes)
                      handleReminderSettingsChange({ 
                        offsetMinutes: reminderSettings.offsetType === 'before' ? -totalMinutes : totalMinutes
                      })
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="時間"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={reminderTimeInput.minutes}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0
                      const totalMinutes = parseTimeInput(reminderTimeInput.hours, minutes)
                      handleReminderSettingsChange({ 
                        offsetMinutes: reminderSettings.offsetType === 'before' ? -totalMinutes : totalMinutes
                      })
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="分"
                  />
                </div>
              </div>
            </div>

            {/* プリセット */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">よく使う設定</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '15分前', minutes: 15, type: 'before' as const },
                  { label: '30分前', minutes: 30, type: 'before' as const },
                  { label: '1時間前', minutes: 60, type: 'before' as const },
                  { label: '1日前', minutes: 1440, type: 'before' as const },
                  { label: '30分後', minutes: 30, type: 'after' as const },
                  { label: '1時間後', minutes: 60, type: 'after' as const }
                ].map((preset) => (
                  <button
                    key={`${preset.type}-${preset.minutes}`}
                    onClick={() => handleReminderSettingsChange({ 
                      offsetType: preset.type,
                      offsetMinutes: preset.type === 'before' ? -preset.minutes : preset.minutes
                    })}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      reminderSettings.offsetType === preset.type && 
                      Math.abs(reminderSettings.offsetMinutes) === preset.minutes
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <input
                type="text"
                value={reminderSettings.description || ''}
                onChange={(e) => handleReminderSettingsChange({ description: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="例: イベント開始前のリマインダー"
              />
            </div>
          </div>
        </div>
      )}

      {/* プレビュー */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <RotateCcw className="w-4 h-4 mr-2" />
          実行予定
        </h4>
        <p className="text-sm text-gray-700">{getPreviewText()}</p>
      </div>
    </div>
  )
}