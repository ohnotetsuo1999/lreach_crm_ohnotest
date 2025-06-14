import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase'
import { SupabaseConfigError } from './database'

// テーブル情報の型定義
export interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

export interface ColumnInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  ordinal_position: number
}

export interface ForeignKeyInfo {
  table_name: string
  column_name: string
  foreign_table_name: string
  foreign_column_name: string
  constraint_name: string
}

// データベース統計情報
export interface DatabaseStats {
  totalTables: number
  totalRows: number
  tableStats: Array<{
    tableName: string
    rowCount: number
    columns: number
  }>
}

// テーブル一覧を取得（簡易版）
export async function getTables(): Promise<TableInfo[]> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  try {
    // 既知のテーブルをハードコード（実際のプロジェクトでは動的に取得）
    const mockTables: TableInfo[] = [
      { table_name: 'users', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'tags', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'templates', table_schema: 'public', table_type: 'BASE TABLE' },
      { table_name: 'user_tags', table_schema: 'public', table_type: 'BASE TABLE' }
    ]

    return mockTables
  } catch (error) {
    console.error('Failed to fetch tables:', error)
    throw error
  }
}

// テーブルのカラム情報を取得（簡易版）
export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  try {
    // 各テーブルのカラム情報をハードコード
    const columnMap: Record<string, ColumnInfo[]> = {
      users: [
        { table_name: 'users', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1 },
        { table_name: 'users', column_name: 'name', data_type: 'character varying', is_nullable: 'NO', column_default: null, ordinal_position: 2 },
        { table_name: 'users', column_name: 'line_uid', data_type: 'character varying', is_nullable: 'YES', column_default: null, ordinal_position: 3 },
        { table_name: 'users', column_name: 'address', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 4 },
        { table_name: 'users', column_name: 'phone', data_type: 'character varying', is_nullable: 'YES', column_default: null, ordinal_position: 5 },
        { table_name: 'users', column_name: 'custom_fields', data_type: 'jsonb', is_nullable: 'YES', column_default: null, ordinal_position: 6 },
        { table_name: 'users', column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', ordinal_position: 7 },
        { table_name: 'users', column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', ordinal_position: 8 }
      ],
      tags: [
        { table_name: 'tags', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1 },
        { table_name: 'tags', column_name: 'name', data_type: 'character varying', is_nullable: 'NO', column_default: null, ordinal_position: 2 },
        { table_name: 'tags', column_name: 'type', data_type: 'character varying', is_nullable: 'YES', column_default: 'MANUAL', ordinal_position: 3 },
        { table_name: 'tags', column_name: 'folder_id', data_type: 'uuid', is_nullable: 'YES', column_default: null, ordinal_position: 4 },
        { table_name: 'tags', column_name: 'note', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 5 },
        { table_name: 'tags', column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', ordinal_position: 6 }
      ]
    }

    return columnMap[tableName] || []
  } catch (error) {
    console.error('Failed to fetch columns:', error)
    throw error
  }
}

// 外部キー制約を取得
export async function getForeignKeys(tableName?: string): Promise<ForeignKeyInfo[]> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  try {
    // 複雑なクエリなので、RPCファンクションを使用（後で作成）
    // 今はシンプルな実装
    const query = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ${tableName ? `AND tc.table_name = '${tableName}'` : ''}
      ORDER BY tc.table_name, kcu.ordinal_position;
    `

    const { data, error } = await supabase.rpc('execute_sql', { query })

    if (error) {
      console.error('Error fetching foreign keys:', error)
      return [] // エラーの場合は空配列を返す
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch foreign keys:', error)
    return []
  }
}

// データベース統計情報を取得（簡易版）
export async function getDatabaseStats(): Promise<DatabaseStats> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  try {
    const tables = await getTables()
    
    // 実際のusersテーブルから行数を取得
    let usersCount = 0
    try {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      usersCount = count || 0
    } catch (err) {
      console.log('Users table not found, using mock data')
    }

    const tableStats = [
      { tableName: 'users', rowCount: usersCount, columns: 8 },
      { tableName: 'tags', rowCount: 0, columns: 6 },
      { tableName: 'templates', rowCount: 0, columns: 9 },
      { tableName: 'user_tags', rowCount: 0, columns: 5 }
    ]

    return {
      totalTables: tables.length,
      totalRows: tableStats.reduce((sum, stat) => sum + stat.rowCount, 0),
      tableStats
    }
  } catch (error) {
    console.error('Failed to fetch database stats:', error)
    throw error
  }
}

// SQLクエリを実行（簡易版）
export async function executeQuery(query: string): Promise<any> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  try {
    // 簡単なSELECTクエリのみサポート
    if (query.toUpperCase().startsWith('SELECT * FROM USERS')) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10)

      if (error) throw error
      return data
    }

    // その他のクエリは未実装として返す
    return { message: 'このクエリタイプは現在サポートされていません。基本的なSELECT文をお試しください。' }
  } catch (error) {
    console.error('Failed to execute query:', error)
    throw error
  }
}

// テーブルを作成
export async function createTable(tableName: string, columns: Array<{
  name: string
  type: string
  nullable?: boolean
  default?: string
  primaryKey?: boolean
}>): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseConfigError('Supabaseの認証情報が設定されていません。')
  }

  const columnDefinitions = columns.map(col => {
    let definition = `${col.name} ${col.type}`
    if (col.primaryKey) definition += ' PRIMARY KEY'
    if (!col.nullable && !col.primaryKey) definition += ' NOT NULL'
    if (col.default) definition += ` DEFAULT ${col.default}`
    return definition
  }).join(', ')

  const query = `CREATE TABLE ${tableName} (${columnDefinitions})`

  try {
    await executeQuery(query)
  } catch (error) {
    console.error('Failed to create table:', error)
    throw error
  }
}

// テーブルにインデックスを作成
export async function createIndex(tableName: string, columnName: string, indexName?: string): Promise<void> {
  const indexNameFinal = indexName || `idx_${tableName}_${columnName}`
  const query = `CREATE INDEX ${indexNameFinal} ON ${tableName} (${columnName})`
  
  try {
    await executeQuery(query)
  } catch (error) {
    console.error('Failed to create index:', error)
    throw error
  }
}