'use client'

import { useState } from 'react'
import { Template } from '@/types'
import { Type, Layout, Save, X, Zap, MessageSquare, Image, MousePointer } from 'lucide-react'

interface QuickTemplateCreatorProps {
  packId: string
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
  suggestedOrder: number
}

export function QuickTemplateCreator({
  packId,
  onSave,
  onClose,
  suggestedOrder
}: QuickTemplateCreatorProps) {
  const [messageType, setMessageType] = useState<'text' | 'flex'>('text')
  const [textContent, setTextContent] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const textPresets = [
    {
      id: 'welcome',
      name: 'ウェルカムメッセージ',
      content: 'こんにちは{{user.name}}さん！\n\nLINE公式アカウントにご登録いただき、ありがとうございます。\n\n今後ともよろしくお願いいたします。'
    },
    {
      id: 'promotion',
      name: 'プロモーション',
      content: '🎉 特別キャンペーンのお知らせ\n\n{{user.name}}様限定で、今なら30%オフでご利用いただけます！\n\nこの機会をお見逃しなく✨'
    },
    {
      id: 'reminder',
      name: 'リマインダー',
      content: '📅 お忘れではございませんか？\n\n{{user.name}}様にお得な情報をお届けしています。\n\nぜひご確認ください。'
    },
    {
      id: 'thanks',
      name: 'お礼メッセージ',
      content: '{{user.name}}様\n\nいつもご利用いただき、ありがとうございます。\n\n今後ともよろしくお願いいたします🙏'
    }
  ]

  const flexPresets = [
    {
      id: 'button_card',
      name: 'ボタン付きカード',
      content: {
        type: 'flex',
        altText: 'ボタン付きメッセージ',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'お知らせ',
                weight: 'bold',
                size: 'xl',
                color: '#1DB446'
              },
              {
                type: 'text',
                text: '{{user.name}}様',
                size: 'sm',
                color: '#666666'
              },
              {
                type: 'text',
                text: 'ここにメッセージ内容を記載します。',
                wrap: true,
                margin: 'md'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '詳細を見る',
                  uri: 'https://example.com'
                },
                style: 'primary',
                color: '#1DB446'
              }
            ]
          }
        }
      }
    },
    {
      id: 'product_card',
      name: '商品カード',
      content: {
        type: 'flex',
        altText: '商品のご案内',
        contents: {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://via.placeholder.com/300x200',
            size: 'full',
            aspectRatio: '20:13'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '商品名',
                weight: 'bold',
                size: 'xl'
              },
              {
                type: 'text',
                text: '¥3,000',
                size: 'lg',
                color: '#FF6B6B',
                weight: 'bold'
              },
              {
                type: 'text',
                text: '商品の詳細説明がここに入ります。',
                wrap: true,
                color: '#666666',
                margin: 'md'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '購入する',
                  uri: 'https://example.com/purchase'
                },
                style: 'primary'
              }
            ]
          }
        }
      }
    },
    {
      id: 'contact_card',
      name: 'お問い合わせカード',
      content: {
        type: 'flex',
        altText: 'お問い合わせ',
        contents: {
          type: 'bubble',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '💬 お気軽にお問い合わせください',
                weight: 'bold',
                size: 'lg'
              },
              {
                type: 'text',
                text: 'ご質問やご相談がございましたら、以下からお選びください。',
                wrap: true,
                margin: 'md',
                color: '#666666'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'お問い合わせフォーム',
                  uri: 'https://example.com/contact'
                },
                style: 'primary'
              },
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '電話で相談',
                  uri: 'tel:0123456789'
                },
                style: 'secondary'
              }
            ]
          }
        }
      }
    }
  ]

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)
    
    if (messageType === 'text') {
      const preset = textPresets.find(p => p.id === presetId)
      if (preset) {
        setTextContent(preset.content)
      }
    }
  }

  const handleSave = () => {
    let messageJson = ''
    
    if (messageType === 'text') {
      if (!textContent.trim()) {
        alert('メッセージテキストを入力してください')
        return
      }
      messageJson = JSON.stringify({
        type: 'text',
        text: textContent
      })
    } else {
      const preset = flexPresets.find(p => p.id === selectedPreset)
      if (!preset) {
        alert('Flexメッセージのプリセットを選択してください')
        return
      }
      messageJson = JSON.stringify(preset.content)
    }

    const template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
      packId,
      order: suggestedOrder,
      lineMessageJson: messageJson
    }

    onSave(template)
  }

  const getFlexPreview = (preset: any) => {
    const { contents } = preset.content
    if (contents.type === 'bubble') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
          {/* Hero Image */}
          {contents.hero && (
            <div className="mb-2">
              <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                <Image className="w-4 h-4 mr-1" />
                画像
              </div>
            </div>
          )}
          
          {/* Body */}
          {contents.body && (
            <div className="mb-2">
              {contents.body.contents.map((item: any, index: number) => (
                <div key={index} className={`text-xs ${
                  item.weight === 'bold' ? 'font-bold' : ''
                } ${
                  item.size === 'xl' ? 'text-sm' :
                  item.size === 'lg' ? 'text-sm' : 'text-xs'
                }`} style={{ color: item.color || '#000' }}>
                  {item.text}
                </div>
              ))}
            </div>
          )}
          
          {/* Footer Buttons */}
          {contents.footer && (
            <div className="space-y-1">
              {contents.footer.contents.map((button: any, index: number) => (
                <div key={index} className={`py-1 px-2 rounded text-xs text-center ${
                  button.style === 'primary' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <MousePointer className="w-3 h-3 inline mr-1" />
                  {button.action.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                クイックテンプレート作成
              </h2>
              <p className="text-sm text-gray-600">
                プリセットから選択して素早く作成
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* メッセージタイプ選択 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMessageType('text')
                  setSelectedPreset('')
                }}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                  messageType === 'text'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Type className="w-4 h-4 mr-2" />
                テキストメッセージ
              </button>
              <button
                onClick={() => {
                  setMessageType('flex')
                  setSelectedPreset('')
                  setTextContent('')
                }}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                  messageType === 'flex'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="w-4 h-4 mr-2" />
                Flexメッセージ
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto">
            {messageType === 'text' ? (
              <div className="p-6">
                {/* プリセット選択 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">プリセットから選択</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {textPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`text-left p-3 border rounded-lg transition-colors ${
                          selectedPreset === preset.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{preset.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {preset.content.substring(0, 80)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* テキスト編集 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">メッセージ内容</h3>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={8}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="メッセージを入力してください..."
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    文字数: {textContent.length}/5000
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Flexメッセージプリセット</h3>
                <div className="grid grid-cols-1 gap-4">
                  {flexPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`text-left p-4 border rounded-lg transition-colors ${
                        selectedPreset === preset.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Layout className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-900">{preset.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {preset.content.altText}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getFlexPreview(preset)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleSave}
                disabled={messageType === 'text' ? !textContent.trim() : !selectedPreset}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                テンプレート作成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}