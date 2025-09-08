'use client'

import React, { useState } from 'react'
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Calendar, Building2, Users, Heart, Share2, BookmarkPlus, CheckCircle, Globe, Mail, Phone, Award, TrendingUp, Home, Coffee, Zap, Users2, Star, Shield, Target, Sparkles, ArrowRight, Eye } from 'lucide-react'

interface JobDetail {
  id: string
  title: string
  company: string
  companyLogo?: string
  companyDescription: string
  companyWebsite?: string
  companySize: string
  companyIndustry: string
  companyFounded: string
  location: string
  employmentType: string
  salary: string
  experience: string
  description: string
  responsibilities: string[]
  requirements: string[]
  preferredQualifications: string[]
  benefits: string[]
  workEnvironment: string
  teamSize: string
  reportingTo: string
  interviewProcess: string[]
  postedAt: Date
  deadline?: Date
  viewCount: number
  applyCount: number
  isFeatured?: boolean
  isBookmarked?: boolean
  remotePossible?: boolean
  flexTime?: boolean
  matchScore?: number
}

interface RelatedJob {
  id: string
  title: string
  company: string
  location: string
  salary: string
  companyLogo?: string
}

export function JobDetail({ jobId, onBack }: { jobId: string; onBack: () => void }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  // ダミーデータ（実際はjobIdでフェッチ）
  const job: JobDetail = {
    id: jobId,
    title: 'フロントエンドエンジニア',
    company: '株式会社テックイノベーション',
    companyLogo: '/api/placeholder/100/100',
    companyDescription: '私たちは最先端のテクノロジーを活用し、革新的なWebソリューションを提供する企業です。2015年の創業以来、多くのクライアント企業のデジタルトランスフォーメーションを支援してきました。',
    companyWebsite: 'https://techinnovation.example.com',
    companySize: '100-500名',
    companyIndustry: 'IT・ソフトウェア',
    companyFounded: '2015年',
    location: '東京都渋谷区渋谷1-1-1 渋谷ビル10F',
    employmentType: '正社員',
    salary: '500万円〜800万円',
    experience: '3年以上',
    description: 'React/Next.jsを使用した大規模Webアプリケーションの開発をリードしていただきます。最新の技術スタックを活用し、ユーザー体験を重視したプロダクト開発に携わることができます。',
    responsibilities: [
      'React/Next.jsを使用したフロントエンド開発',
      'UIコンポーネントの設計・実装',
      'パフォーマンス最適化とアクセシビリティの改善',
      'コードレビューとジュニアメンバーのメンタリング',
      'プロダクトマネージャー、デザイナーとの協業',
      'テスト戦略の立案と実装'
    ],
    requirements: [
      'React/Next.jsの実務経験3年以上',
      'TypeScriptの使用経験',
      'REST API/GraphQLの理解',
      'Git/GitHubを使用したチーム開発経験',
      'HTML/CSS/JavaScriptの深い理解',
      'レスポンシブデザインの実装経験'
    ],
    preferredQualifications: [
      'テスティングフレームワーク（Jest、React Testing Library）の使用経験',
      'CI/CDパイプラインの構築経験',
      'アジャイル開発の経験',
      'OSSへの貢献経験',
      'テックブログなどでの技術発信経験'
    ],
    benefits: [
      'リモートワーク可（週3日まで）',
      'フレックスタイム制',
      '社会保険完備',
      '交通費全額支給',
      '書籍購入支援（月1万円まで）',
      '外部研修・カンファレンス参加支援',
      'Mac/Windows選択可',
      '最新デバイス支給',
      '健康診断年2回',
      'ストックオプション制度あり'
    ],
    workEnvironment: 'オープンなオフィス環境で、エンジニア同士のコミュニケーションを重視しています。定期的な勉強会やハッカソンも開催しており、技術的な成長を支援する環境が整っています。',
    teamSize: '15名（フロントエンド5名、バックエンド8名、インフラ2名）',
    reportingTo: 'エンジニアリングマネージャー',
    interviewProcess: [
      '書類選考',
      'コーディングテスト（オンライン）',
      '1次面接（エンジニア面接）',
      '2次面接（役員面接）',
      '最終面接（代表面接）'
    ],
    postedAt: new Date('2024-02-15'),
    deadline: new Date('2024-03-31'),
    viewCount: 342,
    applyCount: 28,
    isFeatured: true,
    isBookmarked: false,
    remotePossible: true,
    flexTime: true,
    matchScore: 95
  }
  
  const relatedJobs: RelatedJob[] = [
    {
      id: '2',
      title: 'バックエンドエンジニア',
      company: '株式会社テックイノベーション',
      location: '東京都渋谷区',
      salary: '550万円〜850万円',
      companyLogo: '/api/placeholder/60/60'
    },
    {
      id: '3',
      title: 'フロントエンドエンジニア',
      company: 'Web制作会社A',
      location: '東京都港区',
      salary: '450万円〜700万円'
    },
    {
      id: '4',
      title: 'フルスタックエンジニア',
      company: 'スタートアップB',
      location: '東京都渋谷区',
      salary: '600万円〜900万円'
    }
  ]
  
  const benefitIcons: Record<string, any> = {
    'リモートワーク': Home,
    'フレックスタイム': Clock,
    '社会保険': Shield,
    '交通費': TrendingUp,
    '書籍購入': Award,
    '研修': Users2,
    'デバイス': Zap,
    '健康診断': Coffee,
    'ストックオプション': Target
  }
  
  const getBenefitIcon = (benefit: string) => {
    for (const [key, icon] of Object.entries(benefitIcons)) {
      if (benefit.includes(key)) return icon
    }
    return CheckCircle
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* ヘッダー */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            求人一覧に戻る
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-20 h-20 rounded-2xl bg-white p-2 shadow-xl" />
              ) : (
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white/80" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {job.isFeatured && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                      <Sparkles className="w-3 h-3 mr-1" />
                      おすすめ
                    </span>
                  )}
                  {job.matchScore && job.matchScore >= 80 && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                      マッチ度 {job.matchScore}%
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <p className="text-xl text-white/90 mb-4">{job.company}</p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location.split(' ')[0]}
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {job.salary}
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {job.employmentType}
                  </div>
                  <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    {job.experience}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl backdrop-blur-sm transition-all ${
                  isBookmarked ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 統計バー */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <span className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                投稿: {job.postedAt.toLocaleDateString('ja-JP')}
              </span>
              <span className="flex items-center text-gray-600">
                <Eye className="w-4 h-4 mr-2 text-gray-400" />
                {job.viewCount.toLocaleString()} 回閲覧
              </span>
              <span className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                {job.applyCount} 人が応募
              </span>
              {job.deadline && (
                <span className="flex items-center text-red-600 font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  締切: {job.deadline.toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {job.remotePossible && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  リモート可
                </span>
              )}
              {job.flexTime && (
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  フレックス
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 仕事内容 */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">仕事内容</h2>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{job.description}</p>
              
              <h3 className="font-bold text-gray-900 mb-4 text-lg">主な業務内容</h3>
              <div className="space-y-3">
                {job.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700 flex-1">{resp}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 応募資格 */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">応募資格</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    必須条件
                  </h3>
                  <div className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                        <span className="text-gray-700 text-sm flex-1">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    歓迎条件
                  </h3>
                  <div className="space-y-3">
                    {job.preferredQualifications.map((qual, index) => (
                      <div key={index} className="flex items-start">
                        <Star className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700 text-sm flex-1">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 福利厚生 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-sm p-8 border border-orange-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">福利厚生・待遇</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.benefits.map((benefit, index) => {
                  const Icon = getBenefitIcon(benefit)
                  return (
                    <div key={index} className="flex items-center p-3 bg-white rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* 職場環境 */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">職場環境・チーム</h2>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{job.workEnvironment}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">チーム規模</h3>
                  <p className="text-gray-700">{job.teamSize}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">レポート先</h3>
                  <p className="text-gray-700">{job.reportingTo}</p>
                </div>
              </div>
            </div>
            
            {/* 選考プロセス */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">選考プロセス</h2>
              </div>
              
              <div className="relative">
                <div className="absolute left-7 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {job.interviewProcess.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center mr-4 ${
                        index === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gray-100'
                      }`}>
                        <span className={`text-lg font-bold ${index === 0 ? 'text-white' : 'text-gray-600'}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="font-semibold text-gray-900">{step}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* サイドバー */}
          <div className="space-y-6">
            {/* 応募ボタン */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <button 
                onClick={() => setShowApplicationForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                この求人に応募する
              </button>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>簡単3分で応募完了</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="w-5 h-5 text-yellow-500 mr-3" />
                  <span>24時間以内に返信</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-500 mr-3" />
                  <span>個人情報は厳重に保護</span>
                </div>
              </div>
            </div>
            
            {/* 企業情報 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">企業情報</h3>
              
              <div className="mb-4">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-xl mb-3" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <h4 className="font-bold text-gray-900 mb-2">{job.company}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{job.companyDescription}</p>
              </div>
              
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">業界</dt>
                  <dd className="text-sm font-medium text-gray-900">{job.companyIndustry}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">従業員数</dt>
                  <dd className="text-sm font-medium text-gray-900">{job.companySize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">設立</dt>
                  <dd className="text-sm font-medium text-gray-900">{job.companyFounded}</dd>
                </div>
              </dl>
              
              {job.companyWebsite && (
                <a 
                  href={job.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  企業サイトを見る
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
            
            {/* 勤務地 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">勤務地</h3>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-medium">{job.location}</p>
                  {job.remotePossible && (
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      ✓ リモートワーク可能
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 関連する求人 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">関連する求人</h3>
              <div className="space-y-4">
                {relatedJobs.map((relatedJob) => (
                  <div key={relatedJob.id} className="group cursor-pointer">
                    <div className="p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600">
                        {relatedJob.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">{relatedJob.company}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{relatedJob.location}</span>
                        <span className="font-medium text-gray-700">{relatedJob.salary}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}