import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/supabase-admin'

// POST /api/supabase/query - SQLクエリを実行
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      )
    }

    // 危険なクエリをブロック
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER TABLE', 'UPDATE']
    const upperQuery = query.toUpperCase()
    
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        return NextResponse.json(
          { error: `Dangerous operation '${keyword}' is not allowed` },
          { status: 403 }
        )
      }
    }

    const result = await executeQuery(query)
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Query execution error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query execution failed' },
      { status: 500 }
    )
  }
}