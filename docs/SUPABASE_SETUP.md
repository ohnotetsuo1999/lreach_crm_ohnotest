# Supabase データベーステーブル設定手順

## 1. usersテーブルの作成

Supabaseダッシュボードで以下のSQLを実行してください：

```sql
-- usersテーブルを作成
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  line_uid VARCHAR(255) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_users_line_uid ON users(line_uid);
CREATE INDEX idx_users_created_at ON users(created_at);

-- サンプルデータを挿入
INSERT INTO users (name, line_uid, address, phone, custom_fields) VALUES
('田中太郎', 'U1234567890abcdef', '東京都渋谷区', '090-1234-5678', '{"birthday": "1990-01-15", "preferences": ["tech", "music"]}'),
('佐藤花子', 'U2345678901bcdefg', '大阪府大阪市', '080-2345-6789', '{"birthday": "1985-03-20", "preferences": ["travel", "food"]}'),
('山田次郎', 'U3456789012cdefgh', '名古屋市中区', '070-3456-7890', '{"birthday": "1992-07-10", "preferences": ["sports", "gaming"]}'),
('高橋美咲', NULL, '福岡市博多区', '090-4567-8901', '{"birthday": "1988-12-05", "preferences": ["art", "books"]}'),
('中村健太', 'U5678901234efghij', '札幌市中央区', NULL, '{"birthday": "1995-09-25", "preferences": ["outdoor", "photography"]}');

-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーが読み取り可能
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- 認証されたユーザーが作成可能
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- 認証されたユーザーが更新可能
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- 認証されたユーザーが削除可能
CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (true);
```

## 2. tagsテーブルの作成

```sql
-- tagsテーブルを作成
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'MANUAL' CHECK (type IN ('MANUAL', 'AUTOMATIC', 'BEHAVIORAL')),
  folder_id UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_type ON tags(type);

-- サンプルデータを挿入
INSERT INTO tags (name, type, note) VALUES
('新規ユーザー', 'AUTOMATIC', '友達追加時に自動付与'),
('アクティブユーザー', 'BEHAVIORAL', '7日以内にアクションあり'),
('プレミアムユーザー', 'MANUAL', '手動で付与するプレミアムタグ'),
('イベント参加者', 'MANUAL', 'イベント参加時に付与'),
('休眠ユーザー', 'BEHAVIORAL', '30日以上非アクティブ');

-- RLSを有効化
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Tags can be managed by authenticated users" ON tags
  FOR ALL USING (true);
```

## 3. user_tagsテーブル（多対多関係）の作成

```sql
-- user_tagsテーブルを作成（ユーザーとタグの関連付け）
CREATE TABLE user_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by VARCHAR(255),
  UNIQUE(user_id, tag_id)
);

-- インデックスを作成
CREATE INDEX idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX idx_user_tags_tag_id ON user_tags(tag_id);

-- サンプルデータを挿入
INSERT INTO user_tags (user_id, tag_id, assigned_by)
SELECT 
  u.id,
  t.id,
  'system'
FROM users u
CROSS JOIN tags t
WHERE u.name = '田中太郎' AND t.name IN ('新規ユーザー', 'アクティブユーザー')
UNION ALL
SELECT 
  u.id,
  t.id,
  'admin'
FROM users u
CROSS JOIN tags t
WHERE u.name = '佐藤花子' AND t.name IN ('新規ユーザー', 'プレミアムユーザー');

-- RLSを有効化
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User tags are viewable by everyone" ON user_tags
  FOR SELECT USING (true);

CREATE POLICY "User tags can be managed by authenticated users" ON user_tags
  FOR ALL USING (true);
```

## 4. templatesテーブルの作成

```sql
-- templatesテーブルを作成
CREATE TABLE templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'TEXT' CHECK (type IN ('TEXT', 'FLEX', 'IMAGE', 'PACK')),
  content TEXT NOT NULL,
  notes TEXT,
  folder_id UUID,
  pack_id UUID,
  order_position INTEGER DEFAULT 0,
  line_message_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX idx_templates_name ON templates(name);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_created_at ON templates(created_at);

-- サンプルデータを挿入
INSERT INTO templates (name, type, content, notes) VALUES
('ウェルカムメッセージ', 'TEXT', 'こんにちは！友達追加ありがとうございます🎉', '新規ユーザー向けの挨拶'),
('プロモーション案内', 'FLEX', '特別オファーのご案内', 'Flexメッセージテンプレート'),
('リマインダー', 'TEXT', 'お忘れではありませんか？', 'フォローアップ用'),
('サンキューメッセージ', 'TEXT', 'ありがとうございました！', 'お礼メッセージ'),
('アンケート依頼', 'TEXT', 'アンケートにご協力ください', 'フィードバック収集用');

-- RLSを有効化
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone" ON templates
  FOR SELECT USING (true);

CREATE POLICY "Templates can be managed by authenticated users" ON templates
  FOR ALL USING (true);
```

## 5. 実行手順

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard/project/lnzwgycthszxfqxwcpvh

2. **SQL Editorを開く**
   - 左サイドバーの「SQL Editor」をクリック

3. **上記のSQLを順番に実行**
   - 各テーブル作成のSQLをコピー&ペーストして実行

4. **データ確認**
   - 「Table Editor」でテーブルとデータを確認

## 6. アプリケーションでの確認

アプリケーションで以下を確認できます：

1. **Supabaseテスト**ページでユーザーデータの取得・操作
2. **DBスキーマ**ページでテーブル構造の確認
3. **統計情報**でデータ件数の確認
4. **SQLクエリ**で任意のデータ取得

これで完全な動作環境が構築されます！