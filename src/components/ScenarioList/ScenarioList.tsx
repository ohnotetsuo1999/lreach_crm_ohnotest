'use client'

import { useState } from 'react'
import { Scenario, Campaign, ScenarioFolder, TriggerType } from '@/types'
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Edit2,
  Copy,
  Trash2,
  Target,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'

interface ScenarioListProps {
  scenarios: Scenario[]
  scenarioFolders: ScenarioFolder[]
  campaigns: Campaign[]
  onCreateScenario: () => void
  onEditScenario: (scenario: Scenario) => void
  onDuplicateScenario: (scenario: Scenario) => void
  onDeleteScenario: (scenarioId: string) => void
  onToggleActive: (scenarioId: string, isActive: boolean) => void
  onViewAnalytics: (scenarioId: string) => void
  onCreateFolder: (folder: Omit<ScenarioFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<ScenarioFolder>) => void
  onDeleteFolder: (folderId: string) => void
}

export function ScenarioList({
  scenarios,
  scenarioFolders,
  campaigns,
  onCreateScenario,
  onEditScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleActive,
  onViewAnalytics,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}: ScenarioListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [editingFolder, setEditingFolder] = useState<ScenarioFolder | null>(null)

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: ScenarioFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(scenarioFolders)

  // Filter scenarios based on search and folder
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !scenario.folderId
    } else if (selectedFolder) {
      matchesFolder = scenario.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  const handleDelete = (scenarioId: string, scenarioName: string) => {
    if (confirm(`シナリオ「${scenarioName}」を削除しますか？`)) {
      onDeleteScenario(scenarioId)
    }
  }

  const getTriggerLabel = (trigger: TriggerType) => {
    switch (trigger) {
      case 'MANUAL': return '手動'
      case 'SCHEDULE': return 'スケジュール'
      case 'TAG_ADDED': return 'タグ追加'
      case 'STATUS_CHANGED': return 'ステータス変更'
      case 'USER_ACTION': return 'ユーザーアクション'
      case 'TIME_BASED': return '時間ベース'
      default: return trigger
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">シナリオ</h2>
          <p className="mt-1 text-sm text-gray-600">
            自動配信シナリオを管理して効率的な顧客コミュニケーションを実現
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Folder className="w-4 h-4 mr-2 text-green-600" />
            新しいフォルダ
          </button>
          <button
            onClick={onCreateScenario}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            シナリオを作成
          </button>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左カラム: フォルダツリー */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">フォルダ</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <FolderTreeView 
                rootFolders={rootFolders}
                expandedFolders={expandedFolders}
                selectedFolder={selectedFolder}
                onToggleFolder={toggleFolder}
                onSelectFolder={setSelectedFolder}
                onEditFolder={setEditingFolder}
                onDeleteFolder={onDeleteFolder}
                scenarios={scenarios}
              />
            </div>
          </div>
        </div>

        {/* 右カラム: シナリオ表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのシナリオ' 
                    : selectedFolder === 'null'
                    ? '未分類のシナリオ'
                    : scenarioFolders.find(f => f.id === selectedFolder)?.name || 'シナリオ'}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* フォルダ内アクションボタン */}
                  {selectedFolder && selectedFolder !== 'null' && (
                    <>
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        フォルダ追加
                      </button>
                      <button
                        onClick={onCreateScenario}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        シナリオ追加
                      </button>
                    </>
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="シナリオを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ScenarioContentView 
                scenarios={filteredScenarios}
                searchQuery={searchQuery}
                onEditScenario={onEditScenario}
                onDuplicateScenario={onDuplicateScenario}
                onDeleteScenario={handleDelete}
                onToggleActive={onToggleActive}
                onViewAnalytics={onViewAnalytics}
                getTriggerLabel={getTriggerLabel}
              />
            </div>
          </div>
        </div>
      </div>

      {/* フォルダ作成モーダル */}
      {showCreateFolder && (
        <CreateFolderModal 
          onClose={() => setShowCreateFolder(false)} 
          onSubmit={(folder) => {
            onCreateFolder(folder)
            setShowCreateFolder(false)
          }} 
        />
      )}
      
      {/* フォルダ編集モーダル */}
      {editingFolder && (
        <EditFolderModal 
          folder={editingFolder} 
          onClose={() => setEditingFolder(null)} 
          onSubmit={(folderId, updates) => {
            onUpdateFolder(folderId, updates)
            setEditingFolder(null)
          }}
        />
      )}
    </div>
  )
}

// フォルダツリー表示コンポーネント
function FolderTreeView({ 
  rootFolders, 
  expandedFolders, 
  selectedFolder,
  onToggleFolder, 
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  scenarios
}: {
  rootFolders: any[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: ScenarioFolder) => void
  onDeleteFolder: (folderId: string) => void
  scenarios: Scenario[]
}) {
  const getScenarioCount = (folderId: string): number => {
    return scenarios.filter(scenario => scenario.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const scenarioCount = getScenarioCount(folder.id)
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || scenarioCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || scenarioCount > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <div className="w-3 h-3" />
              )}
            </button>
            <Folder className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="font-medium truncate">{folder.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{scenarioCount}</span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditFolder(folder)
                }}
                className="p-1 hover:bg-gray-200 rounded transition-all"
                title="フォルダ編集"
              >
                <Edit2 className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`フォルダ「${folder.name}」を削除しますか？フォルダ内のシナリオは未分類になります。`)) {
                    onDeleteFolder(folder.id)
                  }
                }}
                className="p-1 hover:bg-red-200 rounded transition-all"
                title="フォルダ削除"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map((child: any) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* すべてのシナリオ */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのシナリオ</span>
        </div>
        <span className="text-xs text-gray-500">{scenarios.length}</span>
      </div>

      {/* 未分類シナリオ */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder('null')}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">未分類</span>
        </div>
        <span className="text-xs text-gray-500">{scenarios.filter(scenario => !scenario.folderId).length}</span>
      </div>

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}

// シナリオコンテンツ表示コンポーネント
function ScenarioContentView({
  scenarios,
  searchQuery,
  onEditScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleActive,
  onViewAnalytics,
  getTriggerLabel
}: {
  scenarios: Scenario[]
  searchQuery: string
  onEditScenario: (scenario: Scenario) => void
  onDuplicateScenario: (scenario: Scenario) => void
  onDeleteScenario: (scenarioId: string, scenarioName: string) => void
  onToggleActive: (scenarioId: string, isActive: boolean) => void
  onViewAnalytics: (scenarioId: string) => void
  getTriggerLabel: (trigger: TriggerType) => string
}) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-gray-400 mb-4">
          <Target className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'シナリオが見つかりません' : 'シナリオがまだありません'}
        </h3>
        <p className="text-gray-600">
          {searchQuery 
            ? '検索条件に一致するシナリオがありません。'
            : '新しいシナリオを作成して、自動配信を設定しましょう。'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[250px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                シナリオ名
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                トリガー
              </th>
              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scenarios.map((scenario) => {
              return (
                <tr key={scenario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      <div className="truncate max-w-[200px]" title={scenario.name}>
                        {scenario.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div className="truncate max-w-[200px]" title={`ID: ${scenario.id}`}>
                        ID: {scenario.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {getTriggerLabel(scenario.trigger)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      scenario.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {scenario.isActive ? 'アクティブ' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {scenario.createdAt.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewAnalytics(scenario.id)}
                        className="text-purple-600 hover:text-purple-900 inline-flex items-center p-1 rounded hover:bg-purple-100"
                        title="分析"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditScenario(scenario)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateScenario(scenario)}
                        className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
                        title="複製"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteScenario(scenario.id, scenario.name)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded hover:bg-red-100"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// フォルダ作成モーダル
function CreateFolderModal({ onClose, onSubmit }: { 
  onClose: () => void, 
  onSubmit: (folder: Omit<ScenarioFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新規フォルダ作成</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="フォルダ名を入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="フォルダの説明を入力"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                作成
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// フォルダ編集モーダル
function EditFolderModal({ folder, onClose, onSubmit }: { 
  folder: ScenarioFolder, 
  onClose: () => void, 
  onSubmit: (folderId: string, updates: Partial<ScenarioFolder>) => void
}) {
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit(folder.id, {
      name: name.trim(),
      description: description.trim() || undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">フォルダ編集</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                更新
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}