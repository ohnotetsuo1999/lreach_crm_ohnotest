# データベース構成ドキュメント

## 概要

このドキュメントは、LINE配信自動化システムのデータベース構成について説明します。本システムは **Prisma ORM** を使用し、開発環境では **SQLite** データベースを使用しています。

## データベースアーキテクチャ

### 技術スタック
- **データベース**: SQLite (開発環境)
- **ORM**: Prisma
- **スキーマ定義**: `/prisma/schema.prisma`
- **型定義**: TypeScript (`/src/types/`)
- **拡張可能**: Supabase (PostgreSQL) への移行可能

## 主要エンティティ

### 1. ユーザー管理

#### User (users)
ユーザー情報を管理する中核テーブル

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | ユーザーID | ✓ |
| name | string | ユーザー名 | ✓ |
| lineUid | string | LINE UID (ユニーク) | |
| email | string | メールアドレス | |
| phone | string | 電話番号 | |
| createdAt | DateTime | 作成日時 | ✓ |
| updatedAt | DateTime | 更新日時 | ✓ |

**リレーション**:
- → userTags (1対多)
- → userStatusLogs (1対多)
- → deliveryLogs (1対多)

#### UserTag (user_tags)
ユーザーとタグの中間テーブル

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| userId | string | ユーザーID | ✓ |
| tagId | string | タグID | ✓ |
| assignedAt | DateTime | 割当日時 | ✓ |

**制約**:
- 複合主キー: (userId, tagId)
- CASCADE DELETE: ユーザーまたはタグ削除時に自動削除

#### UserStatusLog (user_status_logs)
ユーザーステータス変更履歴

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | ログID | ✓ |
| userId | string | ユーザーID | ✓ |
| statusId | string | ステータスID | ✓ |
| changedAt | DateTime | 変更日時 | ✓ |

**制約**:
- CASCADE DELETE: ユーザー削除時に自動削除

### 2. 分類・整理

#### Tag (tags)
ユーザー分類用タグ

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | タグID | ✓ |
| name | string | タグ名 (ユニーク) | ✓ |
| type | TagType | タグタイプ | ✓ |
| createdAt | DateTime | 作成日時 | ✓ |

**TagType列挙型**:
- MANUAL: 手動設定
- AUTOMATIC: 自動設定
- BEHAVIORAL: 行動ベース

#### Status (statuses)
ユーザーステータス定義

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | ステータスID | ✓ |
| code | string | ステータスコード (ユニーク) | ✓ |
| label | string | 表示名 | ✓ |

#### Segment (segments)
ユーザーセグメント定義

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | セグメントID | ✓ |
| name | string | セグメント名 | ✓ |
| filterJson | string | フィルター条件 (JSON) | ✓ |
| createdAt | DateTime | 作成日時 | ✓ |
| updatedAt | DateTime | 更新日時 | ✓ |

**filterJson例**:
```json
{
  "operator": "AND",
  "conditions": [
    {"type": "tag", "tagId": "xxx", "operator": "has"},
    {"type": "status", "statusId": "yyy", "operator": "is"}
  ]
}
```

### 3. キャンペーン・配信

#### Campaign (campaigns)
キャンペーン管理

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | キャンペーンID | ✓ |
| name | string | キャンペーン名 | ✓ |
| startAt | DateTime | 開始日時 | |
| endAt | DateTime | 終了日時 | |
| createdBy | string | 作成者ID | |
| createdAt | DateTime | 作成日時 | ✓ |
| updatedAt | DateTime | 更新日時 | ✓ |

**リレーション**:
- → scenarios (1対多)

#### Scenario (scenarios)
自動配信シナリオ

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | シナリオID | ✓ |
| campaignId | string | キャンペーンID | ✓ |
| name | string | シナリオ名 | ✓ |
| trigger | TriggerType | トリガータイプ | ✓ |
| triggerValue | string | トリガー詳細パラメータ | |
| isActive | boolean | 有効状態 | ✓ |
| createdAt | DateTime | 作成日時 | ✓ |
| updatedAt | DateTime | 更新日時 | ✓ |

**TriggerType列挙型**:
- MANUAL: 手動実行
- SCHEDULE: スケジュール実行
- USER_ACTION: ユーザーアクション
- TAG_ADDED: タグ追加時
- STATUS_CHANGED: ステータス変更時
- TIME_BASED: 時間ベース

**制約**:
- CASCADE DELETE: キャンペーン削除時に自動削除

#### Pack (packs)
メッセージパック（テンプレートコンテナ）

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | パックID | ✓ |
| scenarioId | string | シナリオID | ✓ |
| order | int | 実行順序 | ✓ |
| offsetMinutes | int | 遅延時間（分） | ✓ |
| conditionJson | string | 条件定義 (JSON) | |
| createdAt | DateTime | 作成日時 | ✓ |

**説明**:
- シナリオ内で順序付けされたメッセージのバンドル
- offsetMinutes: トリガーまたは前のパックからの遅延時間
- conditionJson: 実行条件（タグ、ステータスなど）

**制約**:
- CASCADE DELETE: シナリオ削除時に自動削除

#### Template (templates)
メッセージテンプレート

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | テンプレートID | ✓ |
| packId | string | パックID | ✓ |
| order | int | 表示順序 | ✓ |
| lineMessageJson | string | LINE メッセージJSON | ✓ |
| createdAt | DateTime | 作成日時 | ✓ |
| updatedAt | DateTime | 更新日時 | ✓ |

**lineMessageJson例**:
```json
{
  "type": "text",
  "text": "こんにちは！"
}
```
or
```json
{
  "type": "flex",
  "altText": "メッセージ",
  "contents": { /* Flex Message */ }
}
```

**制約**:
- CASCADE DELETE: パック削除時に自動削除

### 4. 配信履歴

#### DeliveryLog (delivery_logs)
配信ログ

| カラム名 | 型 | 説明 | 必須 |
|---------|---|------|-----|
| id | string (CUID) | ログID | ✓ |
| templateId | string | テンプレートID | ✓ |
| userId | string | ユーザーID | ✓ |
| status | DeliveryStatus | 配信ステータス | ✓ |
| sentAt | DateTime | 送信日時 | |
| openedAt | DateTime | 開封日時 | |
| clickedAt | DateTime | クリック日時 | |
| error | string | エラー内容 | |
| createdAt | DateTime | 作成日時 | ✓ |

**DeliveryStatus列挙型**:
- PENDING: 送信待ち
- SENT: 送信済み
- DELIVERED: 配信済み
- OPENED: 開封済み
- CLICKED: クリック済み
- FAILED: 失敗
- CANCELLED: キャンセル

## データベース構造の概要

### エンティティ関係図
```
Campaign (キャンペーン)
  └── Scenario (シナリオ) 
        └── Pack (メッセージパック)
              └── Template (テンプレート)
                    └── DeliveryLog (配信ログ)

User (ユーザー)
  ├── UserTag (タグ関連)
  ├── UserStatusLog (ステータス履歴)
  └── DeliveryLog (受信履歴)
```

## 拡張型システム（TypeScriptレイヤー）

実際のPrismaスキーマに加えて、TypeScriptの型システム(`/src/types/`)では以下の拡張機能が定義されています：

### 拡張されたユーザーフィールド
- customFields (JSON): 誕生日、記念日、契約期限などのカスタム日付
- 住所情報の拡張

### 追加エンティティ（型定義のみ）
- **Reservation**: 予約管理
- **ReservationReminder**: リマインダー設定
- **Broadcast**: 一斉配信管理
- **ActionRule**: アクションルール定義
- **UserAction**: ユーザーアクション追跡

### フォルダシステム
- TagFolder, StatusFolder, SegmentFolder等の階層管理
- 各エンティティの整理・分類機能

## Prismaスキーマの特徴

### ID生成
- すべてのIDは`@default(cuid())`を使用
- CUID (Collision-resistant Unique Identifier) による一意性保証

### タイムスタンプ
- `createdAt`: `@default(now())`で自動設定
- `updatedAt`: `@updatedAt`で自動更新

### リレーション
- 外部キー制約による参照整合性
- CASCADE DELETE による関連データの自動削除
- 多対多リレーションは中間テーブルで実装

## 列挙型 (Enums)

### TriggerType
```typescript
enum TriggerType {
  MANUAL = 'MANUAL',                   // 手動実行
  SCHEDULE = 'SCHEDULE',               // スケジュール実行
  USER_ACTION = 'USER_ACTION',         // ユーザーアクション
  TAG_ADDED = 'TAG_ADDED',             // タグ追加時
  STATUS_CHANGED = 'STATUS_CHANGED',   // ステータス変更時
  TIME_BASED = 'TIME_BASED',           // 時間ベース
  FRIEND_ADDED = 'FRIEND_ADDED'        // 友だち追加時
}
```

### DeliveryStatus
```typescript
enum DeliveryStatus {
  PENDING = 'PENDING',       // 送信待ち
  SENT = 'SENT',            // 送信済み
  DELIVERED = 'DELIVERED',   // 配信済み
  OPENED = 'OPENED',        // 開封済み
  CLICKED = 'CLICKED',      // クリック済み
  FAILED = 'FAILED',        // 失敗
  CANCELLED = 'CANCELLED'   // キャンセル
}
```

### ActionType
```typescript
enum ActionType {
  ADD_TAG = 'ADD_TAG',               // タグ追加
  REMOVE_TAG = 'REMOVE_TAG',         // タグ削除
  CHANGE_STATUS = 'CHANGE_STATUS',   // ステータス変更
  SEND_MESSAGE = 'SEND_MESSAGE',     // メッセージ送信
  WAIT = 'WAIT',                     // 待機
  CONDITIONAL = 'CONDITIONAL'        // 条件分岐
}
```

### UserActionType
```typescript
enum UserActionType {
  URL_CLICK = 'URL_CLICK',           // URLクリック
  BUTTON_CLICK = 'BUTTON_CLICK',     // ボタンクリック
  IMAGE_CLICK = 'IMAGE_CLICK',       // 画像クリック
  TEXT_SELECT = 'TEXT_SELECT',       // テキスト選択
  MESSAGE_SHARE = 'MESSAGE_SHARE',   // メッセージ共有
  REPLY = 'REPLY',                   // 返信
  REACTION = 'REACTION',             // リアクション
  POSTBACK = 'POSTBACK'              // ポストバック
}
```

## リレーションシップ

### 主要な関係性

1. **User ↔ Tag** (多対多)
   - 中間テーブル: UserTag

2. **User → UserStatusLog** (1対多)
   - ユーザーのステータス変更履歴

3. **Campaign → Scenario** (1対多)
   - キャンペーンに複数のシナリオ

4. **Scenario → Pack** (1対多)
   - シナリオに複数のメッセージパック

5. **Pack ↔ Template** (多対多)
   - 中間テーブル: PackTemplate

6. **Template → DeliveryLog** (1対多)
   - テンプレートの配信履歴

7. **DeliveryLog → UserAction** (1対多)
   - 配信に対するユーザーアクション

8. **User → Reservation** (1対多)
   - ユーザーの予約情報

## インデックス戦略

### 推奨インデックス

1. **users**
   - lineUid (UNIQUE)
   - createdAt
   - (name, createdAt) - 複合インデックス

2. **user_tags**
   - (userId, tagId) - 複合ユニークインデックス
   - tagId
   - assignedAt

3. **delivery_logs**
   - (userId, templateId, createdAt) - 複合インデックス
   - status
   - sentAt

4. **user_actions**
   - (userId, timestamp)
   - (templateId, actionType)
   - processed

## データ整合性

### 外部キー制約

- user_tags.userId → users.id (CASCADE DELETE)
- user_tags.tagId → tags.id (CASCADE DELETE)
- delivery_logs.userId → users.id (CASCADE DELETE)
- delivery_logs.templateId → templates.id (RESTRICT DELETE)
- scenarios.campaignId → campaigns.id (CASCADE DELETE)
- packs.scenarioId → scenarios.id (CASCADE DELETE)

### トランザクション要件

以下の操作はトランザクション内で実行:
1. ユーザーへのタグ一括割り当て
2. シナリオとそのパックの作成/更新
3. 配信実行とログ記録
4. ユーザーアクションの処理とそれに伴う状態変更

## パフォーマンス最適化

### JSONフィールドの使用
- `filterJson`: セグメント条件の複雑なクエリ
- `messageFlow`: シナリオのフロー定義
- `customFields`: ユーザーの拡張フィールド

### 推奨事項
1. JSON フィールドには GIN インデックスを使用
2. 大量配信時は配信ログをバッチ挿入
3. ユーザーアクションは非同期処理でキューイング
4. 統計情報は定期的に集計してキャッシュ

## バックアップ・リカバリ

### バックアップ戦略
1. **日次バックアップ**: 全データ
2. **トランザクションログ**: リアルタイムレプリケーション
3. **重要データ**: 配信ログとユーザーアクションは別途アーカイブ

### リカバリポイント目標 (RPO)
- 本番環境: 1時間以内
- 開発環境: 24時間以内

## セキュリティ考慮事項

1. **個人情報保護**
   - ユーザー情報は暗号化
   - LINE UIDは別テーブルで管理を検討

2. **アクセス制御**
   - Row Level Security (RLS) の実装
   - APIレベルでの権限管理

3. **監査ログ**
   - 重要な操作は監査ログに記録
   - ユーザーデータの変更履歴を保持

## マイグレーション

### Prismaマイグレーション
```bash
# 開発環境
npx prisma migrate dev

# 本番環境
npx prisma migrate deploy
```

### Supabaseマイグレーション
- Supabase Dashboard経由でSQL実行
- またはSupabase CLIを使用

## 今後の拡張計画

1. **分析機能の強化**
   - 配信効果の詳細分析テーブル
   - ユーザー行動パターンの保存

2. **マルチテナント対応**
   - organization テーブルの追加
   - すべてのテーブルに organizationId を追加

3. **A/Bテスト機能**
   - experiment テーブルの追加
   - variant 管理機能

4. **AIレコメンデーション**
   - recommendation_scores テーブル
   - user_preferences テーブル