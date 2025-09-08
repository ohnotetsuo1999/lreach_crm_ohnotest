'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Phone,
  Mail,
  MessageCircle,
  Users,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  XCircle,
  Eye,
  FileText,
  Upload
} from 'lucide-react'
import { UnifiedDetailModal } from '@/components/shared/UnifiedDetailModal'

// 求職者の型定義
interface JobSeeker {
  id: number
  name: string
  nameKana: string
  email: string
  phone: string
  address: string
  age: number
  gender: string
  currentPosition: string
  desiredPosition: string
  skills: string[]
  experience: string
  education: string
  desiredSalary: string
  workLocation: string
  source: string
  lineStatus: string
  registeredDate: string
  lastContact: string
  memo: string
}

// CRM求職者管理コンポーネント
export function JobSeekerManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedLineStatus, setSelectedLineStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedJobSeeker, setSelectedJobSeeker] = useState<JobSeeker | null>(null)
  const [detailTab, setDetailTab] = useState<'info' | 'resume' | 'cv' | 'selection'>('info')
  const [showAddJobSeeker, setShowAddJobSeeker] = useState(false)
  const [newJobSeeker, setNewJobSeeker] = useState<Partial<JobSeeker>>({
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    address: '',
    age: 0,
    gender: '',
    currentPosition: '',
    desiredPosition: '',
    skills: [],
    experience: '',
    education: '',
    desiredSalary: '',
    workLocation: '',
    source: 'direct',
    lineStatus: '未連携',
    memo: ''
  })
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null)
  
  const itemsPerPage = 10

  // Handle PDF upload and auto-fill
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setUploadedPdf(file)
      
      // Simulate PDF parsing and auto-fill (in real app, this would use a PDF parsing library)
      setTimeout(() => {
        setNewJobSeeker(prev => ({
          ...prev,
          name: '山田 太郎',
          nameKana: 'ヤマダ タロウ',
          email: 'yamada@example.com',
          phone: '090-9876-5432',
          address: '東京都港区六本木1-1-1',
          age: 32,
          gender: '男性',
          currentPosition: 'シニアエンジニア',
          desiredPosition: 'テックリード',
          skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
          experience: '10年',
          education: '工学部情報工学科卒',
          desiredSalary: '800-1000万円',
          workLocation: '東京都・リモート可'
        }))
        alert('PDFから情報を読み取りました')
      }, 1000)
    }
  }

  // 仮データ
  const jobSeekers: JobSeeker[] = [
    {
      id: 1,
      name: '佐藤 花子',
      nameKana: 'サトウ ハナコ',
      email: 'sato.hanako@example.com',
      phone: '090-1234-5678',
      address: '東京都渋谷区渋谷2-15-1',
      age: 28,
      gender: '女性',
      currentPosition: 'Webデザイナー',
      desiredPosition: 'フロントエンドエンジニア',
      skills: ['React', 'TypeScript', 'CSS', 'Figma'],
      experience: '5年',
      education: '情報系大学卒',
      desiredSalary: '500-700万円',
      workLocation: '東京都',
      source: 'LP',
      lineStatus: '連携済み',
      registeredDate: '2024-12-01',
      lastContact: '2024-12-15',
      memo: 'React経験豊富。即戦力として期待できる。'
    },
    {
      id: 2,
      name: '鈴木 一郎',
      nameKana: 'スズキ イチロウ',
      email: 'suzuki.ichiro@example.com',
      phone: '090-2345-6789',
      address: '神奈川県横浜市西区みなとみらい3-6-1',
      age: 35,
      gender: '男性',
      currentPosition: '営業マネージャー',
      desiredPosition: '営業部長',
      skills: ['B2B営業', 'マネジメント', 'SaaS', '新規開拓'],
      experience: '12年',
      education: '経営学部卒',
      desiredSalary: '800-1000万円',
      workLocation: '東京都、神奈川県',
      source: '広告',
      lineStatus: '連携済み',
      registeredDate: '2024-11-20',
      lastContact: '2024-12-10',
      memo: 'SaaS営業経験が豊富。チームマネジメント経験あり。'
    },
    {
      id: 3,
      name: '高橋 美咲',
      nameKana: 'タカハシ ミサキ',
      email: 'takahashi.misaki@example.com',
      phone: '090-3456-7890',
      address: '東京都港区六本木5-1-3',
      age: 26,
      gender: '女性',
      currentPosition: 'データアナリスト',
      desiredPosition: 'データサイエンティスト',
      skills: ['Python', 'SQL', 'Tableau', '機械学習'],
      experience: '3年',
      education: '統計学修士',
      desiredSalary: '550-750万円',
      workLocation: '東京都、リモート可',
      source: 'オーガニック',
      lineStatus: '未連携',
      registeredDate: '2024-12-05',
      lastContact: '2024-12-14',
      memo: '統計学のバックグラウンドが強い。Python経験3年。'
    },
    {
      id: 4,
      name: '山田 太郎',
      nameKana: 'ヤマダ タロウ',
      email: 'yamada.taro@example.com',
      phone: '090-4567-8901',
      address: '東京都千代田区大手町1-5-1',
      age: 42,
      gender: '男性',
      currentPosition: 'プロジェクトマネージャー',
      desiredPosition: 'ITコンサルタント',
      skills: ['PM', 'アジャイル', 'AWS', 'プリセールス'],
      experience: '18年',
      education: '工学部卒',
      desiredSalary: '900-1200万円',
      workLocation: '東京都',
      source: 'リファラル',
      lineStatus: '連携済み',
      registeredDate: '2024-11-15',
      lastContact: '2024-12-12',
      memo: '大規模プロジェクトの経験豊富。AWS認定資格保有。'
    },
    {
      id: 5,
      name: '田中 美穂',
      nameKana: 'タナカ ミホ',
      email: 'tanaka.miho@example.com',
      phone: '090-5678-9012',
      address: '東京都新宿区西新宿2-8-1',
      age: 30,
      gender: '女性',
      currentPosition: 'プロダクトマネージャー',
      desiredPosition: 'プロダクトオーナー',
      skills: ['プロダクト戦略', 'UI/UX', 'アジャイル', 'SQL'],
      experience: '7年',
      education: 'MBA',
      desiredSalary: '700-900万円',
      workLocation: '東京都、リモート可',
      source: 'SNS',
      lineStatus: '連携済み',
      registeredDate: '2024-12-08',
      lastContact: '2024-12-16',
      memo: 'toC向けプロダクトの経験が豊富。MBA保有。'
    },
    {
      id: 6,
      name: '伊藤 健太',
      nameKana: 'イトウ ケンタ',
      email: 'ito.kenta@example.com',
      phone: '090-6789-0123',
      address: '東京都品川区大崎1-11-2',
      age: 33,
      gender: '男性',
      currentPosition: 'バックエンドエンジニア',
      desiredPosition: 'テックリード',
      skills: ['Go', 'Python', 'Kubernetes', 'マイクロサービス'],
      experience: '10年',
      education: '情報工学修士',
      desiredSalary: '800-1000万円',
      workLocation: '東京都、フルリモート可',
      source: 'QR',
      lineStatus: 'ブロック',
      registeredDate: '2024-11-25',
      lastContact: '2024-12-05',
      memo: 'マイクロサービスアーキテクチャの設計経験あり。'
    },
    {
      id: 7,
      name: '渡辺 さくら',
      nameKana: 'ワタナベ サクラ',
      email: 'watanabe.sakura@example.com',
      phone: '090-7890-1234',
      address: '東京都世田谷区玉川1-14-1',
      age: 24,
      gender: '女性',
      currentPosition: '新卒',
      desiredPosition: 'Webエンジニア',
      skills: ['JavaScript', 'React', 'Node.js', 'Git'],
      experience: '0年（新卒）',
      education: '情報系大学卒（2024年3月）',
      desiredSalary: '350-450万円',
      workLocation: '東京都、神奈川県',
      source: 'LP',
      lineStatus: '未連携',
      registeredDate: '2024-12-10',
      lastContact: '2024-12-17',
      memo: '学生時代にインターン経験あり。成長意欲が高い。'
    },
    {
      id: 8,
      name: '小林 大輔',
      nameKana: 'コバヤシ ダイスケ',
      email: 'kobayashi.daisuke@example.com',
      phone: '090-8901-2345',
      address: '東京都中央区日本橋2-3-4',
      age: 38,
      gender: '男性',
      currentPosition: 'インフラエンジニア',
      desiredPosition: 'SRE',
      skills: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
      experience: '15年',
      education: '工学部卒',
      desiredSalary: '750-950万円',
      workLocation: '東京都、埼玉県',
      source: '広告',
      lineStatus: '連携済み',
      registeredDate: '2024-12-03',
      lastContact: '2024-12-18',
      memo: 'AWS認定ソリューションアーキテクト保有。DevOps経験豊富。'
    },
    {
      id: 9,
      name: '中村 愛',
      nameKana: 'ナカムラ アイ',
      email: 'nakamura.ai@example.com',
      phone: '090-9012-3456',
      address: '東京都文京区本郷7-3-1',
      age: 29,
      gender: '女性',
      currentPosition: 'カスタマーサクセス',
      desiredPosition: 'カスタマーサクセスマネージャー',
      skills: ['顧客対応', 'データ分析', 'CRM', 'プレゼンテーション'],
      experience: '6年',
      education: '文学部卒',
      desiredSalary: '600-800万円',
      workLocation: '東京都',
      source: 'ダイレクト',
      lineStatus: '連携済み',
      registeredDate: '2024-12-11',
      lastContact: '2024-12-19',
      memo: 'BtoBのカスタマーサクセス経験豊富。顧客満足度向上に実績あり。'
    },
    {
      id: 10,
      name: '斎藤 健',
      nameKana: 'サイトウ ケン',
      email: 'saito.ken@example.com',
      phone: '090-0123-4567',
      address: '東京都豊島区南池袋1-28-1',
      age: 31,
      gender: '男性',
      currentPosition: 'UIデザイナー',
      desiredPosition: 'プロダクトデザイナー',
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'プロトタイピング'],
      experience: '8年',
      education: '美術大学卒',
      desiredSalary: '650-850万円',
      workLocation: '東京都、リモート可',
      source: 'メール',
      lineStatus: '未連携',
      registeredDate: '2024-12-06',
      lastContact: '2024-12-16',
      memo: 'モバイルアプリのUI設計経験豊富。デザインシステム構築経験あり。'
    },
    {
      id: 11,
      name: '木村 翔太',
      nameKana: 'キムラ ショウタ',
      email: 'kimura.shota@example.com',
      phone: '090-1234-5678',
      address: '東京都江東区豊洲2-2-31',
      age: 27,
      gender: '男性',
      currentPosition: 'フルスタックエンジニア',
      desiredPosition: 'テックリード',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      experience: '5年',
      education: '情報工学部卒',
      desiredSalary: '700-900万円',
      workLocation: '東京都、フルリモート可',
      source: 'LP',
      lineStatus: 'ブロック',
      registeredDate: '2024-11-28',
      lastContact: '2024-12-08',
      memo: 'スタートアップでの開発経験。0→1フェーズに強み。'
    },
    {
      id: 12,
      name: '吉田 麻衣',
      nameKana: 'ヨシダ マイ',
      email: 'yoshida.mai@example.com',
      phone: '090-2345-6789',
      address: '東京都台東区上野7-1-1',
      age: 34,
      gender: '女性',
      currentPosition: 'マーケティングマネージャー',
      desiredPosition: 'CMO',
      skills: ['デジタルマーケティング', 'ブランディング', 'SEO/SEM', 'MA'],
      experience: '11年',
      education: 'MBA',
      desiredSalary: '1000-1300万円',
      workLocation: '東京都',
      source: 'QR',
      lineStatus: '連携済み',
      registeredDate: '2024-12-02',
      lastContact: '2024-12-20',
      memo: 'BtoC、BtoB両方の経験。グロースハック実績多数。'
    },
    {
      id: 13,
      name: '橋本 優',
      nameKana: 'ハシモト ユウ',
      email: 'hashimoto.yu@example.com',
      phone: '090-3456-7890',
      address: '東京都墨田区押上1-1-2',
      age: 26,
      gender: '男性',
      currentPosition: 'QAエンジニア',
      desiredPosition: 'QAリード',
      skills: ['テスト自動化', 'Selenium', 'JIRA', 'アジャイル'],
      experience: '4年',
      education: '理工学部卒',
      desiredSalary: '500-650万円',
      workLocation: '東京都、神奈川県',
      source: 'オーガニック',
      lineStatus: '連携済み',
      registeredDate: '2024-12-13',
      lastContact: '2024-12-21',
      memo: 'テスト自動化の導入経験。品質改善プロセスの構築実績あり。'
    },
    {
      id: 14,
      name: '松本 理恵',
      nameKana: 'マツモト リエ',
      email: 'matsumoto.rie@example.com',
      phone: '090-4567-8901',
      age: 32,
      gender: '女性',
      currentPosition: 'プロダクトオーナー',
      desiredPosition: 'VP of Product',
      skills: ['プロダクト戦略', 'ロードマップ', 'アジャイル', 'OKR'],
      experience: '9年',
      education: '経済学部卒',
      desiredSalary: '900-1100万円',
      workLocation: '東京都、リモート可',
      source: 'SNS',
      lineStatus: '未連携',
      registeredDate: '2024-11-30',
      lastContact: '2024-12-15',
      memo: 'SaaS企業でのPO経験。MAU向上の実績多数。'
    },
    {
      id: 15,
      name: '石川 大地',
      nameKana: 'イシカワ ダイチ',
      email: 'ishikawa.daichi@example.com',
      phone: '090-5678-9012',
      age: 36,
      gender: '男性',
      currentPosition: 'セキュリティエンジニア',
      desiredPosition: 'CISO',
      skills: ['セキュリティ監査', 'ペネトレーションテスト', 'SIEM', 'ISO27001'],
      experience: '13年',
      education: '情報セキュリティ修士',
      desiredSalary: '1100-1400万円',
      workLocation: '東京都',
      source: 'リファラル',
      lineStatus: '連携済み',
      registeredDate: '2024-12-04',
      lastContact: '2024-12-19',
      memo: 'CISSP保有。大手企業でのセキュリティ体制構築経験あり。'
    },
    {
      id: 16,
      name: '前田 彩香',
      nameKana: 'マエダ アヤカ',
      email: 'maeda.ayaka@example.com',
      phone: '090-6789-0123',
      address: '東京都品川区大崎1-11-2',
      age: 25,
      gender: '女性',
      currentPosition: 'コンテンツマーケター',
      desiredPosition: 'コンテンツマネージャー',
      skills: ['コンテンツ制作', 'SEO', 'SNS運用', '動画編集'],
      experience: '3年',
      education: 'メディア学部卒',
      desiredSalary: '450-600万円',
      workLocation: '東京都、埼玉県',
      source: '広告',
      lineStatus: 'ブロック',
      registeredDate: '2024-12-09',
      lastContact: '2024-12-17',
      memo: 'オウンドメディア運営経験。PV数3倍達成の実績。'
    },
    {
      id: 17,
      name: '藤田 剛',
      nameKana: 'フジタ ツヨシ',
      email: 'fujita.tsuyoshi@example.com',
      phone: '090-7890-1234',
      address: '東京都世田谷区玉川1-14-1',
      age: 40,
      gender: '男性',
      currentPosition: 'CFO',
      desiredPosition: 'CFO（上場企業）',
      skills: ['財務戦略', 'IPO', '資金調達', 'M&A'],
      experience: '17年',
      education: '公認会計士',
      desiredSalary: '1500-2000万円',
      workLocation: '東京都',
      source: 'ダイレクト',
      lineStatus: '連携済み',
      registeredDate: '2024-11-22',
      lastContact: '2024-12-14',
      memo: 'IPO経験2社。資金調達総額50億円の実績。'
    },
    {
      id: 18,
      name: '岡田 美紀',
      nameKana: 'オカダ ミキ',
      email: 'okada.miki@example.com',
      phone: '090-8901-2345',
      address: '東京都中央区日本橋2-3-4',
      age: 28,
      gender: '女性',
      currentPosition: 'データエンジニア',
      desiredPosition: 'データアーキテクト',
      skills: ['ETL', 'BigQuery', 'Airflow', 'Python'],
      experience: '5年',
      education: '数学科卒',
      desiredSalary: '700-900万円',
      workLocation: '東京都、フルリモート可',
      source: 'メール',
      lineStatus: '未連携',
      registeredDate: '2024-12-07',
      lastContact: '2024-12-22',
      memo: 'データ基盤構築の経験豊富。リアルタイム処理の実装経験あり。'
    },
    {
      id: 19,
      name: '森 雄太',
      nameKana: 'モリ ユウタ',
      email: 'mori.yuta@example.com',
      phone: '090-9012-3456',
      address: '東京都文京区本郷7-3-1',
      age: 33,
      gender: '男性',
      currentPosition: 'DevOpsエンジニア',
      desiredPosition: 'SREマネージャー',
      skills: ['Kubernetes', 'Terraform', 'CI/CD', 'モニタリング'],
      experience: '10年',
      education: '情報工学部卒',
      desiredSalary: '850-1050万円',
      workLocation: '東京都、千葉県',
      source: 'LP',
      lineStatus: '連携済み',
      registeredDate: '2024-12-12',
      lastContact: '2024-12-23',
      memo: 'SRE文化の導入経験。可用性99.99%達成の実績。'
    },
    {
      id: 20,
      name: '清水 涼子',
      nameKana: 'シミズ リョウコ',
      email: 'shimizu.ryoko@example.com',
      phone: '090-0123-4567',
      address: '東京都豊島区南池袋1-28-1',
      age: 30,
      gender: '女性',
      currentPosition: 'HRビジネスパートナー',
      desiredPosition: 'HRディレクター',
      skills: ['組織開発', '採用', '人事制度設計', 'タレントマネジメント'],
      experience: '7年',
      education: '心理学部卒',
      desiredSalary: '700-900万円',
      workLocation: '東京都',
      source: 'オーガニック',
      lineStatus: 'ブロック',
      registeredDate: '2024-12-01',
      lastContact: '2024-12-18',
      memo: 'IT企業での組織拡大フェーズ経験。エンジニア採用に強み。'
    }
  ]

  // フィルタリング
  const filteredJobSeekers = jobSeekers.filter(js => {
    const matchesSearch = searchQuery === '' || 
      js.name.includes(searchQuery) ||
      js.nameKana.includes(searchQuery) ||
      js.email.includes(searchQuery) ||
      js.phone.includes(searchQuery) ||
      js.desiredPosition.includes(searchQuery) ||
      js.skills.some(skill => skill.includes(searchQuery))
    
    const matchesSource = selectedSource === 'all' || js.source === selectedSource
    const matchesLineStatus = selectedLineStatus === 'all' || js.lineStatus === selectedLineStatus
    
    return matchesSearch && matchesSource && matchesLineStatus
  })

  // ページネーション
  const totalPages = Math.ceil(filteredJobSeekers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentJobSeekers = filteredJobSeekers.slice(startIndex, startIndex + itemsPerPage)

  // 統計情報
  const stats = {
    total: jobSeekers.length,
    lineConnected: jobSeekers.filter(js => js.lineStatus === '連携済み').length,
    lineNotConnected: jobSeekers.filter(js => js.lineStatus === '未連携').length,
    lineBlocked: jobSeekers.filter(js => js.lineStatus === 'ブロック').length
  }

  const sourceColors: Record<string, string> = {
    'LP': 'bg-blue-100 text-blue-800',
    '広告': 'bg-yellow-100 text-yellow-800',
    'オーガニック': 'bg-green-100 text-green-800',
    'QR': 'bg-purple-100 text-purple-800',
    'SNS': 'bg-pink-100 text-pink-800',
    'リファラル': 'bg-orange-100 text-orange-800',
    'ダイレクト': 'bg-indigo-100 text-indigo-800',
    'メール': 'bg-gray-100 text-gray-800'
  }

  const lineStatusColors: Record<string, string> = {
    '連携済み': 'bg-green-100 text-green-800',
    '未連携': 'bg-yellow-100 text-yellow-800',
    'ブロック': 'bg-red-100 text-red-800'
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">求職者管理</h1>
            <p className="text-gray-600 mt-1">登録されている求職者の管理</p>
          </div>
          <button 
            onClick={() => setShowAddJobSeeker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新規登録
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">総求職者数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">LINE連携済み</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.lineConnected}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">LINE未連携</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lineNotConnected}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ブロック</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.lineBlocked}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="名前、メール、電話番号、スキルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ての流入経路</option>
            <option value="LP">LP</option>
            <option value="広告">広告</option>
            <option value="オーガニック">オーガニック</option>
            <option value="QR">QR</option>
            <option value="SNS">SNS</option>
            <option value="リファラル">リファラル</option>
            <option value="ダイレクト">ダイレクト</option>
            <option value="メール">メール</option>
          </select>
          <select
            value={selectedLineStatus}
            onChange={(e) => setSelectedLineStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全てのLINE状態</option>
            <option value="連携済み">連携済み</option>
            <option value="未連携">未連携</option>
            <option value="ブロック">ブロック</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <Download className="w-4 h-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                基本情報
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                流入経路
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LINE連携
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentJobSeekers.map((jobSeeker) => (
              <tr 
                key={jobSeeker.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedJobSeeker(jobSeeker)
                  setShowDetail(true)
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {jobSeeker.name[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{jobSeeker.name}</div>
                      <div className="text-sm text-gray-500">{jobSeeker.age}歳 {jobSeeker.gender}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {jobSeeker.phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {jobSeeker.address || jobSeeker.workLocation}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${sourceColors[jobSeeker.source]}`}>
                    {jobSeeker.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${lineStatusColors[jobSeeker.lineStatus]}`}>
                    {jobSeeker.lineStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {jobSeeker.registeredDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {filteredJobSeekers.length}件中 {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredJobSeekers.length)}件を表示
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Detail Modal */}
      {showDetail && selectedJobSeeker && (
        <UnifiedDetailModal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false)
            setDetailTab('info')
          }}
          jobSeeker={{
            id: selectedJobSeeker.id.toString(),
            name: selectedJobSeeker.name,
            email: selectedJobSeeker.email,
            phone: selectedJobSeeker.phone,
            address: selectedJobSeeker.address,
            age: selectedJobSeeker.age,
            currentPosition: selectedJobSeeker.currentPosition,
            desiredPosition: selectedJobSeeker.desiredPosition,
            skills: selectedJobSeeker.skills,
            experience: selectedJobSeeker.experience,
            education: selectedJobSeeker.education,
            desiredSalary: selectedJobSeeker.desiredSalary,
            workLocation: selectedJobSeeker.workLocation,
            lineStatus: selectedJobSeeker.lineStatus,
            createdAt: new Date(selectedJobSeeker.registeredDate),
            memo: selectedJobSeeker.memo
          }}
          initialTab={detailTab === 'selection' ? 'selection' : detailTab === 'resume' ? 'resume' : detailTab === 'cv' ? 'cv' : 'basic'}
          mode="jobseeker"
        />
      )}

      {/* 求職者追加モーダル */}
      {showAddJobSeeker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">新規求職者登録</h3>
                <button
                  onClick={() => {
                    setShowAddJobSeeker(false)
                    setNewJobSeeker({
                      name: '',
                      nameKana: '',
                      email: '',
                      phone: '',
                      address: '',
                      age: 0,
                      gender: '',
                      currentPosition: '',
                      desiredPosition: '',
                      skills: [],
                      experience: '',
                      education: '',
                      desiredSalary: '',
                      workLocation: '',
                      source: 'direct',
                      lineStatus: '未連携',
                      memo: ''
                    })
                    setUploadedPdf(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* PDF Upload */}
              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">履歴書・職務経歴書（PDF）をアップロードして自動入力</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                  >
                    PDFを選択
                  </label>
                  {uploadedPdf && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ {uploadedPdf.name} をアップロードしました
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
                  <input
                    type="text"
                    value={newJobSeeker.name || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label>
                  <input
                    type="text"
                    value={newJobSeeker.nameKana || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, nameKana: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
                  <input
                    type="email"
                    value={newJobSeeker.email || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={newJobSeeker.phone || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                  <input
                    type="text"
                    value={newJobSeeker.address || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                  <input
                    type="number"
                    value={newJobSeeker.age || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, age: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                  <select
                    value={newJobSeeker.gender || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="男性">男性</option>
                    <option value="女性">女性</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">現在の職種</label>
                  <input
                    type="text"
                    value={newJobSeeker.currentPosition || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, currentPosition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望職種</label>
                  <input
                    type="text"
                    value={newJobSeeker.desiredPosition || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, desiredPosition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">経験年数</label>
                  <input
                    type="text"
                    value={newJobSeeker.experience || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望年収</label>
                  <input
                    type="text"
                    value={newJobSeeker.desiredSalary || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, desiredSalary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">スキル（カンマ区切り）</label>
                  <input
                    type="text"
                    value={newJobSeeker.skills?.join(', ') || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, skills: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={newJobSeeker.memo || ''}
                    onChange={(e) => setNewJobSeeker({...newJobSeeker, memo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddJobSeeker(false)
                    setNewJobSeeker({
                      name: '',
                      nameKana: '',
                      email: '',
                      phone: '',
                      address: '',
                      age: 0,
                      gender: '',
                      currentPosition: '',
                      desiredPosition: '',
                      skills: [],
                      experience: '',
                      education: '',
                      desiredSalary: '',
                      workLocation: '',
                      source: 'direct',
                      lineStatus: '未連携',
                      memo: ''
                    })
                    setUploadedPdf(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    if (newJobSeeker.name && newJobSeeker.email) {
                      alert(`求職者「${newJobSeeker.name}」を登録しました（デモ）`)
                      setShowAddJobSeeker(false)
                      setNewJobSeeker({
                        name: '',
                        nameKana: '',
                        email: '',
                        phone: '',
                        address: '',
                        age: 0,
                        gender: '',
                        currentPosition: '',
                        desiredPosition: '',
                        skills: [],
                        experience: '',
                        education: '',
                        desiredSalary: '',
                        workLocation: '',
                        source: 'direct',
                        lineStatus: '未連携',
                        memo: ''
                      })
                      setUploadedPdf(null)
                    } else {
                      alert('名前とメールアドレスは必須です')
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}