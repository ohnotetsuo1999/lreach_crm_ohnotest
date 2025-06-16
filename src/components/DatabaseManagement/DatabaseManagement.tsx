'use client'

import { ChevronDown, Download } from "lucide-react"
import { useState } from "react"

type TableNames = {
  inflow_path: {
    label: string
    columns: string[]
  }
  scenario_deliveries: {
    label: string
    columns: string[]
  }
  user_profiles: {
    label: string
    columns: string[]
  }
}

type TableData = {
  id: string
  created_at?: string
  [key: string]: any
}

export function DatabaseManagement() {
  const [selectedTable, setSelectedTable] = useState<keyof TableNames>("inflow_path")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const tableNames: TableNames = {
    inflow_path: {
      label: "流入経路",
      columns: ["id", "created_at", "status", "user_name", "user_id", "referrer_url", "answers_id"]
    },
    scenario_deliveries: {
      label: "シナリオ配信履歴",
      columns: ["id", "created_at", "user_name", "user_id", "tag"]
    },
    user_profiles: {
      label: "ユーザー情報",
      columns: ["id", "created_at", "name", "is_blocked", "is_blocked_at", "email", "phone_number", "desired_work_location", "updated_at"]
    }
  }

  // ダミーデータ
  const mockData: TableData[] = [
    {
      id: "1",
      created_at: "2024-01-15T10:30:00Z",
      status: "active",
      user_name: "田中太郎",
      user_id: "U001",
      referrer_url: "https://example.com",
      answers_id: "A001"
    },
    {
      id: "2",
      created_at: "2024-01-16T14:20:00Z",
      status: "active",
      user_name: "佐藤花子",
      user_id: "U002",
      referrer_url: "https://example.com/campaign",
      answers_id: "A002"
    },
    {
      id: "3",
      created_at: "2024-01-17T09:15:00Z",
      status: "inactive",
      user_name: "鈴木一郎",
      user_id: "U003",
      referrer_url: "https://example.com/lp",
      answers_id: "A003"
    }
  ]

  // 日付を指定形式に変換する関数
  const formatDate = (dateString?: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hour = String(date.getHours()).padStart(2, "0")
    const minute = String(date.getMinutes()).padStart(2, "0")
    const second = String(date.getSeconds()).padStart(2, "0")

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  // CSVエクスポート機能
  const exportToCSV = () => {
    const columns = tableNames[selectedTable].columns
    
    // CSVヘッダー作成
    let csv = columns.join(",") + "\n"

    // データ行の作成
    mockData.forEach((row) => {
      const rowData = columns.map((column) => {
        const value = row[column]
        let cellText: string
        if (column === "created_at") {
          cellText = formatDate(value as string | undefined)
        } else if (typeof value === "boolean") {
          cellText = value ? "TRUE" : "FALSE"
        } else {
          cellText = String(value ?? "")
        }
        // カンマを含む場合はダブルクォートで囲む
        if (cellText.includes(",")) {
          cellText = `"${cellText}"`
        }
        return cellText
      })
      csv += rowData.join(",") + "\n"
    })

    // BOMを追加してUTF-8エンコーディングを示す
    const bom = new Uint8Array([0xef, 0xbb, 0xbf])
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedTable}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">データベース管理</h1>
        <p className="text-gray-600 mt-1">各種データテーブルの閲覧とエクスポート</p>
      </div>

      <div className="bg-white py-2 px-3 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center divide-x divide-gray-200">
          {/* テーブル選択 */}
          <div className="pr-4 w-56">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>
                  {tableNames[selectedTable].label || "テーブルを選択"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  {Object.entries(tableNames).map(([value, { label }]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setSelectedTable(value as keyof TableNames)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        selectedTable === value
                          ? "bg-gray-50 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 日付選択 */}
          <div className="flex items-center gap-2 px-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36 px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <span className="text-gray-400 text-sm">〜</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36 px-2 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* エクスポートボタン */}
          <div className="pl-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>エクスポート</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {tableNames[selectedTable].columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {tableNames[selectedTable].columns.map((column) => (
                    <td
                      key={column}
                      className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
                    >
                      {column === "created_at"
                        ? formatDate(row[column] as string | undefined)
                        : typeof row[column] === "boolean"
                        ? row[column]
                          ? "TRUE"
                          : "FALSE"
                        : String(row[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}