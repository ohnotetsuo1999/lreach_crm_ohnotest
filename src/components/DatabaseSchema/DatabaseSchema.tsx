'use client'

import { useState, useEffect } from 'react'
import { 
  Database, 
  Table, 
  Columns3, 
  Key, 
  BarChart3, 
  RefreshCw, 
  Search, 
  Plus,
  Code,
  AlertCircle,
  CheckCircle,
  Play
} from 'lucide-react'

interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

interface ColumnInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  ordinal_position: number
}

interface DatabaseStats {
  totalTables: number
  totalRows: number
  tableStats: Array<{
    tableName: string
    rowCount: number
    columns: number
  }>
}

export function DatabaseSchema() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'stats'>('tables')
  const [searchTerm, setSearchTerm] = useState('')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryLoading, setQueryLoading] = useState(false)

  useEffect(() => {
    loadTables()
    loadStats()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/supabase/tables')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tables')
      }
      
      setTables(data.tables || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  const loadTableColumns = async (tableName: string) => {
    try {
      const response = await fetch(`/api/supabase/tables?action=columns&table=${tableName}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load columns')
      }
      
      setColumns(data.columns || [])
      setSelectedTable(tableName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load columns')
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/supabase/tables?action=stats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load stats')
      }
      
      setStats(data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const executeQuery = async () => {
    try {
      setQueryLoading(true)
      setError(null)
      
      const response = await fetch('/api/supabase/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Query execution failed')
      }
      
      setQueryResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed')
    } finally {
      setQueryLoading(false)
    }
  }

  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderTablesView = () => (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="テーブルを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadTables}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            更新
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            新規テーブル
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Table className="w-5 h-5 text-blue-500" />
              テーブル一覧 ({filteredTables.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredTables.map((table) => (
              <div
                key={table.table_name}
                onClick={() => loadTableColumns(table.table_name)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTable === table.table_name ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{table.table_name}</h4>
                    <p className="text-sm text-gray-500">{table.table_type}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {stats?.tableStats.find(s => s.tableName === table.table_name)?.rowCount || 0} rows
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Columns3 className="w-5 h-5 text-green-500" />
              カラム詳細
              {selectedTable && <span className="text-sm font-normal text-gray-500">({selectedTable})</span>}
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {selectedTable ? (
              columns.length > 0 ? (
                columns.map((column) => (
                  <div key={column.column_name} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {column.column_name}
                        {column.column_name.includes('id') && (
                          <Key className="w-3 h-3 text-yellow-500" />
                        )}
                      </h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {column.data_type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Nullable: {column.is_nullable === 'YES' ? 'Yes' : 'No'}</div>
                      {column.column_default && (
                        <div>Default: {column.column_default}</div>
                      )}
                      <div>Position: {column.ordinal_position}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  カラム情報が見つかりません
                </div>
              )
            ) : (
              <div className="p-8 text-center text-gray-500">
                テーブルを選択してカラム情報を表示
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderQueryView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-500" />
            SQLクエリエディタ
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQLクエリ
              </label>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                placeholder="SELECT * FROM your_table LIMIT 10;"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={executeQuery}
                disabled={queryLoading || !sqlQuery.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {queryLoading ? '実行中...' : '実行'}
              </button>
              <div className="text-sm text-gray-500">
                ※ 読み取り専用のSELECTクエリのみ実行可能
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Result */}
      {queryResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              クエリ結果
            </h3>
          </div>
          <div className="p-4">
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )

  const renderStatsView = () => (
    <div className="space-y-6">
      {stats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">{stats.totalTables}</div>
                  <div className="text-blue-600">総テーブル数</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-700">{stats.totalRows.toLocaleString()}</div>
                  <div className="text-green-600">総レコード数</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Columns3 className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {stats.tableStats.reduce((sum, table) => sum + table.columns, 0)}
                  </div>
                  <div className="text-purple-600">総カラム数</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">テーブル別統計</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.tableStats.map((table) => (
                <div key={table.tableName} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{table.tableName}</h4>
                    <p className="text-sm text-gray-500">{table.columns} columns</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{table.rowCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">rows</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">データベーススキーマを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">データベーススキーマ</h1>
            <p className="text-gray-600">Supabaseデータベース構造の管理と確認</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">エラーが発生しました</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'tables', name: 'テーブル', icon: Table },
            { id: 'query', name: 'クエリ', icon: Code },
            { id: 'stats', name: '統計', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'tables' && renderTablesView()}
      {activeTab === 'query' && renderQueryView()}
      {activeTab === 'stats' && renderStatsView()}
    </div>
  )
}