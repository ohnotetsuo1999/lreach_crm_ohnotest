# データフローとシステムアーキテクチャ

## システム概要図

```mermaid
graph TB
    subgraph "フロントエンド"
        UI[React UI]
    end
    
    subgraph "APIレイヤー"
        API[Next.js API Routes]
        Auth[認証]
    end
    
    subgraph "データベース層"
        Supabase[(Supabase<br/>PostgreSQL)]
        Cache[(Redis Cache)]
    end
    
    subgraph "外部サービス"
        LINE[LINE Messaging API]
        Storage[File Storage]
    end
    
    UI --> API
    API --> Auth
    API --> Supabase
    API --> Cache
    API --> LINE
    API --> Storage
```

## 主要なデータフロー

### 1. ユーザー登録・管理フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant L as LINE
    participant A as API
    participant DB as Database
    
    U->>L: 友だち追加
    L->>A: Webhook (follow event)
    A->>DB: ユーザー作成
    Note over DB: users テーブルに挿入
    A->>DB: 初期タグ付与
    Note over DB: user_tags に挿入
    A->>DB: 初期ステータス設定
    Note over DB: user_status_logs に記録
    A-->>L: Welcome メッセージ送信
```

### 2. シナリオ配信フロー

```mermaid
flowchart TB
    Start([トリガー発火]) --> Check{トリガータイプ}
    
    Check -->|時間ベース| Timer[定期実行]
    Check -->|ユーザーアクション| Action[アクション検知]
    Check -->|タグ追加| Tag[タグ変更検知]
    
    Timer --> Target
    Action --> Target
    Tag --> Target
    
    Target[対象ユーザー抽出] --> Segment{セグメント条件}
    Segment -->|合致| Pack[Pack取得]
    Segment -->|非合致| End([終了])
    
    Pack --> Template[Template取得]
    Template --> Send[メッセージ送信]
    Send --> Log[配信ログ記録]
    Log --> Wait{次のPack?}
    Wait -->|あり| Delay[遅延処理]
    Wait -->|なし| End
    Delay --> Pack
```

### 3. ユーザーアクション処理フロー

```mermaid
stateDiagram-v2
    [*] --> メッセージ配信
    メッセージ配信 --> ユーザーアクション
    
    state ユーザーアクション {
        [*] --> アクション受信
        アクション受信 --> アクション記録
        アクション記録 --> 条件評価
        
        条件評価 --> タグ操作: タグ追加/削除
        条件評価 --> ステータス変更: ステータス更新
        条件評価 --> 次のメッセージ: メッセージ送信
        条件評価 --> 外部連携: Webhook
    }
    
    タグ操作 --> 完了
    ステータス変更 --> 完了
    次のメッセージ --> 完了
    外部連携 --> 完了
    
    完了 --> [*]
```

## データ整合性の保証

### トランザクション境界

```mermaid
graph LR
    subgraph "トランザクション1: ユーザータグ更新"
        A1[user_tags削除] --> A2[user_tags挿入]
        A2 --> A3[user_action_logs記録]
    end
    
    subgraph "トランザクション2: 配信実行"
        B1[delivery_logs作成] --> B2[送信カウント更新]
        B2 --> B3[ステータス更新]
    end
    
    subgraph "トランザクション3: シナリオ更新"
        C1[scenario更新] --> C2[packs削除]
        C2 --> C3[packs作成]
        C3 --> C4[pack_templates作成]
    end
```

## キャッシュ戦略

### キャッシュ対象と更新タイミング

| データ種別 | キャッシュ時間 | 更新トリガー | キーパターン |
|-----------|--------------|-------------|-------------|
| ユーザー基本情報 | 1時間 | 更新時即座 | `user:{userId}` |
| タグ一覧 | 24時間 | タグ作成/更新時 | `tags:all` |
| セグメント結果 | 15分 | セグメント更新時 | `segment:{segmentId}:users` |
| テンプレート | 1時間 | テンプレート更新時 | `template:{templateId}` |
| 配信統計 | 5分 | - | `stats:delivery:{broadcastId}` |

### キャッシュ無効化フロー

```mermaid
graph TD
    Update[データ更新] --> InvalidateCache[キャッシュ無効化]
    InvalidateCache --> UpdateDB[DB更新]
    UpdateDB --> RefreshCache[キャッシュ再生成]
    RefreshCache --> Notify[関連キャッシュ通知]
    
    Notify --> UserCache[ユーザーキャッシュ]
    Notify --> SegmentCache[セグメントキャッシュ]
    Notify --> StatsCache[統計キャッシュ]
```

## バックグラウンドジョブ

### ジョブの種類と実行タイミング

```mermaid
gantt
    title バックグラウンドジョブスケジュール
    dateFormat HH:mm
    axisFormat %H:%M
    
    section 定期ジョブ
    セグメント再計算     :done, seg1, 00:00, 30m
    配信統計集計         :done, stat1, 00:30, 20m
    アクション処理       :active, act1, 00:00, 24h
    
    section 日次ジョブ
    データクリーンアップ  :crit, clean1, 02:00, 1h
    レポート生成         :done, report1, 03:00, 30m
    バックアップ         :done, backup1, 04:00, 2h
```

### ジョブ処理フロー

```mermaid
stateDiagram-v2
    [*] --> ジョブキュー登録
    
    state ジョブ実行 {
        ジョブキュー登録 --> ジョブ取得
        ジョブ取得 --> 実行中
        実行中 --> 成功: 正常終了
        実行中 --> 失敗: エラー発生
        
        失敗 --> リトライ判定
        リトライ判定 --> ジョブ取得: リトライ可能
        リトライ判定 --> デッドレター: リトライ上限
    }
    
    成功 --> ログ記録
    デッドレター --> アラート送信
    ログ記録 --> [*]
    アラート送信 --> [*]
```

## データ分析パイプライン

### リアルタイム分析

```mermaid
graph LR
    subgraph "イベントストリーム"
        E1[配信イベント]
        E2[開封イベント]
        E3[クリックイベント]
        E4[アクションイベント]
    end
    
    subgraph "処理"
        P1[イベント集約]
        P2[リアルタイム集計]
        P3[異常検知]
    end
    
    subgraph "出力"
        O1[ダッシュボード]
        O2[アラート]
        O3[レポート]
    end
    
    E1 --> P1
    E2 --> P1
    E3 --> P1
    E4 --> P1
    
    P1 --> P2
    P1 --> P3
    
    P2 --> O1
    P2 --> O3
    P3 --> O2
```

### バッチ分析

```mermaid
flowchart TB
    subgraph "日次バッチ"
        Raw[(生データ)] --> ETL[ETL処理]
        ETL --> DW[(データウェアハウス)]
        DW --> Agg[集計処理]
        Agg --> Report[レポート生成]
    end
    
    subgraph "分析結果"
        Report --> UserReport[ユーザー分析]
        Report --> CampaignReport[キャンペーン分析]
        Report --> SegmentReport[セグメント分析]
    end
```

## セキュリティとアクセス制御

### データアクセス階層

```mermaid
graph TD
    subgraph "アプリケーション層"
        API[API Gateway]
        Auth[認証・認可]
    end
    
    subgraph "データアクセス層"
        RLS[Row Level Security]
        Encrypt[暗号化]
    end
    
    subgraph "データ層"
        Sensitive[機密データ]
        Public[公開データ]
    end
    
    API --> Auth
    Auth --> RLS
    RLS --> Encrypt
    Encrypt --> Sensitive
    RLS --> Public
```

### 監査ログフロー

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    participant Audit
    
    User->>API: データ操作要求
    API->>API: 認証・認可チェック
    API->>DB: データ操作実行
    
    par 並行処理
        DB-->>API: 操作結果
    and
        API->>Audit: 監査ログ記録
    end
    
    API-->>User: レスポンス返却
    
    Note over Audit: 監査ログ内容<br/>- ユーザーID<br/>- 操作種別<br/>- 対象データ<br/>- タイムスタンプ<br/>- IPアドレス
```

## スケーラビリティ対策

### 水平スケーリング戦略

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[ロードバランサー]
    end
    
    subgraph "Application Servers"
        App1[Server 1]
        App2[Server 2]
        App3[Server N]
    end
    
    subgraph "Database Cluster"
        Master[(Master DB)]
        Slave1[(Read Replica 1)]
        Slave2[(Read Replica 2)]
    end
    
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> Master
    App2 --> Slave1
    App3 --> Slave2
    
    Master -.同期.-> Slave1
    Master -.同期.-> Slave2
```

### シャーディング戦略

| テーブル | シャーディングキー | 分割方法 |
|---------|------------------|----------|
| users | userId | ハッシュ分割 |
| delivery_logs | userId + 年月 | 複合キー分割 |
| user_actions | userId | ハッシュ分割 |
| campaigns | campaignId | レンジ分割 |

## 災害復旧計画

### バックアップとリストア

```mermaid
graph LR
    subgraph "本番環境"
        Prod[(本番DB)]
        ProdApp[本番アプリ]
    end
    
    subgraph "バックアップ"
        Daily[日次バックアップ]
        Continuous[継続的レプリケーション]
        Snapshot[スナップショット]
    end
    
    subgraph "災害復旧環境"
        DR[(DR DB)]
        DRApp[DRアプリ]
    end
    
    Prod --> Daily
    Prod --> Continuous
    Prod --> Snapshot
    
    Daily --> DR
    Continuous --> DR
    Snapshot --> DR
    
    DR --> DRApp
```

### RPO/RTO目標

- **RPO (Recovery Point Objective)**: 1時間
- **RTO (Recovery Time Objective)**: 4時間

### 復旧手順

1. 障害検知とアラート
2. 影響範囲の特定
3. DRサイトへの切り替え判断
4. DNSおよびロードバランサーの切り替え
5. データ整合性の確認
6. サービス再開とモニタリング