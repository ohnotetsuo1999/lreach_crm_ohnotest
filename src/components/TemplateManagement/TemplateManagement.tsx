'use client'

import { useState, useEffect, useRef } from 'react'
import { Template, TemplateFolder, TemplatePack, LineMessage } from '@/types'
import { Eye, Copy, Edit2, Send } from 'lucide-react'
import { TemplateDrawer } from './TemplateDrawer'
import { PackDrawer } from './PackDrawer'
import { EnhancedLinePreview } from '../TemplatePreview/EnhancedLinePreview'
import { PackDetail } from '../PackManagement/PackDetail'
import { createCommonMenuItems } from '@/components/Common/ActionMenu'
import { ManagementLayout } from '@/components/Common/ManagementLayout'
import { FolderTreeView } from '@/components/Common/FolderTreeView'
import { DraggableFolderTree } from '@/components/Common/DraggableFolderTree'
import { DataTable, TableColumn } from '@/components/Common/DataTable'
import { StatusBadge } from '@/components/Common/StatusBadge'
import { TestSendModal } from '@/components/Common/TestSendModal'

interface TemplateManagementProps {
  templates: Template[]
  templateFolders: TemplateFolder[]
  templatePacks: TemplatePack[]
  users?: any[] // テスト送信用ユーザーリスト
  onCreateTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void
  onUpdateTemplate: (templateId: string, updates: Partial<Template>) => void
  onDeleteTemplate: (templateId: string) => void
  onDuplicateTemplate: (template: Template) => void
  onCreateFolder: (folder: Omit<TemplateFolder, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateFolder: (folderId: string, updates: Partial<TemplateFolder>) => void
  onDeleteFolder: (folderId: string) => void
  onReorderFolders: (folders: TemplateFolder[]) => void
  onReorderTemplates?: (templates: Template[]) => void
  onMoveTemplate?: (templateId: string, targetFolderId: string | null) => void
  onCreatePack: (pack: Omit<TemplatePack, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdatePack: (packId: string, updates: Partial<TemplatePack>) => void
  onDeletePack: (packId: string) => void
  onTestSend?: (templateId: string, userIds: string[], message?: string) => Promise<void>
  onNavigateToPackDetail?: (packId: string) => void
}

export function TemplateManagement({
  templates,
  templateFolders,
  templatePacks,
  users = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onReorderFolders,
  onReorderTemplates,
  onMoveTemplate,
  onCreatePack,
  onUpdatePack,
  onDeletePack,
  onTestSend,
  onNavigateToPackDetail
}: TemplateManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showCreatePack, setShowCreatePack] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<TemplateFolder | null>(null)
  const [editingPack, setEditingPack] = useState<TemplatePack | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false)
  const [selectedPack, setSelectedPack] = useState<TemplatePack | null>(null)
  const [isPackDrawerOpen, setIsPackDrawerOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'pack-detail'>('list')
  const [editingPackFromTemplate, setEditingPackFromTemplate] = useState<TemplatePack | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [savedState, setSavedState] = useState({
    searchQuery: '',
    selectedFolder: null as string | null,
    expandedFolders: [] as string[]
  })
  const [testSendTemplate, setTestSendTemplate] = useState<Template | null>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)

  // 状態の復元
  useEffect(() => {
    if (currentView === 'list' && (savedState.searchQuery || savedState.selectedFolder || savedState.expandedFolders.length > 0)) {
      setSearchQuery(savedState.searchQuery)
      setSelectedFolder(savedState.selectedFolder)
      setExpandedFolders(savedState.expandedFolders)
      
      // スクロール位置を復元
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = scrollPosition
        }
      }, 100)
    }
  }, [currentView])

  // フォルダの展開/折りたたみ  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  // フィルタリング
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesFolder = true
    if (selectedFolder === 'null') {
      matchesFolder = !template.folderId
    } else if (selectedFolder) {
      matchesFolder = template.folderId === selectedFolder
    }
    
    return matchesSearch && matchesFolder
  })

  // フォルダ階層の構築
  const buildFolderHierarchy = (folders: TemplateFolder[], parentId: string | null = null): any[] => {
    const filtered = folders.filter(folder => 
      (folder.parentId === parentId) || 
      (parentId === null && folder.parentId === undefined)
    )
    
    // Sort by order field, fallback to creation date
    const sorted = filtered.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    
    return sorted.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(templateFolders)

  // ドラッグ&ドロップのハンドラー

  // テンプレート詳細編集
  const handleOpenTemplateDrawer = (template: Template) => {
    if (template.type === 'PACK' && template.packId) {
      // 現在の状態を保存
      setSavedState({
        searchQuery,
        selectedFolder,
        expandedFolders
      })
      
      // スクロール位置を保存
      if (mainContentRef.current) {
        setScrollPosition(mainContentRef.current.scrollTop)
      }
      
      // パックタイプの場合はパック詳細画面を表示
      const pack = templatePacks.find(p => p.id === template.packId)
      if (pack) {
        setEditingPackFromTemplate(pack)
        setCurrentView('pack-detail')
      }
    } else {
      // 通常のテンプレートの場合はドロワーを表示
      setSelectedTemplate(template)
      setIsTemplateDrawerOpen(true)
    }
  }

  const handleCloseTemplateDrawer = () => {
    setSelectedTemplate(null)
    setIsTemplateDrawerOpen(false)
  }

  const handleBackFromPackDetail = () => {
    setEditingPackFromTemplate(null)
    setCurrentView('list')
    // 状態の復元は useEffect で自動的に行われる
  }

  // パック詳細編集
  const handleOpenPackDrawer = (pack: TemplatePack) => {
    setSelectedPack(pack)
    setIsPackDrawerOpen(true)
  }

  const handleClosePackDrawer = () => {
    setSelectedPack(null)
    setIsPackDrawerOpen(false)
  }

  // パック詳細画面の表示
  if (currentView === 'pack-detail' && editingPackFromTemplate) {
    return (
      <PackDetail
        pack={editingPackFromTemplate}
        templates={templates}
        templateFolders={templateFolders}
        onBack={handleBackFromPackDetail}
        onUpdatePack={onUpdatePack}
        onDeletePack={(packId) => {
          onDeletePack(packId)
          handleBackFromPackDetail()
        }}
        onUpdateTemplate={onUpdateTemplate}
        onPreviewTemplate={(template) => {
          setPreviewTemplate(template)
          setIsPreviewModalOpen(true)
        }}
      />
    )
  }

  // テーブル列の定義
  const columns: TableColumn[] = [
    { key: 'name', label: 'テンプレート名', minWidth: 'min-w-[250px]' },
    { key: 'type', label: 'タイプ', minWidth: 'min-w-[100px]' },
    { key: 'createdAt', label: '登録日', minWidth: 'min-w-[120px]' },
    { key: 'actions', label: 'アクション', minWidth: 'min-w-[120px]' }
  ]

  // テンプレートタイプの色を取得
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'info'
      case 'FLEX': return 'behavioral'
      case 'IMAGE': return 'success'
      case 'PACK': return 'warning'
      default: return 'inactive'
    }
  }

  // テンプレートタイプのラベルを取得
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TEXT': return 'テキスト'
      case 'FLEX': return 'Flex'
      case 'IMAGE': return '画像'
      case 'PACK': return 'パック'
      default: return type
    }
  }

  // テーブル行のレンダリング
  const renderTemplateRow = (template: Template, index: number, isDragging?: boolean) => (
    <>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-gray-900">
          <div className="truncate max-w-[200px]" title={template.name}>
            {template.name}
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          <div className="truncate max-w-[200px]" title={template.content}>
            {template.content.length > 40 ? template.content.substring(0, 40) + '...' : template.content}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        <StatusBadge variant={getTypeColor(template.type) as any}>
          {getTypeLabel(template.type)}
        </StatusBadge>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
        {template.createdAt.toLocaleDateString('ja-JP')}
      </td>
      <td className="px-4 py-4 text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setPreviewTemplate(template)
              setIsPreviewModalOpen(true)
            }}
            className="text-gray-600 hover:text-gray-900 inline-flex items-center p-1 rounded hover:bg-gray-100"
            title="プレビュー"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onTestSend && users && users.length > 0 && (
            <button
              onClick={() => setTestSendTemplate(template)}
              className="text-orange-600 hover:text-orange-900 inline-flex items-center p-1 rounded hover:bg-orange-100"
              title="テスト送信"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDuplicateTemplate(template)}
            className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
            title="複製"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenTemplateDrawer(template)}
            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </>
  )

  // 空の状態
  const emptyState = (
    <div className="text-center py-12 text-gray-500">
      <div className="text-lg font-medium mb-2">テンプレートがありません。</div>
      <div className="text-sm">新しいテンプレートを作成してください</div>
    </div>
  )

  return (
    <ManagementLayout
      title="テンプレート"
      description="個別トーク・シナリオ配信・一斉配信などで使用できるテンプレートを管理"
      headerActions={createCommonMenuItems({
        onCreateNew: () => setShowCreateTemplate(true),
        onCreateFolder: () => setShowCreateFolder(true),
        onCreatePack: () => setShowCreatePack(true),
        entityName: 'テンプレート',
        selectedFolder: selectedFolder && selectedFolder !== 'null' ? templateFolders.find(f => f.id === selectedFolder) : null,
        onEditFolder: selectedFolder && selectedFolder !== 'null' ? () => {
          const folder = templateFolders.find(f => f.id === selectedFolder)
          if (folder) setEditingFolder(folder)
        } : undefined,
        onDeleteFolder: selectedFolder && selectedFolder !== 'null' ? () => {
          const folder = templateFolders.find(f => f.id === selectedFolder)
          if (folder && confirm(`フォルダ「${folder.name}」を削除しますか？`)) {
            onDeleteFolder(selectedFolder)
          }
        } : undefined
      })}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="テンプレートを検索"
      folderTree={
        <DraggableFolderTree
          folders={templateFolders}
          items={templates}
          expandedFolders={expandedFolders}
          selectedFolder={selectedFolder}
          onToggleFolder={toggleFolder}
          onSelectFolder={setSelectedFolder}
          onReorderFolders={onReorderFolders}
          onReorderItems={onReorderTemplates || (() => {})}
          onMoveItem={onMoveTemplate || (() => {})}
          showAllFolder={true}
          showUncategorizedFolder={true}
          allFolderLabel="すべてのテンプレート"
          uncategorizedFolderLabel="未分類"
        />
      }
      content={
        <DataTable
          columns={columns}
          data={filteredTemplates}
          renderRow={renderTemplateRow}
          emptyState={emptyState}
          onReorderItems={onReorderTemplates}
          onMoveItem={onMoveTemplate}
          currentFolderId={selectedFolder}
          showDragHandle={true}
        />
      }
      modals={
        <>
          {/* プレビューモーダル */}
          {isPreviewModalOpen && previewTemplate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">テンプレートプレビュー</h3>
                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <EnhancedLinePreview message={{ type: 'text', text: previewTemplate.content }} />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsPreviewModalOpen(false)
                      setPreviewTemplate(null)
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* テンプレート詳細ドロワー */}
          {isTemplateDrawerOpen && selectedTemplate && (
            <TemplateDrawer
              template={selectedTemplate}
              isOpen={isTemplateDrawerOpen}
              onClose={handleCloseTemplateDrawer}
              onSave={onUpdateTemplate}
              onDelete={onDeleteTemplate}
              folders={templateFolders}
              onNavigateToPackDetail={onNavigateToPackDetail}
              templatePacks={templatePacks}
              onUpdatePack={onUpdatePack}
              onDeletePack={onDeletePack}
              templates={templates}
              onUpdateTemplate={onUpdateTemplate}
            />
          )}

          {/* テンプレートパック詳細ドロワー */}
          {isPackDrawerOpen && selectedPack && (
            <PackDrawer
              pack={selectedPack}
              isOpen={isPackDrawerOpen}
              onClose={handleClosePackDrawer}
              onSave={onUpdatePack}
              onDelete={onDeletePack}
              templates={templates}
              onUpdateTemplate={onUpdateTemplate}
            />
          )}

          {/* テスト送信モーダル */}
          {testSendTemplate && onTestSend && users && (
            <TestSendModal
              isOpen={true}
              onClose={() => setTestSendTemplate(null)}
              users={users}
              title={`テンプレート「${testSendTemplate.name}」のテスト送信`}
              contentPreview={
                <EnhancedLinePreview message={{ type: 'text', text: testSendTemplate.content }} />
              }
              onSend={async (userIds, message) => {
                await onTestSend(testSendTemplate.id, userIds, message)
              }}
            />
          )}
        </>
      }
    />
  )
}
