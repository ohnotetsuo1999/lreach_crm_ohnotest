# リマインダー機能の実装状況

## 概要

リマインダー機能は、TypeScriptの型定義とUIコンポーネントは実装されていますが、データベーススキーマには含まれていません。

## 現在の実装状況

### ✅ 実装済み

#### 1. TypeScript型定義 (`/src/types/index.ts`)
```typescript
export interface ReservationReminder {
  id: string
  name: string
  description?: string
  isActive: boolean
  folderId?: string
  reminderType: 'reservation' | 'user_field' | 'custom_date'
  reminderSettings: ReminderConfiguration
  eventSettings?: ReminderEventSettings
  templates: ReminderTemplate[]
  createdAt: Date
  updatedAt: Date
}
```

#### 2. UIコンポーネント (`/src/components/ReminderManagement/`)
- `ReminderList.tsx` - リマインダー一覧表示
- `ReminderEditor.tsx` - リマインダー編集画面
- `ReminderEditor_clean.tsx` - リファクタリング版

### ❌ 未実装

#### データベーステーブル
Prismaスキーマ（`/prisma/schema.prisma`）にリマインダー関連のテーブルが存在しません。

## 推奨される実装方法

### オプション1: 専用テーブルの追加

```prisma
model Reminder {
  id              String   @id @default(cuid())
  name            String
  description     String?
  isActive        Boolean  @default(true)
  reminderType    ReminderType
  settingsJson    String   // ReminderConfiguration as JSON
  eventJson       String?  // ReminderEventSettings as JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  reminderTemplates ReminderTemplate[]
  
  @@map("reminders")
}

model ReminderTemplate {
  id            String   @id @default(cuid())
  reminderId    String
  templateId    String
  order         Int
  timingJson    String   // ReminderTimingConfig as JSON
  
  reminder      Reminder @relation(fields: [reminderId], references: [id], onDelete: Cascade)
  template      Template @relation(fields: [templateId], references: [id])
  
  @@map("reminder_templates")
}

enum ReminderType {
  RESERVATION
  USER_FIELD
  CUSTOM_DATE
}
```

### オプション2: 既存のPackシステムを活用

現在のPackテーブルを拡張して、`packType = 'reminder'`として保存：

```typescript
// Pack作成時
await prisma.pack.create({
  data: {
    scenarioId: 'dummy-scenario-for-reminders',
    packType: 'reminder',
    conditionJson: JSON.stringify(reminderSettings),
    // その他のリマインダー設定
  }
});
```

### オプション3: 外部ストレージ（Supabase）

Supabaseの別テーブルでリマインダーを管理：

```sql
-- Supabaseでの実装例
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  reminder_type TEXT NOT NULL,
  settings JSONB NOT NULL,
  event_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 移行計画

### フェーズ1: データモデルの決定
1. 上記オプションから最適な方法を選択
2. 既存データとの整合性を確認

### フェーズ2: スキーマ実装
1. Prismaスキーマの更新
2. マイグレーションの実行
3. 型定義の調整

### フェーズ3: API実装
1. CRUD操作のAPI作成
2. 既存のUIコンポーネントとの接続
3. データ永続化の確認

### フェーズ4: テストとデプロイ
1. ユニットテストの作成
2. 統合テストの実施
3. 本番環境へのデプロイ

## 注意事項

- 現在のUIは型定義に基づいて動作しているため、データベース実装時は後方互換性を保つ必要があります
- リマインダーの実行ロジック（cron job等）は別途実装が必要です
- タイムゾーンの考慮が必要です（予約時刻の扱い）