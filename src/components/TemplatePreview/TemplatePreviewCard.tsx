'use client'

import { Template, ActionRule, Tag, Status } from '@/types'
import { 
  Type, 
  Layout, 
  MousePointer, 
  Link, 
  Image as ImageIcon, 
  Zap, 
  ChevronRight,
  MessageSquare,
  ExternalLink
} from 'lucide-react'

interface TemplatePreviewCardProps {
  template: Template
  actionRules: ActionRule[]
  tags: Tag[]
  statuses: Status[]
  onEdit: (template: Template) => void
  onDelete: (templateId: string) => void
  showActions?: boolean
}

export function TemplatePreviewCard({
  template,
  actionRules,
  tags,
  statuses,
  onEdit,
  onDelete,
  showActions = true
}: TemplatePreviewCardProps) {
  
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
      return message.text.length > 80 
        ? message.text.substring(0, 80) + '...' 
        : message.text
    } else if (message.type === 'flex') {
      return message.altText || 'Flex Message'
    }
    return 'Unknown message type'
  }

  const getActionSummary = (buttonText: string) => {
    const buttonRules = templateRules.filter(rule => 
      rule.actionType === 'BUTTON_CLICK' && 
      rule.actionCondition.value === buttonText
    )
    
    return buttonRules.map(rule => {
      return rule.tagActions.map(action => {
        switch (action.type) {
          case 'ADD_TAG':
            const tag = tags.find(t => t.id === action.tagId)
            return `+${tag?.name || '?'}`
          case 'REMOVE_TAG':
            const removeTag = tags.find(t => t.id === action.tagId)
            return `-${removeTag?.name || '?'}`
          case 'SET_STATUS':
            const status = statuses.find(s => s.id === action.statusId)
            return `→${status?.label || '?'}`
          default:
            return '?'
        }
      }).join(', ')
    }).join(' | ')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
            {template.order}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
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
            
            <div className="text-xs text-gray-500">
              {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>

        {/* アクションルール数表示 */}
        {templateRules.length > 0 && (
          <span className="inline-flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 mr-1" />
            {templateRules.length}ルール
          </span>
        )}
      </div>

      {/* メッセージプレビュー */}
      <div className="mb-3 p-3 bg-gray-50 rounded border">
        <div className="text-sm text-gray-800 mb-2">
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
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <MousePointer className="w-3 h-3 mr-1" />
                <span>ボタン ({buttons.length}個)</span>
              </div>
              <div className="space-y-1 ml-4">
                {buttons.map((buttonText, index) => {
                  const hasAction = templateRules.some(rule => 
                    rule.actionType === 'BUTTON_CLICK' && 
                    rule.actionCondition.value === buttonText
                  )
                  const actionSummary = getActionSummary(buttonText)
                  
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        hasAction 
                          ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}>
                        <span className="font-medium">「{buttonText}」</span>
                        {hasAction && <Zap className="w-3 h-3 ml-1" />}
                      </div>
                      {actionSummary && (
                        <span className="text-xs text-orange-600">{actionSummary}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* URL */}
          {urls.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <ExternalLink className="w-3 h-3 mr-1" />
                <span>リンク ({urls.length}個)</span>
              </div>
              <div className="space-y-1 ml-4">
                {urls.slice(0, 2).map((url, index) => (
                  <div key={index} className="text-xs text-blue-600 truncate">
                    {url.length > 40 ? url.substring(0, 40) + '...' : url}
                  </div>
                ))}
                {urls.length > 2 && (
                  <div className="text-xs text-gray-500">
                    他{urls.length - 2}個のリンク...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {message.type === 'flex' && (
            <span className="flex items-center">
              <Layout className="w-3 h-3 mr-1" />
              インタラクティブ
            </span>
          )}
          {buttons.length > 0 && (
            <span className="flex items-center">
              <MousePointer className="w-3 h-3 mr-1" />
              {buttons.length}ボタン
            </span>
          )}
          {templateRules.length > 0 && (
            <span className="flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              {templateRules.length}アクション
            </span>
          )}
        </div>
        
        <button
          onClick={() => onEdit(template)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
        >
          編集
          <ChevronRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  )
}