'use client'

import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, User, MessageSquare, Star, Flag, Circle } from 'lucide-react'
import { JobSeeker } from '@/types'

interface GanttChartProps {
  jobSeekers: JobSeeker[]
}

interface TimelineEvent {
  id: string
  jobSeekerId: string
  date: Date
  type: 'status' | 'event' | 'memo' | 'score_change'
  subType?: 'interview_completed' | 'resume_collected' | 'cv_collected' | 'basic_info_collected' | 'interview' | 'company_introduction' | 'interview_practice'
  title: string
  description?: string
  previousValue?: string
  newValue?: string
  score?: number
  color?: string
}

// モックのタイムラインイベント
// 現在の年月を取得
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

const mockTimelineEvents: TimelineEvent[] = [
  // 佐藤花子 (js1) のイベント
  {
    id: '1',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 15),
    type: 'status',
    subType: 'interview_completed',
    title: '面談実施',
    description: 'キャリア相談・希望条件ヒアリング完了',
    color: '#3B82F6'
  },
  {
    id: '2',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 18),
    type: 'memo',
    title: 'メモ追加',
    description: 'React経験豊富、フロントエンド案件を優先的に紹介',
    color: '#F59E0B'
  },
  {
    id: '3',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 20),
    type: 'event',
    subType: 'interview',
    title: '面談',
    description: '初回面談実施',
    color: '#10B981'
  },
  {
    id: '35',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 20),
    type: 'status',
    subType: 'resume_collected',
    title: '履歴書回収済',
    description: '履歴書を受領しました',
    color: '#8B5CF6'
  },
  {
    id: '4',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 22),
    type: 'score_change',
    title: 'スコア変更',
    description: '技術力評価',
    score: 92,
    color: '#8B5CF6'
  },
  {
    id: '5',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 25),
    type: 'event',
    subType: 'company_introduction',
    title: '企業紹介',
    description: 'テックカンパニー株式会社のポジション紹介',
    color: '#10B981'
  },
  {
    id: '6',
    jobSeekerId: 'js1',
    date: new Date(currentYear, currentMonth, 28),
    type: 'status',
    subType: 'cv_collected',
    title: '職務経歴書回収済',
    description: '職務経歴書を受領しました',
    color: '#3B82F6'
  },
  
  // 鈴木一郎 (js2) のイベント
  {
    id: '7',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 10),
    type: 'status',
    subType: 'basic_info_collected',
    title: '基本情報回収済',
    description: '基本情報の登録が完了しました',
    color: '#3B82F6'
  },
  {
    id: '8',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 12),
    type: 'event',
    subType: 'interview',
    title: '面談',
    description: 'オンライン面談実施',
    color: '#10B981'
  },
  {
    id: '9',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 14),
    type: 'memo',
    title: 'メモ追加',
    description: '希望年収1000万円以上、マネジメント職希望',
    color: '#F59E0B'
  },
  {
    id: '10',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 18),
    type: 'score_change',
    title: 'スコア変更',
    description: 'マネジメント経験評価',
    score: 88,
    color: '#8B5CF6'
  },
  {
    id: '36',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 18),
    type: 'status',
    subType: 'interview_completed',
    title: '面談実施',
    description: '初回面談を完了しました',
    color: '#3B82F6'
  },
  {
    id: '37',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 18),
    type: 'status',
    subType: 'resume_collected',
    title: '履歴書回収済',
    description: '履歴書・職務経歴書を受領',
    color: '#8B5CF6'
  },
  {
    id: '11',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 20),
    type: 'event',
    subType: 'interview_practice',
    title: '面接練習',
    description: 'ビジネスソリューション社向け面接対策',
    color: '#EC4899'
  },
  {
    id: '12',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 24),
    type: 'status',
    title: 'ステータス変更',
    description: '面談調整中 → 面接中',
    previousValue: '面談調整中',
    newValue: '面接中',
    color: '#3B82F6'
  },
  {
    id: '13',
    jobSeekerId: 'js2',
    date: new Date(currentYear, currentMonth, 26),
    type: 'event',
    title: '一次面接',
    description: '人事面接実施',
    color: '#10B981'
  },
  
  // 高橋美咲 (js3) のイベント
  {
    id: '14',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 16),
    type: 'status',
    title: 'ステータス変更',
    description: '新規 → 資格確認済',
    previousValue: '新規',
    newValue: '資格確認済',
    color: '#3B82F6'
  },
  {
    id: '15',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 17),
    type: 'memo',
    title: 'メモ追加',
    description: 'データ分析職を希望、Python/SQL経験あり',
    color: '#F59E0B'
  },
  {
    id: '16',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 19),
    type: 'event',
    title: '面談実施',
    description: 'キャリアカウンセリング',
    color: '#10B981'
  },
  {
    id: '17',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 21),
    type: 'score_change',
    title: 'スコア変更',
    description: 'データ分析スキル評価',
    score: 78,
    color: '#8B5CF6'
  },
  {
    id: '18',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 23),
    type: 'event',
    title: '求人マッチング',
    description: '3社の求人を提案',
    color: '#10B981'
  },
  {
    id: '19',
    jobSeekerId: 'js3',
    date: new Date(currentYear, currentMonth, 27),
    type: 'memo',
    title: 'メモ追加',
    description: '1月中旬から転職活動本格化予定',
    color: '#F59E0B'
  },
  
  // 山田次郎 (js4) のイベント
  {
    id: '20',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 11),
    type: 'status',
    title: 'ステータス変更',
    description: '新規登録',
    previousValue: '',
    newValue: '新規',
    color: '#3B82F6'
  },
  {
    id: '21',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 13),
    type: 'memo',
    title: 'メモ追加',
    description: 'Java/Spring経験10年以上、大規模システム開発経験あり',
    color: '#F59E0B'
  },
  {
    id: '22',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 15),
    type: 'event',
    title: '電話連絡',
    description: '初回ヒアリング実施',
    color: '#10B981'
  },
  {
    id: '23',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 19),
    type: 'score_change',
    title: 'スコア変更',
    description: '技術力初期評価',
    score: 85,
    color: '#8B5CF6'
  },
  {
    id: '24',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 21),
    type: 'event',
    title: '書類準備',
    description: '職務経歴書の作成支援',
    color: '#EC4899'
  },
  {
    id: '25',
    jobSeekerId: 'js4',
    date: new Date(currentYear, currentMonth, 25),
    type: 'memo',
    title: 'メモ追加',
    description: '3月頃の転職を希望、現職との調整必要',
    color: '#F59E0B'
  },
  
  // 田中美穂 (js5) のイベント
  {
    id: '26',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 8),
    type: 'status',
    title: 'ステータス変更',
    description: '新規 → 面談調整中',
    previousValue: '新規',
    newValue: '面談調整中',
    color: '#3B82F6'
  },
  {
    id: '27',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 10),
    type: 'event',
    title: '初回面談',
    description: 'プロダクトマネージャー経験ヒアリング',
    color: '#10B981'
  },
  {
    id: '28',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 12),
    type: 'score_change',
    title: 'スコア変更',
    description: 'PM経験・スキル評価',
    score: 90,
    color: '#8B5CF6'
  },
  {
    id: '29',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 14),
    type: 'memo',
    title: 'メモ追加',
    description: 'B2C/SaaS領域でのPM経験豊富、データドリブンな意思決定が得意',
    color: '#F59E0B'
  },
  {
    id: '30',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 17),
    type: 'event',
    title: '求人提案',
    description: '成長中のSaaS企業3社を提案',
    color: '#10B981'
  },
  {
    id: '31',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 20),
    type: 'status',
    title: 'ステータス変更',
    description: '面談調整中 → 面接中',
    previousValue: '面談調整中',
    newValue: '面接中',
    color: '#3B82F6'
  },
  {
    id: '32',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 22),
    type: 'event',
    title: '企業面接',
    description: 'A社カジュアル面談実施',
    color: '#10B981'
  },
  {
    id: '33',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 26),
    type: 'event',
    title: '二次面接',
    description: 'A社二次面接（役員面接）',
    color: '#10B981'
  },
  {
    id: '34',
    jobSeekerId: 'js5',
    date: new Date(currentYear, currentMonth, 28),
    type: 'memo',
    title: 'メモ追加',
    description: 'A社の面接通過、最終面接に向けて準備中',
    color: '#F59E0B'
  }
]

// 担当CAのモックデータ
const mockCAAssignments: { [key: string]: string } = {
  'js1': '樋山大和',
  'js2': '田中太郎',
  'js3': '山田花子',
  'js4': '樋山大和',
  'js5': '田中太郎'
}

// 担当CAリスト
const caList = ['全員', '樋山大和', '田中太郎', '山田花子']

// フィルターオプション
const statusOptions = [
  { value: 'interview_completed', label: '面談実施', color: '#3B82F6' },
  { value: 'resume_collected', label: '履歴書回収済', color: '#8B5CF6' },
  { value: 'cv_collected', label: '職務経歴書回収済', color: '#3B82F6' },
  { value: 'basic_info_collected', label: '基本情報回収済', color: '#3B82F6' }
]

const eventOptions = [
  { value: 'interview', label: '面談', color: '#10B981' },
  { value: 'company_introduction', label: '企業紹介', color: '#10B981' },
  { value: 'interview_practice', label: '面接練習', color: '#EC4899' }
]

export const GanttChart: React.FC<GanttChartProps> = ({ jobSeekers }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<TimelineEvent[]>([])
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [selectedCA, setSelectedCA] = useState<string>('全員')
  const [showMemo, setShowMemo] = useState(true)
  const [showScore, setShowScore] = useState(true)
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(['interview_completed', 'resume_collected', 'cv_collected', 'basic_info_collected'])
  )
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(['interview', 'company_introduction', 'interview_practice'])
  )

  // 月の日付リストを生成
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // フィルタリングされた求職者
  const filteredJobSeekers = useMemo(() => {
    if (selectedCA === '全員') {
      return jobSeekers
    }
    return jobSeekers.filter(js => mockCAAssignments[js.id] === selectedCA)
  }, [jobSeekers, selectedCA])

  // フィルタリングされたイベント
  const filteredEvents = useMemo(() => {
    return mockTimelineEvents.filter(event => {
      if (event.type === 'memo' && !showMemo) return false
      if (event.type === 'score_change' && !showScore) return false
      if (event.type === 'status' && event.subType && !selectedStatuses.has(event.subType)) return false
      if (event.type === 'event' && event.subType && !selectedEvents.has(event.subType)) return false
      return true
    })
  }, [showMemo, showScore, selectedStatuses, selectedEvents])

  // 求職者ごとのイベントを整理
  const eventsByJobSeeker = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>()
    filteredJobSeekers.forEach(js => {
      map.set(js.id, [])
    })
    filteredEvents.forEach(event => {
      const events = map.get(event.jobSeekerId) || []
      if (events) {
        events.push(event)
        map.set(event.jobSeekerId, events)
      }
    })
    return map
  }, [filteredJobSeekers, filteredEvents])

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const toggleStatus = (status: string) => {
    const newStatuses = new Set(selectedStatuses)
    if (newStatuses.has(status)) {
      newStatuses.delete(status)
    } else {
      newStatuses.add(status)
    }
    setSelectedStatuses(newStatuses)
  }

  const toggleEvent = (event: string) => {
    const newEvents = new Set(selectedEvents)
    if (newEvents.has(event)) {
      newEvents.delete(event)
    } else {
      newEvents.add(event)
    }
    setSelectedEvents(newEvents)
  }

  const getEventIcon = (type: TimelineEvent['type'], subType?: TimelineEvent['subType']) => {
    switch (type) {
      case 'status':
        return <Circle className="w-3 h-3" />
      case 'memo':
        return <MessageSquare className="w-3 h-3" />
      case 'score_change':
        return <Star className="w-3 h-3" />
      case 'event':
        return <Flag className="w-3 h-3" />
      default:
        return <Circle className="w-3 h-3" />
    }
  }

  const getEventTypeLabel = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'status':
        return 'ステータス'
      case 'memo':
        return 'メモ'
      case 'score_change':
        return 'スコア変更'
      case 'event':
        return 'イベント'
      default:
        return ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">求職者タイムライン</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* コンパクトなフィルター */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* 担当者フィルター */}
          <select
            value={selectedCA}
            onChange={(e) => setSelectedCA(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="全員">担当CA: 全員</option>
            {caList.slice(1).map(ca => (
              <option key={ca} value={ca}>担当CA: {ca}</option>
            ))}
          </select>

          {/* ステータスフィルター（ドロップダウン） */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <Circle className="w-3 h-3 text-blue-600" />
              <span>ステータス ({selectedStatuses.size}/4)</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-2 space-y-1">
                {statusOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.has(option.value)}
                      onChange={() => toggleStatus(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }}></div>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* イベントフィルター（ドロップダウン） */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <Flag className="w-3 h-3 text-green-600" />
              <span>イベント ({selectedEvents.size}/3)</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="p-2 space-y-1">
                {eventOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(option.value)}
                      onChange={() => toggleEvent(option.value)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: option.color }}></div>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* その他のフィルター */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMemo}
                onChange={(e) => setShowMemo(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <MessageSquare className="w-3 h-3 text-amber-600" />
              <span className="text-sm text-gray-700">メモ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showScore}
                onChange={(e) => setShowScore(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Star className="w-3 h-3 text-purple-600" />
              <span className="text-sm text-gray-700">スコア</span>
            </label>
          </div>

          {/* フィルターリセット */}
          <button
            onClick={() => {
              setSelectedCA('全員')
              setSelectedStatuses(new Set(['interview_completed', 'resume_collected', 'cv_collected', 'basic_info_collected']))
              setSelectedEvents(new Set(['interview', 'company_introduction', 'interview_practice']))
              setShowMemo(true)
              setShowScore(true)
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            リセット
          </button>
        </div>
      </div>

      {/* ガントチャート本体 */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* 日付ヘッダー */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 flex-shrink-0 px-4 py-2 bg-gray-50 border-r border-gray-200">
              <span className="text-sm font-medium text-gray-700">求職者</span>
            </div>
            <div className="flex-1 flex">
              {monthDays.map((day, index) => (
                <div
                  key={index}
                  className={`flex-1 px-1 py-2 text-center border-r border-gray-100 ${
                    day.getDay() === 0 ? 'bg-red-50' : 
                    day.getDay() === 6 ? 'bg-blue-50' : 
                    'bg-gray-50'
                  }`}
                >
                  <div className="text-xs text-gray-500">
                    {format(day, 'E', { locale: ja })}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 求職者行 */}
          {filteredJobSeekers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>該当する求職者がいません</p>
              </div>
            </div>
          ) : (
            filteredJobSeekers.map((jobSeeker, jobSeekerIndex) => {
            const events = eventsByJobSeeker.get(jobSeeker.id) || []
            
            return (
              <div
                key={jobSeeker.id}
                className={`flex border-b border-gray-200 ${
                  jobSeekerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* 求職者情報 */}
                <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {jobSeeker.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        担当CA: {mockCAAssignments[jobSeeker.id] || '未割当'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* タイムライン */}
                <div className="flex-1 flex relative">
                  {monthDays.map((day, dayIndex) => {
                    const dayEvents = events.filter(event => 
                      isSameDay(event.date, day)
                    )
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`flex-1 min-h-[60px] border-r border-gray-100 relative ${
                          day.getDay() === 0 ? 'bg-red-50/50' : 
                          day.getDay() === 6 ? 'bg-blue-50/50' : 
                          ''
                        }`}
                      >
                        {dayEvents.length > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center p-1">
                            {dayEvents.length === 1 ? (
                              // 単一イベントの表示
                              <button
                                onClick={() => {
                                  setSelectedEvent(dayEvents[0])
                                  setSelectedDayEvents(dayEvents)
                                  setCurrentEventIndex(0)
                                }}
                                className={`group relative flex items-center justify-center w-6 h-6 rounded-full shadow-sm hover:scale-110 transition-transform`}
                                style={{ backgroundColor: dayEvents[0].color || '#6B7280' }}
                                title={dayEvents[0].title}
                              >
                                <span className="text-white">
                                  {getEventIcon(dayEvents[0].type, dayEvents[0].subType)}
                                </span>
                                
                                {/* ツールチップ */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                  {dayEvents[0].title}
                                </div>
                              </button>
                            ) : (
                              // 複数イベントの表示
                              <button
                                onClick={() => {
                                  // 複数イベントの場合は最初のイベントを表示
                                  setSelectedEvent(dayEvents[0])
                                  setSelectedDayEvents(dayEvents)
                                  setCurrentEventIndex(0)
                                }}
                                className="group relative flex items-center justify-center"
                                title={`${dayEvents.length}件のイベント`}
                              >
                                {/* 複数イベントのスタック表示 */}
                                <div className="relative">
                                  {/* 背面のイベント */}
                                  {dayEvents.slice(1, 3).map((event, index) => (
                                    <div
                                      key={event.id}
                                      className="absolute w-6 h-6 rounded-full shadow-sm"
                                      style={{ 
                                        backgroundColor: event.color || '#6B7280',
                                        top: `${(index + 1) * 3}px`,
                                        left: `${(index + 1) * 3}px`,
                                        zIndex: -index - 1
                                      }}
                                    />
                                  ))}
                                  {/* 前面のイベント */}
                                  <div
                                    className="relative w-6 h-6 rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
                                    style={{ backgroundColor: dayEvents[0].color || '#6B7280' }}
                                  >
                                    <span className="text-white text-xs font-bold">
                                      {dayEvents.length}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* ツールチップ */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                  {dayEvents.length}件のイベント
                                  <div className="mt-1 space-y-0.5">
                                    {dayEvents.slice(0, 3).map(event => (
                                      <div key={event.id} className="text-gray-300">
                                        • {event.title}
                                      </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                      <div className="text-gray-400">
                                        他{dayEvents.length - 3}件
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
          )}
        </div>
      </div>

      {/* イベント詳細モーダル（右スライド） */}
      {selectedEvent && (
        <>
          {/* 背景オーバーレイ（半透明） */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity"
            onClick={() => setSelectedEvent(null)}
          />
          
          {/* 右側スライドパネル */}
          <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${selectedEvent ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: selectedEvent.color || '#6B7280' }}
                  >
                    <span className="text-white">
                      {getEventIcon(selectedEvent.type, selectedEvent.subType)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getEventTypeLabel(selectedEvent.type)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(selectedEvent.date, 'yyyy年M月d日', { locale: ja })}
                    </p>
                  </div>
                  
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(null)
                    setSelectedDayEvents([])
                    setCurrentEventIndex(0)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* コンテンツ */}
            <div className="px-6 py-6 overflow-y-auto h-[calc(100%-80px)]">
              <div className="space-y-6">
                {/* 求職者情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">求職者情報</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {jobSeekers.find(js => js.id === selectedEvent.jobSeekerId)?.name || '不明'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {jobSeekers.find(js => js.id === selectedEvent.jobSeekerId)?.currentPosition || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 複数イベントの場合は全て表示 */}
                {selectedDayEvents.length > 1 ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {format(selectedEvent.date, 'M月d日', { locale: ja })}のイベント一覧
                    </h4>
                    <div className="space-y-3">
                      {selectedDayEvents.map((event, index) => (
                        <div
                          key={event.id}
                          className={`border rounded-lg p-4 transition-all cursor-pointer ${
                            currentEventIndex === index 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setCurrentEventIndex(index)
                            setSelectedEvent(event)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: event.color || '#6B7280' }}
                            >
                              <span className="text-white text-sm">
                                {getEventIcon(event.type, event.subType)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-gray-900">
                                  {event.title}
                                </h5>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {getEventTypeLabel(event.type)}
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {event.description}
                                </p>
                              )}
                              
                              {event.type === 'status' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {event.previousValue || '未設定'}
                                  </span>
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                                    {event.newValue}
                                  </span>
                                </div>
                              )}
                              
                              {event.type === 'score_change' && event.score && (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-purple-600">
                                    {event.score}点
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                    <div
                                      className="bg-purple-600 h-1.5 rounded-full"
                                      style={{ width: `${event.score}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* 単一イベントの場合は詳細表示 */
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">イベント詳細</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">タイトル</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {selectedEvent.title}
                        </p>
                      </div>
                      
                      {selectedEvent.description && (
                        <div>
                          <p className="text-sm text-gray-500">説明</p>
                          <p className="text-gray-900 mt-1">
                            {selectedEvent.description}
                          </p>
                        </div>
                      )}
                      
                      {selectedEvent.type === 'status' && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">ステータス変更</p>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {selectedEvent.previousValue || '未設定'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {selectedEvent.newValue}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.type === 'score_change' && selectedEvent.score && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">評価スコア</p>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-purple-600">
                              {selectedEvent.score}
                            </div>
                            <div className="text-sm text-gray-500">/ 100点</div>
                          </div>
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${selectedEvent.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.type === 'memo' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900">メモ</p>
                              <p className="text-sm text-amber-800 mt-1">
                                {selectedEvent.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedEvent.type === 'event' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Flag className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900">イベント</p>
                              <p className="text-sm text-green-800 mt-1">
                                {selectedEvent.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* タイムスタンプ */}
                <div className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                  <p>記録日時: {format(selectedEvent.date, 'yyyy年M月d日 HH:mm', { locale: ja })}</p>
                </div>
              </div>
            </div>
            
            {/* フッター */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedEvent(null)
                    setSelectedDayEvents([])
                    setCurrentEventIndex(0)
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  閉じる
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  編集
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}