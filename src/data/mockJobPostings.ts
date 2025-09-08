import { JobPosting } from '@/types'

export const mockJobPostingsData: JobPosting[] = [
  {
    id: 'job-001',
    title: 'フロントエンドリードエンジニア',
    companyId: 'company-001',
    companyName: '株式会社イノベーション',
    companyLogo: null,
    department: '技術開発部',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    location: '東京都渋谷区',
    remoteOption: 'hybrid',
    salaryRange: { min: 900, max: 1200, currency: 'JPY' },
    description: 'Reactを使用した大規模Webアプリケーション開発のリーダーを募集',
    requirements: [
      'React/TypeScriptでの開発経験5年以上',
      'チームリード経験',
      'アーキテクチャ設計経験'
    ],
    benefits: [
      'フレックスタイム制',
      'リモートワーク可',
      '技術書購入支援'
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    postedDate: '2024-01-01',
    applicationDeadline: '2024-03-31',
    status: 'active',
    viewCount: 150,
    applicationCount: 12,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'job-002',
    title: 'UIUXデザインマネージャー',
    companyId: 'company-002',
    companyName: '株式会社クリエイティブラボ',
    companyLogo: null,
    department: 'デザイン部',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '東京都港区',
    remoteOption: 'office',
    salaryRange: { min: 700, max: 900, currency: 'JPY' },
    description: 'BtoCサービスのUI/UX設計をリードするデザイナーを募集',
    requirements: [
      'Figma/Adobe XDの実務経験3年以上',
      'BtoCサービスのデザイン経験',
      'チームマネジメント経験'
    ],
    benefits: [
      'デザインツール支給',
      '展示会参加支援',
      'クリエイティブ休暇'
    ],
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
    postedDate: '2024-01-05',
    applicationDeadline: '2024-03-15',
    status: 'active',
    viewCount: 98,
    applicationCount: 8,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z'
  },
  {
    id: 'job-003',
    title: 'プロダクトマネージャー',
    companyId: 'company-003',
    companyName: '株式会社テックベンチャー',
    companyLogo: null,
    department: 'プロダクト開発部',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    location: '東京都千代田区',
    remoteOption: 'remote',
    salaryRange: { min: 1000, max: 1400, currency: 'JPY' },
    description: 'SaaSプロダクトの企画から開発までを統括するPMを募集',
    requirements: [
      'PM経験5年以上',
      'SaaS/BtoBプロダクトの経験',
      'エンジニアリング知識'
    ],
    benefits: [
      'フルリモート可',
      'ストックオプション',
      '副業OK'
    ],
    skills: ['プロダクト管理', 'アジャイル', 'SQL', 'データ分析'],
    postedDate: '2024-01-08',
    applicationDeadline: '2024-02-29',
    status: 'active',
    viewCount: 203,
    applicationCount: 15,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-19T09:00:00Z'
  },
  {
    id: 'job-004',
    title: 'デジタルマーケティングスペシャリスト',
    companyId: 'company-004',
    companyName: '株式会社マーケティングソリューションズ',
    companyLogo: null,
    department: 'マーケティング部',
    employmentType: 'full-time',
    experienceLevel: 'junior',
    location: '東京都新宿区',
    remoteOption: 'hybrid',
    salaryRange: { min: 500, max: 700, currency: 'JPY' },
    description: 'デジタル広告運用とSEO/SEM施策を担当するマーケターを募集',
    requirements: [
      'デジタルマーケティング経験2年以上',
      'Google Ads/Facebook Ads運用経験',
      'データ分析スキル'
    ],
    benefits: [
      'マーケティング資格取得支援',
      'カンファレンス参加費補助',
      'フレックスタイム'
    ],
    skills: ['Google Analytics', 'Google Ads', 'SEO', 'SNS運用'],
    postedDate: '2024-01-10',
    applicationDeadline: '2024-03-20',
    status: 'active',
    viewCount: 156,
    applicationCount: 18,
    createdAt: '2024-01-10T13:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z'
  },
  {
    id: 'job-005',
    title: '営業部長',
    companyId: 'company-005',
    companyName: '株式会社ビジネスソリューション',
    companyLogo: null,
    department: '営業本部',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    location: '東京都品川区',
    remoteOption: 'office',
    salaryRange: { min: 1200, max: 1600, currency: 'JPY' },
    description: 'エンタープライズ営業チームを統括する営業部長を募集',
    requirements: [
      '営業管理職経験10年以上',
      'BtoB大手企業営業経験',
      'チーム30名以上のマネジメント経験'
    ],
    benefits: [
      'インセンティブ制度',
      '社用車支給',
      'エグゼクティブ研修'
    ],
    skills: ['営業戦略', 'チームマネジメント', 'CRM', 'プレゼンテーション'],
    postedDate: '2023-12-20',
    applicationDeadline: '2024-02-15',
    status: 'active',
    viewCount: 89,
    applicationCount: 5,
    createdAt: '2023-12-20T09:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  },
  {
    id: 'job-006',
    title: '人事マネージャー',
    companyId: 'company-006',
    companyName: '株式会社HRテクノロジー',
    companyLogo: null,
    department: '人事部',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '東京都渋谷区',
    remoteOption: 'hybrid',
    salaryRange: { min: 600, max: 800, currency: 'JPY' },
    description: 'IT企業の採用と人事制度設計を担当するマネージャーを募集',
    requirements: [
      '人事経験5年以上',
      'IT企業での採用経験',
      '人事制度設計経験'
    ],
    benefits: [
      '人事資格取得支援',
      'メンタルヘルスケア',
      '育児支援制度'
    ],
    skills: ['採用', '人事評価', '労務管理', '組織開発'],
    postedDate: '2024-01-12',
    applicationDeadline: '2024-03-10',
    status: 'active',
    viewCount: 124,
    applicationCount: 9,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z'
  },
  {
    id: 'job-007',
    title: 'データサイエンティスト',
    companyId: 'company-007',
    companyName: '株式会社AIイノベーション',
    companyLogo: null,
    department: 'データサイエンス部',
    employmentType: 'contract',
    experienceLevel: 'expert',
    location: '東京都千代田区',
    remoteOption: 'remote',
    salaryRange: { min: 1500, max: 2000, currency: 'JPY' },
    description: '機械学習モデル開発とデータ分析基盤構築をリードする専門家を募集',
    requirements: [
      'データサイエンス実務経験10年以上',
      '機械学習プロジェクトリード経験',
      '博士号または同等の専門知識'
    ],
    benefits: [
      '完全リモート',
      '論文執筆時間確保',
      '国際カンファレンス参加支援'
    ],
    skills: ['Python', '機械学習', 'Deep Learning', 'SQL', 'Spark'],
    postedDate: '2023-11-15',
    applicationDeadline: '2024-01-31',
    status: 'closed',
    viewCount: 312,
    applicationCount: 8,
    createdAt: '2023-11-15T09:00:00Z',
    updatedAt: '2024-01-31T23:59:59Z'
  },
  {
    id: 'job-008',
    title: 'ECサイト運営責任者',
    companyId: 'company-008',
    companyName: '株式会社Eコマース',
    companyLogo: null,
    department: 'EC事業部',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '東京都世田谷区',
    remoteOption: 'hybrid',
    salaryRange: { min: 550, max: 750, currency: 'JPY' },
    description: 'ファッションECサイトの運営全般を管理する責任者を募集',
    requirements: [
      'EC運営経験3年以上',
      'Shopify等のEC構築経験',
      'マーケティング知識'
    ],
    benefits: [
      '社員割引',
      'ファッション手当',
      'フレックスタイム'
    ],
    skills: ['ECサイト運営', 'Shopify', 'Google Analytics', 'SNS運用'],
    postedDate: '2024-01-14',
    applicationDeadline: '2024-03-25',
    status: 'active',
    viewCount: 167,
    applicationCount: 14,
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z'
  },
  {
    id: 'job-009',
    title: 'ゲームプログラマー',
    companyId: 'company-009',
    companyName: '株式会社ゲームクリエイト',
    companyLogo: null,
    department: '開発部',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '東京都中野区',
    remoteOption: 'hybrid',
    salaryRange: { min: 700, max: 950, currency: 'JPY' },
    description: 'Unityを使用したモバイルゲーム開発エンジニアを募集',
    requirements: [
      'Unity開発経験5年以上',
      'C#プログラミングスキル',
      'モバイルゲーム開発経験'
    ],
    benefits: [
      'ゲーム購入補助',
      'クリエイター交流会',
      '最新デバイス支給'
    ],
    skills: ['Unity', 'C#', 'Unreal Engine', 'Git'],
    postedDate: '2024-01-16',
    applicationDeadline: '2024-04-01',
    status: 'active',
    viewCount: 234,
    applicationCount: 21,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-23T11:00:00Z'
  },
  {
    id: 'job-010',
    title: 'ビジネスコンサルタント',
    companyId: 'company-010',
    companyName: '株式会社コンサルティングパートナーズ',
    companyLogo: null,
    department: 'コンサルティング部',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    location: '東京都千代田区',
    remoteOption: 'hybrid',
    salaryRange: { min: 700, max: 1000, currency: 'JPY' },
    description: '企業の業務改善と戦略立案を支援するコンサルタントを募集',
    requirements: [
      'コンサルティング経験3年以上',
      'データ分析スキル',
      'プレゼンテーション能力'
    ],
    benefits: [
      'MBA取得支援',
      '海外研修制度',
      'プロジェクトボーナス'
    ],
    skills: ['戦略立案', 'データ分析', 'PowerPoint', 'Excel'],
    postedDate: '2024-01-18',
    applicationDeadline: '2024-03-30',
    status: 'active',
    viewCount: 189,
    applicationCount: 16,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-24T14:00:00Z'
  }
]