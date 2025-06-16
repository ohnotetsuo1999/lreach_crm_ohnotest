'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, Download, Search } from 'lucide-react'

interface AdData {
  id: string
  banner: string
  campaignName: string
  adCost: number
  impressions: number
  cpm: number
  ulpInflow: number
  uctr: number
  ucpc: number
  lineAdds: {
    total: number
    new: number
    existing: number
  }
  lineCpa: number
  validLists: {
    total: number
    new: number
    existing: number
  }
  validListCpa: number
  appointments: number
  appointmentCpa: number
  consultations: number
  consultationCpa: number
}

export function AdAnalytics() {
  const [activeTab, setActiveTab] = useState<'line' | 'db' | 'block'>('line')
  const [dateRange, setDateRange] = useState({
    start: '2025年06月',
    end: ''
  })
  const [selectedAccount, setSelectedAccount] = useState('すべてのアカウント')
  const [displayMode, setDisplayMode] = useState('表示モード')
  const [cvDisplay, setCvDisplay] = useState('全て表示')
  const [displayContent, setDisplayContent] = useState('表示内容')
  const [campaignFilter, setCampaignFilter] = useState('キャンペーン名')
  const [searchQuery, setSearchQuery] = useState('')

  // サンプルデータ
  const [adData] = useState<AdData[]>([
    {
      id: '1',
      banner: '/banner1.jpg',
      campaignName: 'Instagram_ストーリーズ_リタゲ',
      adCost: 250000,
      impressions: 450000,
      cpm: 556,
      ulpInflow: 3200,
      uctr: 0.71,
      ucpc: 78,
      lineAdds: { total: 280, new: 180, existing: 100 },
      lineCpa: 893,
      validLists: { total: 120, new: 80, existing: 40 },
      validListCpa: 2083,
      appointments: 25,
      appointmentCpa: 10000,
      consultations: 18,
      consultationCpa: 13889
    },
    {
      id: '2',
      banner: '/banner2.jpg',
      campaignName: 'Facebook_フィード_獲得',
      adCost: 180000,
      impressions: 380000,
      cpm: 474,
      ulpInflow: 2800,
      uctr: 0.74,
      ucpc: 64,
      lineAdds: { total: 220, new: 140, existing: 80 },
      lineCpa: 818,
      validLists: { total: 95, new: 60, existing: 35 },
      validListCpa: 1895,
      appointments: 20,
      appointmentCpa: 9000,
      consultations: 15,
      consultationCpa: 12000
    },
    {
      id: '3',
      banner: '/banner3.jpg',
      campaignName: 'Instagram_フィード_類似オーディエンス',
      adCost: 320000,
      impressions: 580000,
      cpm: 552,
      ulpInflow: 4100,
      uctr: 0.71,
      ucpc: 78,
      lineAdds: { total: 350, new: 210, existing: 140 },
      lineCpa: 914,
      validLists: { total: 160, new: 95, existing: 65 },
      validListCpa: 2000,
      appointments: 32,
      appointmentCpa: 10000,
      consultations: 24,
      consultationCpa: 13333
    }
  ])

  const lineFlowStats = {
    today: 4,
    yesterday: 7,
    last2Days: 11,
    last3Days: 15,
    lastWeek: 44,
    total: 112
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* タブ */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('line')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'line'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                LINE流入数
              </button>
              <button
                onClick={() => setActiveTab('db')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'db'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                DB登録数
              </button>
              <button
                onClick={() => setActiveTab('block')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'block'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ブロック率
              </button>
            </nav>
          </div>
        </div>

        {/* 日付選択とアクション */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={dateRange.start}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="2025年06月"
              />
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-500">〜</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={dateRange.end}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="年/月/日"
              />
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
              表示
            </button>
          </div>
        </div>

        {/* LINE流入数統計 */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">LINE流入数</h3>
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white border-2 border-green-500 rounded-lg p-4">
              <div className="text-xs text-gray-500">当日</div>
              <div className="text-2xl font-bold">{lineFlowStats.today} 人</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500">前日</div>
              <div className="text-2xl font-bold">{lineFlowStats.yesterday} 人</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500">過去2日</div>
              <div className="text-2xl font-bold">{lineFlowStats.last2Days} 人</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500">過去3日</div>
              <div className="text-2xl font-bold">{lineFlowStats.last3Days} 人</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500">過去1週間</div>
              <div className="text-2xl font-bold">{lineFlowStats.lastWeek} 人</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-500">当月</div>
              <div className="text-2xl font-bold">{lineFlowStats.total} 人</div>
            </div>
          </div>
        </div>

        {/* キャンペーン別データ */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">6/16のキャンペーン別データ</h3>
          
          {/* フィルター */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select 
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm"
              >
                <option>すべてのアカウント</option>
                <option>アカウント1</option>
                <option>アカウント2</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm"
              >
                <option>表示モード</option>
                <option>単純集計</option>
                <option>詳細表示</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <select 
                value={cvDisplay}
                onChange={(e) => setCvDisplay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm"
              >
                <option>全て表示</option>
                <option>CV有りのみ</option>
                <option>CV無しのみ</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                value={displayContent}
                onChange={(e) => setDisplayContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm"
              >
                <option>表示内容</option>
                <option>全項目</option>
                <option>主要項目のみ</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <select 
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none bg-white pr-8 text-sm"
              >
                <option>キャンペーン名</option>
                <option>Instagram</option>
                <option>Facebook</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 検索とダウンロード */}
          <div className="flex items-center justify-between mb-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              <span>バナー列を非表示</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4" />
                <span>CSV出力</span>
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="内テキストをカンマ区切りで検索（例: 0402_41k,0512_61k）"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 text-sm"
                />
              </div>
              
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                絞り込み
              </button>
            </div>
          </div>

          {/* データテーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    バナー
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    キャンペーン名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    広告費用 ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    インプレッション ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    CPM ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    ULP流入数 ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    UCTR ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    UCPC ▼
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    LINE追加数 ▼
                    <div className="flex justify-center space-x-2 mt-1 text-xs normal-case">
                      <span>全体</span>
                      <span>新規</span>
                      <span>既存</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    LINE CPA ▼
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    有効リスト数 ▼
                    <div className="flex justify-center space-x-2 mt-1 text-xs normal-case">
                      <span>全体</span>
                      <span>新規</span>
                      <span>既存</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    有効リストCPA ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    面談予約数 ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    面談予約CPA ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    面談着座数 ▼
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
                    面談着座CPA ▼
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adData.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ad.campaignName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.adCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.cpm.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.ulpInflow.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.uctr}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.ucpc}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex justify-center space-x-4">
                        <span>{ad.lineAdds.total}</span>
                        <span className="text-blue-600">{ad.lineAdds.new}</span>
                        <span className="text-gray-500">{ad.lineAdds.existing}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.lineCpa.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex justify-center space-x-4">
                        <span>{ad.validLists.total}</span>
                        <span className="text-blue-600">{ad.validLists.new}</span>
                        <span className="text-gray-500">{ad.validLists.existing}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.validListCpa.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.appointments}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.appointmentCpa.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.consultations}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{ad.consultationCpa.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}