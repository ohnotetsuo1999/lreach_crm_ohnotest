'use client'

import { useState } from 'react'
import { TemplatePack, Template, TemplateFolder } from '@/types'
import { Plus, Search, Settings, Eye, Package, Calendar, FileText } from 'lucide-react'

interface PackListProps {
  templatePacks: TemplatePack[]
  templates: Template[]
  templateFolders: TemplateFolder[]
  onCreatePack: () => void
  onEditPack: (pack: TemplatePack) => void
  onDeletePack: (packId: string) => void
  onViewPackDetail: (pack: TemplatePack) => void
}

export function PackList({
  templatePacks,
  templates,
  templateFolders,
  onCreatePack,
  onEditPack,
  onDeletePack,
  onViewPackDetail
}: PackListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // 検索フィルタリング
  const filteredPacks = templatePacks.filter(pack =>
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pack.description && pack.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // パック内のテンプレート取得
  const getPackTemplates = (pack: TemplatePack) => {
    return templates.filter(template => pack.templateIds.includes(template.id))
  }

  // テンプレートタイプ別カウント
  const getTemplateTypeCounts = (packTemplates: Template[]) => {
    const counts = {
      TEXT: 0,
      FLEX: 0,
      IMAGE: 0,
      PACK: 0
    }
    packTemplates.forEach(template => {
      counts[template.type]++
    })
    return counts
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">パック管理</h2>
          <p className="mt-1 text-sm text-gray-600">
            複数のテンプレートをまとめて管理・配信するためのパックを管理
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="パックを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
            />
          </div>
          
          {/* 新規作成ボタン */}
          <button
            onClick={onCreatePack}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            新しいパック
          </button>
        </div>
      </div>

      {/* パック一覧 */}
      <div className="bg-white rounded-lg shadow">
        {filteredPacks.length === 0 ? (
          <div className="text-center py-12">
            {searchQuery ? (
              <div>
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">パックが見つかりません</h3>
                <p className="mt-1 text-sm text-gray-500">
                  検索条件に一致するパックがありません
                </p>
              </div>
            ) : (
              <div>
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">パックがありません</h3>
                <p className="mt-1 text-sm text-gray-500">
                  新しいパックを作成してテンプレートをまとめて管理しましょう
                </p>
                <div className="mt-6">
                  <button
                    onClick={onCreatePack}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    パックを作成
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    パック名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    テンプレート数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    構成
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPacks.map((pack) => {
                  const packTemplates = getPackTemplates(pack)
                  const typeCounts = getTemplateTypeCounts(packTemplates)
                  
                  return (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {pack.name}
                            </div>
                            {pack.description && (
                              <div className="text-sm text-gray-500">
                                {pack.description.length > 60 
                                  ? pack.description.substring(0, 60) + '...' 
                                  : pack.description
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {packTemplates.length} 件
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {typeCounts.TEXT > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              テキスト {typeCounts.TEXT}
                            </span>
                          )}
                          {typeCounts.FLEX > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Flex {typeCounts.FLEX}
                            </span>
                          )}
                          {typeCounts.IMAGE > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              画像 {typeCounts.IMAGE}
                            </span>
                          )}
                          {typeCounts.PACK > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              パック {typeCounts.PACK}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(pack.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewPackDetail(pack)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded hover:bg-blue-100"
                            title="詳細"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditPack(pack)}
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center p-1 rounded hover:bg-gray-100"
                            title="設定"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">統計情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{templatePacks.length}</div>
            <div className="text-sm text-gray-500">総パック数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {templatePacks.reduce((sum, pack) => sum + pack.templateIds.length, 0)}
            </div>
            <div className="text-sm text-gray-500">総テンプレート数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {templatePacks.length > 0 
                ? Math.round(templatePacks.reduce((sum, pack) => sum + pack.templateIds.length, 0) / templatePacks.length)
                : 0
              }
            </div>
            <div className="text-sm text-gray-500">平均テンプレート数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {templatePacks.filter(pack => pack.templateIds.length > 0).length}
            </div>
            <div className="text-sm text-gray-500">アクティブパック数</div>
          </div>
        </div>
      </div>
    </div>
  )
}