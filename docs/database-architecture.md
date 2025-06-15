# データベースアーキテクチャ設計書

## システム概要

LINE配信自動化システムは、マーケティングオートメーション機能を提供するWebアプリケーションです。Prisma ORMとSQLiteデータベースを使用して、ユーザー管理、メッセージ配信、キャンペーン管理などの機能を実現しています。

## アーキテクチャ構成

### レイヤード・アーキテクチャ

```
┌─────────────────────────────────────┐
│      Frontend (React/Next.js)       │
├─────────────────────────────────────┤
│      API Layer (Next.js API)        │
├─────────────────────────────────────┤
│   Type System (TypeScript)          │
├─────────────────────────────────────┤
│      ORM Layer (Prisma)             │
├─────────────────────────────────────┤
│    Database (SQLite/PostgreSQL)     │
└─────────────────────────────────────┘
```

### データベース選択の理由

#### 開発環境: SQLite
- **軽量性**: セットアップ不要で即座に開発開始可能
- **ポータビリティ**: ファイルベースで環境間の移行が容易
- **開発速度**: ローカル環境での高速な開発サイクル

#### 本番環境対応: PostgreSQL (Supabase)
- **スケーラビリティ**: 大規模データに対応
- **高度な機能**: JSON型、全文検索、パーティショニング
- **Prismaの互換性**: スキーマ定義を変更せずに移行可能

## データモデル設計

### 階層構造

```
Campaign（キャンペーン）
├── Scenario（シナリオ）
│   ├── Pack（メッセージパック）
│   │   └── Template（テンプレート）
│   │       └── DeliveryLog（配信ログ）
│   └── Trigger（トリガー設定）
└── Schedule（スケジュール設定）

User（ユーザー）
├── UserTag（タグ関連）
├── UserStatusLog（ステータス履歴）
└── DeliveryLog（受信履歴）
```

### エンティティ設計の原則

1. **正規化**: 第3正規形を基本とし、パフォーマンスを考慮して適切に非正規化
2. **拡張性**: JSON型フィールドで柔軟な属性管理
3. **監査性**: すべてのエンティティにcreatedAt/updatedAtを付与
4. **一意性**: CUIDによる衝突耐性のあるID生成

## パフォーマンス設計

### インデックス戦略

```sql
-- 頻繁に検索されるカラム
CREATE UNIQUE INDEX idx_users_lineUid ON users(lineUid);
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE UNIQUE INDEX idx_statuses_code ON statuses(code);

-- 結合性能向上
CREATE INDEX idx_user_tags_composite ON user_tags(userId, tagId);
CREATE INDEX idx_delivery_logs_composite ON delivery_logs(userId, templateId, createdAt);

-- フィルタリング性能
CREATE INDEX idx_scenarios_active ON scenarios(isActive, campaignId);
CREATE INDEX idx_delivery_logs_status ON delivery_logs(status);
```

### クエリ最適化

#### N+1問題の回避
```typescript
// Bad: N+1クエリ
const campaigns = await prisma.campaign.findMany();
for (const campaign of campaigns) {
  const scenarios = await prisma.scenario.findMany({
    where: { campaignId: campaign.id }
  });
}

// Good: Eager Loading
const campaigns = await prisma.campaign.findMany({
  include: {
    scenarios: {
      include: {
        packs: {
          include: { templates: true }
        }
      }
    }
  }
});
```

### バッチ処理
```typescript
// 大量データの一括挿入
await prisma.deliveryLog.createMany({
  data: deliveryLogs,
  skipDuplicates: true
});

// チャンク処理
const CHUNK_SIZE = 1000;
for (let i = 0; i < users.length; i += CHUNK_SIZE) {
  const chunk = users.slice(i, i + CHUNK_SIZE);
  await processChunk(chunk);
}
```

## セキュリティ設計

### データ保護

1. **個人情報の暗号化**
   - 検討: lineUid, email, phoneの暗号化
   - 実装: アプリケーションレベルでの暗号化/復号化

2. **アクセス制御**
   ```typescript
   // Row Level Security相当の実装
   function canAccessUser(requesterId: string, targetUserId: string) {
     // アクセス権限チェックロジック
   }
   ```

3. **SQLインジェクション対策**
   - Prismaのプリペアドステートメントで自動的に対策

### 監査ログ

```typescript
interface AuditLog {
  userId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

## スケーラビリティ設計

### 垂直スケーリング
- SQLite → PostgreSQLへの移行パス
- インデックスチューニング
- クエリ最適化

### 水平スケーリング
```typescript
// 読み取り負荷分散（将来的な実装）
const readReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.READ_REPLICA_URL }
  }
});

// 読み取り専用クエリ
const users = await readReplica.user.findMany();
```

### データパーティショニング戦略
```sql
-- 配信ログの月次パーティション（PostgreSQL）
CREATE TABLE delivery_logs_2024_01 PARTITION OF delivery_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## トランザクション設計

### ACID特性の保証

```typescript
// 複雑なビジネスロジックのトランザクション
async function executeScenario(userId: string, scenarioId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. ユーザー状態の確認
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { userTags: true }
    });
    
    // 2. シナリオ実行条件の検証
    const scenario = await tx.scenario.findUnique({
      where: { id: scenarioId }
    });
    
    // 3. メッセージ配信の登録
    const deliveryLog = await tx.deliveryLog.create({
      data: { /* ... */ }
    });
    
    // 4. ユーザー状態の更新
    await tx.userStatusLog.create({
      data: { /* ... */ }
    });
    
    return deliveryLog;
  });
}
```

### デッドロック対策
1. 一貫したロック順序
2. トランザクションの細分化
3. タイムアウト設定

## バックアップ・リカバリ戦略

### SQLiteの場合
```bash
# 定期バックアップスクリプト
#!/bin/bash
DB_PATH="./prisma/dev.db"
BACKUP_PATH="./backups/dev_$(date +%Y%m%d_%H%M%S).db"
cp $DB_PATH $BACKUP_PATH
```

### PostgreSQLの場合
```sql
-- ポイントインタイムリカバリ
pg_dump -h localhost -U user -d database > backup.sql

-- 継続的アーカイブ
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
```

## マイグレーション戦略

### スキーマバージョン管理
```bash
# Prismaマイグレーション
npx prisma migrate dev --name add_user_fields
npx prisma migrate deploy

# ロールバック用スクリプト
npx prisma migrate resolve --rolled-back
```

### ゼロダウンタイムマイグレーション
1. カラム追加は常に NULL許可で
2. 新旧両方のコードが動作する移行期間を設ける
3. データ移行後に制約を追加

## モニタリング・メトリクス

### パフォーマンスメトリクス
```typescript
// クエリ実行時間の計測
const startTime = performance.now();
const result = await prisma.user.findMany();
const duration = performance.now() - startTime;
logger.info(`Query executed in ${duration}ms`);
```

### ヘルスチェック
```typescript
async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', database: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', database: 'disconnected', error };
  }
}
```

## 将来の拡張計画

### 短期計画（3-6ヶ月）
1. PostgreSQLへの本番移行
2. Redisキャッシュレイヤーの追加
3. 読み取りレプリカの導入

### 中期計画（6-12ヶ月）
1. マルチテナント対応
2. データウェアハウス統合
3. リアルタイム分析基盤

### 長期計画（1年以上）
1. グローバル分散データベース
2. AIベースのクエリ最適化
3. 自動スケーリング機能

## ベストプラクティス

### 開発ガイドライン
1. **型安全性**: Prismaの生成型を活用
2. **エラーハンドリング**: 適切な例外処理
3. **テスト**: トランザクションロールバックでのテスト
4. **ドキュメント**: スキーマ変更は必ずドキュメント化

### コードレビューチェックリスト
- [ ] N+1クエリがないか
- [ ] 適切なインデックスが設定されているか
- [ ] トランザクション境界が適切か
- [ ] エラーハンドリングが実装されているか
- [ ] パフォーマンスへの影響を考慮したか