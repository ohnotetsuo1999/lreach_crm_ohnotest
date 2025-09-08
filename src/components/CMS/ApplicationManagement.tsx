'use client'

import React, { useState } from 'react'
import { Search, Filter, Download, Eye, Mail, Phone, Calendar, FileText, CheckCircle, XCircle, Clock, MessageSquare, Star, Briefcase, User } from 'lucide-react'

interface Application {
  id: string
  jobTitle: string
  companyName: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  appliedAt: Date
  status: 'new' | 'reviewing' | 'interviewed' | 'offered' | 'accepted' | 'rejected'
  resumeUrl?: string
  coverLetter?: string
  experience: string
  education: string
  expectedSalary?: string
  availableFrom?: Date
  notes?: string
  rating?: number
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-300',
  reviewing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  interviewed: 'bg-purple-100 text-purple-800 border-purple-300',
  offered: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  accepted: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300'
}

const statusLabels = {
  new: '新規',
  reviewing: '選考中',
  interviewed: '面接済',
  offered: 'オファー',
  accepted: '採用',
  rejected: '不採用'
}

export function ApplicationManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  
  // ダミーデータ
  const [applications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'フロントエンドエンジニア',
      companyName: '株式会社テックイノベーション',
      applicantName: '田中太郎',
      applicantEmail: 'tanaka@example.com',
      applicantPhone: '090-1234-5678',
      appliedAt: new Date('2024-02-15'),
      status: 'interviewed',
      resumeUrl: '/resumes/tanaka_taro.pdf',
      coverLetter: 'React/Next.jsの開発経験が5年あり、チーム開発の経験も豊富です。',
      experience: '5年',
      education: '情報工学部卒',
      expectedSalary: '600万円〜',
      availableFrom: new Date('2024-04-01'),
      rating: 4
    },
    {
      id: '2',
      jobTitle: '営業マネージャー',
      companyName: '成長株式会社',
      applicantName: '佐藤花子',
      applicantEmail: 'sato@example.com',
      applicantPhone: '080-9876-5432',
      appliedAt: new Date('2024-02-14'),
      status: 'offered',
      resumeUrl: '/resumes/sato_hanako.pdf',
      experience: '8年',
      education: '経営学部卒',
      expectedSalary: '800万円〜',
      notes: '営業実績が非常に優秀',
      rating: 5
    },
    {
      id: '3',
      jobTitle: 'データサイエンティスト',
      companyName: 'AI総研株式会社',
      applicantName: '鈴木一郎',
      applicantEmail: 'suzuki@example.com',
      appliedAt: new Date('2024-02-13'),
      status: 'reviewing',
      resumeUrl: '/resumes/suzuki_ichiro.pdf',
      coverLetter: '機械学習モデルの開発経験があり、Python/TensorFlowを使用したプロジェクトに携わってきました。',
      experience: '3年',
      education: '理学部数学科卒',
      expectedSalary: '700万円〜'
    },
    {
      id: '4',
      jobTitle: 'カスタマーサポート',
      companyName: 'サービス向上株式会社',
      applicantName: '山田美咲',
      applicantEmail: 'yamada@example.com',
      appliedAt: new Date('2024-02-12'),
      status: 'new',
      experience: '2年',
      education: '文学部卒'
    },
    {
      id: '5',
      jobTitle: 'Webデザイナー',
      companyName: 'クリエイティブデザイン株式会社',
      applicantName: '高橋健太',
      applicantEmail: 'takahashi@example.com',
      appliedAt: new Date('2024-02-10'),
      status: 'rejected',
      resumeUrl: '/resumes/takahashi_kenta.pdf',
      experience: '1年',
      education: 'デザイン専門学校卒',
      notes: '経験不足のため今回は見送り'
    },
    {
      id: '6',
      jobTitle: 'フロントエンドエンジニア',
      companyName: '株式会社テックイノベーション',
      applicantName: '伊藤真由美',
      applicantEmail: 'ito@example.com',
      appliedAt: new Date('2024-02-16'),
      status: 'new',
      resumeUrl: '/resumes/ito_mayumi.pdf',
      experience: '4年',
      education: '工学部卒',
      expectedSalary: '550万円〜'
    },
    {
      id: '7',
      jobTitle: 'データサイエンティスト',
      companyName: 'AI総研株式会社',
      applicantName: '中村勇太',
      applicantEmail: 'nakamura@example.com',
      appliedAt: new Date('2024-02-17'),
      status: 'accepted',
      resumeUrl: '/resumes/nakamura_yuta.pdf',
      experience: '6年',
      education: '情報科学研究科修士',
      expectedSalary: '900万円〜',
      rating: 5,
      notes: '即戦力として期待'
    }
  ])
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    const matchesJob = selectedJob === 'all' || app.jobTitle === selectedJob
    
    return matchesSearch && matchesStatus && matchesJob
  })
  
  // 統計情報の計算
  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length
  }
  
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">応募管理</h1>
          <p className="text-sm text-gray-600 mt-1">求人応募者の選考状況管理</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700">
          <Download className="w-4 h-4 mr-2" />
          CSVエクスポート
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総応募数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">新規応募</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.new}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">選考中</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.reviewing}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">採用決定</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="応募者名、メールアドレス、求人で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="new">新規</option>
            <option value="reviewing">選考中</option>
            <option value="interviewed">面接済</option>
            <option value="offered">オファー</option>
            <option value="accepted">採用</option>
            <option value="rejected">不採用</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全期間</option>
            <option value="today">今日</option>
            <option value="week">今週</option>
            <option value="month">今月</option>
          </select>
        </div>
      </div>

      {/* 応募リスト */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  求人/企業
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  応募日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  評価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.applicantName}</div>
                      <div className="text-sm text-gray-500">{app.applicantEmail}</div>
                      {app.applicantPhone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {app.applicantPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{app.jobTitle}</div>
                      <div className="text-sm text-gray-500">{app.companyName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {app.experience} • {app.education}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {app.appliedAt.toLocaleDateString('ja-JP')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.floor((new Date().getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24))}日前
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.rating ? (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (app.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">未評価</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="詳細">
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.resumeUrl && (
                        <button className="text-gray-600 hover:text-gray-800" title="履歴書">
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-green-600 hover:text-green-800" title="メール">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-800" title="メモ">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する応募が見つかりません</p>
          </div>
        )}
      </div>
    </div>
  )
}