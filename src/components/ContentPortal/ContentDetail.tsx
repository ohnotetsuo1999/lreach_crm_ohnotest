'use client'

import React, { useState } from 'react'
import { ArrowLeft, Calendar, Clock, Eye, User, Tag, Share2, BookmarkPlus, ThumbsUp, MessageCircle, Facebook, Twitter, Link2, ChevronRight, BookOpen, Newspaper, FileText, Linkedin, Mail, CheckCircle, TrendingUp, Users, Award, Coffee, Play, Headphones } from 'lucide-react'

interface ContentDetail {
  id: string
  title: string
  type: 'blog' | 'news' | 'guide' | 'video' | 'podcast'
  category: string
  content: string
  excerpt: string
  thumbnail?: string
  author: {
    name: string
    avatar?: string
    bio: string
    role: string
    social?: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }
  publishedAt: Date
  updatedAt?: Date
  readTime: number
  viewCount: number
  likeCount: number
  tags: string[]
  tableOfContents?: { id: string; title: string; level: number }[]
  relatedArticles?: RelatedContent[]
  seoTitle?: string
  seoDescription?: string
  ogImage?: string
}

interface RelatedContent {
  id: string
  title: string
  type: 'blog' | 'news' | 'guide' | 'video' | 'podcast'
  excerpt: string
  thumbnail?: string
  author: string
  authorAvatar?: string
  publishedAt: Date
  readTime: number
  category: string
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

export function ContentDetail({ contentId, onBack }: { contentId: string; onBack: () => void }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(1234)
  const [activeSection, setActiveSection] = useState('intro')
  
  // ダミーデータ with real images
  const content: ContentDetail = {
    id: contentId,
    title: '2024年エンジニア転職市場の最新トレンド：AIとDXが変える未来のキャリアパス',
    type: 'blog',
    category: '転職ノウハウ',
    excerpt: 'AI技術の急速な発展とDX推進により、エンジニア転職市場は大きな変革期を迎えています。本記事では、最新の市場動向と転職成功のための具体的な戦略を詳しく解説します。',
    thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&h=900&fit=crop',
    author: {
      name: '山田太郎',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      bio: '人材業界で15年以上の経験を持つシニアキャリアコンサルタント。これまで1000名以上のエンジニアの転職を支援。AI・機械学習分野の転職市場に精通。',
      role: 'シニアキャリアアドバイザー',
      social: {
        twitter: 'https://twitter.com/example',
        linkedin: 'https://linkedin.com/in/example',
        github: 'https://github.com/example'
      }
    },
    publishedAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-16'),
    readTime: 12,
    viewCount: 34567,
    likeCount: 1234,
    tags: ['AI', 'DX', 'エンジニア転職', 'キャリア', '2024トレンド', 'スキルアップ'],
    content: `
# はじめに

2024年のエンジニア転職市場は、AI技術の急速な発展とDX推進の加速により、かつてない変革期を迎えています。ChatGPTをはじめとする生成AIの登場は、エンジニアの役割と求められるスキルセットを根本的に変えつつあります。

本記事では、最新の市場動向と、この激動の時代を勝ち抜くための転職戦略について、実際のデータと成功事例を交えながら詳しく解説します。

## 1. 2024年エンジニア転職市場の全体像

### 1.1 市場規模と成長率

2024年のエンジニア転職市場は、前年比15%の成長を記録し、過去最高の活況を呈しています。特にAI・機械学習エンジニアの求人数は前年比40%増と、驚異的な伸びを示しています。

**主要な統計データ：**
- エンジニア求人倍率: 8.2倍（全職種平均の3倍以上）
- 平均転職成功率: 72%（適切な準備をした場合）
- 年収アップ率: 平均23%（スキルマッチした場合は最大40%）

### 1.2 需要の高い技術スキルTOP10

現在、企業が最も求めているスキルは以下の通りです：

1. **生成AI/LLM開発**: ChatGPT、Claude、Geminiなどの活用経験
2. **クラウドアーキテクチャ**: AWS、GCP、Azureでのシステム設計
3. **TypeScript/React/Next.js**: モダンなフロントエンド開発
4. **Python（AI/ML向け）**: TensorFlow、PyTorch、scikit-learn
5. **Go言語**: 高性能バックエンドシステムの開発
6. **Kubernetes/Docker**: コンテナオーケストレーション
7. **データエンジニアリング**: BigQuery、Snowflake、dbt
8. **DevOps/SRE**: CI/CD、監視、自動化
9. **セキュリティ**: ゼロトラスト、DevSecOps
10. **Web3/ブロックチェーン**: スマートコントラクト開発

### 1.3 給与水準の最新動向

2024年のエンジニア年収は、スキルと経験により大きな幅があります：

| 経験年数 | 一般的な年収 | AI/ML分野 | セキュリティ分野 |
|---------|------------|-----------|---------------|
| 0-2年 | 400-550万円 | 500-700万円 | 450-650万円 |
| 3-5年 | 550-750万円 | 700-1000万円 | 650-900万円 |
| 5-10年 | 750-1000万円 | 1000-1500万円 | 900-1300万円 |
| 10年以上 | 1000万円〜 | 1500万円〜 | 1300万円〜 |

特筆すべきは、生成AI関連のスキルを持つエンジニアへの需要が急増し、通常の1.5〜2倍の年収オファーが提示されるケースが増えていることです。

## 2. 転職を成功させる7つの戦略

### 2.1 技術ポートフォリオの戦略的構築

単なるGitHubのリポジトリ公開では不十分です。採用担当者が10秒で価値を理解できるポートフォリオが必要です。

**効果的なポートフォリオの要素：**
- デモ可能なWebアプリケーション（Vercel/Netlifyでホスティング）
- 詳細なREADME（問題設定、解決方法、使用技術の説明）
- CI/CDパイプラインの実装
- テストカバレッジ80%以上
- パフォーマンス最適化の証跡

### 2.2 個人ブランディングの確立

技術ブログ、登壇、OSSコントリビューションを通じて、専門性をアピールします。

**実践的アプローチ：**
1. Zenn、Qiita、note等で月2本以上の技術記事執筆
2. 社内勉強会→社外LT→カンファレンス登壇とステップアップ
3. 人気OSSプロジェクトへの意味のあるPR作成
4. X（Twitter）での技術情報発信（フォロワー1000人を目標）

### 2.3 スキルの可視化と定量化

抽象的な「できる」ではなく、具体的な成果で語ります。

**アピール例：**
- ❌ 「Reactが得意です」
- ✅ 「Reactで開発したECサイトが月間100万PV、Core Web Vitalsスコア95以上達成」

### 2.4 戦略的な企業選定

成長企業の見極めポイント：
- 技術投資額が売上の15%以上
- エンジニア比率が全社員の30%以上
- 技術ブログの更新頻度が月2回以上
- GitHubでのOSS公開実績
- エンジニア向け福利厚生の充実度

### 2.5 面接対策の科学的アプローチ

**技術面接の4つの評価軸：**
1. **コーディング力**: LeetCode Medium以上を30分で解ける
2. **システム設計**: 大規模システムの設計と trade-off の説明
3. **カルチャーフィット**: チーム開発での協調性とリーダーシップ
4. **学習意欲**: 新技術へのキャッチアップ速度

### 2.6 給与交渉の実践テクニック

**交渉成功の3原則：**
1. 市場価値の正確な把握（複数エージェントから情報収集）
2. 複数内定による交渉力の確保
3. 給与以外の条件（RSU、サイニングボーナス、リモートワーク）も含めた総合交渉

### 2.7 オンボーディング期間の最適化

転職成功は入社後3ヶ月で決まります。

**最初の90日間のロードマップ：**
- 0-30日: プロダクト理解、開発環境構築、小タスクでの貢献
- 31-60日: 中規模機能の実装、コードレビュー参加
- 61-90日: 技術的リーダーシップの発揮、改善提案の実施

## 3. 注目企業カテゴリーと採用トレンド

### 3.1 生成AI スタートアップ

- 平均年収: 800-1500万円
- 求められるスキル: LLM、プロンプトエンジニアリング、RAG
- 代表企業: Sakana AI、Stability AI Japan、Preferred Networks

### 3.2 メガベンチャー

- 平均年収: 700-1200万円
- 求められるスキル: 大規模システム設計、マイクロサービス
- 代表企業: メルカリ、LINE、楽天、サイバーエージェント

### 3.3 外資系テック企業

- 平均年収: 1000-2000万円+RSU
- 求められるスキル: アルゴリズム、システム設計、英語力
- 代表企業: Google、Amazon、Microsoft、Apple

### 3.4 DX推進企業

- 平均年収: 600-1000万円
- 求められるスキル: レガシーシステムのモダナイゼーション
- 代表企業: 大手金融、製造業、小売業のDX部門

## 4. 転職活動のタイムライン

### 最適な転職活動期間: 3-6ヶ月

**月別アクションプラン：**

**1ヶ月目: 準備期間**
- スキルの棚卸しと市場調査
- 履歴書・職務経歴書の作成
- ポートフォリオの整備

**2ヶ月目: 応募開始**
- 10-15社への応募
- カジュアル面談の実施
- 技術課題の対策

**3ヶ月目: 選考本格化**
- 面接対策と実施
- 企業研究の深掘り
- 条件交渉の準備

**4ヶ月目: 内定獲得と交渉**
- 複数内定の獲得
- 条件交渉
- 最終意思決定

## 5. よくある失敗パターンと対策

### 5.1 準備不足による失敗

**症状：**
- コーディングテストで時間切れ
- システム設計で詰まる
- 企業研究が浅い

**対策：**
- LeetCodeを毎日1問、3ヶ月継続
- System Design Primerの完全理解
- 企業の技術ブログ、決算資料の熟読

### 5.2 期待値のミスマッチ

**症状：**
- 入社後に業務内容のギャップ
- 技術スタックの相違
- カルチャーの不一致

**対策：**
- 現場エンジニアとの面談を必須化
- 1日体験入社の活用
- 退職者の口コミサイト確認

### 5.3 交渉の失敗

**症状：**
- 提示年収への即答
- 他社オファーの非開示
- 非金銭的条件の軽視

**対策：**
- 「検討期間をいただきたい」と即答を避ける
- 複数内定を材料に交渉
- トータルパッケージで評価

## 6. 2024年後半の展望

### 6.1 さらなる需要増が予想される分野

- **AI エージェント開発**: 自律的に動作するAIシステム
- **エッジAI**: IoTデバイスでのAI処理
- **量子コンピューティング**: 実用化に向けた研究開発
- **サステナビリティテック**: 環境問題解決のための技術

### 6.2 新しい働き方の定着

- **完全リモート求人**: 全求人の40%以上に
- **4日勤務制**: 先進企業での導入加速
- **副業・複業**: スキルシェアの一般化
- **ワーケーション**: 地方創生との連携

## まとめ

2024年のエンジニア転職市場は、適切な準備と戦略があれば、キャリアの大きな飛躍を実現できる絶好の機会です。特に生成AIの波に乗り、継続的な学習とスキルアップを怠らなければ、理想的なキャリアパスを描くことができるでしょう。

転職は単なる職場の変更ではなく、人生の新しい章の始まりです。この記事が、あなたの転職成功への道標となることを願っています。

**次のアクション：**
1. 自身のスキルセットを棚卸しする
2. 目標企業を5社リストアップする
3. 3ヶ月の学習計画を立てる
4. ポートフォリオの作成を開始する

転職活動は marathon であり sprint ではありません。焦らず、着実に準備を進めていきましょう。
    `,
    tableOfContents: [
      { id: 'intro', title: 'はじめに', level: 1 },
      { id: 'market', title: '1. 2024年エンジニア転職市場の全体像', level: 2 },
      { id: 'scale', title: '1.1 市場規模と成長率', level: 3 },
      { id: 'skills', title: '1.2 需要の高い技術スキルTOP10', level: 3 },
      { id: 'salary', title: '1.3 給与水準の最新動向', level: 3 },
      { id: 'strategy', title: '2. 転職を成功させる7つの戦略', level: 2 },
      { id: 'companies', title: '3. 注目企業カテゴリーと採用トレンド', level: 2 },
      { id: 'timeline', title: '4. 転職活動のタイムライン', level: 2 },
      { id: 'failures', title: '5. よくある失敗パターンと対策', level: 2 },
      { id: 'future', title: '6. 2024年後半の展望', level: 2 },
      { id: 'conclusion', title: 'まとめ', level: 2 }
    ],
    relatedArticles: [
      {
        id: '2',
        title: '面接で差をつける！エンジニア向けコミュニケーション術',
        type: 'guide',
        excerpt: '技術力だけでなく、コミュニケーション能力で差をつける。面接官の心を掴む話し方とは？',
        thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
        author: '鈴木花子',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        publishedAt: new Date('2024-02-14'),
        readTime: 5,
        category: '面接対策'
      },
      {
        id: '3',
        title: 'GitHubで魅せる！採用担当者が注目するポートフォリオの作り方',
        type: 'video',
        excerpt: '実際の採用担当者が語る、GitHubプロフィールとリポジトリの最適化テクニックを動画で解説。',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop',
        author: '佐藤次郎',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        publishedAt: new Date('2024-02-10'),
        readTime: 15,
        category: 'スキルアップ'
      },
      {
        id: '4',
        title: 'リモートワーク時代の転職戦略：地方在住エンジニアの成功事例',
        type: 'blog',
        excerpt: '場所にとらわれない働き方で、理想のキャリアを実現した地方在住エンジニアたちのストーリー。',
        thumbnail: 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&h=400&fit=crop',
        author: '高橋美咲',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        publishedAt: new Date('2024-02-08'),
        readTime: 6,
        category: '働き方'
      },
      {
        id: '5',
        title: 'スタートアップCTOが語る、採用したいエンジニアの条件',
        type: 'podcast',
        excerpt: '急成長スタートアップのCTOが本音で語る、技術力以外で重視するポイントとは？',
        thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
        author: '田中一郎',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        publishedAt: new Date('2024-02-06'),
        readTime: 30,
        category: 'インタビュー'
      }
    ]
  }
  
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }
  
  // Markdown風のコンテンツをHTMLに変換（改良版）
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-4xl font-bold mt-12 mb-6 text-gray-900">{line.substring(2)}</h1>
      } else if (line.startsWith('## ')) {
        const id = line.substring(3).toLowerCase().replace(/\s+/g, '-')
        return <h2 key={index} id={id} className="text-3xl font-semibold mt-10 mb-4 text-gray-900 scroll-mt-20">{line.substring(3)}</h2>
      } else if (line.startsWith('### ')) {
        const id = line.substring(4).toLowerCase().replace(/\s+/g, '-')
        return <h3 key={index} id={id} className="text-2xl font-medium mt-8 mb-3 text-gray-800 scroll-mt-20">{line.substring(4)}</h3>
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-900 mb-3">{line.substring(2, line.length - 2)}</p>
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-2 text-gray-700 list-disc">{line.substring(2)}</li>
      } else if (line.includes('|') && !line.includes('-')) {
        const cells = line.split('|').filter(cell => cell.trim())
        return (
          <tr key={index} className="border-b">
            {cells.map((cell, i) => (
              <td key={i} className="px-4 py-2 text-gray-700">{cell.trim()}</td>
            ))}
          </tr>
        )
      } else if (line.includes('|') && line.includes('-')) {
        return null // Skip table separator
      } else if (line.match(/^\d+\.\s/)) {
        return <li key={index} className="ml-6 mb-2 text-gray-700 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>
      } else if (line.trim() === '') {
        return <br key={index} />
      } else {
        // Handle inline formatting
        let formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm">$1</code>')
        
        if (formattedLine.includes('<strong>') || formattedLine.includes('<em>') || formattedLine.includes('<code>')) {
          return <p key={index} className="mb-4 leading-relaxed text-gray-700" dangerouslySetInnerHTML={{ __html: formattedLine }} />
        }
        
        return <p key={index} className="mb-4 leading-relaxed text-gray-700">{line}</p>
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Image */}
      <div className="relative h-[400px] w-full">
        <img 
          src={content.thumbnail} 
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute top-4 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4">
            <button 
              onClick={onBack}
              className="flex items-center text-white/90 hover:text-white transition-colors bg-black/30 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              記事一覧に戻る
            </button>
          </div>
        </div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-7xl mx-auto px-4 pb-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white text-sm font-medium rounded-full border border-white/30">
                  <span className="mr-2">{typeIcons[content.type]}</span>
                  {typeLabels[content.type]}
                </span>
                <span className="px-3 py-1 bg-purple-600/80 backdrop-blur-md text-white text-sm font-medium rounded-full">
                  {content.category}
                </span>
                {content.readTime && (
                  <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-white text-sm rounded-full">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {content.readTime}分で読了
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {content.title}
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                {content.excerpt}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 lg:p-12">
                {/* Author & Meta Info */}
                <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b mb-8">
                  <div className="flex items-center">
                    <img 
                      src={content.author.avatar} 
                      alt={content.author.name} 
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{content.author.name}</p>
                      <p className="text-sm text-gray-600">{content.author.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {content.publishedAt.toLocaleDateString('ja-JP')}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {content.viewCount.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      256
                    </span>
                  </div>
                </div>
                
                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {renderContent(content.content)}
                </div>
                
                {/* Tags */}
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="w-5 h-5 text-gray-400" />
                    {content.tags.map((tag) => (
                      <button key={tag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors">
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-8 pt-8 border-t flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                        isLiked 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount.toLocaleString()}</span>
                    </button>
                    <button 
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                        isBookmarked 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <BookmarkPlus className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span>保存</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Author Bio */}
                <div className="mt-12 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">著者について</h3>
                  <div className="flex items-start gap-4">
                    <img 
                      src={content.author.avatar} 
                      alt={content.author.name} 
                      className="w-20 h-20 rounded-xl"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-lg">{content.author.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{content.author.role}</p>
                      <p className="text-gray-700 leading-relaxed">{content.author.bio}</p>
                      {content.author.social && (
                        <div className="flex items-center gap-3 mt-4">
                          {content.author.social.twitter && (
                            <a href={content.author.social.twitter} className="p-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                              <Twitter className="w-4 h-4 text-gray-600" />
                            </a>
                          )}
                          {content.author.social.linkedin && (
                            <a href={content.author.social.linkedin} className="p-2 bg-white rounded-lg hover:shadow-md transition-shadow">
                              <Linkedin className="w-4 h-4 text-gray-600" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
            
            {/* Related Articles for Mobile */}
            <div className="lg:hidden mt-8">
              {content.relatedArticles && content.relatedArticles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    関連記事
                  </h3>
                  <div className="space-y-4">
                    {content.relatedArticles.map((article) => (
                      <article key={article.id} className="group cursor-pointer">
                        <div className="flex gap-4">
                          <img 
                            src={article.thumbnail} 
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{typeIcons[article.type]}</span>
                              <span>{article.category}</span>
                              <span>{article.readTime}分</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            {/* Table of Contents */}
            {content.tableOfContents && content.tableOfContents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                  目次
                </h3>
                <nav className="space-y-2">
                  {content.tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setActiveSection(item.id)}
                      className={`block text-sm transition-all hover:text-purple-600 ${
                        item.level === 1 ? 'font-semibold text-gray-900 py-2' : 
                        item.level === 2 ? 'pl-4 text-gray-700 py-1.5' : 
                        'pl-8 text-gray-600 py-1'
                      } ${activeSection === item.id ? 'text-purple-600 border-l-2 border-purple-600 -ml-2 pl-2' : ''}`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">記事の統計</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{(content.viewCount / 1000).toFixed(1)}K</div>
                  <div className="text-white/80 text-sm">閲覧数</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{likeCount.toLocaleString()}</div>
                  <div className="text-white/80 text-sm">いいね</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">256</div>
                  <div className="text-white/80 text-sm">コメント</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">89</div>
                  <div className="text-white/80 text-sm">シェア</div>
                </div>
              </div>
            </div>
            
            {/* Related Articles */}
            {content.relatedArticles && content.relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  おすすめ記事
                </h3>
                <div className="space-y-6">
                  {content.relatedArticles.map((article) => (
                    <article key={article.id} className="group cursor-pointer">
                      <div className="aspect-video relative overflow-hidden rounded-xl mb-3">
                        <img 
                          src={article.thumbnail} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {article.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-gray-900 ml-1" />
                            </div>
                          </div>
                        )}
                        {article.type === 'podcast' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                              <Headphones className="w-6 h-6 text-gray-900" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur text-white text-xs font-medium rounded-full">
                            {typeIcons[article.type]}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {article.authorAvatar && (
                              <img src={article.authorAvatar} alt={article.author} className="w-5 h-5 rounded-full" />
                            )}
                            <span className="text-xs text-gray-500">{article.author}</span>
                          </div>
                          <span className="text-xs text-gray-500">{article.readTime}分</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            
            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">無料転職相談</h3>
                <p className="text-sm text-gray-700">
                  専門アドバイザーがあなたのキャリアをサポート
                </p>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
                今すぐ相談する
              </button>
            </div>
            
            {/* Newsletter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
                ニュースレター
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                最新の転職情報をメールでお届けします
              </p>
              <input 
                type="email" 
                placeholder="メールアドレス"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
              />
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                購読する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}