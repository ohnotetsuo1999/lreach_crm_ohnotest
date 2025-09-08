'use client'

import React, { useState } from 'react'
import { Search, MapPin, Briefcase, DollarSign, Clock, Calendar, ArrowRight, Building2, TrendingUp, Sparkles, Star, Users, CheckCircle, ChevronRight, Globe, Zap, Award, Coffee, Target, Rocket, Heart, BookOpen } from 'lucide-react'

interface FeaturedJob {
  id: string
  company: string
  companyLogo: string
  companyImage: string
  title: string
  description: string
  location: string
  salary: string
  employmentType: string
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
  isRemote?: boolean
  category: string
  viewCount: number
}

export function JobPortalTop({ onViewAll, onSelectJob }: { onViewAll: () => void; onSelectJob?: (jobId: string) => void }) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  
  // Featured jobs data
  const featuredJobs: FeaturedJob[] = [
    {
      id: '1',
      company: 'テックイノベーション株式会社',
      companyLogo: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
      title: 'フロントエンドエンジニア',
      description: '最新のReact/TypeScriptを使用した自社プロダクト開発。フルリモート可能で、技術力を磨ける環境です。',
      location: 'フルリモート',
      salary: '500〜800',
      employmentType: '正社員',
      tags: ['React', 'TypeScript', 'フルリモート', 'フレックス'],
      isFeatured: true,
      isRemote: true,
      category: 'エンジニア',
      viewCount: 15234
    },
    {
      id: '2',
      company: 'グローバルコンサルティング',
      companyLogo: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop',
      title: '経営コンサルタント',
      description: '大手企業の経営課題解決から、スタートアップの成長支援まで幅広いプロジェクトに携わることができます。',
      location: '東京都千代田区',
      salary: '700〜1200',
      employmentType: '正社員',
      tags: ['高年収', 'MBA歓迎', '成長企業'],
      isFeatured: true,
      category: 'コンサルタント',
      viewCount: 8976
    },
    {
      id: '3',
      company: 'AIスタートアップ',
      companyLogo: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=100&h=100&fit=crop',
      companyImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
      title: '機械学習エンジニア',
      description: '最先端のAI技術を活用した新規事業開発。論文実装から本番環境への導入まで一貫して担当。',
      location: '東京都渋谷区',
      salary: '600〜1000',
      employmentType: '正社員',
      tags: ['AI/ML', 'Python', '研究開発'],
      isNew: true,
      isFeatured: true,
      category: 'エンジニア',
      viewCount: 12456
    }
  ]
  
  const categories = [
    { icon: '💻', label: 'エンジニア', count: 2843, gradient: 'from-blue-500 to-cyan-500' },
    { icon: '📊', label: 'マーケティング', count: 1256, gradient: 'from-purple-500 to-pink-500' },
    { icon: '💼', label: '営業', count: 1892, gradient: 'from-orange-500 to-red-500' },
    { icon: '🎨', label: 'デザイナー', count: 743, gradient: 'from-green-500 to-emerald-500' },
    { icon: '📈', label: 'コンサルタント', count: 567, gradient: 'from-indigo-500 to-purple-500' },
    { icon: '🏢', label: '事務・管理', count: 1435, gradient: 'from-yellow-500 to-orange-500' }
  ]
  
  const stats = [
    { label: '掲載求人数', value: '15,234', icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: '登録企業数', value: '3,456', icon: Building2, color: 'from-purple-500 to-pink-500' },
    { label: '転職成功者', value: '8,901', icon: Users, color: 'from-green-500 to-emerald-500' },
    { label: '平均年収UP', value: '23%', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
  ]
  
  const handleSearch = () => {
    // Implement search functionality
    onViewAll()
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-40 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-40 left-40 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
          <div className="absolute bottom-20 right-20 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-300"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center items-center px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium text-white">あなたの理想のキャリアがここに</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              次のステージへ、
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                一歩踏み出そう
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              15,000件以上の求人から、あなたにぴったりの仕事を見つけよう。
              AI技術で最適なマッチングを実現します。
            </p>
            
            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 max-w-4xl mx-auto border border-white/20">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="職種、スキル、会社名で検索"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                  <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                </div>
                <div className="md:w-72 relative">
                  <input
                    type="text"
                    placeholder="勤務地（例：東京都）"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                  <MapPin className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                </div>
                <button 
                  onClick={handleSearch}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  求人を検索
                </button>
              </div>
            </div>
            
            {/* Quick Search Tags */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-white/80 text-sm">人気の検索:</span>
              {['リモートワーク', 'フレックスタイム', '未経験OK', '高年収', 'AI/機械学習'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30 hover:bg-white/30 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">職種から探す</h2>
          <p className="text-gray-600">あなたの専門分野から最適な求人を見つけましょう</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <p className="font-medium text-gray-900 mb-1">{category.label}</p>
              <p className="text-sm text-gray-500">{category.count.toLocaleString()}件</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Featured Jobs */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">注目の求人</h2>
              <p className="text-gray-600">編集部が厳選した、今週のおすすめ求人</p>
            </div>
            <button 
              onClick={onViewAll}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium text-gray-700 hover:text-orange-600"
            >
              すべての求人を見る
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob?.(job.id)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Company Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={job.companyImage} 
                    alt={job.company}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {job.isFeatured && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        FEATURED
                      </span>
                    )}
                    {job.isNew && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  {/* Company Logo */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <img 
                      src={job.companyLogo} 
                      alt={job.company}
                      className="w-12 h-12 bg-white rounded-xl p-1 shadow-lg"
                    />
                    <div className="text-white">
                      <p className="font-bold">{job.company}</p>
                      <p className="text-sm text-white/80">{job.category}</p>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {job.isRemote && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        リモート
                      </span>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-orange-600">{job.salary}万円</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">転職成功までの3ステップ</h2>
            <p className="text-gray-600">簡単3ステップで理想の仕事を見つけよう</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. 求人を検索</h3>
              <p className="text-gray-600">条件を指定して、15,000件以上の求人から最適な仕事を探す</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. マッチング</h3>
              <p className="text-gray-600">AIが分析してあなたに最適な求人を提案</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. 応募・内定</h3>
              <p className="text-gray-600">簡単応募で、理想のキャリアを実現</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今すぐ転職活動を始めよう
          </h2>
          <p className="text-xl text-white/90 mb-8">
            無料会員登録で、すべての機能が利用可能。あなたの理想のキャリアが待っています。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onViewAll}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              求人を探す
            </button>
            <button className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              無料会員登録
            </button>
          </div>
        </div>
      </div>
      
      {/* Trust Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-gray-600 font-medium">導入企業</span>
            <div className="flex flex-wrap items-center gap-8">
              {['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta'].map((company) => (
                <span key={company} className="text-xl font-bold text-gray-400">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}