'use client'

import { useState, useEffect, useRef } from 'react'
import { Template, TemplateFolder, TemplatePack, LineMessage } from '@/types'
import { Plus, Search, Folder, ChevronDown, ChevronRight, FolderOpen, Package, Eye, X, Copy, Edit2 } from 'lucide-react'
import { TemplateDrawer } from './TemplateDrawer'
import { PackDrawer } from './PackDrawer'
import { EnhancedLinePreview } from '../TemplatePreview/EnhancedLinePreview'
import { PackDetail } from '../PackManagement/PackDetail'

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
  onCreatePack: (pack: Omit<TemplatePack, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdatePack: (packId: string, updates: Partial<TemplatePack>) => void
  onDeletePack: (packId: string) => void
  onTestSend?: (userIds: string[], template: Template) => Promise<void>
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
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, folderId: string | null} | null>(null)
  const [newTemplateInFolder, setNewTemplateInFolder] = useState<string | null>(null)
  const [newFolderInFolder, setNewFolderInFolder] = useState<string | null>(null)
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
    
    return filtered.map(folder => ({
      ...folder,
      children: buildFolderHierarchy(folders, folder.id)
    }))
  }

  const rootFolders = buildFolderHierarchy(templateFolders)

  // 右クリックメニューの処理
  const handleContextMenu = (e: React.MouseEvent, folderId: string | null) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // フォルダ内に新規テンプレート作成
  const handleCreateTemplateInFolder = (folderId: string | null) => {
    setNewTemplateInFolder(folderId)
    setShowCreateTemplate(true)
    closeContextMenu()
  }

  // フォルダ内に新規フォルダ作成
  const handleCreateFolderInFolder = (folderId: string | null) => {
    setNewFolderInFolder(folderId)
    setShowCreateFolder(true)
    closeContextMenu()
  }

  // モーダルを閉じるときのリセット
  const handleCloseCreateTemplate = () => {
    setShowCreateTemplate(false)
    setNewTemplateInFolder(null)
  }

  const handleCloseCreateFolder = () => {
    setShowCreateFolder(false)
    setNewFolderInFolder(null)
  }

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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">テンプレート</h2>
          <p className="mt-1 text-sm text-gray-600">
            個別トーク・シナリオ配信・一斉配信などで使用できるテンプレートを管理
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {/* 新規作成ボタン */}
          <button
            onClick={() => setShowCreateFolder(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Folder className="w-4 h-4 mr-2 text-green-600" />
            新しいフォルダ
          </button>
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-2 text-blue-600" />
            テンプレートを作成
          </button>
          <button
            onClick={() => setShowCreatePack(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Package className="w-4 h-4 mr-2" />
            テンプレートパックを作成
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
                onContextMenu={handleContextMenu}
                onCreateFolderInFolder={handleCreateFolderInFolder}
                onCreateTemplateInFolder={handleCreateTemplateInFolder}
                templates={templates}
              />
            </div>
          </div>
        </div>

        {/* 右カラム: テンプレート表示 */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {selectedFolder === null 
                    ? 'すべてのテンプレート' 
                    : selectedFolder === 'null'
                    ? '未分類のテンプレート'
                    : templateFolders.find(f => f.id === selectedFolder)?.name || 'テンプレート'}
                </h3>
                <div className="flex items-center space-x-3">
                  {/* フォルダ内アクションボタン */}
                  {selectedFolder && selectedFolder !== 'null' && (
                    <>
                      <button
                        onClick={() => handleCreateFolderInFolder(selectedFolder)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        フォルダ追加
                      </button>
                      <button
                        onClick={() => handleCreateTemplateInFolder(selectedFolder)}
                        className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        テンプレート追加
                      </button>
                    </>
                  )}
                  
                  {/* 検索 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="テンプレートを検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div ref={mainContentRef} className="flex-1 overflow-y-auto p-4">
              <TemplateListView 
                templates={filteredTemplates}
                templatePacks={templatePacks}
                onOpenTemplateDrawer={handleOpenTemplateDrawer}
                onOpenPackDrawer={handleOpenPackDrawer}
                onDuplicateTemplate={onDuplicateTemplate}
                onPreviewTemplate={(template) => {
                  setPreviewTemplate(template)
                  setIsPreviewModalOpen(true)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={closeContextMenu} />
          <div 
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => handleCreateTemplateInFolder(contextMenu.folderId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規テンプレート作成
            </button>
            <button
              onClick={() => handleCreateFolderInFolder(contextMenu.folderId)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Folder className="w-4 h-4 mr-2" />
              新規フォルダ作成
            </button>
          </div>
        </>
      )}

      {/* 新規テンプレート作成モーダル */}
      {showCreateTemplate && (
        <CreateTemplateModal 
          onClose={handleCloseCreateTemplate} 
          onSubmit={onCreateTemplate} 
          folders={templateFolders}
          defaultFolderId={newTemplateInFolder}
        />
      )}
      
      {/* 新規フォルダ作成モーダル */}
      {showCreateFolder && (
        <CreateFolderModal 
          onClose={handleCloseCreateFolder} 
          onSubmit={onCreateFolder} 
          folders={templateFolders}
          defaultParentId={newFolderInFolder}
        />
      )}

      {/* 新規テンプレートパック作成モーダル */}
      {showCreatePack && (
        <CreatePackModal 
          onClose={() => setShowCreatePack(false)} 
          onSubmit={onCreatePack} 
          templates={templates}
        />
      )}
      
      {/* プレビューモーダル */}
      {isPreviewModalOpen && previewTemplate && (
        <TemplatePreviewModal 
          template={previewTemplate} 
          users={users}
          onTestSend={onTestSend}
          onClose={() => {
            setIsPreviewModalOpen(false)
            setPreviewTemplate(null)
          }} 
        />
      )}
      
      {/* フォルダ編集モーダル */}
      {editingFolder && (
        <EditFolderModal 
          folder={editingFolder} 
          onClose={() => setEditingFolder(null)} 
          onSubmit={onUpdateFolder} 
          folders={templateFolders} 
        />
      )}

      {/* テンプレートパック編集モーダル */}
      {editingPack && (
        <EditPackModal 
          pack={editingPack} 
          onClose={() => setEditingPack(null)} 
          onSubmit={onUpdatePack} 
          onDelete={onDeletePack}
          templates={templates}
        />
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
    </div>
  )
}

// 左カラム: フォルダツリー表示コンポーネント
function FolderTreeView({ 
  rootFolders, 
  expandedFolders, 
  selectedFolder,
  onToggleFolder, 
  onSelectFolder,
  onContextMenu,
  onCreateFolderInFolder,
  onCreateTemplateInFolder,
  templates
}: {
  rootFolders: any[]
  expandedFolders: string[]
  selectedFolder: string | null
  onToggleFolder: (folderId: string) => void
  onSelectFolder: (folderId: string | null) => void
  onContextMenu: (e: React.MouseEvent, folderId: string | null) => void
  onCreateFolderInFolder: (folderId: string | null) => void
  onCreateTemplateInFolder: (folderId: string | null) => void
  templates: Template[]
}) {
  const getTemplateCount = (folderId: string): number => {
    return templates.filter(template => template.folderId === folderId).length
  }

  const renderFolder = (folder: any, level: number = 0) => {
    const templateCount = getTemplateCount(folder.id)
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
          onContextMenu={(e) => onContextMenu(e, folder.id)}
        >
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (hasChildren || templateCount > 0) {
                  onToggleFolder(folder.id)
                }
              }}
              className="w-4 h-4 mr-2 flex items-center justify-center"
            >
              {hasChildren || templateCount > 0 ? (
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
            <span className="text-xs text-gray-500">({templateCount})</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateTemplateInFolder(folder.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all"
              title="新規テンプレート作成"
            >
              <Plus className="w-3 h-3 text-blue-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFolderInFolder(folder.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              title="新規フォルダ作成"
            >
              <Folder className="w-3 h-3 text-gray-600" />
            </button>
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
      {/* すべてのテンプレート */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === null ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder(null)}
        onContextMenu={(e) => onContextMenu(e, null)}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <Folder className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-medium">すべてのテンプレート</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">({templates.length})</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateTemplateInFolder(null)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all"
            title="新規テンプレート作成"
          >
            <Plus className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateFolderInFolder(null)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
            title="新規フォルダ作成"
          >
            <Folder className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 未分類テンプレート */}
      <div 
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
          selectedFolder === 'null' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
        }`}
        onClick={() => onSelectFolder('null')}
        onContextMenu={(e) => onContextMenu(e, 'null')}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 mr-2" />
          <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">未分類</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">({templates.filter(template => !template.folderId).length})</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateTemplateInFolder('null')
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-200 rounded transition-all"
            title="新規テンプレート作成"
          >
            <Plus className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateFolderInFolder(null)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
            title="新規フォルダ作成"
          >
            <Folder className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* フォルダツリー */}
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}


// リスト表示コンポーネント
function TemplateListView({ 
  templates, 
  templatePacks,
  onOpenTemplateDrawer,
  onOpenPackDrawer,
  onDuplicateTemplate,
  onPreviewTemplate
}: {
  templates: Template[]
  templatePacks: TemplatePack[]
  onOpenTemplateDrawer: (template: Template) => void
  onOpenPackDrawer: (pack: TemplatePack) => void
  onDuplicateTemplate: (template: Template) => void
  onPreviewTemplate: (template: Template) => void
}) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">テンプレートがありません。</div>
        <div className="text-sm">新しいテンプレートを作成してください</div>
      </div>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800'
      case 'FLEX': return 'bg-purple-100 text-purple-800'
      case 'IMAGE': return 'bg-green-100 text-green-800'
      case 'PACK': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[250px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                テンプレート名
              </th>
              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイプ
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
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
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                    {template.type === 'TEXT' ? 'テキスト' : template.type === 'FLEX' ? 'Flex' : template.type === 'IMAGE' ? '画像' : 'パック'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {template.createdAt.toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-4 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onPreviewTemplate(template)
                      }}
                      className="text-gray-600 hover:text-gray-900 inline-flex items-center p-1 rounded hover:bg-gray-100"
                      title="プレビュー"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateTemplate(template)}
                      className="text-green-600 hover:text-green-900 inline-flex items-center p-1 rounded hover:bg-green-100"
                      title="複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenTemplateDrawer(template)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 新規テンプレート作成モーダル
function CreateTemplateModal({ onClose, onSubmit, folders, defaultFolderId }: { 
  onClose: () => void, 
  onSubmit: (template: Omit<Template, 'id' | 'createdAt'>) => void, 
  folders: TemplateFolder[],
  defaultFolderId?: string | null
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'TEXT' | 'FLEX' | 'IMAGE' | 'PACK'>('TEXT')
  const [folderId, setFolderId] = useState<string>(
    defaultFolderId && defaultFolderId !== 'null' ? defaultFolderId : ''
  )
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState('')

  const generateLineMessageJson = (type: string, content: string) => {
    if (type === 'TEXT') {
      return JSON.stringify({
        type: 'text',
        text: content || 'サンプルテキストメッセージ'
      })
    } else if (type === 'FLEX') {
      return JSON.stringify({
        type: 'flex',
        altText: 'Flexメッセージ',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: content || 'サンプルFlexメッセージ',
                weight: 'bold',
                size: 'lg'
              }
            ]
          }
        }
      })
    }
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    const lineMessageJson = generateLineMessageJson(type, content.trim())

    onSubmit({
      name: name.trim(),
      type,
      folderId: folderId || undefined,
      content: content.trim(),
      notes: notes.trim() || undefined,
      lineMessageJson: lineMessageJson ?? undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新規テンプレート作成</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="テンプレート名を入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TEXT">テキスト</option>
                <option value="FLEX">Flex</option>
                <option value="IMAGE">画像</option>
                <option value="PACK">パック</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">フォルダ</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">未分類</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="テンプレートの内容を入力"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">備考（任意）</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="テンプレートの備考やメモを入力"
                rows={2}
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

// 新規フォルダ作成モーダル
function CreateFolderModal({ onClose, onSubmit, defaultParentId }: { 
  onClose: () => void, 
  onSubmit: (folder: Omit<TemplateFolder, 'id' | 'createdAt' | 'updatedAt'>) => void, 
  folders?: TemplateFolder[],
  defaultParentId?: string | null
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: defaultParentId && defaultParentId !== 'null' ? defaultParentId : undefined
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

// 新規テンプレートパック作成モーダル
function CreatePackModal({ onClose, onSubmit, templates }: { 
  onClose: () => void, 
  onSubmit: (pack: Omit<TemplatePack, 'id' | 'createdAt' | 'updatedAt'>) => void, 
  templates: Template[]
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedTemplates.length === 0) return
    
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      templateIds: selectedTemplates
    })
    onClose()
  }

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新規テンプレートパック作成</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">パック名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パック名を入力"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パックの説明を入力"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テンプレートを選択 ({selectedTemplates.length}件選択中)
              </label>
              <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                {templates.map((template) => (
                  <label key={template.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => toggleTemplate(template.id)}
                      className="mr-3 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.type}</div>
                    </div>
                  </label>
                ))}
              </div>
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
                disabled={selectedTemplates.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  folder: TemplateFolder, 
  onClose: () => void, 
  onSubmit: (folderId: string, updates: Partial<TemplateFolder>) => void,
  folders?: TemplateFolder[]
}) {
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    onSubmit(folder.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: folder.parentId
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

// テンプレートパック編集モーダル
function EditPackModal({ pack, onClose, onSubmit, onDelete, templates }: { 
  pack: TemplatePack, 
  onClose: () => void, 
  onSubmit: (packId: string, updates: Partial<TemplatePack>) => void,
  onDelete: (packId: string) => void,
  templates: Template[]
}) {
  const [name, setName] = useState(pack.name)
  const [description, setDescription] = useState(pack.description || '')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(pack.templateIds)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedTemplates.length === 0) return
    
    onSubmit(pack.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      templateIds: selectedTemplates
    })
    onClose()
  }

  const handleDelete = () => {
    if (confirm('このテンプレートパックを削除しますか？')) {
      onDelete(pack.id)
      onClose()
    }
  }

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">テンプレートパック編集</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">パック名</label>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テンプレートを選択 ({selectedTemplates.length}件選択中)
              </label>
              <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                {templates.map((template) => (
                  <label key={template.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => toggleTemplate(template.id)}
                      className="mr-3 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.type}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={selectedTemplates.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  更新
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// テンプレートプレビューモーダル
function TemplatePreviewModal({ 
  template, 
  onClose, 
  users = [], 
  onTestSend 
}: { 
  template: Template, 
  onClose: () => void,
  users?: any[],
  onTestSend?: (userIds: string[], template: Template) => Promise<void>
}) {
  const getLineMessage = (): LineMessage | null => {
    try {
      if (template.lineMessageJson) {
        return JSON.parse(template.lineMessageJson) as LineMessage
      }
      return null
    } catch {
      return null
    }
  }

  const lineMessage = getLineMessage()

  const handleTestSend = async (userIds: string[], message: LineMessage) => {
    if (onTestSend) {
      await onTestSend(userIds, template)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">テンプレートプレビュー</h3>
            <p className="text-sm text-gray-600">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <EnhancedLinePreview 
            message={lineMessage}
            className="mb-4"
            showTestSend={true}
            users={users}
            onTestSend={handleTestSend}
            showMockChat={true}
          />
          
          {/* メタ情報 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 space-y-1">
              <div>タイプ: {template.type}</div>
              {lineMessage && (
                <div>メッセージタイプ: {lineMessage.type}</div>
              )}
              <div>作成日: {template.createdAt ? new Date(template.createdAt).toLocaleDateString('ja-JP') : 'N/A'}</div>
              <div>更新日: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString('ja-JP') : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}