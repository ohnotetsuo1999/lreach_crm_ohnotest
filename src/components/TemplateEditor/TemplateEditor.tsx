'use client'

import { useState, useRef } from 'react'
import { LineMessagePreview } from './LineMessagePreview'
import { QuickVarInsert } from './QuickVarInsert'
import { Template, LineMessage, LineTextMessage, LineFlexMessage } from '@/types'
import { 
  Save, 
  Eye, 
  Code, 
  Type, 
  Layout, 
  Plus, 
  Trash2, 
  Copy,
  ArrowLeft,
  Download,
  Upload
} from 'lucide-react'

interface TemplateEditorProps {
  template: Template | null
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  onBack: () => void
}

export function TemplateEditor({ template, onSave, onBack }: TemplateEditorProps) {
  const [messageType, setMessageType] = useState<'text' | 'flex'>('text')
  const [textContent, setTextContent] = useState('')
  const [flexContent, setFlexContent] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null)

  // Initialize form data
  useState(() => {
    if (template) {
      try {
        const message = JSON.parse(template.lineMessageJson) as LineMessage
        setMessageType(message.type)
        
        if (message.type === 'text') {
          setTextContent(message.text)
        } else if (message.type === 'flex') {
          setFlexContent(template.lineMessageJson)
        }
      } catch (error) {
        console.error('Failed to parse template JSON:', error)
      }
    }
  })

  const getCurrentMessage = (): LineMessage | null => {
    try {
      if (messageType === 'text') {
        if (!textContent.trim()) return null
        
        return {
          type: 'text',
          text: textContent
        } as LineTextMessage
      } else {
        if (!flexContent.trim()) return null
        
        return JSON.parse(flexContent) as LineFlexMessage
      }
    } catch (error) {
      return null
    }
  }

  const handleSave = () => {
    const message = getCurrentMessage()
    if (!message) {
      alert('有効なメッセージを作成してください')
      return
    }

    onSave({
      packId: template?.packId || '',
      order: template?.order || 1,
      lineMessageJson: JSON.stringify(message)
    })
  }

  const handleVariableInsert = (variable: string) => {
    if (messageType === 'text' && textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = textContent.substring(0, start) + variable + textContent.substring(end)
      
      setTextContent(newText)
      
      // フォーカスを戻して、カーソル位置を調整
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else if (messageType === 'flex' && jsonEditorRef.current) {
      const textarea = jsonEditorRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = flexContent.substring(0, start) + `"${variable}"` + flexContent.substring(end)
      
      setFlexContent(newText)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2)
      }, 0)
    }
  }

  const insertFlexTemplate = (templateType: 'button' | 'bubble' | 'carousel') => {
    let template = ''
    
    switch (templateType) {
      case 'button':
        template = JSON.stringify({
          type: 'flex',
          altText: 'ボタンメッセージ',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'ここにメッセージを入力',
                  weight: 'bold'
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
                    label: 'ボタン',
                    uri: 'https://example.com'
                  }
                }
              ]
            }
          }
        }, null, 2)
        break
        
      case 'bubble':
        template = JSON.stringify({
          type: 'flex',
          altText: 'バブルメッセージ',
          contents: {
            type: 'bubble',
            hero: {
              type: 'image',
              url: 'https://example.com/image.jpg',
              size: 'full',
              aspectRatio: '20:13'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'タイトル',
                  weight: 'bold',
                  size: 'xl'
                },
                {
                  type: 'text',
                  text: 'ここに説明文を入力'
                }
              ]
            }
          }
        }, null, 2)
        break
        
      case 'carousel':
        template = JSON.stringify({
          type: 'flex',
          altText: 'カルーセルメッセージ',
          contents: {
            type: 'carousel',
            contents: [
              {
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'アイテム1',
                      weight: 'bold'
                    }
                  ]
                }
              },
              {
                type: 'bubble',
                body: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'アイテム2',
                      weight: 'bold'
                    }
                  ]
                }
              }
            ]
          }
        }, null, 2)
        break
    }
    
    setFlexContent(template)
  }

  const copyToClipboard = () => {
    const message = getCurrentMessage()
    if (message) {
      navigator.clipboard.writeText(JSON.stringify(message, null, 2))
        .then(() => alert('クリップボードにコピーしました'))
        .catch(() => alert('コピーに失敗しました'))
    }
  }

  const importJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const parsed = JSON.parse(content)
            
            if (parsed.type === 'text') {
              setMessageType('text')
              setTextContent(parsed.text)
            } else if (parsed.type === 'flex') {
              setMessageType('flex')
              setFlexContent(JSON.stringify(parsed, null, 2))
            }
          } catch (error) {
            alert('無効なJSONファイルです')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const exportJson = () => {
    const message = getCurrentMessage()
    if (message) {
      const blob = new Blob([JSON.stringify(message, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {template ? 'テンプレート編集' : '新規テンプレート'}
            </h1>
            <p className="text-sm text-gray-600">
              LINEメッセージのテンプレートを作成・編集
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded-lg ${
              showPreview 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowJsonEditor(!showJsonEditor)}
            className={`p-2 rounded-lg ${
              showJsonEditor 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Code className="w-5 h-5" />
          </button>
          
          <div className="h-6 border-l border-gray-300" />
          
          <button
            onClick={importJson}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Upload className="w-5 h-5" />
          </button>
          
          <button
            onClick={exportJson}
            disabled={!getCurrentMessage()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={!getCurrentMessage()}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <Copy className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={!getCurrentMessage()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
      </div>

      {/* メイン */}
      <div className="flex-1 flex">
        {/* エディター */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex flex-col`}>
          {/* メッセージタイプ選択 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMessageType('text')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                  messageType === 'text'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Type className="w-4 h-4 mr-2" />
                テキスト
              </button>
              <button
                onClick={() => setMessageType('flex')}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                  messageType === 'flex'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="w-4 h-4 mr-2" />
                Flex
              </button>
            </div>
          </div>

          {/* ツールバー */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <QuickVarInsert onInsert={handleVariableInsert} />
              
              {messageType === 'flex' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => insertFlexTemplate('button')}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    ボタン
                  </button>
                  <button
                    onClick={() => insertFlexTemplate('bubble')}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    バブル
                  </button>
                  <button
                    onClick={() => insertFlexTemplate('carousel')}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    カルーセル
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* エディター本体 */}
          <div className="flex-1 p-4">
            {messageType === 'text' ? (
              <div className="h-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メッセージテキスト
                </label>
                <textarea
                  ref={textareaRef}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="block w-full h-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="メッセージを入力してください...&#10;&#10;変数を使用することができます：&#10;{{user.name}} - ユーザー名&#10;{{date.today}} - 今日の日付"
                />
                <div className="mt-2 text-sm text-gray-500">
                  文字数: {textContent.length}/5000
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flex Message JSON
                </label>
                <textarea
                  ref={jsonEditorRef}
                  value={flexContent}
                  onChange={(e) => setFlexContent(e.target.value)}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                  placeholder="Flex Message のJSONを入力してください..."
                />
                {showJsonEditor && (
                  <div className="mt-2 text-xs text-gray-500">
                    <a 
                      href="https://developers.line.biz/flex-simulator/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LINE Flex Message Simulator で確認 →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* プレビュー */}
        {showPreview && (
          <div className="w-1/2 bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">プレビュー</h3>
            <LineMessagePreview message={getCurrentMessage()} />
          </div>
        )}
      </div>
    </div>
  )
}