# 求人サイトCMS機能 実装プロンプト

## 概要
求人情報を管理・公開し、求人サイトをCMS的に運営できるシステムを構築する。

## 主要機能要件

### 1. 求人管理機能
#### 1.1 求人情報の作成・編集・削除
- **求人基本情報**
  - 求人タイトル
  - 企業名・企業ロゴ
  - 雇用形態（正社員、契約社員、パート・アルバイト、業務委託など）
  - 職種カテゴリ（営業、エンジニア、マーケティング、事務など）
  - 業界カテゴリ（IT、金融、製造業、サービス業など）
  - 勤務地（都道府県、市区町村、最寄り駅、リモート可否）
  - 給与情報（年収・月給・時給、給与レンジ）
  - 勤務時間・休日情報

- **求人詳細情報**
  - 仕事内容（リッチテキストエディタ）
  - 応募資格・必須スキル
  - 歓迎スキル・経験
  - 福利厚生
  - 選考プロセス
  - 募集人数
  - 掲載期限

#### 1.2 求人ステータス管理
- 下書き
- 公開待ち（承認待ち）
- 公開中
- 一時停止
- 掲載終了
- アーカイブ

#### 1.3 求人の一括操作
- 複数求人の一括公開/非公開
- CSVインポート/エクスポート
- 一括編集機能

### 2. 企業管理機能
#### 2.1 企業プロフィール
- 企業基本情報（会社名、設立年、従業員数、資本金）
- 企業紹介文
- 企業ロゴ・カバー画像
- 企業の特徴・アピールポイント
- オフィス写真ギャラリー
- 動画コンテンツ
- SNSリンク

#### 2.2 企業アカウント管理
- 企業担当者アカウント作成
- 権限管理（管理者、編集者、閲覧者）
- 企業ごとの求人掲載上限設定

### 3. コンテンツ管理機能
#### 3.1 ランディングページ作成
- ドラッグ&ドロップでのページビルダー
- テンプレート選択
- カスタムHTML/CSS対応
- プレビュー機能

#### 3.2 特集ページ管理
- 新卒採用特集
- 中途採用特集
- 業界別特集
- 地域別特集
- 季節キャンペーン

#### 3.3 ブログ/お知らせ機能
- 記事作成・編集
- カテゴリ・タグ管理
- 予約投稿
- SNS自動連携

### 4. SEO・マーケティング機能
#### 4.1 SEO管理
- メタタグ設定（タイトル、ディスクリプション）
- OGP設定
- 構造化データ（求人Schema.org）
- XMLサイトマップ自動生成
- robots.txt管理

#### 4.2 URL管理
- カスタムURL設定
- リダイレクト管理
- 404ページカスタマイズ

#### 4.3 アクセス解析
- PV数、UU数
- 求人詳細ページ閲覧数
- 応募率（CVR）
- 流入元分析
- 人気求人ランキング

### 5. 応募管理機能
#### 5.1 応募フォーム
- カスタマイズ可能な応募フォーム
- 必須/任意項目設定
- ファイルアップロード（履歴書、職務経歴書）
- 自動返信メール

#### 5.2 応募者管理
- 応募者一覧
- ステータス管理（未対応、選考中、内定、不採用）
- メモ・タグ付け
- 応募者へのメッセージ送信

### 6. 検索・フィルタリング機能
#### 6.1 求職者向け検索
- キーワード検索
- 詳細条件検索
  - 職種
  - 勤務地
  - 給与
  - 雇用形態
  - こだわり条件（リモート可、未経験OK、急募など）
- 保存した検索条件
- 検索アラート

#### 6.2 管理画面内検索
- 求人検索
- 企業検索
- 応募者検索

### 7. 通知・アラート機能
- 新規応募通知
- 掲載期限アラート
- 承認依頼通知
- システムメンテナンス通知

### 8. レポート・分析機能
#### 8.1 ダッシュボード
- リアルタイムデータ表示
- KPI表示（応募数、掲載求人数、アクティブ企業数）
- グラフ・チャート表示

#### 8.2 定期レポート
- 月次レポート自動生成
- PDFエクスポート
- メール配信

### 9. 多言語対応
- 日本語/英語切り替え
- 求人情報の多言語入力
- 自動翻訳機能（オプション）

### 10. モバイル対応
- レスポンシブデザイン
- モバイル専用管理画面
- プッシュ通知

## 技術仕様

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui コンポーネント
- リッチテキストエディタ（TipTap or Lexical）
- ドラッグ&ドロップ（react-beautiful-dnd）

### バックエンド
- Supabase（既存）
- PostgreSQL
- Edge Functions（必要に応じて）

### データベース設計
```sql
-- 企業テーブル
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  employee_count VARCHAR(50),
  founded_year INT,
  capital INT,
  industry VARCHAR(100),
  website_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 求人テーブル
CREATE TABLE job_postings_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  employment_type VARCHAR(50),
  job_category VARCHAR(100),
  location VARCHAR(255),
  salary_min INT,
  salary_max INT,
  salary_type VARCHAR(20), -- 'yearly', 'monthly', 'hourly'
  requirements TEXT,
  benefits TEXT,
  work_hours VARCHAR(255),
  holidays VARCHAR(255),
  recruitment_count INT,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  view_count INT DEFAULT 0,
  apply_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  custom_url VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 応募テーブル
CREATE TABLE job_applications_cms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES job_postings_cms(id),
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(50),
  resume_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ページテーブル
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB,
  template VARCHAR(50),
  status VARCHAR(20) DEFAULT 'draft',
  seo_title VARCHAR(255),
  seo_description TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ブログ記事テーブル
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID,
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## UI/UXデザイン要件

### 管理画面
1. **ダッシュボード**
   - 重要指標の一覧表示
   - 最近の応募
   - 人気求人ランキング
   - TODOリスト

2. **求人管理画面**
   - テーブル表示/カード表示切り替え
   - インライン編集
   - ドラフト自動保存
   - プレビュー機能

3. **ビジュアルエディタ**
   - WYSIWYG編集
   - テンプレート選択
   - リアルタイムプレビュー

### 求職者向け画面
1. **トップページ**
   - ヒーローセクション
   - 注目求人
   - 職種別求人
   - 新着求人

2. **求人検索ページ**
   - サイドバーフィルター
   - 並び替え機能
   - お気に入り保存

3. **求人詳細ページ**
   - 企業情報表示
   - 関連求人表示
   - SNSシェアボタン
   - 応募フォーム

## 実装優先順位

### Phase 1（MVP）- 1-2週間
1. 求人CRUD機能
2. 企業管理基本機能
3. 応募フォーム
4. 基本的な検索機能
5. 求人一覧・詳細ページ

### Phase 2（基本機能拡張）- 2-3週間
1. SEO管理機能
2. アクセス解析
3. 応募者管理
4. ダッシュボード
5. メール通知

### Phase 3（高度な機能）- 3-4週間
1. ページビルダー
2. ブログ機能
3. 多言語対応
4. 高度な分析機能
5. API連携

## 実装手順

1. **データベース設計とマイグレーション**
2. **基本的なCRUD APIの実装**
3. **管理画面UIの構築**
4. **求職者向け画面の構築**
5. **検索・フィルタリング機能の実装**
6. **SEO・メタデータ管理の実装**
7. **応募機能の実装**
8. **通知システムの構築**
9. **分析・レポート機能の追加**
10. **テストとデバッグ**

## 成功指標（KPI）

- 求人掲載数
- 月間応募数
- 応募率（CVR）
- 平均掲載期間
- リピート企業率
- ページ表示速度
- モバイルユーザビリティスコア
- SEOランキング向上

## セキュリティ要件

- 個人情報の暗号化
- SQLインジェクション対策
- XSS対策
- CSRF対策
- レート制限
- 定期的なセキュリティ監査
- GDPRコンプライアンス

## 追加検討事項

- AIによる求人マッチング
- チャットボット統合
- ビデオ面接機能
- スキル診断テスト
- 給与相場情報
- 企業レビュー機能
- ソーシャルリクルーティング連携