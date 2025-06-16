'use client'

import { useState } from 'react'
import { Scenario, ScenarioFolder, Campaign, User } from '@/types'
import {
  Plus,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Edit2,
  Copy,
  Trash2,
  BarChart3,
  Send
} from 'lucide-react'
import { ActionMenu, createCommonMenuItems } from '@/components/Common/ActionMenu'
import { DraggableList, DragHandle } from '@/components/Common/DraggableList'
import { DraggableFolderTree } from '@/components/Common/DraggableFolderTree'
import { DraggableTableBody } from '@/components/Common/DraggableTableBody'
import { TestSendModal } from '@/components/Common/TestSendModal'

interface ScenarioListProps {
  scenarios: Scenario[]
  scenarioFolders: ScenarioFolder[]
  campaigns: Campaign[]
  users?: User[]
  onCreateScenario: () => void
  onEditScenario: (scenario: Scenario) => void
  onDuplicateScenario: (scenario: Scenario) => void
  onDeleteScenario: (scenarioId: string) => void
  onToggleActive: (scenarioId: string, isActive: boolean) => void
  onViewAnalytics: (scenarioId: string) => void
  onTestSend?: (scenarioId: string, userIds: string[], message?: string) => Promise<void>
  onCreateFolder: (folder: Omit<ScenarioFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<ScenarioFolder>) => void
  onDeleteFolder: (folderId: string) => void
  onReorderScenarios?: (scenarios: Scenario[]) => void
  onReorderFolders?: (folders: ScenarioFolder[]) => void
  onMoveScenario?: (scenarioId: string, targetFolderId: string | null) => void
}

export function ScenarioList({
  scenarios,
  scenarioFolders,
  campaigns,
  users = [],
  onCreateScenario,
  onEditScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleActive,
  onViewAnalytics,
  onTestSend,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onReorderScenarios,
  onReorderFolders,
  onMoveScenario
}: ScenarioListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [testSendScenario, setTestSendScenario] = useState<Scenario | null>(null)

  // フォルダの展開/折りたたみ
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フィルタリングされたシナリオ
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolder === null 
      ? true 
      : selectedFolder === 'null' 
      ? !scenario.folderId 
      : scenario.folderId === selectedFolder
    return matchesSearch && matchesFolder
  })

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: ScenarioFolder[], parentId: string | null = null): any[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderHierarchy(folders, folder.id)
      }))
  }

  const folderHierarchy = buildFolderHierarchy(scenarioFolders)

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">シナリオ</h2>
          <p className="mt-1 text-sm text-gray-600">
            自動配信シナリオを作成・管理します
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左サイドバー: フォルダツリー */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">フォルダ</h3>
            </div>
            <div className="p-4">
              {onReorderFolders && onMoveScenario ? (
                <DraggableFolderTree
                  folders={scenarioFolders}
                  items={scenarios}
                  expandedFolders={expandedFolders}
                  selectedFolder={selectedFolder}
                  onToggleFolder={toggleFolder}
                  onSelectFolder={setSelectedFolder}
                  onReorderFolders={onReorderFolders}
                  onReorderItems={onReorderScenarios || (() => {})}
                  onMoveItem={onMoveScenario}
                  showAllFolder={true}
                  showUncategorizedFolder={true}
                  allFolderLabel="すべてのシナリオ"
                  uncategorizedFolderLabel="未分類"
                />
              ) : (
                <FolderTree
                  folders={folderHierarchy}
                  expandedFolders={expandedFolders}
                  selectedFolder={selectedFolder}
                  onToggleFolder={toggleFolder}
                  onSelectFolder={setSelectedFolder}
                  scenarios={scenarios}
                />
              )}
            </div>
          </div>
        </div>

        {/* 右メインエリア: シナリオリスト */}
        <div className="col-span-9">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのシナリオ'
                    : selectedFolder === 'null'
                    ? '未分類のシナリオ'
                    : scenarioFolders.find(f => f.id === selectedFolder)?.name || 'シナリオ'}
                </h3>
                <div className="flex items-center gap-3">
                  {/* アクションメニュー */}
                  <ActionMenu
                    items={createCommonMenuItems({
                      onCreateNew: onCreateScenario,
                      onCreateFolder: () => setShowCreateFolder(true),
                      entityName: 'シナリオ',
                      selectedFolder: selectedFolder && selectedFolder !== 'null' ? scenarioFolders.find(f => f.id === selectedFolder) : null,
                      onEditFolder: selectedFolder && selectedFolder !== 'null' ? () => {
                        const folder = scenarioFolders.find(f => f.id === selectedFolder)
                        if (folder) onUpdateFolder(folder.id, folder)
                      } : undefined,
                      onDeleteFolder: selectedFolder && selectedFolder !== 'null' ? () => {
                        const folder = scenarioFolders.find(f => f.id === selectedFolder)
                        if (folder && confirm(`フォルダ「${folder.name}」を削除しますか？`)) {
                          onDeleteFolder(selectedFolder)
                        }
                      } : undefined
                    })}
                  />
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="シナリオを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ScenarioTable
                scenarios={filteredScenarios}
                campaigns={campaigns}
                onEditScenario={onEditScenario}
                onDuplicateScenario={onDuplicateScenario}
                onDeleteScenario={onDeleteScenario}
                onToggleActive={onToggleActive}
                onViewAnalytics={onViewAnalytics}
                onReorderScenarios={onReorderScenarios}
                onMoveScenario={onMoveScenario}
                selectedFolder={selectedFolder}
                onTestSend={onTestSend}
                setTestSendScenario={setTestSendScenario}
              />
            </div>
          </div>
        </div>
      </div>

      {/* フォルダ作成モーダル */}
      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onSubmit={(data: Omit<ScenarioFolder, 'id' | 'createdAt' | 'updatedAt'>) => {
            onCreateFolder(data)
            setShowCreateFolder(false)
          }}
          parentFolders={scenarioFolders}
        />
      )}

      {/* テスト送信モーダル */}
      {testSendScenario && onTestSend && (
        <TestSendModal
          isOpen={true}
          onClose={() => setTestSendScenario(null)}
          users={users}
          title={`シナリオ「${testSendScenario.name}」のテスト送信`}
          contentPreview={
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                {testSendScenario.name}
              </div>
              {testSendScenario.description && (
                <div className="text-sm text-gray-600">
                  {testSendScenario.description}
                </div>
              )}
              <div className="text-xs text-gray-500">
                トリガー: {testSendScenario.trigger}
              </div>
            </div>
          }
          onSend={async (userIds, message) => {
            await onTestSend(testSendScenario.id, userIds, message)
          }}
        />
      )}
    </div>
  )
}

// フォルダツリーコンポーネント
function FolderTree({ 
  folders, 
  expandedFolders, 
  selectedFolder, 
  onToggleFolder, 
  onSelectFolder,
  scenarios 
}: any) {
  const getScenarioCount = (folderId: string) => {
    return scenarios.filter((s: Scenario) => s.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0
    const isExpanded = expandedFolders.includes(folder.id)
    const isSelected = selectedFolder === folder.id
    const count = getScenarioCount(folder.id)

    return (
      <div key={folder.id} className="mb-1">
        <div
          className={`group flex items-center justify-between py-2 px-3 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren) onToggleFolder(folder.id)
              }}
              className="w-4 h-4 mr-2"
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3" />
              )}
            </button>
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-gray-500">({count})</span>
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
        className={`group flex items-center justify-between py-2 px-3 rounded cursor-pointer hover:bg-gray-100 ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのシナリオ</span>
        </div>
        <span className="text-xs text-gray-500">({scenarios.length})</span>
      </div>

      {/* 未分類 */}
      <div
        className={`group flex items-center justify-between py-2 px-3 rounded cursor-pointer hover:bg-gray-100 ${
          selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder('null')}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">未分類</span>
        </div>
        <span className="text-xs text-gray-500">
          ({scenarios.filter((s: Scenario) => !s.folderId).length})
        </span>
      </div>

      {/* フォルダツリー */}
      {folders.map((folder: any) => renderFolder(folder))}
    </div>
  )
}

// シナリオテーブルコンポーネント
function ScenarioTable({
  scenarios,
  campaigns,
  onEditScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleActive,
  onViewAnalytics,
  onReorderScenarios,
  onMoveScenario,
  selectedFolder,
  onTestSend,
  setTestSendScenario
}: any) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {onReorderScenarios && <th className="w-10 px-2"></th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              シナリオ名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              キャンペーン
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              トリガー
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ステータス
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        {onReorderScenarios && onMoveScenario ? (
          <DraggableTableBody
            items={scenarios}
            currentFolderId={selectedFolder}
            onReorderItems={onReorderScenarios}
            onMoveItem={onMoveScenario}
            showDragHandle={true}
            renderRow={(scenario: Scenario, index, isDragging) => {
              const campaign = campaigns.find((c: Campaign) => c.id === scenario.campaignId)
              return (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                    {scenario.description && (
                      <div className="text-sm text-gray-500">{scenario.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{campaign?.name || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {scenario.trigger}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleActive(scenario.id, !scenario.isActive)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      scenario.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {scenario.isActive ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        有効
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        無効
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewAnalytics(scenario.id)}
                      className="text-gray-600 hover:text-gray-900"
                      title="分析"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (onTestSend) setTestSendScenario(scenario)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="テスト送信"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditScenario(scenario)}
                      className="text-gray-600 hover:text-gray-900"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateScenario(scenario)}
                      className="text-gray-600 hover:text-gray-900"
                      title="複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`シナリオ「${scenario.name}」を削除しますか？`)) {
                          onDeleteScenario(scenario.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                </>
              )
            }}
          />
        ) : (
          <tbody className="bg-white divide-y divide-gray-200">
            {scenarios.map((scenario: Scenario) => {
              const campaign = campaigns.find((c: Campaign) => c.id === scenario.campaignId)
              return (
                <tr key={scenario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                      {scenario.description && (
                        <div className="text-sm text-gray-500">{scenario.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {scenario.trigger}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive(scenario.id, !scenario.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        scenario.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {scenario.isActive ? (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          有効
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          無効
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewAnalytics(scenario.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="分析"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (onTestSend) setTestSendScenario(scenario)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="テスト送信"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditScenario(scenario)}
                        className="text-gray-600 hover:text-gray-900"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateScenario(scenario)}
                        className="text-gray-600 hover:text-gray-900"
                        title="複製"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`シナリオ「${scenario.name}」を削除しますか？`)) {
                            onDeleteScenario(scenario.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
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
        )}
      </table>
      {scenarios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">シナリオがありません</p>
        </div>
      )}
    </div>
  )
}

// フォルダ作成モーダル
function CreateFolderModal({ onClose, onSubmit, parentFolders }: any) {
  const [folderData, setFolderData] = useState({
    name: '',
    description: '',
    parentId: null as string | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderData.name.trim()) {
      onSubmit(folderData)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-medium text-gray-900 mb-4">新規フォルダ作成</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                フォルダ名
              </label>
              <input
                type="text"
                value={folderData.name}
                onChange={(e) => setFolderData({ ...folderData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                説明（任意）
              </label>
              <textarea
                value={folderData.description}
                onChange={(e) => setFolderData({ ...folderData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                親フォルダ（任意）
              </label>
              <select
                value={folderData.parentId || ''}
                onChange={(e) => setFolderData({ ...folderData, parentId: e.target.value || null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">なし</option>
                {parentFolders.map((folder: ScenarioFolder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}