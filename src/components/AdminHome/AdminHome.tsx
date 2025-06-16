'use client'

import React, { useState } from 'react'
import { Search, FileImage, ChevronDown, PlayCircle } from 'lucide-react'

interface AdCampaign {
  id: string
  banner: string
  name: string
  adSpend: number
  impressions: number
  cpm: number
  lpVisits: number
  ctr: number
  cpc: number
  lineAdds: number
  lineCpa: number
  effectiveListCount: number
  effectiveListRate: number
}

export function AdminHome() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null)

  // 広告キャンペーンのダミーデータ
  const campaigns: AdCampaign[] = [
    {
      id: '0512_69k',
      banner: 'banner1',
      name: 'LP03a_KISHUN10-7',
      adSpend: 3863,
      impressions: 1131,
      cpm: 3416,
      lpVisits: 21,
      ctr: 1.86,
      cpc: 184,
      lineAdds: 0,
      lineCpa: 0,
      effectiveListCount: 0,
      effectiveListRate: 0
    },
    {
      id: '0512_64k',
      banner: 'banner2',
      name: 'LP03a_KISHUN10-2',
      adSpend: 3492,
      impressions: 1443,
      cpm: 2420,
      lpVisits: 16,
      ctr: 1.11,
      cpc: 218,
      lineAdds: 2,
      lineCpa: 1746,
      effectiveListCount: 0,
      effectiveListRate: 0
    },
    {
      id: '0512_52k',
      banner: 'banner3',
      name: 'LP03a_KISHUN07-4',
      adSpend: 3439,
      impressions: 835,
      cpm: 4119,
      lpVisits: 11,
      ctr: 1.32,
      cpc: 313,
      lineAdds: 0,
      lineCpa: 0,
      effectiveListCount: 0,
      effectiveListRate: 0
    },
    {
      id: '0512_68k',
      banner: 'banner4',
      name: 'LP03a_KISHUN10-6',
      adSpend: 3435,
      impressions: 1246,
      cpm: 2757,
      lpVisits: 9,
      ctr: 0.72,
      cpc: 382,
      lineAdds: 0,
      lineCpa: 0,
      effectiveListCount: 0,
      effectiveListRate: 0
    },
    {
      id: '0512_61k',
      banner: 'banner5',
      name: 'LP03a_KISHUN09-2',
      adSpend: 2500,
      impressions: 1015,
      cpm: 2463,
      lpVisits: 10,
      ctr: 0.99,
      cpc: 250,
      lineAdds: 0,
      lineCpa: 0,
      effectiveListCount: 0,
      effectiveListRate: 0
    }
  ]

  // 合計値の計算
  const totals = campaigns.reduce((acc, campaign) => ({
    adSpend: acc.adSpend + campaign.adSpend,
    impressions: acc.impressions + campaign.impressions,
    cpm: 0, // 後で計算
    lpVisits: acc.lpVisits + campaign.lpVisits,
    ctr: 0, // 後で計算
    cpc: 0, // 後で計算
    lineAdds: acc.lineAdds + campaign.lineAdds,
    lineCpa: 0, // 後で計算
    effectiveListCount: acc.effectiveListCount + campaign.effectiveListCount
  }), {
    adSpend: 0,
    impressions: 0,
    cpm: 0,
    lpVisits: 0,
    ctr: 0,
    cpc: 0,
    lineAdds: 0,
    lineCpa: 0,
    effectiveListCount: 0
  })

  // 平均値の計算
  totals.cpm = Math.round(totals.adSpend / totals.impressions * 1000)
  totals.ctr = Number(((totals.lpVisits / totals.impressions) * 100).toFixed(2))
  totals.cpc = Math.round(totals.adSpend / totals.lpVisits)
  totals.lineCpa = totals.lineAdds > 0 ? Math.round(totals.adSpend / totals.lineAdds) : 0

  // バナーのサンプル画像（実際の画像の代わり）
  const getBannerImage = (bannerId: string) => {
    const bannerColors = {
      banner1: 'bg-gradient-to-br from-blue-400 to-blue-600',
      banner2: 'bg-gradient-to-br from-purple-400 to-purple-600',
      banner3: 'bg-gradient-to-br from-pink-400 to-pink-600',
      banner4: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      banner5: 'bg-gradient-to-br from-cyan-400 to-cyan-600'
    }
    return bannerColors[bannerId as keyof typeof bannerColors] || 'bg-gray-400'
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">広告分析</h1>
        <p className="text-gray-600 mt-1">広告キャンペーンのパフォーマンスを分析</p>
      </div>

      {/* 検索とフィルター */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>バナー列を非表示</span>
          <input type="checkbox" className="rounded border-gray-300" />
        </div>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <FileImage className="w-4 h-4" />
          CSV出力
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="内テキストをカンマ区切りで検索（例: 0402_41k,0512_61k）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          絞り込み
        </button>
      </div>

      {/* データテーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  バナー
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  キャンペーン名
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  広告費用 <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  インプレッション <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPM <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LP流入数 <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPC <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LINE追加数 <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LINE CPA <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有効リスト数 <ChevronDown className="inline w-3 h-3" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  有効リスト率
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <div className={`w-16 h-16 rounded ${getBannerImage(campaign.banner)} flex items-center justify-center cursor-pointer`}>
                        <PlayCircle className="w-8 h-8 text-white opacity-80" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-opacity" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    [{campaign.id}] {campaign.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ¥{campaign.adSpend.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ¥{campaign.cpm.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.lpVisits}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.ctr}%
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ¥{campaign.cpc}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.lineAdds}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.lineCpa > 0 ? `¥${campaign.lineCpa.toLocaleString()}` : '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.effectiveListCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {campaign.effectiveListRate}
                  </td>
                </tr>
              ))}
              {/* 合計行 */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-4 py-3 text-sm text-gray-900">
                  -
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  合計 / 平均 <span className="text-gray-400">?</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ¥{totals.adSpend.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.impressions.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ¥{totals.cpm.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.lpVisits}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.ctr}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ¥{totals.cpc}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.lineAdds}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.lineCpa > 0 ? `¥${totals.lineCpa.toLocaleString()}` : '0'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {totals.effectiveListCount}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}