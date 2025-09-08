'use client'

import React, { useState } from 'react'
import { Search, Calendar, Clock, Eye, ArrowRight, Tag, FileText, Newspaper, BookOpen, Megaphone, TrendingUp, Sparkles, Filter, Star, Zap, Award, Coffee, Heart, Users, MessageCircle, Bookmark, Share2, ChevronRight, Play } from 'lucide-react'

interface Content {
  id: string
  title: string
  type: 'blog' | 'news' | 'guide' | 'video' | 'podcast'
  category: string
  excerpt: string
  thumbnail?: string
  author: string
  authorAvatar?: string
  authorRole?: string
  publishedAt: Date
  readTime: number
  viewCount: number
  tags: string[]
  isFeatured?: boolean
  isNew?: boolean
  isTrending?: boolean
  likes?: number
  comments?: number
}

const typeIcons = {
  blog: '📝',
  news: '📰',
  guide: '📚',
  video: '🎥',
  podcast: '🎙️'
}

const typeLabels = {
  blog: 'ブログ',
  news: 'ニュース',
  guide: 'ガイド',
  video: 'ビデオ',
  podcast: 'ポッドキャスト'
}

export function ContentList({ onSelectContent }: { onSelectContent?: (contentId: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // ダミーデータ with real images
  const [contents] = useState<Content[]>([
    {
      id: '1',
      title: '2024年エンジニア転職市場の最新トレンド：AIとDXが変える未来',
      type: 'blog',
      category: '転職ノウハウ',
      excerpt: 'AI技術の進化とDXの推進により、エンジニア転職市場が大きく変化しています。最新トレンドと今後のキャリアパスについて、業界エキスパートが徹底解説します。',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
      author: '山田太郎',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      authorRole: 'テクノロジーライター',
      publishedAt: new Date('2024-02-15'),
      readTime: 5,
      viewCount: 3420,
      likes: 234,
      comments: 45,
      tags: ['AI', 'DX', 'キャリア'],
      isFeatured: true,
      isTrending: true
    },
    {
      id: '2',
      title: '面接で差をつける！効果的なコミュニケーション術',
      type: 'guide',
      category: '面接対策',
      excerpt: '採用面接で好印象を与えるコミュニケーション術を、心理学の観点から解説。実践的なテクニックで内定率アップを目指しましょう。',
      thumbnail: 'https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=800&h=450&fit=crop',
      author: '鈴木花子',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      authorRole: 'キャリアコンサルタント',
      publishedAt: new Date('2024-02-14'),
      readTime: 8,
      viewCount: 5678,
      likes: 456,
      comments: 78,
      tags: ['面接', '転職', '対策'],
      isFeatured: true,
      isNew: true
    },
    {
      id: '3',
      title: 'リモートワーク時代のチームビルディング',
      type: 'video',
      category: '働き方',
      excerpt: '分散型チームでも強い絆を築く方法とは？成功事例から学ぶ、リモート環境でのチームビルディングの秘訣を動画で解説します。',
      thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=450&fit=crop',
      author: '佐藤次郎',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      authorRole: 'プロダクトマネージャー',
      publishedAt: new Date('2024-02-13'),
      readTime: 15,
      viewCount: 8901,
      likes: 567,
      comments: 123,
      tags: ['リモートワーク', 'チーム', 'マネジメント'],
      isTrending: true
    },
    {
      id: '4',
      title: 'スタートアップvs大企業：あなたに合う環境は？',
      type: 'podcast',
      category: 'キャリアプラン',
      excerpt: '異なる企業文化で働いた経験を持つゲストと共に、それぞれの環境のメリット・デメリットを深掘りします。',
      thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop',
      author: '高橋美咲',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      authorRole: 'ポッドキャストホスト',
      publishedAt: new Date('2024-02-12'),
      readTime: 30,
      viewCount: 4567,
      likes: 345,
      comments: 67,
      tags: ['スタートアップ', '大企業', 'キャリア']
    },
    {
      id: '5',
      title: 'データサイエンティストへの転職完全ガイド',
      type: 'guide',
      category: 'スキルアップ',
      excerpt: '未経験からデータサイエンティストになるためのロードマップ。必要なスキルセットと学習方法を詳しく解説します。',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      author: '田中一郎',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      authorRole: 'データサイエンティスト',
      publishedAt: new Date('2024-02-10'),
      readTime: 12,
      viewCount: 7890,
      likes: 678,
      comments: 145,
      tags: ['データサイエンス', 'Python', 'キャリアチェンジ'],
      isFeatured: true
    },
    {
      id: '6',
      title: 'Web3.0時代のエンジニアに求められるスキル',
      type: 'news',
      category: 'テクノロジー',
      excerpt: 'ブロックチェーン技術の普及により、エンジニアに求められるスキルが変化。最新の業界動向をお伝えします。',
      thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
      author: '中村真理',
      authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
      authorRole: 'テックジャーナリスト',
      publishedAt: new Date('2024-02-08'),
      readTime: 6,
      viewCount: 3456,
      likes: 234,
      comments: 56,
      tags: ['Web3', 'ブロックチェーン', 'スキル'],
      isNew: true
    },
    {
      id: '7',
      title: '効率的な転職活動のスケジューリング術',
      type: 'blog',
      category: '転職ノウハウ',
      excerpt: '働きながら転職活動を成功させるための時間管理術。効率的なスケジューリングで理想の転職を実現しましょう。',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
      author: '渡辺健太',
      authorAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop',
      authorRole: 'キャリアアドバイザー',
      publishedAt: new Date('2024-02-07'),
      readTime: 7,
      viewCount: 2345,
      likes: 178,
      comments: 34,
      tags: ['転職活動', '時間管理', 'ノウハウ']
    },
    {
      id: '8',
      title: 'エンジニアのためのポートフォリオ作成講座',
      type: 'video',
      category: 'スキルアップ',
      excerpt: '採用担当者の目を引くポートフォリオの作り方を実演。GitHubの活用法から効果的なプレゼンテーションまで。',
      thumbnail: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop',
      author: '伊藤陽子',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      authorRole: 'フロントエンドエンジニア',
      publishedAt: new Date('2024-02-05'),
      readTime: 20,
      viewCount: 5678,
      likes: 456,
      comments: 89,
      tags: ['ポートフォリオ', 'GitHub', 'スキル'],
      isTrending: true
    }
  ])
  
  const filteredContents = contents.filter(content => {
    const matchesSearch = searchTerm === '' || 
      content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || content.type === selectedType
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory
    
    return matchesSearch && matchesType && matchesCategory
  })
  
  // カテゴリー一覧を取得
  const categories = Array.from(new Set(contents.map(c => c.category)))
  
  // 注目記事（Featured）
  const featuredContents = contents.filter(c => c.isFeatured).slice(0, 3)
  
  // トレンド記事
  const trendingContents = contents.filter(c => c.isTrending).slice(0, 4)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative h-[500px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=800&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center items-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium text-white">毎日更新！転職成功のヒント</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Knowledge Hub
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              キャリアアップを実現するための最新情報とノウハウをお届け
            </p>
            
            {/* Search Bar with Glassmorphism */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="記事を検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                    />
                    <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    フィルター
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const gradients = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-red-500',
              'from-indigo-500 to-purple-500',
              'from-yellow-500 to-orange-500'
            ]
            const emojis = ['💼', '🎯', '💡', '📊', '🚀', '⚡']
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
                  selectedCategory === category ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${gradients[index]} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                  <span className="text-2xl">{emojis[index]}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{category}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {contents.filter(c => c.category === category).length}件
                </p>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">すべてのタイプ</option>
                <option value="blog">📝 ブログ</option>
                <option value="news">📰 ニュース</option>
                <option value="guide">📚 ガイド</option>
                <option value="video">🎥 ビデオ</option>
                <option value="podcast">🎙️ ポッドキャスト</option>
              </select>
              
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors"
              >
                カテゴリーをリセット
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Articles */}
        {featuredContents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">注目の記事</h2>
                  <p className="text-gray-600 text-sm mt-1">編集部が厳選した必読コンテンツ</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                すべて見る
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Featured Article */}
              <div className="lg:col-span-2">
                {featuredContents[0] && (
                  <div 
                    onClick={() => onSelectContent?.(featuredContents[0].id)}
                    className="group relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={featuredContents[0].thumbnail} 
                        alt={featuredContents[0].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                            FEATURED
                          </span>
                          <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-medium rounded-full">
                            {typeIcons[featuredContents[0].type]} {typeLabels[featuredContents[0].type]}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {featuredContents[0].title}
                        </h3>
                        <p className="text-white/90 line-clamp-2">
                          {featuredContents[0].excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img 
                            src={featuredContents[0].authorAvatar} 
                            alt={featuredContents[0].author}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{featuredContents[0].author}</p>
                            <p className="text-xs text-gray-500">{featuredContents[0].authorRole}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {featuredContents[0].viewCount?.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {featuredContents[0].likes?.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {featuredContents[0].comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Side Featured Articles */}
              <div className="space-y-6">
                {featuredContents.slice(1, 3).map((content) => (
                  <div 
                    key={content.id}
                    onClick={() => onSelectContent?.(content.id)}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={content.thumbnail} 
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium rounded-full">
                          {typeIcons[content.type]}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {content.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {content.readTime}分
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {content.viewCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Trending Section */}
        {trendingContents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">トレンド</h2>
                  <p className="text-gray-600 text-sm mt-1">今最も読まれている記事</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingContents.map((content, index) => (
                <div 
                  key={content.id}
                  onClick={() => onSelectContent?.(content.id)}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    {content.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 text-gray-900 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-red-600">
                        {content.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {content.readTime}分で読める
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-3">
                      {content.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={content.authorAvatar} 
                          alt={content.author}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-xs text-gray-600">{content.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {(content.viewCount / 1000).toFixed(1)}K
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* All Articles Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">すべての記事</h2>
                <p className="text-gray-600 text-sm mt-1">{filteredContents.length}件の記事</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContents.map((content) => (
              <article 
                key={content.id} 
                onClick={() => onSelectContent?.(content.id)}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img 
                    src={content.thumbnail} 
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {content.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/60 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  )}
                  {content.isNew && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        NEW
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{typeIcons[content.type]}</span>
                    <span className="text-sm font-medium text-gray-600">{content.category}</span>
                    {content.isTrending && (
                      <span className="ml-auto">
                        <Zap className="w-4 h-4 text-orange-500" />
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {content.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {content.excerpt}
                  </p>
                  
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <img 
                        src={content.authorAvatar} 
                        alt={content.author}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{content.author}</p>
                        <p className="text-xs text-gray-500">
                          {content.publishedAt.toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-500 transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        
        {filteredContents.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">該当するコンテンツが見つかりません</h3>
            <p className="text-gray-600">検索条件を変更してお試しください</p>
          </div>
        )}
      </div>
    </div>
  )
}