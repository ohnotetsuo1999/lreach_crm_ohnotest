import { JobSeeker } from '@/types'

export const agentJobSeekersData: JobSeeker[] = [
  {
    id: 'js-agent-001',
    name: '佐藤 太郎',
    nameKana: 'サトウ タロウ',
    email: 'sato.taro@example.com',
    phone: '090-1234-5678',
    address: '東京都渋谷区恵比寿1-2-3',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    nationality: 'Japan',
    currentCompany: '株式会社テックソリューション',
    currentPosition: 'シニアエンジニア',
    yearsOfExperience: 8,
    education: [
      {
        school: '東京工業大学',
        degree: '工学部情報工学科',
        startDate: '2009-04-01',
        endDate: '2013-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社テックソリューション',
        position: 'シニアエンジニア',
        startDate: '2018-04-01',
        endDate: null,
        description: 'Webアプリケーション開発、チームリード'
      },
      {
        company: '株式会社デジタルイノベーション',
        position: 'エンジニア',
        startDate: '2013-04-01',
        endDate: '2018-03-31',
        description: 'システム開発、保守運用'
      }
    ],
    skills: [
      { name: 'JavaScript', level: 'expert' },
      { name: 'React', level: 'expert' },
      { name: 'Node.js', level: 'advanced' },
      { name: 'TypeScript', level: 'advanced' },
      { name: 'AWS', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'business' }
    ],
    certifications: ['AWS認定ソリューションアーキテクト', '応用情報技術者'],
    desiredSalary: { min: 700, max: 900, currency: 'JPY' },
    desiredWorkLocation: ['東京都', 'リモート可'],
    desiredJobType: 'full-time',
    availableFrom: '2024-04-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/sato_taro_resume.pdf',
    cvUrl: '/cvs/sato_taro_cv.pdf',
    portfolioUrl: 'https://portfolio.example.com/sato',
    linkedinUrl: 'https://linkedin.com/in/sato-taro',
    githubUrl: 'https://github.com/sato-taro',
    notes: 'フロントエンド開発に強み。チームリード経験あり。',
    tags: ['agent:agent1', 'skill:react', 'exp:senior'],
    status: 'interviewing',
    source: 'lp',
    lineStatus: 'connected',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'js-agent-002',
    name: '田中 花子',
    nameKana: 'タナカ ハナコ',
    email: 'tanaka.hanako@example.com',
    phone: '090-2345-6789',
    address: '東京都港区南青山2-3-4',
    dateOfBirth: '1992-08-20',
    gender: 'female',
    nationality: 'Japan',
    currentCompany: '株式会社クリエイティブデザイン',
    currentPosition: 'UIUXデザイナー',
    yearsOfExperience: 6,
    education: [
      {
        school: '多摩美術大学',
        degree: 'グラフィックデザイン学科',
        startDate: '2011-04-01',
        endDate: '2015-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社クリエイティブデザイン',
        position: 'UIUXデザイナー',
        startDate: '2019-04-01',
        endDate: null,
        description: 'モバイルアプリ、Webサービスのデザイン'
      }
    ],
    skills: [
      { name: 'Figma', level: 'expert' },
      { name: 'Adobe XD', level: 'expert' },
      { name: 'Photoshop', level: 'advanced' },
      { name: 'HTML/CSS', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'conversational' }
    ],
    certifications: [],
    desiredSalary: { min: 600, max: 750, currency: 'JPY' },
    desiredWorkLocation: ['東京都'],
    desiredJobType: 'full-time',
    availableFrom: '2024-03-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/tanaka_hanako_resume.pdf',
    cvUrl: '/cvs/tanaka_hanako_cv.pdf',
    portfolioUrl: 'https://portfolio.example.com/tanaka',
    linkedinUrl: null,
    githubUrl: null,
    notes: 'BtoC向けのデザイン経験豊富。ユーザビリティ重視。',
    tags: ['agent:agent1', 'skill:design', 'exp:mid'],
    status: 'qualified',
    source: 'ad',
    lineStatus: 'connected',
    createdAt: '2024-11-25T11:00:00Z',
    updatedAt: '2024-12-14T16:00:00Z'
  },
  {
    id: 'js-agent-003',
    name: '鈴木 健太',
    nameKana: 'スズキ ケンタ',
    email: 'suzuki.kenta@example.com',
    phone: '090-3456-7890',
    address: '神奈川県横浜市西区みなとみらい3-4-5',
    dateOfBirth: '1988-03-10',
    gender: 'male',
    nationality: 'Japan',
    currentCompany: '株式会社ビジネスソリューション',
    currentPosition: 'プロジェクトマネージャー',
    yearsOfExperience: 12,
    education: [
      {
        school: '慶應義塾大学',
        degree: '経済学部',
        startDate: '2007-04-01',
        endDate: '2011-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社ビジネスソリューション',
        position: 'プロジェクトマネージャー',
        startDate: '2016-04-01',
        endDate: null,
        description: '大規模プロジェクトの管理、クライアント折衝'
      }
    ],
    skills: [
      { name: 'プロジェクト管理', level: 'expert' },
      { name: 'アジャイル開発', level: 'advanced' },
      { name: 'リスク管理', level: 'advanced' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'business' }
    ],
    certifications: ['PMP', 'スクラムマスター'],
    desiredSalary: { min: 900, max: 1200, currency: 'JPY' },
    desiredWorkLocation: ['東京都', '神奈川県'],
    desiredJobType: 'full-time',
    availableFrom: '2024-05-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/suzuki_kenta_resume.pdf',
    cvUrl: '/cvs/suzuki_kenta_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/suzuki-kenta',
    githubUrl: null,
    notes: '大規模プロジェクトの経験豊富。PMPホルダー。',
    tags: ['agent:agent2', 'skill:pm', 'exp:senior'],
    status: 'new',
    source: 'organic',
    lineStatus: 'not_connected',
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-16T10:00:00Z'
  },
  {
    id: 'js-agent-004',
    name: '山田 美咲',
    nameKana: 'ヤマダ ミサキ',
    email: 'yamada.misaki@example.com',
    phone: '090-4567-8901',
    address: '東京都新宿区西新宿4-5-6',
    dateOfBirth: '1995-11-25',
    gender: 'female',
    nationality: 'Japan',
    currentCompany: '株式会社マーケティングプロ',
    currentPosition: 'デジタルマーケター',
    yearsOfExperience: 4,
    education: [
      {
        school: '早稲田大学',
        degree: '商学部',
        startDate: '2014-04-01',
        endDate: '2018-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社マーケティングプロ',
        position: 'デジタルマーケター',
        startDate: '2020-04-01',
        endDate: null,
        description: 'デジタル広告運用、SEO/SEM施策'
      }
    ],
    skills: [
      { name: 'Google Analytics', level: 'advanced' },
      { name: 'Google Ads', level: 'advanced' },
      { name: 'Facebook Ads', level: 'advanced' },
      { name: 'SEO', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'conversational' }
    ],
    certifications: ['Google広告認定資格'],
    desiredSalary: { min: 500, max: 650, currency: 'JPY' },
    desiredWorkLocation: ['東京都', 'リモート可'],
    desiredJobType: 'full-time',
    availableFrom: '2024-04-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/yamada_misaki_resume.pdf',
    cvUrl: '/cvs/yamada_misaki_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: null,
    githubUrl: null,
    notes: 'BtoC向けマーケティング経験。SNS広告に強み。',
    tags: ['agent:agent2', 'skill:marketing', 'exp:junior'],
    status: 'screening',
    source: 'qr',
    lineStatus: 'connected',
    createdAt: '2024-12-05T13:00:00Z',
    updatedAt: '2024-12-17T09:30:00Z'
  },
  {
    id: 'js-agent-005',
    name: '高橋 大輔',
    nameKana: 'タカハシ ダイスケ',
    email: 'takahashi.daisuke@example.com',
    phone: '090-5678-9012',
    address: '千葉県千葉市中央区5-6-7',
    dateOfBirth: '1987-06-30',
    gender: 'male',
    nationality: 'Japan',
    currentCompany: '株式会社セールスフォース',
    currentPosition: '営業部長',
    yearsOfExperience: 13,
    education: [
      {
        school: '明治大学',
        degree: '経営学部',
        startDate: '2006-04-01',
        endDate: '2010-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社セールスフォース',
        position: '営業部長',
        startDate: '2017-04-01',
        endDate: null,
        description: '営業チーム管理、大口顧客対応'
      }
    ],
    skills: [
      { name: 'B2B営業', level: 'expert' },
      { name: 'チームマネジメント', level: 'expert' },
      { name: 'CRM', level: 'advanced' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'business' }
    ],
    certifications: [],
    desiredSalary: { min: 1000, max: 1400, currency: 'JPY' },
    desiredWorkLocation: ['東京都'],
    desiredJobType: 'full-time',
    availableFrom: '2024-06-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/takahashi_daisuke_resume.pdf',
    cvUrl: '/cvs/takahashi_daisuke_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/takahashi-daisuke',
    githubUrl: null,
    notes: '大手企業での営業管理経験。エンタープライズ営業に精通。',
    tags: ['agent:agent3', 'skill:sales', 'exp:senior'],
    status: 'offer_pending',
    source: 'referral',
    lineStatus: 'connected',
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2024-12-15T17:00:00Z'
  },
  {
    id: 'js-agent-006',
    name: '伊藤 真由美',
    nameKana: 'イトウ マユミ',
    email: 'ito.mayumi@example.com',
    phone: '090-6789-0123',
    address: '埼玉県さいたま市大宮区6-7-8',
    dateOfBirth: '1993-09-12',
    gender: 'female',
    nationality: 'Japan',
    currentCompany: '株式会社HR テック',
    currentPosition: '人事スペシャリスト',
    yearsOfExperience: 5,
    education: [
      {
        school: '立教大学',
        degree: '社会学部',
        startDate: '2012-04-01',
        endDate: '2016-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社HR テック',
        position: '人事スペシャリスト',
        startDate: '2019-04-01',
        endDate: null,
        description: '採用業務、人事制度設計'
      }
    ],
    skills: [
      { name: '採用', level: 'advanced' },
      { name: '人事評価', level: 'intermediate' },
      { name: '労務管理', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'basic' }
    ],
    certifications: ['社会保険労務士'],
    desiredSalary: { min: 550, max: 700, currency: 'JPY' },
    desiredWorkLocation: ['東京都', '埼玉県'],
    desiredJobType: 'full-time',
    availableFrom: '2024-03-15',
    profileImageUrl: null,
    resumeUrl: '/resumes/ito_mayumi_resume.pdf',
    cvUrl: '/cvs/ito_mayumi_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: null,
    githubUrl: null,
    notes: 'IT企業での人事経験。エンジニア採用に強み。',
    tags: ['agent:agent3', 'skill:hr', 'exp:mid'],
    status: 'hired',
    source: 'direct',
    lineStatus: 'connected',
    createdAt: '2024-11-15T14:00:00Z',
    updatedAt: '2024-12-10T11:00:00Z'
  },
  {
    id: 'js-agent-007',
    name: '渡辺 健一',
    nameKana: 'ワタナベ ケンイチ',
    email: 'watanabe.kenichi@example.com',
    phone: '090-7890-1234',
    address: '東京都豊島区池袋7-8-9',
    dateOfBirth: '1985-02-18',
    gender: 'male',
    nationality: 'Japan',
    currentCompany: 'フリーランス',
    currentPosition: 'データサイエンティスト',
    yearsOfExperience: 15,
    education: [
      {
        school: '東京大学',
        degree: '理学部数学科',
        startDate: '2004-04-01',
        endDate: '2008-03-31'
      },
      {
        school: '東京大学大学院',
        degree: '情報理工学系研究科',
        startDate: '2008-04-01',
        endDate: '2010-03-31'
      }
    ],
    workExperience: [
      {
        company: 'フリーランス',
        position: 'データサイエンティスト',
        startDate: '2020-04-01',
        endDate: null,
        description: '機械学習モデル開発、データ分析コンサルティング'
      }
    ],
    skills: [
      { name: 'Python', level: 'expert' },
      { name: '機械学習', level: 'expert' },
      { name: 'SQL', level: 'advanced' },
      { name: 'R', level: 'advanced' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'fluent' }
    ],
    certifications: ['統計検定1級'],
    desiredSalary: { min: 1200, max: 1600, currency: 'JPY' },
    desiredWorkLocation: ['東京都', 'フルリモート'],
    desiredJobType: 'contract',
    availableFrom: '2024-02-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/watanabe_kenichi_resume.pdf',
    cvUrl: '/cvs/watanabe_kenichi_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/watanabe-kenichi',
    githubUrl: 'https://github.com/watanabe-kenichi',
    notes: '博士課程修了。論文多数。AIプロジェクトのリード経験豊富。',
    tags: ['agent:agent4', 'skill:datascience', 'exp:expert'],
    status: 'rejected',
    source: 'sns',
    lineStatus: 'blocked',
    createdAt: '2024-10-20T12:00:00Z',
    updatedAt: '2024-11-30T15:00:00Z'
  },
  {
    id: 'js-agent-008',
    name: '小林 愛子',
    nameKana: 'コバヤシ アイコ',
    email: 'kobayashi.aiko@example.com',
    phone: '090-8901-2345',
    address: '東京都世田谷区三軒茶屋8-9-10',
    dateOfBirth: '1996-12-05',
    gender: 'female',
    nationality: 'Japan',
    currentCompany: '株式会社ファッションテック',
    currentPosition: 'ECマネージャー',
    yearsOfExperience: 3,
    education: [
      {
        school: '青山学院大学',
        degree: '経営学部マーケティング学科',
        startDate: '2015-04-01',
        endDate: '2019-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社ファッションテック',
        position: 'ECマネージャー',
        startDate: '2021-04-01',
        endDate: null,
        description: 'ECサイト運営、売上管理、顧客対応'
      }
    ],
    skills: [
      { name: 'ECサイト運営', level: 'advanced' },
      { name: 'Shopify', level: 'advanced' },
      { name: 'Google Analytics', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'conversational' },
      { name: '中国語', level: 'basic' }
    ],
    certifications: [],
    desiredSalary: { min: 450, max: 600, currency: 'JPY' },
    desiredWorkLocation: ['東京都'],
    desiredJobType: 'full-time',
    availableFrom: '2024-04-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/kobayashi_aiko_resume.pdf',
    cvUrl: '/cvs/kobayashi_aiko_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: null,
    githubUrl: null,
    notes: 'ファッションECの経験。中国向けEC展開の知識あり。',
    tags: ['agent:agent4', 'skill:ec', 'exp:junior'],
    status: 'on_hold',
    source: 'email',
    lineStatus: 'not_connected',
    createdAt: '2024-12-08T10:30:00Z',
    updatedAt: '2024-12-18T14:00:00Z'
  },
  {
    id: 'js-agent-009',
    name: '中村 誠',
    nameKana: 'ナカムラ マコト',
    email: 'nakamura.makoto@example.com',
    phone: '090-9012-3456',
    address: '東京都中野区中野9-10-11',
    dateOfBirth: '1991-07-22',
    gender: 'male',
    nationality: 'Japan',
    currentCompany: '株式会社ゲームスタジオ',
    currentPosition: 'ゲームプログラマー',
    yearsOfExperience: 7,
    education: [
      {
        school: '東京工科大学',
        degree: 'メディア学部',
        startDate: '2010-04-01',
        endDate: '2014-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社ゲームスタジオ',
        position: 'ゲームプログラマー',
        startDate: '2017-04-01',
        endDate: null,
        description: 'Unity開発、ゲームロジック実装'
      }
    ],
    skills: [
      { name: 'Unity', level: 'expert' },
      { name: 'C#', level: 'expert' },
      { name: 'Unreal Engine', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'basic' }
    ],
    certifications: [],
    desiredSalary: { min: 650, max: 850, currency: 'JPY' },
    desiredWorkLocation: ['東京都', 'リモート可'],
    desiredJobType: 'full-time',
    availableFrom: '2024-05-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/nakamura_makoto_resume.pdf',
    cvUrl: '/cvs/nakamura_makoto_cv.pdf',
    portfolioUrl: 'https://portfolio.example.com/nakamura',
    linkedinUrl: null,
    githubUrl: 'https://github.com/nakamura-makoto',
    notes: 'モバイルゲーム開発経験豊富。複数タイトルのリリース実績。',
    tags: ['agent:agent5', 'skill:game', 'exp:mid'],
    status: 'withdrawn',
    source: 'ad',
    lineStatus: 'connected',
    createdAt: '2024-11-28T11:00:00Z',
    updatedAt: '2024-12-12T16:30:00Z'
  },
  {
    id: 'js-agent-010',
    name: '森田 さやか',
    nameKana: 'モリタ サヤカ',
    email: 'morita.sayaka@example.com',
    phone: '090-0123-4567',
    address: '東京都文京区本郷10-11-12',
    dateOfBirth: '1994-04-08',
    gender: 'female',
    nationality: 'Japan',
    currentCompany: '株式会社コンサルティングファーム',
    currentPosition: 'ビジネスアナリスト',
    yearsOfExperience: 4,
    education: [
      {
        school: '一橋大学',
        degree: '商学部',
        startDate: '2013-04-01',
        endDate: '2017-03-31'
      }
    ],
    workExperience: [
      {
        company: '株式会社コンサルティングファーム',
        position: 'ビジネスアナリスト',
        startDate: '2020-04-01',
        endDate: null,
        description: '業務改善提案、データ分析、プレゼン資料作成'
      }
    ],
    skills: [
      { name: 'Excel', level: 'expert' },
      { name: 'PowerPoint', level: 'expert' },
      { name: 'SQL', level: 'intermediate' },
      { name: 'Tableau', level: 'intermediate' }
    ],
    languages: [
      { name: '日本語', level: 'native' },
      { name: '英語', level: 'business' }
    ],
    certifications: ['簿記2級', 'TOEIC 850'],
    desiredSalary: { min: 600, max: 800, currency: 'JPY' },
    desiredWorkLocation: ['東京都'],
    desiredJobType: 'full-time',
    availableFrom: '2024-04-01',
    profileImageUrl: null,
    resumeUrl: '/resumes/morita_sayaka_resume.pdf',
    cvUrl: '/cvs/morita_sayaka_cv.pdf',
    portfolioUrl: null,
    linkedinUrl: 'https://linkedin.com/in/morita-sayaka',
    githubUrl: null,
    notes: '戦略コンサルティング経験。製造業、小売業の知見あり。',
    tags: ['agent:agent5', 'skill:consulting', 'exp:mid'],
    status: 'qualified',
    source: 'lp',
    lineStatus: 'connected',
    createdAt: '2024-12-02T09:00:00Z',
    updatedAt: '2024-12-19T13:00:00Z'
  }
]