# 完全版データベーススキーマ設計書

## 概要

このドキュメントは、LINE配信自動化システムの完全なデータベーススキーマを定義します。現在実装されている機能と、TypeScriptで定義されているが未実装の機能（リマインダー等）を含む、統合的なスキーマ設計です。

## データベース構成

### 基本設定
- **開発環境**: SQLite
- **本番環境**: PostgreSQL (Supabase対応)
- **ORM**: Prisma
- **ID生成**: CUID (Collision-resistant Unique Identifier)

## 完全なPrismaスキーマ

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // 本番では "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// ユーザー管理
// ==========================================

model User {
  id              String             @id @default(cuid())
  name            String
  lineUid         String?            @unique
  email           String?
  phone           String?
  address         String?
  customFields    String?            // JSON: birthday, anniversary, etc.
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  userTags        UserTag[]
  userStatusLogs  UserStatusLog[]
  deliveryLogs    DeliveryLog[]
  reservations    Reservation[]
  userActions     UserAction[]
  
  @@map("users")
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  type     TagType   @default(MANUAL)
  note     String?
  folderId String?
  createdAt DateTime @default(now())
  
  userTags UserTag[]
  folder   TagFolder? @relation(fields: [folderId], references: [id])
  
  @@map("tags")
}

model UserTag {
  userId    String
  tagId     String
  assignedAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([userId, tagId])
  @@map("user_tags")
}

model Status {
  id    String @id @default(cuid())
  code  String @unique
  label String
  folderId String?
  
  userStatusLogs UserStatusLog[]
  folder StatusFolder? @relation(fields: [folderId], references: [id])
  
  @@map("statuses")
}

model UserStatusLog {
  id        String   @id @default(cuid())
  userId    String
  statusId  String
  changedAt DateTime @default(now())
  changedBy String?  // 変更者ID
  reason    String?  // 変更理由
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    Status   @relation(fields: [statusId], references: [id])
  
  @@map("user_status_logs")
}

// ==========================================
// セグメント管理
// ==========================================

model Segment {
  id         String   @id @default(cuid())
  name       String
  description String?
  filterJson String   // JSON: 複雑なフィルター条件
  folderId   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  folder     SegmentFolder? @relation(fields: [folderId], references: [id])
  
  @@map("segments")
}

// ==========================================
// キャンペーン・シナリオ管理
// ==========================================

model Campaign {
  id        String     @id @default(cuid())
  name      String
  description String?
  startAt   DateTime?
  endAt     DateTime?
  createdBy String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  scenarios Scenario[]
  
  @@map("campaigns")
}

model Scenario {
  id           String      @id @default(cuid())
  campaignId   String
  name         String
  description  String?
  trigger      TriggerType
  triggerValue String?     // トリガーの詳細パラメータ
  isActive     Boolean     @default(true)
  folderId     String?
  targetType   String      @default("all") // all, segment, tags
  targetJson   String?     // JSON: ターゲット条件
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  campaign     Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  packs        Pack[]
  folder       ScenarioFolder? @relation(fields: [folderId], references: [id])
  
  @@map("scenarios")
}

model Pack {
  id            String   @id @default(cuid())
  scenarioId    String
  order         Int
  name          String?
  offsetMinutes Int      @default(0)
  conditionJson String?  // JSON: 実行条件
  packType      String   @default("normal") // normal, reminder, conditional
  createdAt     DateTime @default(now())
  
  scenario      Scenario   @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  templates     Template[]
  
  @@map("packs")
}

model Template {
  id              String   @id @default(cuid())
  packId          String?
  name            String
  description     String?
  order           Int      @default(0)
  lineMessageJson String   // JSON: LINE Flex/Text Message
  templateType    String   @default("message") // message, reminder, notification
  folderId        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  pack            Pack?           @relation(fields: [packId], references: [id], onDelete: Cascade)
  deliveryLogs    DeliveryLog[]
  folder          TemplateFolder? @relation(fields: [folderId], references: [id])
  reminderTemplates ReminderTemplate[]
  
  @@map("templates")
}

// ==========================================
// リマインダー管理（新規追加）
// ==========================================

model Reminder {
  id              String   @id @default(cuid())
  name            String
  description     String?
  isActive        Boolean  @default(true)
  reminderType    ReminderType
  settingsJson    String   // JSON: ReminderConfiguration
  eventJson       String?  // JSON: ReminderEventSettings
  folderId        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  reminderTemplates ReminderTemplate[]
  folder            ReminderFolder? @relation(fields: [folderId], references: [id])
  
  @@map("reminders")
}

model ReminderTemplate {
  id            String   @id @default(cuid())
  reminderId    String
  templateId    String
  order         Int      @default(0)
  timingJson    String   // JSON: ReminderTimingConfig
  conditionJson String?  // JSON: 送信条件
  
  reminder      Reminder @relation(fields: [reminderId], references: [id], onDelete: Cascade)
  template      Template @relation(fields: [templateId], references: [id])
  
  @@map("reminder_templates")
}

// ==========================================
// 予約管理（新規追加）
// ==========================================

model Reservation {
  id              String   @id @default(cuid())
  userId          String
  serviceId       String?
  serviceName     String
  reservationDate DateTime
  reservationTime String   // HH:mm format
  status          ReservationStatus @default(PENDING)
  notes           String?
  metadata        String?  // JSON: 追加情報
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("reservations")
}

// ==========================================
// 配信・アクション管理
// ==========================================

model Broadcast {
  id              String   @id @default(cuid())
  name            String
  description     String?
  targetType      String   // all, segment, tags
  targetJson      String?  // JSON: ターゲット条件
  templateId      String
  scheduledAt     DateTime?
  sentAt          DateTime?
  status          BroadcastStatus @default(DRAFT)
  statsJson       String?  // JSON: 配信統計
  folderId        String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  folder          BroadcastFolder? @relation(fields: [folderId], references: [id])
  
  @@map("broadcasts")
}

model DeliveryLog {
  id         String        @id @default(cuid())
  templateId String
  userId     String
  broadcastId String?      // 一斉配信の場合
  scenarioId  String?      // シナリオ配信の場合
  reminderId  String?      // リマインダー配信の場合
  status     DeliveryStatus
  sentAt     DateTime?
  openedAt   DateTime?
  clickedAt  DateTime?
  error      String?
  metadata   String?       // JSON: 追加メタデータ
  createdAt  DateTime      @default(now())
  
  template   Template      @relation(fields: [templateId], references: [id])
  user       User          @relation(fields: [userId], references: [id])
  userActions UserAction[]
  
  @@index([userId, createdAt])
  @@index([templateId, status])
  @@map("delivery_logs")
}

model UserAction {
  id            String   @id @default(cuid())
  userId        String
  deliveryLogId String
  actionType    String   // URL_CLICK, BUTTON_CLICK, etc.
  actionValue   String   // クリックされたURL等
  metadata      String?  // JSON: 追加情報
  processed     Boolean  @default(false)
  timestamp     DateTime @default(now())
  
  user          User         @relation(fields: [userId], references: [id])
  deliveryLog   DeliveryLog  @relation(fields: [deliveryLogId], references: [id])
  
  @@index([userId, timestamp])
  @@index([processed])
  @@map("user_actions")
}

// ==========================================
// アクションルール（新規追加）
// ==========================================

model ActionRule {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isActive      Boolean  @default(true)
  trigger       String   // USER_ACTION, TAG_ADDED, etc.
  conditionJson String   // JSON: 実行条件
  actionJson    String   // JSON: 実行アクション
  priority      Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("action_rules")
}

// ==========================================
// フォルダシステム
// ==========================================

model TagFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tags        Tag[]
  parent      TagFolder?  @relation("TagFolderHierarchy", fields: [parentId], references: [id])
  children    TagFolder[] @relation("TagFolderHierarchy")
  
  @@map("tag_folders")
}

model StatusFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  statuses    Status[]
  parent      StatusFolder?  @relation("StatusFolderHierarchy", fields: [parentId], references: [id])
  children    StatusFolder[] @relation("StatusFolderHierarchy")
  
  @@map("status_folders")
}

model SegmentFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  segments    Segment[]
  parent      SegmentFolder?  @relation("SegmentFolderHierarchy", fields: [parentId], references: [id])
  children    SegmentFolder[] @relation("SegmentFolderHierarchy")
  
  @@map("segment_folders")
}

model ScenarioFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  scenarios   Scenario[]
  parent      ScenarioFolder?  @relation("ScenarioFolderHierarchy", fields: [parentId], references: [id])
  children    ScenarioFolder[] @relation("ScenarioFolderHierarchy")
  
  @@map("scenario_folders")
}

model TemplateFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  templates   Template[]
  parent      TemplateFolder?  @relation("TemplateFolderHierarchy", fields: [parentId], references: [id])
  children    TemplateFolder[] @relation("TemplateFolderHierarchy")
  
  @@map("template_folders")
}

model BroadcastFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  broadcasts  Broadcast[]
  parent      BroadcastFolder?  @relation("BroadcastFolderHierarchy", fields: [parentId], references: [id])
  children    BroadcastFolder[] @relation("BroadcastFolderHierarchy")
  
  @@map("broadcast_folders")
}

model ReminderFolder {
  id          String   @id @default(cuid())
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  reminders   Reminder[]
  parent      ReminderFolder?  @relation("ReminderFolderHierarchy", fields: [parentId], references: [id])
  children    ReminderFolder[] @relation("ReminderFolderHierarchy")
  
  @@map("reminder_folders")
}

// ==========================================
// Enum定義
// ==========================================

enum TagType {
  MANUAL
  AUTOMATIC
  BEHAVIORAL
}

enum TriggerType {
  MANUAL
  SCHEDULE
  USER_ACTION
  TAG_ADDED
  STATUS_CHANGED
  TIME_BASED
  FRIEND_ADDED
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  FAILED
  CANCELLED
}

enum ReminderType {
  RESERVATION
  USER_FIELD
  CUSTOM_DATE
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum BroadcastStatus {
  DRAFT
  SCHEDULED
  SENDING
  COMPLETED
  FAILED
}
```

## JSONフィールドの構造定義

### User.customFields
```json
{
  "birthday": "1990-01-01",
  "anniversary": "2020-06-15",
  "contractExpiry": "2025-12-31",
  "subscriptionRenewal": "2024-03-01",
  "lastPurchaseDate": "2024-01-15",
  "customDate1": "2024-05-20",
  "customDate2": null,
  "preferences": {
    "contactTime": "morning",
    "language": "ja"
  }
}
```

### Segment.filterJson
```json
{
  "operator": "AND",
  "conditions": [
    {
      "type": "tag",
      "operator": "has",
      "value": "VIP"
    },
    {
      "type": "status",
      "operator": "is",
      "value": "active"
    },
    {
      "type": "custom_field",
      "field": "birthday",
      "operator": "month_equals",
      "value": 5
    }
  ]
}
```

### Reminder.settingsJson
```json
{
  "offsetDays": -1,
  "offsetHours": 10,
  "offsetMinutes": 0,
  "sendTime": "10:00",
  "timezone": "Asia/Tokyo",
  "repeat": {
    "enabled": true,
    "interval": "daily",
    "endDate": null
  },
  "conditions": {
    "skipWeekends": true,
    "skipHolidays": true
  }
}
```

### Template.lineMessageJson
```json
{
  "type": "flex",
  "altText": "予約リマインダー",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "明日の予約をお忘れなく！",
          "weight": "bold",
          "size": "lg"
        }
      ]
    }
  }
}
```

## インデックス設計

```sql
-- ユーザー検索の最適化
CREATE UNIQUE INDEX idx_users_lineUid ON users(lineUid);
CREATE INDEX idx_users_created ON users(createdAt);
CREATE INDEX idx_users_email ON users(email);

-- タグ検索の最適化
CREATE UNIQUE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_user_tags_user ON user_tags(userId);
CREATE INDEX idx_user_tags_tag ON user_tags(tagId);
CREATE INDEX idx_user_tags_assigned ON user_tags(assignedAt);

-- ステータス管理
CREATE UNIQUE INDEX idx_statuses_code ON statuses(code);
CREATE INDEX idx_user_status_logs_user ON user_status_logs(userId, changedAt);

-- 配信ログの最適化
CREATE INDEX idx_delivery_logs_user_created ON delivery_logs(userId, createdAt);
CREATE INDEX idx_delivery_logs_template_status ON delivery_logs(templateId, status);
CREATE INDEX idx_delivery_logs_broadcast ON delivery_logs(broadcastId);
CREATE INDEX idx_delivery_logs_scenario ON delivery_logs(scenarioId);
CREATE INDEX idx_delivery_logs_reminder ON delivery_logs(reminderId);

-- ユーザーアクション
CREATE INDEX idx_user_actions_user_time ON user_actions(userId, timestamp);
CREATE INDEX idx_user_actions_processed ON user_actions(processed);
CREATE INDEX idx_user_actions_delivery ON user_actions(deliveryLogId);

-- 予約管理
CREATE INDEX idx_reservations_user ON reservations(userId);
CREATE INDEX idx_reservations_date ON reservations(reservationDate);
CREATE INDEX idx_reservations_status ON reservations(status);

-- シナリオ・パック
CREATE INDEX idx_scenarios_campaign_active ON scenarios(campaignId, isActive);
CREATE INDEX idx_packs_scenario_order ON packs(scenarioId, order);

-- リマインダー
CREATE INDEX idx_reminders_active ON reminders(isActive);
CREATE INDEX idx_reminder_templates_reminder ON reminder_templates(reminderId);
```

## マイグレーション計画

### フェーズ1: 基本機能（実装済み）
- users, tags, statuses, segments
- campaigns, scenarios, packs, templates
- delivery_logs

### フェーズ2: リマインダー機能
```bash
npx prisma migrate dev --name add_reminders
```

### フェーズ3: 予約管理
```bash
npx prisma migrate dev --name add_reservations
```

### フェーズ4: アクションルール
```bash
npx prisma migrate dev --name add_action_rules
```

### フェーズ5: フォルダシステム
```bash
npx prisma migrate dev --name add_folder_system
```

## データ整合性とビジネスルール

### 1. カスケード削除
- ユーザー削除 → 関連するタグ、ステータス履歴、配信ログも削除
- キャンペーン削除 → シナリオ、パック、テンプレートも削除
- リマインダー削除 → リマインダーテンプレートも削除

### 2. 必須チェック
- ユーザー: name必須
- テンプレート: lineMessageJson必須
- 配信ログ: userId, templateId必須

### 3. 一意性制約
- users.lineUid
- tags.name
- statuses.code

### 4. ビジネスルール実装例

```typescript
// リマインダー実行チェック
async function shouldExecuteReminder(reminder: Reminder, user: User): boolean {
  const settings = JSON.parse(reminder.settingsJson);
  
  // 週末スキップ
  if (settings.conditions.skipWeekends && isWeekend(new Date())) {
    return false;
  }
  
  // 既に送信済みチェック
  const recentDelivery = await prisma.deliveryLog.findFirst({
    where: {
      userId: user.id,
      reminderId: reminder.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  });
  
  return !recentDelivery;
}
```

## パフォーマンス最適化

### 1. クエリ最適化
```typescript
// 効率的なユーザー取得（必要な関連データのみ）
const users = await prisma.user.findMany({
  where: { /* conditions */ },
  include: {
    userTags: {
      include: { tag: true },
      where: { tag: { type: 'MANUAL' } }
    },
    _count: {
      select: { deliveryLogs: true }
    }
  }
});
```

### 2. バッチ処理
```typescript
// 大量配信の効率化
async function bulkDeliver(userIds: string[], templateId: string) {
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    
    await prisma.deliveryLog.createMany({
      data: batch.map(userId => ({
        userId,
        templateId,
        status: 'PENDING'
      }))
    });
  }
}
```

### 3. キャッシュ戦略
- 頻繁にアクセスされるマスタデータ（tags, statuses）はメモリキャッシュ
- セグメント評価結果は15分間キャッシュ
- テンプレートは更新時にキャッシュクリア

## セキュリティ考慮事項

### 1. 個人情報保護
- lineUid, email, phoneは暗号化を検討
- customFieldsの機密情報は別途暗号化

### 2. アクセス制御
```typescript
// ユーザーデータアクセス制御
function canAccessUserData(requesterId: string, targetUserId: string): boolean {
  // 管理者権限チェック
  // データ所有者チェック
  // 組織内アクセス権チェック
}
```

### 3. 監査ログ
- すべての更新操作をログ記録
- 個人情報へのアクセスを追跡

## 今後の拡張計画

### 短期（3ヶ月）
1. リマインダー機能の完全実装
2. 予約管理システムの構築
3. アクションルールエンジン

### 中期（6ヶ月）
1. A/Bテスト機能
2. 高度な分析ダッシュボード
3. マルチチャネル対応（Email, SMS）

### 長期（1年）
1. AI駆動の配信最適化
2. 予測分析機能
3. 外部システム連携API