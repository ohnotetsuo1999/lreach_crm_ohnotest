'use client'

import { useState, useEffect } from 'react'
import { SegmentFilter, User } from '@/types'
import { Users, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface PreviewCountProps {
  filter: SegmentFilter
  users: User[]
  onRefresh?: () => void
}

export function PreviewCount({ filter, users, onRefresh }: PreviewCountProps) {
  const [matchedUsers, setMatchedUsers] = useState<User[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [previousCount, setPreviousCount] = useState<number | null>(null)

  useEffect(() => {
    calculateMatches()
  }, [filter, users])

  const calculateMatches = async () => {
    setIsCalculating(true)
    setPreviousCount(matchedUsers.length)

    // シミュレート: 実際の実装では API コールまたは複雑なフィルタリングロジック
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const matches = users.filter(user => evaluateFilter(user, filter))
      setMatchedUsers(matches)
    } catch (error) {
      console.error('Filter evaluation error:', error)
      setMatchedUsers([])
    }

    setIsCalculating(false)
  }

  const evaluateFilter = (user: User, filter: SegmentFilter): boolean => {
    if (filter.conditions.length === 0) return true

    const results = filter.conditions.map((condition, index) => {
      const result = evaluateCondition(user, condition)
      return { result, logic: condition.logic }
    })

    // 最初の条件は常に含まれる
    let finalResult = results[0]?.result || false

    // 残りの条件を論理演算子で結合
    for (let i = 1; i < results.length; i++) {
      const current = results[i]
      if (current.logic === 'OR') {
        finalResult = finalResult || current.result
      } else { // AND
        finalResult = finalResult && current.result
      }
    }

    return finalResult
  }

  const evaluateCondition = (user: User, condition: any): boolean => {
    const { field, operator, value } = condition

    let fieldValue: any
    switch (field) {
      case 'name':
        fieldValue = user.name
        break
      case 'address':
        // 住所から都道府県を抽出（モックデータでは直接都道府県名を返す）
        const prefectures = ['東京都', '大阪府', '神奈川県', '愛知県', '福岡県', '埼玉県', '千葉県', '北海道']
        fieldValue = [prefectures[Math.floor(Math.random() * prefectures.length)]]
        break
      case 'phone':
        fieldValue = user.phone || ''
        break
      case 'createdAt':
        fieldValue = new Date(user.createdAt)
        break
      case 'updatedAt':
        fieldValue = new Date(user.updatedAt)
        break
      case 'lineFriendAddedAt':
        // モックデータ: 実際の実装では user.lineFriendAddedAt を使用
        fieldValue = new Date(user.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        break
      case 'lastReactionAt':
        // モックデータ: 実際の実装では user.lastReactionAt を使用
        fieldValue = new Date(user.updatedAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        break
      case 'lastInflowAt':
        // モックデータ: 実際の実装では user.lastInflowAt を使用
        fieldValue = new Date(user.createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000)
        break
      case 'tags':
        fieldValue = user.tags.map(tag => tag.id)
        break
      case 'status':
        fieldValue = user.statusHistory.map(s => s.statusId)
        break
      case 'age':
        // モックデータ: 実際の実装では user.age を使用
        const birthYear = new Date().getFullYear() - Math.floor(Math.random() * 60) - 18 // 18-78歳のランダム年齢
        fieldValue = new Date().getFullYear() - birthYear
        break
      case 'calendarReservation':
        // モックデータ: ユーザーの予約状況をランダムに生成
        // 実際の実装では user.reservations から今後の予約をチェック
        fieldValue = Math.random() > 0.5 // 50%の確率で今後の予約あり
        break
      default:
        return false
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not_equals':
        return fieldValue !== value
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
      case 'greater_than':
        if (fieldValue instanceof Date) {
          return fieldValue > new Date(value)
        }
        return Number(fieldValue) > Number(value)
      case 'less_than':
        if (fieldValue instanceof Date) {
          return fieldValue < new Date(value)
        }
        return Number(fieldValue) < Number(value)
      case 'greater_equal':
        if (fieldValue instanceof Date) {
          return fieldValue >= new Date(value)
        }
        return Number(fieldValue) >= Number(value)
      case 'less_equal':
        if (fieldValue instanceof Date) {
          return fieldValue <= new Date(value)
        }
        return Number(fieldValue) <= Number(value)
      case 'in':
        if (Array.isArray(fieldValue)) {
          return Array.isArray(value) && value.some(v => fieldValue.includes(v))
        }
        return Array.isArray(value) && value.includes(fieldValue)
      case 'not_in':
        if (Array.isArray(fieldValue)) {
          return Array.isArray(value) && !value.some(v => fieldValue.includes(v))
        }
        return Array.isArray(value) && !value.includes(fieldValue)
      case 'contains_all':
        // すべてのタグを含む
        if (Array.isArray(fieldValue) && Array.isArray(value)) {
          return value.every(v => fieldValue.includes(v))
        }
        return false
      case 'contains_any':
        // いずれかのタグを含む
        if (Array.isArray(fieldValue) && Array.isArray(value)) {
          return value.some(v => fieldValue.includes(v))
        }
        return false
      case 'between':
        // 期間内の評価（日付または年齢）
        if (fieldValue instanceof Date && typeof value === 'object') {
          const fromDate = value.from ? new Date(value.from) : null
          const toDate = value.to ? new Date(value.to) : null
          
          if (fromDate && toDate) {
            return fieldValue >= fromDate && fieldValue <= toDate
          } else if (fromDate) {
            return fieldValue >= fromDate
          } else if (toDate) {
            return fieldValue <= toDate
          }
        } else if (typeof fieldValue === 'number' && typeof value === 'object') {
          // 年齢の範囲指定
          const fromAge = value.from ? Number(value.from) : null
          const toAge = value.to ? Number(value.to) : null
          
          if (fromAge !== null && toAge !== null) {
            return fieldValue >= fromAge && fieldValue <= toAge
          } else if (fromAge !== null) {
            return fieldValue >= fromAge
          } else if (toAge !== null) {
            return fieldValue <= toAge
          }
        }
        return false
      case 'before':
        // それ以前
        if (fieldValue instanceof Date) {
          return fieldValue < new Date(value)
        }
        return false
      case 'after':
        // それ以降
        if (fieldValue instanceof Date) {
          return fieldValue > new Date(value)
        }
        return false
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
      case 'not_exists':
        return fieldValue === null || fieldValue === undefined || fieldValue === ''
      default:
        return false
    }
  }

  const totalUsers = users.length
  const matchedCount = matchedUsers.length
  const percentage = totalUsers > 0 ? (matchedCount / totalUsers * 100) : 0
  const trend = previousCount !== null ? matchedCount - previousCount : 0

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return null
  }

  const getTrendText = () => {
    if (trend === 0) return null
    const direction = trend > 0 ? '増加' : '減少'
    return `前回から${Math.abs(trend)}人${direction}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6 z-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">プレビュー</h3>
        <button
          onClick={onRefresh}
          disabled={isCalculating}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isCalculating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        {/* メインカウント */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="text-3xl font-bold text-gray-900">
              {isCalculating ? '---' : matchedCount.toLocaleString()}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            条件に該当するユーザー（全{totalUsers.toLocaleString()}人中）
          </p>
          
          {trend !== 0 && (
            <div className="flex items-center justify-center space-x-1 mt-2">
              {getTrendIcon()}
              <span className="text-sm text-gray-500">{getTrendText()}</span>
            </div>
          )}
        </div>

        {/* パーセンテージバー */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>該当率</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900">
              {((matchedCount / Math.max(totalUsers, 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-gray-600">該当率</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-semibold text-gray-900">
              {(totalUsers - matchedCount).toLocaleString()}
            </div>
            <div className="text-gray-600">除外</div>
          </div>
        </div>

        {/* 条件のサマリー */}
        {filter.conditions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">適用中の条件</h4>
            <div className="text-xs text-gray-500 space-y-1">
              {filter.conditions.map((condition, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <span className="mr-2 px-1 bg-gray-200 rounded text-xs">
                      {condition.logic}
                    </span>
                  )}
                  <span>{condition.field} {condition.operator}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* サンプルユーザー */}
        {matchedUsers.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              該当ユーザー例（最大5人）
            </h4>
            <div className="space-y-2">
              {matchedUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-2 text-sm">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-gray-700">{user.name}</span>
                  {user.tags.length > 0 && (
                    <span className="text-xs text-gray-500">
                      ({user.tags.length}タグ)
                    </span>
                  )}
                </div>
              ))}
              {matchedUsers.length > 5 && (
                <div className="text-xs text-gray-500">
                  他{matchedUsers.length - 5}人...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}