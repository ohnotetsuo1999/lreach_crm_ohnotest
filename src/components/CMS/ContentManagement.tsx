'use client'

import React, { useState } from 'react'
import { Plus, Search, FileText, Edit2, Trash2, Eye, Globe, Calendar, Clock, Image, Video, Link, Tag, TrendingUp, Copy, Archive } from 'lucide-react'

interface Content {
  id: string
  title: string
  type: 'page' | 'blog' | 'news' | 'landing'
  slug: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  author: string
  category?: string
  tags: string[]
  publishedAt?: Date
  scheduledAt?: Date
  viewCount: number
  thumbnail?: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  published: 'bg-green-100 text-green-800 border-green-300',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
  archived: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

const statusLabels = {
  draft: '下書き',
  published: '公開中',
  scheduled: '予約済',
  archived: 'アーカイブ'
}

const typeColors = {
  page: 'bg-purple-100 text-purple-800 border-purple-300',
  blog: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  news: 'bg-pink-100 text-pink-800 border-pink-300',
  landing: 'bg-orange-100 text-orange-800 border-orange-300'
}

const typeLabels = {
  page: 'ページ',
  blog: 'ブログ',
  news: 'お知らせ',
  landing: 'LP'
}

export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // ダミーデータ
  const [contents] = useState<Content[]>([
    {
      id: '1',
      title: '2024年新卒採用特集ページ',
      type: 'landing',
      slug: 'new-graduate-2024',
      status: 'published',
      author: '田中管理者',
      category: '採用情報',
      tags: ['新卒', '2024', '採用'],
      publishedAt: new Date('2024-01-01'),
      viewCount: 5420,
      thumbnail: '/api/placeholder/300/200',
      excerpt: '2024年度の新卒採用情報をまとめた特集ページです。',
      seoTitle: '2024年新卒採用 | 採用特設サイト',
      seoDescription: '2024年度新卒採用の募集要項、選考フロー、社員インタビューなど',
      createdAt: new Date('2023-12-15'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'エンジニア転職市場の最新動向',
      type: 'blog',
      slug: 'engineer-job-market-trends',
      status: 'published',
      author: '佐藤ライター',
      category: '転職ノウハウ',
      tags: ['エンジニア', '転職', '市場動向'],
      publishedAt: new Date('2024-02-10'),
      viewCount: 3200,
      thumbnail: '/api/placeholder/300/200',
      excerpt: 'エンジニア転職市場の最新トレンドと求人動向を解説します。',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-10')
    },
    {
      id: '3',
      title: 'サイトメンテナンスのお知らせ',
      type: 'news',
      slug: 'maintenance-notice-202402',
      status: 'scheduled',
      author: 'システム管理',
      category: 'お知らせ',
      tags: ['メンテナンス', 'システム'],
      scheduledAt: new Date('2024-03-01'),
      viewCount: 0,
      excerpt: '3月1日深夜にシステムメンテナンスを実施します。',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: '4',
      title: '企業向けサービス紹介',
      type: 'page',
      slug: 'corporate-services',
      status: 'published',
      author: '営業チーム',
      category: 'サービス',
      tags: ['企業向け', 'サービス紹介'],
      publishedAt: new Date('2023-10-01'),
      viewCount: 8900,
      seoTitle: '企業向け求人掲載サービス',
      seoDescription: '効果的な求人掲載で優秀な人材を獲得',
      createdAt: new Date('2023-09-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '5',
      title: '面接対策完全ガイド',
      type: 'blog',
      slug: 'interview-preparation-guide',
      status: 'draft',
      author: 'キャリアアドバイザー',
      category: '転職ノウハウ',
      tags: ['面接', '対策', 'ガイド'],
      viewCount: 0,
      excerpt: '面接で成功するための準備と対策を詳しく解説。',
      createdAt: new Date('2024-02-18'),
      updatedAt: new Date('2024-02-18')
    },
    {
      id: '6',
      title: '2023年度採用実績レポート',
      type: 'news',
      slug: 'recruitment-report-2023',
      status: 'archived',
      author: '人事部',
      category: '採用情報',
      tags: ['採用実績', '2023', 'レポート'],
      publishedAt: new Date('2023-04-01'),
      viewCount: 1250,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2023-12-31')
    }
  ])
  
  const filteredContents = contents.filter(content => {
    const matchesSearch = searchTerm === '' || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || content.type === selectedType
    const matchesStatus = selectedStatus === 'all' || content.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })
  
  // 統計情報
  const stats = {
    total: contents.length,
    published: contents.filter(c => c.status === 'published').length,
    totalViews: contents.reduce((sum, c) => sum + c.viewCount, 0),
    drafts: contents.filter(c => c.status === 'draft').length
  }
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">コンテンツ管理</h1>
          <p className="text-sm text-gray-600 mt-1">ページ、ブログ、お知らせの管理</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新規コンテンツ作成
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総コンテンツ数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">公開中</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.published}</p>
            </div>
            <Globe className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総閲覧数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">下書き</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.drafts}</p>
            </div>
            <Edit2 className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="タイトル、内容で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのタイプ</option>
            <option value="page">ページ</option>
            <option value="blog">ブログ</option>
            <option value="news">お知らせ</option>
            <option value="landing">LP</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="draft">下書き</option>
            <option value="published">公開中</option>
            <option value="scheduled">予約済</option>
            <option value="archived">アーカイブ</option>
          </select>
        </div>
      </div>

      {/* コンテンツグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.map((content) => (
          <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {content.thumbnail && (
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                <img 
                  src={content.thumbnail} 
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${typeColors[content.type]}`}>
                  {typeLabels[content.type]}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${statusColors[content.status]}`}>
                  {statusLabels[content.status]}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">{content.title}</h3>
              
              {content.excerpt && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.excerpt}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Link className="w-3 h-3 mr-2" />
                  <span className="truncate">/{content.slug}</span>
                </div>
                {content.category && (
                  <div className="flex items-center text-gray-500">
                    <Tag className="w-3 h-3 mr-2" />
                    {content.category}
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {content.publishedAt 
                      ? content.publishedAt.toLocaleDateString('ja-JP')
                      : content.scheduledAt
                      ? `予約: ${content.scheduledAt.toLocaleDateString('ja-JP')}`
                      : '未公開'}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {content.viewCount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {content.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">by {content.author}</span>
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="プレビュー">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800" title="編集">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-800" title="複製">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="削除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredContents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">該当するコンテンツが見つかりません</p>
        </div>
      )}
    </div>
  )
}