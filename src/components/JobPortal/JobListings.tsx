'use client'

import React, { useState } from 'react'
import { Search, MapPin, Briefcase, DollarSign, Clock, Calendar, Users, ChevronRight, Filter, Building2, Heart, BookmarkPlus, TrendingUp, Star, CheckCircle, Globe, Home, Train } from 'lucide-react'

interface Job {
  id: string
  company: string
  companyLogo?: string
  companyImage?: string
  title: string
  description: string
  location: string
  salary: string
  employmentType: string
  postedDate: Date
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
  isRemote?: boolean
  benefits?: string[]
  requirements?: string[]
  applicationCount?: number
  category: string
}

export function JobListings({ onSelectJob }: { onSelectJob?: (jobId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string[]>([])
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string[]>([])
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('')
  
  // サンプルデータ
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      company: '社名完全非公開',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop',
      title: '【財務・会計】フレックスあり/リモートワーク可能/英語を活かし、海外でも活躍できる！アフリカ諸国の食糧問題をはじめとする社会課題を解決し、貧困削減をめざす一般財団法人',
      description: '【募集背景】組織体制強化のための募集になります。【業務内容】アフリカの現地事務所と協力し、組織の経理、財務、予算管理等を担当する「財務・会計担当職員（ファイナンス・オフィサー）」を募集します。事業の円滑な実施を財務面から支える、非常に重要でや...',
      location: '東京都港区虎ノ門',
      salary: '400〜610',
      employmentType: '正社員',
      postedDate: new Date('2024-02-10'),
      tags: ['完全週休2日制', '年間休日120日以上', '転勤なし', 'フレックス制度あり', 'リモートワーク可能'],
      isNew: true,
      isFeatured: true,
      isRemote: true,
      category: '財務',
      applicationCount: 25467,
      benefits: ['完全週休2日制', 'フレックスタイム', 'リモートワーク可', '英語力を活かせる'],
      requirements: ['財務・会計の実務経験3年以上', 'ビジネスレベルの英語力', 'Excel等の表計算ソフトの実務経験']
    },
    {
      id: '2',
      company: '社名完全非公開',
      companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=250&fit=crop',
      title: '【一般事務】フルフレックス／2036年までに、「店舗数700店舗」「年商1000億円」を目指し成長中！〜人材関連のニッチ事業にて日本最大手企業でもあり、安定・成長を兼ね備えた...',
      description: '【募集背景】事業拡大による増員募集です。【業務内容】総務部門での一般事務のお仕事です。データ入力、書類作成、電話対応、来客対応など、幅広い業務をお任せします。未経験の方でも丁寧に指導しますので、安心してご応募ください。',
      location: '東京都渋谷区',
      salary: '300〜450',
      employmentType: '正社員',
      postedDate: new Date('2024-02-12'),
      tags: ['未経験OK', '第二新卒歓迎', '残業月20h以下', '土日祝休み', '駅チカ'],
      isNew: true,
      category: '総務',
      applicationCount: 25463,
      benefits: ['完全週休2日制', '年間休日125日', '産休・育休取得実績あり', '資格取得支援'],
      requirements: ['PCの基本操作ができる方', 'コミュニケーション能力のある方']
    },
    {
      id: '3',
      company: 'テックイノベーション株式会社',
      companyLogo: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop',
      title: '【フロントエンドエンジニア】React/TypeScript/フルリモート可/自社プロダクト開発',
      description: '急成長中のSaaS企業で、自社プロダクトのフロントエンド開発をお任せします。最新技術を積極的に採用し、エンジニアファーストな環境で働けます。',
      location: 'フルリモート',
      salary: '500〜800',
      employmentType: '正社員',
      postedDate: new Date('2024-02-14'),
      tags: ['フルリモート', 'フレックス制度', '副業OK', '最新技術', 'スキルアップ'],
      isFeatured: true,
      isRemote: true,
      category: 'エンジニア',
      applicationCount: 15234,
      benefits: ['フルリモート勤務', 'フレックスタイム制', '副業OK', '書籍購入支援'],
      requirements: ['React/TypeScriptの実務経験2年以上', 'Gitを使用したチーム開発経験', 'UI/UXへの興味・関心']
    },
    {
      id: '4',
      company: 'グローバルコンサルティング',
      companyLogo: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
      title: '【経営コンサルタント】年収1000万円可/MBA歓迎/グローバル案件多数',
      description: '大手企業の経営課題解決から、スタートアップの成長支援まで、幅広いプロジェクトに携わることができます。',
      location: '東京都千代田区',
      salary: '700〜1200',
      employmentType: '正社員',
      postedDate: new Date('2024-02-08'),
      tags: ['高年収', 'MBA歓迎', '海外出張あり', '成長企業', 'キャリアアップ'],
      isFeatured: true,
      category: 'コンサルタント',
      applicationCount: 8976,
      benefits: ['年収1000万円以上可', '海外研修制度', 'MBA取得支援', 'ストックオプション'],
      requirements: ['コンサルティング経験3年以上', 'ビジネスレベルの英語力', 'MBA取得者歓迎']
    },
    {
      id: '5',
      company: 'AIスタートアップ',
      companyLogo: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      title: '【機械学習エンジニア】最先端AI開発/論文実装/研究開発',
      description: '最先端のAI技術を活用した新規事業開発に携わっていただきます。論文の実装から本番環境への導入まで、一貫して担当できます。',
      location: '東京都渋谷区',
      salary: '600〜1000',
      employmentType: '正社員',
      postedDate: new Date('2024-02-15'),
      tags: ['AI/機械学習', '研究開発', '論文実装', 'Python', 'TensorFlow'],
      isNew: true,
      isFeatured: true,
      category: 'エンジニア',
      applicationCount: 12456,
      benefits: ['裁量労働制', '研究開発費支給', '学会参加支援', 'GPU環境完備'],
      requirements: ['機械学習の実務経験', 'Python/TensorFlow or PyTorchの経験', '論文を読んで実装できる方']
    },
    {
      id: '6',
      company: 'デジタルマーケティング社',
      companyLogo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      title: '【Webマーケター】SEO/SEM/SNS運用/データ分析',
      description: 'デジタルマーケティング全般をお任せします。SEO、リスティング広告、SNS運用など幅広く経験を積めます。',
      location: '東京都港区',
      salary: '400〜700',
      employmentType: '正社員',
      postedDate: new Date('2024-02-13'),
      tags: ['マーケティング', 'SEO/SEM', 'データ分析', 'リモートワーク可', '成長企業'],
      isRemote: true,
      category: 'マーケティング',
      applicationCount: 9876,
      benefits: ['週3リモート可', 'フレックスタイム', '副業OK', '資格取得支援'],
      requirements: ['Webマーケティング経験2年以上', 'Google Analytics使用経験', 'データ分析スキル']
    },
    {
      id: '7',
      company: 'ヘルスケアテック',
      companyLogo: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
      title: '【プロダクトマネージャー】医療系SaaS/社会貢献性の高い事業',
      description: '医療現場の課題を解決するSaaSプロダクトのプロダクトマネジメントをお任せします。',
      location: '東京都文京区',
      salary: '600〜900',
      employmentType: '正社員',
      postedDate: new Date('2024-02-11'),
      tags: ['プロダクトマネジメント', 'SaaS', '医療・ヘルスケア', '社会貢献', 'アジャイル'],
      category: 'プロダクトマネージャー',
      applicationCount: 7654,
      benefits: ['フレックスタイム', '在宅勤務可', '健康診断充実', 'ストックオプション'],
      requirements: ['プロダクトマネジメント経験', 'BtoB SaaSの経験', 'アジャイル開発の理解']
    },
    {
      id: '8',
      company: 'グリーンエネルギー',
      companyLogo: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop',
      title: '【営業】再生可能エネルギー/SDGs/インセンティブ充実',
      description: '再生可能エネルギー事業の法人営業をお任せします。SDGsに貢献できる仕事です。',
      location: '大阪府大阪市',
      salary: '450〜750',
      employmentType: '正社員',
      postedDate: new Date('2024-02-09'),
      tags: ['営業', 'SDGs', '再生可能エネルギー', 'インセンティブ', '未経験可'],
      category: '営業',
      applicationCount: 6543,
      benefits: ['インセンティブ制度', '社用車貸与', '営業手当', '資格取得支援'],
      requirements: ['営業経験（業界不問）', '普通自動車免許', 'コミュニケーション能力']
    }
  ])
  
  // フィルタリング
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(job.category)
    const matchesEmploymentType = selectedEmploymentType.length === 0 || selectedEmploymentType.includes(job.employmentType)
    
    return matchesSearch && matchesCategory && matchesEmploymentType
  })
  
  // カテゴリー別の求人数を計算
  const categoryCounts = {
    '経理': jobs.filter(j => j.category === '経理').length,
    '財務': jobs.filter(j => j.category === '財務').length,
    '法務': jobs.filter(j => j.category === '法務').length,
    'CFO': jobs.filter(j => j.category === 'CFO').length,
    '総務': jobs.filter(j => j.category === '総務').length,
    'その他': jobs.filter(j => j.category === 'その他').length,
    '人事': jobs.filter(j => j.category === '人事').length,
    '労務': jobs.filter(j => j.category === '労務').length,
    '知財': jobs.filter(j => j.category === '知財').length,
    'エンジニア': jobs.filter(j => j.category === 'エンジニア').length,
    'コンサルタント': jobs.filter(j => j.category === 'コンサルタント').length,
    'マーケティング': jobs.filter(j => j.category === 'マーケティング').length,
    'プロダクトマネージャー': jobs.filter(j => j.category === 'プロダクトマネージャー').length,
    '営業': jobs.filter(j => j.category === '営業').length,
  }
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategory(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">求人情報の検索結果一覧</h1>
              <span className="text-lg">
                この条件の求人数 <span className="text-3xl font-bold text-orange-500">{filteredJobs.length.toLocaleString()}</span> 件
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                ログイン
              </button>
              <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">
                会員登録
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左サイドバー - フィルター */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="font-bold mb-4">条件を絞り込む</h2>
              
              {/* 職種フィルター */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="font-medium">職種</span>
                  <button className="ml-auto text-sm text-gray-500">
                    職種を選択
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <label key={category} className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategory.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="mr-2"
                      />
                      <span className="flex-1">{category}</span>
                      {count > 0 && <span className="text-gray-500">({count})</span>}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* 勤務地フィルター */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">勤務地</span>
                  <button className="ml-auto text-sm text-gray-500">
                    勤務地を選択
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    東京都
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    大阪府
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    リモートワーク可
                  </label>
                </div>
              </div>
              
              {/* 年収フィルター */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="font-medium">年収</span>
                  <button className="ml-auto text-sm text-gray-500">
                    年収を選択
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    400万円以上
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    600万円以上
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    800万円以上
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    1000万円以上
                  </label>
                </div>
              </div>
              
              {/* こだわり条件 */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="font-medium">こだわり条件</span>
                  <button className="ml-auto text-sm text-gray-500">
                    こだわりを選択
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    完全週休2日制
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    フレックスタイム
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    リモートワーク可
                  </label>
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" className="mr-2" />
                    未経験OK
                  </label>
                </div>
              </div>
              
              {/* 求人数表示 */}
              <div className="pt-4 border-t text-center">
                <div className="text-sm text-gray-600">この条件の求人数</div>
                <div className="text-3xl font-bold text-orange-500 mt-1">
                  {filteredJobs.length.toLocaleString()}
                  <span className="text-base font-normal text-gray-600 ml-1">件</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* メインコンテンツ - 求人一覧 */}
          <div className="flex-1">
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden group"
                  onClick={() => onSelectJob?.(job.id)}
                >
                  <div className="flex">
                    {/* 左側 - 画像エリア */}
                    <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden bg-gray-100">
                      {job.companyImage ? (
                        <img 
                          src={job.companyImage} 
                          alt={job.company}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {job.isFeatured && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded shadow-lg">
                          おすすめ
                        </div>
                      )}
                      {job.companyLogo && (
                        <div className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-lg shadow-md p-1">
                          <img 
                            src={job.companyLogo} 
                            alt={job.company}
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* 右側 - コンテンツエリア */}
                    <div className="flex-1 p-6">
                      {/* 企業名とタグ */}
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {job.company}
                          {job.applicationCount && (
                            <span className="text-gray-500 ml-2">
                              （エージェントに問い合わせください/求人番号{job.applicationCount}）
                            </span>
                          )}
                        </span>
                      </div>
                      
                      {/* タイトル */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      
                      {/* タグ */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.isNew && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                            NEW
                          </span>
                        )}
                        {job.tags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                            {tag}
                          </span>
                        ))}
                        {job.isRemote && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                            <Globe className="w-3 h-3 inline mr-1" />
                            リモート可
                          </span>
                        )}
                      </div>
                      
                      {/* 説明文 */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      {/* 給与・勤務地 */}
                      <div className="flex items-center gap-6 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">給与</span>
                          <span className="font-bold text-orange-500">
                            年収 {job.salary}万円
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">勤務地</span>
                          <span className="font-medium text-gray-800">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">{job.employmentType}</span>
                        </div>
                      </div>
                      
                      {/* アクションボタン */}
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                          ブックマーク
                        </button>
                        <button className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 font-medium shadow-md hover:shadow-lg transition-all">
                          求人の詳細をみる
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* ページネーション */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">前へ</button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">...</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">10</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">次へ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}