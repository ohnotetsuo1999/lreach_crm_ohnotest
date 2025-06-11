'use client'

import { useState } from 'react'
import { Eye, X } from 'lucide-react'

interface ScenarioReportData {
  no: number
  deliveryDateTime: string
  deliveryTitle: string
  deliveryCount: number
  openCount: number
  openRate: number
  massDelivery: {
    deliveryCount: number
    ctaTapCount: number
    ctaTapRate: number
    reservationCount: number
    reservationRate: number
    arrivalRate: number
  }
  ctaOneMinuteAfter: {
    deliveryCount: number
    ctaTapCount: number
    ctaTapRate: number
    reservationCount: number
    reservationRate: number
    arrivalRate: number
  }
  totalReservations: number
  totalReservationRate: number
  totalArrivals: number
  totalArrivalRate: number
  targetAudience: string
  deliveryAppeal: string
  deliveryContent: string
  memo: string
}

const mockData: ScenarioReportData[] = [
  {
    no: 3,
    deliveryDateTime: '5/13(火) 20:13',
    deliveryTitle: '収入アップ訴求',
    deliveryCount: 1925,
    openCount: 32,
    openRate: 1.66,
    massDelivery: {
      deliveryCount: 112,
      ctaTapCount: 0,
      ctaTapRate: 350.00,
      reservationCount: 3,
      reservationRate: 0.16,
      arrivalRate: 0.16
    },
    ctaOneMinuteAfter: {
      deliveryCount: 0,
      ctaTapCount: 0,
      ctaTapRate: 0,
      reservationCount: 0,
      reservationRate: 0,
      arrivalRate: 0
    },
    totalReservations: 3,
    totalReservationRate: 0.16,
    totalArrivals: 0,
    totalArrivalRate: 0.16,
    targetAudience: '・貴瞬広告流入者\n・年齢：23〜30歳\n・営業管理ステータス（下記以外）\n　4. 企業推薦中\n　5. 企業選考中\n　6. 内定\n　入社\n・面談予約済みユーザー（現状は予約ユーザーを管理していないため、手動で設定済み）\n・除外ユーザー\n　U9c43a74633ac4e27128637cef86da0fa',
    deliveryAppeal: '手取りがあと5万円あれば…',
    deliveryContent: '『手取りがあと5万円あれば…』\n通知欄：[name]さんに『株式会社貴瞬』からスカウトが届いています！\nFigma\n※通知欄：スカウトが届いています！\n　→前回と同じだが開封率は下がらなかった',
    memo: '予約リマインド・CTAタップ1分後配信未実装\n┗開発進行中'
  },
  {
    no: 2,
    deliveryDateTime: '5/7(水) 20:57\nGW明け初日',
    deliveryTitle: 'GW明け訴求',
    deliveryCount: 1774,
    openCount: 72,
    openRate: 4.06,
    massDelivery: {
      deliveryCount: 142,
      ctaTapCount: 0,
      ctaTapRate: 197.22,
      reservationCount: 9,
      reservationRate: 0.51,
      arrivalRate: 0.51
    },
    ctaOneMinuteAfter: {
      deliveryCount: 0,
      ctaTapCount: 0,
      ctaTapRate: 0,
      reservationCount: 0,
      reservationRate: 0,
      arrivalRate: 0
    },
    totalReservations: 9,
    totalReservationRate: 0.51,
    totalArrivals: 0,
    totalArrivalRate: 0.51,
    targetAudience: '・貴瞬広告流入者\n・年齢：23〜30歳\n・「4. 企業推薦中」「5. 企業選考中」「6. 内定」「入社」以外\n・面談予約済みユーザー（手動で設定済み）',
    deliveryAppeal: '連休明けの仕事が辛い...',
    deliveryContent: '『連休明けの仕事が辛い...』\n通知欄：[name]さんに『株式会社貴瞬』からスカウトが届いています！\nFigma',
    memo: '配信実装のてこずりにより、配信時刻の遅れ\n┗予定：20:13\n予約リマインド・CTAタップ1分後配信未実装\n┗開発進行中'
  },
  {
    no: 1,
    deliveryDateTime: '5/3(土) 21:31',
    deliveryTitle: '採用強化中キャンペーン',
    deliveryCount: 1822,
    openCount: 111,
    openRate: 6.09,
    massDelivery: {
      deliveryCount: 115,
      ctaTapCount: 0,
      ctaTapRate: 103.60,
      reservationCount: 6,
      reservationRate: 0.33,
      arrivalRate: 0.33
    },
    ctaOneMinuteAfter: {
      deliveryCount: 0,
      ctaTapCount: 0,
      ctaTapRate: 0,
      reservationCount: 0,
      reservationRate: 0,
      arrivalRate: 0
    },
    totalReservations: 6,
    totalReservationRate: 0.33,
    totalArrivals: 0,
    totalArrivalRate: 0.33,
    targetAudience: '①貴瞬広告流入者',
    deliveryAppeal: '採用強化中',
    deliveryContent: '残り2人\n通知欄：『株式会社貴瞬』ただいま採用強化中です！\nFigma',
    memo: '配信実装のてこずりにより、配信時刻の遅れ\n┗予定：20:13\n予約リマインド・CTAタップ1分後配信未実装\n┗開発進行中'
  }
]

interface ScenarioReportTableProps {
  onScenarioSelect?: (scenario: ScenarioReportData) => void
}

export function ScenarioReportTable({ onScenarioSelect }: ScenarioReportTableProps) {
  const [selectedDetail, setSelectedDetail] = useState<{ type: string; content: string; title: string } | null>(null)

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const DetailModal = () => {
    if (!selectedDetail) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{selectedDetail.title}</h3>
            <button
              onClick={() => setSelectedDetail(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">
            <div className="whitespace-pre-line text-sm text-gray-700">
              {selectedDetail.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">シナリオ別配信レポート</h3>
      </div>
      
      <div className="relative overflow-x-auto w-full">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10" style={{ minWidth: '60px' }}>
                No.
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky bg-gray-50 z-10" style={{ left: '60px', minWidth: '140px' }}>
                配信日時
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky bg-gray-50 z-10" style={{ left: '200px', minWidth: '160px' }}>
                配信タイトル
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                配信数
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                開封数
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                開封率
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200" colSpan={6}>
                一斉配信
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200" colSpan={6}>
                CTAタップ1分後配信
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                予約数<br/>(合計)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                予約率<br/>(合計)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                着座数<br/>(合計)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                着座率<br/>(合計)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">
                配信対象者
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32">
                配信訴求
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-40">
                配信内容
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                メモ
              </th>
            </tr>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 border-r border-gray-200 sticky left-0 bg-gray-50 z-10"></th>
              <th className="px-3 py-2 border-r border-gray-200 sticky bg-gray-50 z-10" style={{ left: '60px' }}></th>
              <th className="px-3 py-2 border-r border-gray-200 sticky bg-gray-50 z-10" style={{ left: '200px' }}></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">配信数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">CTAタップ数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">CTAタップ率</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">予約数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">予約率<br/>(予約/配信)</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">引き上げ率<br/>(着座/配信)</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">配信数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">CTAタップ数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">CTAタップ率</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">予約数</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">予約率<br/>(予約/配信)</th>
              <th className="px-2 py-2 text-xs text-gray-500 border-r border-gray-200">引き上げ率<br/>(着座/配信)</th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2 border-r border-gray-200"></th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockData.map((row) => (
              <tr key={row.no} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10" style={{ minWidth: '60px' }}>
                  {row.no}
                </td>
                <td className="px-3 py-4 whitespace-pre-line text-sm text-gray-900 border-r border-gray-200 sticky bg-white z-10" style={{ left: '60px', minWidth: '140px' }}>
                  {row.deliveryDateTime}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200 sticky bg-white z-10" style={{ left: '200px', minWidth: '160px' }}>
                  <button
                    onClick={() => onScenarioSelect?.(row)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {row.deliveryTitle}
                  </button>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.deliveryCount.toLocaleString()}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.openCount}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.openRate}%
                </td>
                
                {/* 一斉配信 */}
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.deliveryCount}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.ctaTapCount || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.ctaTapRate ? `${row.massDelivery.ctaTapRate}%` : '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.reservationCount}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.reservationRate}%
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.massDelivery.arrivalRate}%
                </td>
                
                {/* CTAタップ1分後配信 */}
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.deliveryCount || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.ctaTapCount || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.ctaTapRate || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.reservationCount || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.reservationRate || '-'}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.ctaOneMinuteAfter.arrivalRate || '-'}
                </td>
                
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.totalReservations}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.totalReservationRate}%
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.totalArrivals || '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                  {row.totalArrivalRate}%
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 w-40">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{truncateText(row.targetAudience.replace(/\n/g, ' '), 25)}</span>
                    <button
                      onClick={() => setSelectedDetail({
                        type: 'targetAudience',
                        content: row.targetAudience,
                        title: '配信対象者詳細'
                      })}
                      className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 w-32">
                  <div className="truncate" title={row.deliveryAppeal}>
                    {row.deliveryAppeal}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 border-r border-gray-200 w-40">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{truncateText(row.deliveryContent.replace(/\n/g, ' '), 25)}</span>
                    <button
                      onClick={() => setSelectedDetail({
                        type: 'deliveryContent',
                        content: row.deliveryContent,
                        title: '配信内容詳細'
                      })}
                      className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 w-32">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{truncateText(row.memo.replace(/\n/g, ' '), 20)}</span>
                    <button
                      onClick={() => setSelectedDetail({
                        type: 'memo',
                        content: row.memo,
                        title: 'メモ詳細'
                      })}
                      className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DetailModal />
    </div>
  )
}