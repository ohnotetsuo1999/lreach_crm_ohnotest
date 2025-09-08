'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Settings } from 'lucide-react'

interface StatusItem {
  id: string
  name: string
  color: string
  description?: string
}

interface StatusCategory {
  id: string
  title: string
  description: string
  items: StatusItem[]
}

const initialStatusCategories: StatusCategory[] = [
  {
    id: 'detail-status',
    title: '詳細の状態',
    description: '詳細画面で使用する状態の管理',
    items: [
      { id: '1', name: '新規', color: 'blue', description: '新規登録' },
      { id: '2', name: '対応中', color: 'yellow', description: '対応進行中' },
      { id: '3', name: '完了', color: 'green', description: '対応完了' },
      { id: '4', name: '保留', color: 'gray', description: '一時保留中' }
    ]
  },
  {
    id: 'call-status',
    title: '架電管理のステータス',
    description: '架電管理で使用するステータスの管理',
    items: [
      { id: '1', name: '未架電', color: 'gray', description: 'まだ電話していない' },
      { id: '2', name: '架電中', color: 'blue', description: '電話中' },
      { id: '3', name: '不在', color: 'yellow', description: '不在だった' },
      { id: '4', name: '応答', color: 'green', description: '電話に出た' },
      { id: '5', name: '拒否', color: 'red', description: '電話を拒否された' }
    ]
  },
  {
    id: 'interview-status',
    title: '送客一覧の面談実施有無',
    description: '送客一覧で使用する面談ステータスの管理',
    items: [
      { id: '1', name: '未実施', color: 'gray', description: '面談未実施' },
      { id: '2', name: '日程調整中', color: 'blue', description: '面談日程を調整中' },
      { id: '3', name: '実施済み', color: 'green', description: '面談完了' },
      { id: '4', name: 'キャンセル', color: 'red', description: '面談キャンセル' }
    ]
  },
  {
    id: 'application-status',
    title: '応募管理のステータス',
    description: '応募管理で使用するステータスの管理',
    items: [
      { id: '1', name: '書類選考中', color: 'blue', description: '書類選考段階' },
      { id: '2', name: '一次面接', color: 'purple', description: '一次面接段階' },
      { id: '3', name: '二次面接', color: 'indigo', description: '二次面接段階' },
      { id: '4', name: '最終面接', color: 'pink', description: '最終面接段階' },
      { id: '5', name: '内定', color: 'green', description: '内定獲得' },
      { id: '6', name: '不採用', color: 'red', description: '不採用確定' },
      { id: '7', name: '辞退', color: 'gray', description: '応募者が辞退' }
    ]
  }
]

const colorOptions = [
  { value: 'gray', label: 'グレー', className: 'bg-gray-100 text-gray-800' },
  { value: 'red', label: 'レッド', className: 'bg-red-100 text-red-800' },
  { value: 'yellow', label: 'イエロー', className: 'bg-yellow-100 text-yellow-800' },
  { value: 'green', label: 'グリーン', className: 'bg-green-100 text-green-800' },
  { value: 'blue', label: 'ブルー', className: 'bg-blue-100 text-blue-800' },
  { value: 'indigo', label: 'インディゴ', className: 'bg-indigo-100 text-indigo-800' },
  { value: 'purple', label: 'パープル', className: 'bg-purple-100 text-purple-800' },
  { value: 'pink', label: 'ピンク', className: 'bg-pink-100 text-pink-800' }
]

export function StatusManagement() {
  const [categories, setCategories] = useState<StatusCategory[]>(initialStatusCategories)
  const [editingItem, setEditingItem] = useState<{ categoryId: string; item: StatusItem } | null>(null)
  const [showAddModal, setShowAddModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: 'blue',
    description: ''
  })

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color)
    return colorOption?.className || 'bg-gray-100 text-gray-800'
  }

  const handleAddStatus = (categoryId: string) => {
    const newItem: StatusItem = {
      id: Date.now().toString(),
      name: formData.name,
      color: formData.color,
      description: formData.description
    }

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: [...cat.items, newItem] }
        : cat
    ))

    setShowAddModal(null)
    setFormData({ name: '', color: 'blue', description: '' })
  }

  const handleUpdateStatus = () => {
    if (!editingItem) return

    setCategories(prev => prev.map(cat => 
      cat.id === editingItem.categoryId
        ? {
            ...cat,
            items: cat.items.map(item => 
              item.id === editingItem.item.id ? editingItem.item : item
            )
          }
        : cat
    ))

    setEditingItem(null)
  }

  const handleDeleteStatus = (categoryId: string, itemId: string) => {
    if (window.confirm('このステータスを削除してもよろしいですか？')) {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      ))
    }
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ステータス管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            各機能で使用するステータスとオプションの管理
          </p>
        </div>

        {/* カテゴリごとのステータス管理 */}
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(category.id)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    追加
                  </button>
                </div>

                {/* ステータスリスト */}
                <div className="space-y-2">
                  {category.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getColorClass(item.color)}`}>
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="text-sm text-gray-500">
                            {item.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingItem({ categoryId: category.id, item: { ...item } })}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStatus(category.id, item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {category.items.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      ステータスが登録されていません
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(null)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                新規ステータス追加
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">名前</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="ステータス名を入力"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">色</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getColorClass(formData.color)}`}>
                      プレビュー
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">説明（任意）</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="ステータスの説明を入力"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(null)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleAddStatus(showAddModal)}
                  disabled={!formData.name}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setEditingItem(null)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ステータス編集
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">名前</label>
                  <input
                    type="text"
                    value={editingItem.item.name}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, name: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">色</label>
                  <select
                    value={editingItem.item.color}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, color: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {colorOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getColorClass(editingItem.item.color)}`}>
                      プレビュー
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">説明（任意）</label>
                  <input
                    type="text"
                    value={editingItem.item.description || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      item: { ...editingItem.item, description: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}