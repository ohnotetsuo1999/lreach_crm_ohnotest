# データベース構成 クイックリファレンス

## 🗂️ 実際のPrismaスキーマ テーブル一覧

### ユーザー関連
| テーブル名 | 用途 | 主キー | 重要なカラム |
|-----------|------|--------|-------------|
| users | ユーザー基本情報 | id (CUID) | name, lineUid (UNIQUE), email, phone |
| user_tags | ユーザータグ関連 | userId, tagId | assignedAt |
| user_status_logs | ステータス履歴 | id | userId, statusId, changedAt |

### 配信関連
| テーブル名 | 用途 | 主キー | 重要なカラム |
|-----------|------|--------|-------------|
| campaigns | キャンペーン | id | name, startAt, endAt |
| scenarios | シナリオ定義 | id | campaignId, trigger, triggerValue, isActive |
| packs | メッセージパック | id | scenarioId, order, offsetMinutes |
| templates | メッセージテンプレート | id | packId, order, lineMessageJson |
| delivery_logs | 配信ログ | id | userId, templateId, status |

### 分類・管理
| テーブル名 | 用途 | 主キー | 重要なカラム |
|-----------|------|--------|-------------|
| tags | タグマスタ | id | name (UNIQUE), type |
| statuses | ステータスマスタ | id | code (UNIQUE), label |
| segments | セグメント定義 | id | name, filterJson |

## 🔗 主要リレーションシップ

```
users ←→ tags (多対多: user_tags経由)
users → user_status_logs (1対多)
users → delivery_logs (1対多)

campaigns → scenarios (1対多)
scenarios → packs (1対多)
packs → templates (1対多)
templates → delivery_logs (1対多)
```

## 📊 Prisma Enum定義

### TagType
```prisma
enum TagType {
  MANUAL      // 手動設定
  AUTOMATIC   // 自動設定
  BEHAVIORAL  // 行動ベース
}
```

### TriggerType
```prisma
enum TriggerType {
  MANUAL          // 手動実行
  SCHEDULE        // スケジュール
  USER_ACTION     // ユーザーアクション
  TAG_ADDED       // タグ追加
  STATUS_CHANGED  // ステータス変更
  TIME_BASED      // 時間ベース
}
```

### DeliveryStatus
```prisma
enum DeliveryStatus {
  PENDING    // 送信待ち
  SENT       // 送信済み
  DELIVERED  // 配信済み
  OPENED     // 開封済み
  CLICKED    // クリック済み
  FAILED     // 失敗
  CANCELLED  // キャンセル
}
```

## 🚀 Prismaクエリパターン

### ユーザー検索
```typescript
// LINEユーザーIDで検索
const user = await prisma.user.findUnique({
  where: { lineUid: 'LINE_USER_ID' }
});

// タグでユーザー検索
const users = await prisma.user.findMany({
  where: {
    userTags: {
      some: {
        tag: { name: 'VIP' }
      }
    }
  }
});
```

### 配信状況確認
```typescript
// 配信成功率
const stats = await prisma.deliveryLog.groupBy({
  by: ['status'],
  where: { templateId: 'TEMPLATE_ID' },
  _count: true
});
```

### アクティブシナリオ取得
```typescript
// アクティブなシナリオ一覧
const scenarios = await prisma.scenario.findMany({
  where: {
    isActive: true,
    campaign: {
      OR: [
        { endAt: null },
        { endAt: { gt: new Date() } }
      ]
    }
  },
  include: { campaign: true }
});
```

### 階層データ取得
```typescript
// キャンペーン配下の全データ取得
const campaign = await prisma.campaign.findUnique({
  where: { id: campaignId },
  include: {
    scenarios: {
      include: {
        packs: {
          include: {
            templates: true
          }
        }
      }
    }
  }
});
```

## 🔐 セキュリティ考慮事項

### 個人情報を含むカラム
- users.lineUid
- users.email
- users.phone

### CASCADE DELETE設定
- user_tags: ユーザーまたはタグ削除時
- user_status_logs: ユーザー削除時
- scenarios: キャンペーン削除時
- packs: シナリオ削除時
- templates: パック削除時

## 📈 パフォーマンスチューニング

### SQLiteでの推奨インデックス
```sql
-- ユーザー検索用
CREATE UNIQUE INDEX idx_users_lineUid ON users(lineUid);
CREATE INDEX idx_users_created ON users(createdAt);

-- タグ検索用
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_user_tags_user ON user_tags(userId);
CREATE INDEX idx_user_tags_tag ON user_tags(tagId);

-- ステータス
CREATE UNIQUE INDEX idx_statuses_code ON statuses(code);

-- 配信ログ検索用
CREATE INDEX idx_delivery_logs_user ON delivery_logs(userId);
CREATE INDEX idx_delivery_logs_template ON delivery_logs(templateId);
CREATE INDEX idx_delivery_logs_status ON delivery_logs(status);
```

## 🛠️ 開発用Prismaコマンド

### 基本コマンド
```bash
# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション（開発）
npx prisma migrate dev --name "migration_name"

# データベースリセット
npx prisma migrate reset

# Prisma Studio起動（データビューア）
npx prisma studio

# スキーマ検証
npx prisma validate

# データベースへスキーマ反映（マイグレーションなし）
npx prisma db push
```

### データシード
```bash
# シードデータ投入
npx prisma db seed
```

## 📝 Prismaスキーマ規則

### ID生成
- すべて `@default(cuid())` を使用
- CUID: Collision-resistant Unique Identifier

### タイムスタンプ
- createdAt: `@default(now())`
- updatedAt: `@updatedAt`

### テーブル名マッピング
```prisma
model User {
  // ...
  @@map("users") // 実テーブル名
}
```

### リレーション定義
```prisma
// 1対多
campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

// 多対多（中間テーブル）
@@id([userId, tagId])
```

## 🚨 トランザクション処理

### 基本的なトランザクション
```typescript
const result = await prisma.$transaction([
  prisma.userTag.deleteMany({ where: { userId } }),
  prisma.userTag.createMany({ data: newTags })
]);
```

### インタラクティブトランザクション
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id: userId },
    data: { /* ... */ }
  });
  
  await tx.userStatusLog.create({
    data: {
      userId: user.id,
      statusId: newStatusId
    }
  });
});
```

## 💡 TypeScript型の活用

### Prismaが生成する型
```typescript
import { User, Tag, Scenario } from '@prisma/client';

// includeを使った型
import { Prisma } from '@prisma/client';
type ScenarioWithPacks = Prisma.ScenarioGetPayload<{
  include: { packs: true }
}>;
```

### 拡張型定義
TypeScriptレイヤー (`/src/types/`) で以下を拡張：
- カスタムフィールド
- 計算プロパティ
- ビジネスロジック
- UIステート