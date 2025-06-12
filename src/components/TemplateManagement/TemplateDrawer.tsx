'use client'

import { useState, useEffect } from 'react'
import { Template, TemplateFolder, TemplateButton, TemplatePack } from '@/types'
import { X, Save, Eye, Code, Image, Type, Package, Plus, Trash2, Edit3, MousePointer } from 'lucide-react'

interface TemplateDrawerProps {
  template: Template | null
  isOpen: boolean
  onClose: () => void
  onSave: (templateId: string, updates: Partial<Template>) => void
  onDelete: (templateId: string) => void
  folders: TemplateFolder[]
  onNavigateToPackDetail?: (packId: string) => void
  templatePacks?: TemplatePack[]
  onUpdatePack?: (packId: string, updates: Partial<TemplatePack>) => void
  onDeletePack?: (packId: string) => void
  templates?: Template[]
  onUpdateTemplate?: (templateId: string, updates: Partial<Template>) => void
}

export function TemplateDrawer({
  template,
  isOpen,
  onClose,
  onSave,
  onDelete,
  folders,
  onNavigateToPackDetail,
  templatePacks = [],
  onUpdatePack,
  onDeletePack,
  templates = [],
  onUpdateTemplate
}: TemplateDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'TEXT' as 'TEXT' | 'FLEX' | 'IMAGE' | 'PACK',
    content: '',
    folderId: '',
    notes: '',
    buttons: [] as TemplateButton[]
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [showButtonModal, setShowButtonModal] = useState(false)
  const [editingButton, setEditingButton] = useState<TemplateButton | null>(null)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        content: template.content,
        folderId: template.folderId || '',
        notes: template.notes || '',
        buttons: template.buttons || []
      })
    }
  }, [template])

  const handleSave = () => {
    if (!template) return

    onSave(template.id, {
      name: formData.name.trim(),
      type: formData.type,
      content: formData.content.trim(),
      folderId: formData.folderId || undefined,
      notes: formData.notes.trim() || undefined,
      buttons: formData.type === 'PACK' ? formData.buttons : undefined
    })
    onClose()
  }

  const handleDelete = () => {
    if (!template) return
    
    if (confirm('このテンプレートを削除しますか？')) {
      onDelete(template.id)
      onClose()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type className="w-4 h-4" />
      case 'FLEX': return <Code className="w-4 h-4" />
      case 'IMAGE': return <Image className="w-4 h-4" />
      case 'PACK': return <MousePointer className="w-4 h-4" />
      default: return <Type className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FLEX': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'IMAGE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PACK': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getButtonColorClass = (color: TemplateButton['color']) => {
    switch (color) {
      case 'primary': return 'bg-blue-100 text-blue-800'
      case 'secondary': return 'bg-gray-100 text-gray-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'danger': return 'bg-red-100 text-red-800'
      case 'info': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSaveButton = (buttonData: Omit<TemplateButton, 'id'>) => {
    if (editingButton) {
      // 既存ボタンの編集
      setFormData({
        ...formData,
        buttons: formData.buttons.map(button =>
          button.id === editingButton.id
            ? { ...buttonData, id: editingButton.id }
            : button
        )
      })
    } else {
      // 新規ボタンの追加
      const newButton: TemplateButton = {
        ...buttonData,
        id: Date.now().toString(),
        order: formData.buttons.length + 1
      }
      setFormData({
        ...formData,
        buttons: [...formData.buttons, newButton]
      })
    }
    setShowButtonModal(false)
    setEditingButton(null)
  }

  const handleDeleteButton = (buttonId: string) => {
    if (confirm('このボタンを削除しますか？')) {
      const updatedButtons = formData.buttons
        .filter(button => button.id !== buttonId)
        .map((button, index) => ({ ...button, order: index + 1 }))
      
      setFormData({
        ...formData,
        buttons: updatedButtons
      })
    }
  }

  const handleCloseButtonModal = () => {
    setShowButtonModal(false)
    setEditingButton(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // FileReaderを使用してBase64に変換
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setFormData({ ...formData, content: result })
      }
    }
    reader.onerror = () => {
      alert('ファイルの読み込みに失敗しました')
    }
    reader.readAsDataURL(file)
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'TEXT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テキスト内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="メッセージ内容を入力してください"
            />
            <p className="mt-1 text-xs text-gray-500">
              変数: {'{{user.name}}, {{user.phone}}'} などが使用できます
            </p>
          </div>
        )
      
      case 'FLEX':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flex Message JSON
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={'{"type": "bubble", "body": {...}}'}
            />
            <p className="mt-1 text-xs text-gray-500">
              LINE Flex Message形式のJSONを入力してください
            </p>
          </div>
        )
      
      case 'IMAGE':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像アップロード
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                JPG、PNG、GIF形式の画像ファイルをアップロードできます（最大5MB）
              </p>
              
              {/* URL入力オプション */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  または画像URL
                </label>
                <input
                  type="url"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  外部の画像URLを直接指定することもできます
                </p>
              </div>
            </div>
            
            {formData.content && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレビュー
                </label>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <img
                    src={formData.content}
                    alt="プレビュー"
                    className="max-w-full h-auto rounded border bg-white"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = 'block'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      
      case 'PACK':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パック説明
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="このパックの説明を入力してください"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  アクションボタン
                </label>
                <button
                  type="button"
                  onClick={() => setShowButtonModal(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  ボタン追加
                </button>
              </div>
              
              {formData.buttons.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-500">
                    <div className="text-sm font-medium mb-1">アクションボタンが未設定です</div>
                    <div className="text-xs">ボタンを追加してユーザーアクションを設定しましょう</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.buttons
                    .sort((a, b) => a.order - b.order)
                    .map((button, index) => (
                    <div key={button.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">#{button.order}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            getButtonColorClass(button.color)
                          }`}>
                            {button.text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {button.action.type === 'uri' ? '🔗 リンク' : 
                           button.action.type === 'postback' ? '📤 ポストバック' : '💬 メッセージ'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingButton(button)
                            setShowButtonModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="編集"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteButton(button.id)}
                          className="p-1 text-red-400 hover:text-red-600 rounded"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (!isOpen || !template) return null


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(template.type)}`}>
                {getTypeIcon(template.type)}
                <span className="ml-1">
                  {template.type === 'TEXT' ? 'テキスト' : 
                   template.type === 'FLEX' ? 'Flex' : 
                   template.type === 'IMAGE' ? '画像' : 'ボタン'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {template.name}
                </h2>
                <p className="text-sm text-gray-600">
                  テンプレート設定
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`p-2 rounded-full transition-colors ${
                  previewMode ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="プレビュー"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フォルダ
                  </label>
                  <select
                    value={formData.folderId}
                    onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">未分類</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* タイプ選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイプ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['TEXT', 'FLEX', 'IMAGE', 'PACK'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        // 通常のタイプ選択
                        setFormData({ ...formData, type })
                      }}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        formData.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {getTypeIcon(type)}
                        <span>
                          {type === 'TEXT' ? 'テキスト' : 
                           type === 'FLEX' ? 'Flex' : 
                           type === 'IMAGE' ? '画像' : 'ボタン'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* コンテンツエディター */}
              {renderContentEditor()}

              {/* 備考 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  備考（任意）
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="テンプレートの備考やメモを入力してください"
                />
              </div>


              {/* プレビュー */}
              {previewMode && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">プレビュー</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {formData.type === 'TEXT' && (
                      <div className="whitespace-pre-wrap text-sm">{formData.content}</div>
                    )}
                    {formData.type === 'FLEX' && (
                      <div className="font-mono text-xs text-gray-600">
                        Flex Message プレビュー機能は開発中です
                      </div>
                    )}
                    {formData.type === 'IMAGE' && formData.content && (
                      <img
                        src={formData.content}
                        alt="プレビュー"
                        className="max-w-full h-auto rounded"
                      />
                    )}
                    {formData.type === 'PACK' && (
                      <div className="text-sm text-gray-600">{formData.content}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                削除
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ボタン作成・編集モーダル */}
      {showButtonModal && (
        <ButtonModal
          button={editingButton}
          onSave={handleSaveButton}
          onClose={handleCloseButtonModal}
        />
      )}
    </div>
  )
}

// ボタン作成・編集モーダルコンポーネント
function ButtonModal({
  button,
  onSave,
  onClose
}: {
  button: TemplateButton | null
  onSave: (buttonData: Omit<TemplateButton, 'id'>) => void
  onClose: () => void
}) {
  const [text, setText] = useState(button?.text || '')
  const [color, setColor] = useState<TemplateButton['color']>(button?.color || 'primary')
  const [actionType, setActionType] = useState<'uri' | 'postback' | 'message'>(button?.action.type || 'uri')
  const [actionData, setActionData] = useState(button?.action.data || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !actionData.trim()) return

    onSave({
      text: text.trim(),
      color,
      action: {
        type: actionType,
        data: actionData.trim()
      },
      order: button?.order || 1
    })
  }

  const colorOptions = [
    { value: 'primary', label: 'プライマリ（青）', bgClass: 'bg-blue-100 text-blue-800' },
    { value: 'secondary', label: 'セカンダリ（グレー）', bgClass: 'bg-gray-100 text-gray-800' },
    { value: 'success', label: '成功（緑）', bgClass: 'bg-green-100 text-green-800' },
    { value: 'warning', label: '警告（黄）', bgClass: 'bg-yellow-100 text-yellow-800' },
    { value: 'danger', label: '危険（赤）', bgClass: 'bg-red-100 text-red-800' },
    { value: 'info', label: '情報（シアン）', bgClass: 'bg-cyan-100 text-cyan-800' }
  ] as const

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {button ? 'ボタンを編集' : '新しいボタンを作成'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ボタンテキスト
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ボタンに表示するテキスト"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ボタンの色
              </label>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={option.value}
                      checked={color === option.value}
                      onChange={(e) => setColor(e.target.value as TemplateButton['color'])}
                      className="sr-only"
                    />
                    <div className={`p-2 border-2 rounded-lg text-center text-sm transition-colors ${
                      color === option.value ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${option.bgClass}`}>
                        {option.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                アクションタイプ
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="uri">リンク（URL）</option>
                <option value="postback">ポストバック</option>
                <option value="message">メッセージ送信</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'uri' ? 'URL' : 
                 actionType === 'postback' ? 'ポストバックデータ' : 'メッセージテキスト'}
              </label>
              <input
                type={actionType === 'uri' ? 'url' : 'text'}
                value={actionData}
                onChange={(e) => setActionData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  actionType === 'uri' ? 'https://example.com' :
                  actionType === 'postback' ? 'action_id=123' : 'テキストメッセージ'
                }
                required
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
                {button ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}