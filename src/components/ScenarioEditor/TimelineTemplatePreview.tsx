'use client'

import { Template, ActionRule } from '@/types'
import { Type, Layout, MousePointer, Zap, ExternalLink, ImageIcon } from 'lucide-react'

interface TimelineTemplatePreviewProps {
  template: Template
  actionRules: ActionRule[]
  isExpanded?: boolean
}

export function TimelineTemplatePreview({
  template,
  actionRules,
  isExpanded = false
}: TimelineTemplatePreviewProps) {
  
  const parseMessage = () => {
    try {
      return JSON.parse(template.lineMessageJson)
    } catch {
      return null
    }
  }

  const message = parseMessage()
  if (!message) return null

  // テンプレートに関連するアクションルールを取得
  const templateRules = actionRules.filter(rule => rule.templateId === template.id)

  // メッセージからボタンやURLを抽出
  const extractElements = (obj: any): { buttons: string[], urls: string[], images: string[] } => {
    const buttons: string[] = []
    const urls: string[] = []
    const images: string[] = []
    
    const traverse = (item: any) => {
      if (item && typeof item === 'object') {
        if (item.type === 'button' && item.action?.label) {
          buttons.push(item.action.label)
          if (item.action.type === 'uri' && item.action.uri) {
            urls.push(item.action.uri)
          }
        }
        if (item.type === 'image' && item.url) {
          images.push(item.url)
        }
        
        Object.values(item).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(traverse)
          } else if (typeof value === 'object') {
            traverse(value)
          }
        })
      }
    }
    
    traverse(obj)
    return { 
      buttons: [...new Set(buttons)], 
      urls: [...new Set(urls)], 
      images: [...new Set(images)] 
    }
  }

  const { buttons, urls, images } = extractElements(message)

  const getMessagePreview = () => {
    if (message.type === 'text') {
      return message.text.length > 60 
        ? message.text.substring(0, 60) + '...' 
        : message.text
    } else if (message.type === 'flex') {
      return message.altText || 'Flex Message'
    }
    return 'Unknown message type'
  }

  if (!isExpanded) {
    // コンパクト表示
    return (
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
          <span>テンプレート {template.order}</span>
          {message.type === 'flex' && (
            <Layout className="w-3 h-3 ml-1 text-purple-500" />
          )}
          {buttons.length > 0 && (
            <span className="ml-2 text-xs text-blue-600">
              {buttons.length}ボタン
            </span>
          )}
        </div>
        {templateRules.length > 0 && (
          <span className="inline-flex items-center text-xs text-purple-600">
            <Zap className="w-3 h-3 mr-1" />
            {templateRules.length}
          </span>
        )}
      </div>
    )
  }

  // 詳細表示
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {message.type === 'text' ? (
            <Type className="w-4 h-4 text-gray-500" />
          ) : (
            <Layout className="w-4 h-4 text-purple-500" />
          )}
          <span className="text-sm font-medium text-gray-900">
            テンプレート {template.order}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            message.type === 'text' 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {message.type === 'text' ? 'テキスト' : 'Flex'}
          </span>
        </div>

        {templateRules.length > 0 && (
          <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 mr-1" />
            {templateRules.length}ルール
          </span>
        )}
      </div>

      {/* メッセージプレビュー */}
      <div className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
        {getMessagePreview()}
      </div>

      {/* 要素表示 */}
      <div className="space-y-2">
        {/* 画像 */}
        {images.length > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <ImageIcon className="w-3 h-3 mr-1" />
            <span>{images.length}枚の画像</span>
          </div>
        )}
        
        {/* ボタン */}
        {buttons.length > 0 && (
          <div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <MousePointer className="w-3 h-3 mr-1" />
              <span>ボタン ({buttons.length}個)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {buttons.map((buttonText, index) => {
                const hasAction = templateRules.some(rule => 
                  rule.actionType === 'BUTTON_CLICK' && 
                  rule.actionCondition.value === buttonText
                )
                
                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      hasAction 
                        ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    「{buttonText.length > 8 ? buttonText.substring(0, 8) + '...' : buttonText}」
                    {hasAction && <Zap className="w-3 h-3 ml-1" />}
                  </span>
                )
              })}
            </div>
          </div>
        )}
        
        {/* URL */}
        {urls.length > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span>{urls.length}個のリンク</span>
          </div>
        )}
      </div>
    </div>
  )
}