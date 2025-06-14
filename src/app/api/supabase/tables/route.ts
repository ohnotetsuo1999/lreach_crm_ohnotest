import { NextRequest, NextResponse } from 'next/server'
import { getTables, getTableColumns, getDatabaseStats } from '@/lib/supabase-admin'

// GET /api/supabase/tables - テーブル一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const tableName = searchParams.get('table')

    switch (action) {
      case 'columns':
        if (!tableName) {
          return NextResponse.json(
            { error: 'Table name is required for columns action' },
            { status: 400 }
          )
        }
        const columns = await getTableColumns(tableName)
        return NextResponse.json({ columns })

      case 'stats':
        const stats = await getDatabaseStats()
        return NextResponse.json({ stats })

      default:
        const tables = await getTables()
        return NextResponse.json({ tables })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/tables - テーブルを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableName, columns } = body

    if (!tableName || !columns || !Array.isArray(columns)) {
      return NextResponse.json(
        { error: 'Table name and columns are required' },
        { status: 400 }
      )
    }

    // テーブル作成の実装は後で追加
    return NextResponse.json({ message: 'Table creation not implemented yet' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}