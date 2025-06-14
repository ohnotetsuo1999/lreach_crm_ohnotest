'use client'

import { useState } from 'react'
import { Pack, Template } from '@/types'
import { Plus, Settings2, Clock, FileText, Edit, Trash2, Copy } from 'lucide-react'

interface PackManagementProps {
  packs: Pack[]
  templates: Template[]
  onCreatePack: (pack: Omit<Pack, 'id' | 'createdAt'>) => void
  onEditPack: (pack: Pack) => void
  onDeletePack: (packId: string) => void
  onDuplicatePack: (pack: Pack) => void
}

export function PackManagement({
  packs,
  templates,
  onCreatePack,
  onEditPack,
  onDeletePack,
  onDuplicatePack
}: PackManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPackName, setNewPackName] = useState('')
  const [newPackOffsetMinutes, setNewPackOffsetMinutes] = useState(0)
  const [newPackOrder, setNewPackOrder] = useState(1)

  const handleCreatePack = () => {
    onCreatePack({
      scenarioId: '', // Will be set by parent component
      order: newPackOrder,
      offsetMinutes: newPackOffsetMinutes
    })

    setNewPackName('')
    setNewPackOffsetMinutes(0)
    setNewPackOrder(1)
    setShowCreateModal(false)
  }

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '即座に'
    if (minutes < 60) return `${minutes}分後`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}時間${minutes % 60 > 0 ? `${minutes % 60}分` : ''}後`
    return `${Math.floor(minutes / 1440)}日${Math.floor((minutes % 1440) / 60)}時間後`
  }

  // Pack管理についての説明
  const packExplanation = `
Pack管理は、複数のメッセージを時系列で自動送信するワークフロー機能です。

【用途例】
1. 新規顧客オンボーディング
   - 友達追加直後: 挨拶 + サービス紹介
   - 1日後: 使い方ガイド + お得情報
   - 3日後: 満足度確認 + フォローアップ

2. 予約前後のフォロー
   - 予約3日前: 準備事項のお知らせ
   - 予約1日前: 確認とリマインダー
   - 予約後1日: お礼 + アンケート依頼

3. 購入後のアフターフォロー
   - 購入直後: お礼 + 使い方説明
   - 1週間後: 使用感確認
   - 1ヶ月後: リピート購入促進

4. 段階的な教育コンテンツ
   - ステップ1: 基礎知識
   - ステップ2: 応用テクニック
   - ステップ3: 上級者向け情報
  `

  // サンプルPackデータの生成（デモ用）
  const samplePacks: Pack[] = packs.length === 0 ? [
    {
      id: 'pack_001',
      scenarioId: 'scenario_001',
      order: 1,
      offsetMinutes: 0,
      packType: 'normal',
      createdAt: new Date('2024-01-01'),
      executionMode: 'sequential'
    },
    {
      id: 'pack_002', 
      scenarioId: 'scenario_001',
      order: 2,
      offsetMinutes: 1440, // 1日後
      packType: 'conditional',
      createdAt: new Date('2024-01-01'),
      executionMode: 'conditional',
      conditionalLogic: {
        id: 'logic_001',
        type: 'if_then_else',
        conditions: [
          {
            id: 'branch_001',
            name: '反応なしユーザー',
            condition: {
              type: 'simple',
              field: 'tags',
              comparison: 'not_exists',
              tagId: 'tag_responded'
            },
            actions: [],
            isActive: true
          }
        ],
        evaluationOrder: 'first_match'
      }
    },
    {
      id: 'pack_003',
      scenarioId: 'scenario_001', 
      order: 3,
      offsetMinutes: 4320, // 3日後
      packType: 'reminder',
      createdAt: new Date('2024-01-01'),
      executionMode: 'sequential',
      reminderSettings: {
        targetType: 'manual',
        targetDate: '2024-01-15',
        targetTime: '10:00',
        offsetMinutes: 0,
        offsetType: 'before'
      }
    }
  ] : packs

  return (
    <div className="space-y-6">
      {/* 説明セクション */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Settings2 className="w-5 h-5 mr-2" />
          Pack管理とは
        </h2>
        <div className="text-blue-800 text-sm whitespace-pre-line">
          {packExplanation}
        </div>
      </div>

      {/* Pack一覧表示 */}
      <div>
        {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">テンプレート&パック管理</h1>
            <p className="text-gray-600 mt-1">メッセージテンプレートとパックの作成・管理</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規パック作成
          </button>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{samplePacks.length}</h3>
              <p className="text-gray-600">総パック数</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{templates.length || 5}</h3>
              <p className="text-gray-600">総テンプレート数</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {samplePacks.reduce((total, pack) => total + pack.offsetMinutes, 0)}
              </h3>
              <p className="text-gray-600">総待機時間（分）</p>
            </div>
          </div>
        </div>
      </div>

      {/* パック一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">パック一覧</h2>
          <p className="text-sm text-gray-600 mt-1">シナリオで使用するメッセージパックを管理</p>
        </div>
        
        <div className="p-6">
          {samplePacks.length === 0 ? (
            <div className="text-center py-12">
              <Settings2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">パックがありません</h3>
              <p className="text-gray-600 mb-6">最初のメッセージパックを作成しましょう</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                パックを作成
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {samplePacks.map((pack, index) => {
                // サンプル設定の説明を追加
                const getPackDescription = (pack: Pack, index: number) => {
                  switch (index) {
                    case 0:
                      return {
                        title: 'ウェルカムメッセージ（即座送信）',
                        description: '友達追加直後に送信される挨拶メッセージ。サービス紹介とボタンでの反応促進を含む。',
                        features: ['即座送信', 'ボタン付きテンプレート', 'タグ付け機能']
                      }
                    case 1: 
                      return {
                        title: 'フォローアップメッセージ（条件付き）',
                        description: '1日後に「反応あり」タグがない人にのみ送信。追加の情報提供とエンゲージメント促進。',
                        features: ['条件付き送信', 'タグ条件判定', '1日後送信']
                      }
                    case 2:
                      return {
                        title: 'リマインダーメッセージ（時間指定）',
                        description: '3日後に最終フォローアップ。特別オファーや個別相談の案内を含む。',
                        features: ['時間指定送信', 'リマインダー機能', '3日後送信']
                      }
                    default:
                      return {
                        title: `パック #${pack.order}`,
                        description: 'カスタムパック設定',
                        features: ['カスタム設定']
                      }
                  }
                }

                const packInfo = getPackDescription(pack, index)
                
                return (
                  <div key={pack.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 text-sm font-bold rounded-full">
                              {pack.order}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {packInfo.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {formatDuration(pack.offsetMinutes)}
                              </p>
                              <p className="text-sm text-gray-700 mb-3">
                                {packInfo.description}
                              </p>
                              
                              {/* Pack詳細情報 */}
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  {packInfo.features.map((feature, featureIndex) => (
                                    <span key={featureIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      {feature}
                                    </span>
                                  ))}
                                  
                                  {pack.packType && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      pack.packType === 'normal' ? 'bg-blue-100 text-blue-800' :
                                      pack.packType === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {pack.packType === 'normal' ? '通常' :
                                       pack.packType === 'conditional' ? '条件付き' : 'リマインダー'}
                                    </span>
                                  )}
                                </div>
                                
                                {/* 条件表示 */}
                                {pack.conditionalLogic?.conditions && (
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">実行条件:</span> 
                                    {pack.conditionalLogic.conditions.map((branch, condIndex) => (
                                      <span key={condIndex} className="ml-1">
                                        {branch.condition.comparison === 'not_exists' ? 'タグが存在しない場合' : branch.condition.comparison}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditPack(pack)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => onDuplicatePack(pack)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="複製"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('このパックを削除しますか？')) {
                            onDeletePack(pack.id)
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* 新規パック作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">新規パック作成</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実行順序
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPackOrder}
                  onChange={(e) => setNewPackOrder(Math.max(1, Number(e.target.value)))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実行タイミング（分）
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPackOffsetMinutes}
                  onChange={(e) => setNewPackOffsetMinutes(Math.max(0, Number(e.target.value)))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0 = 即座に実行、60 = 1時間後、1440 = 1日後
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreatePack}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}