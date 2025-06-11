'use client'

import { useState } from 'react'
import { ActionRule, Tag, Status } from '@/types'
import { ButtonActionBinding } from '../QuickActionRules/ButtonActionBinding'
import { Eye, Code, Zap } from 'lucide-react'

interface FlexMessagePreviewProps {
  templateId: string
  packId: string
  flexMessage: any
  actionRules: ActionRule[]
  tags: Tag[]
  statuses: Status[]
  onCreateRule: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDeleteRule: (ruleId: string) => void
}

export function FlexMessagePreview({
  templateId,
  packId,
  flexMessage,
  actionRules,
  tags,
  statuses,
  onCreateRule,
  onDeleteRule
}: FlexMessagePreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview')
  const [showActions, setShowActions] = useState(false)

  // Flexメッセージからボタンを抽出
  const extractButtons = (obj: any): string[] => {
    const buttons: string[] = []
    
    const traverse = (item: any) => {
      if (item && typeof item === 'object') {
        if (item.type === 'button' && item.action?.type === 'uri' && item.action?.label) {
          buttons.push(item.action.label)
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
    return [...new Set(buttons)] // 重複除去
  }

  const buttons = extractButtons(flexMessage)

  const renderFlexPreview = (contents: any) => {
    if (!contents || typeof contents !== 'object') return null

    if (contents.type === 'bubble') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm mx-auto shadow-sm">
          {/* Header */}
          {contents.header && (
            <div className="mb-3">
              {renderBoxContents(contents.header)}
            </div>
          )}
          
          {/* Hero */}
          {contents.hero && (
            <div className="mb-3">
              {contents.hero.type === 'image' && (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                  画像: {contents.hero.url || 'No URL'}
                </div>
              )}
            </div>
          )}
          
          {/* Body */}
          {contents.body && (
            <div className="mb-3">
              {renderBoxContents(contents.body)}
            </div>
          )}
          
          {/* Footer */}
          {contents.footer && (
            <div>
              {renderBoxContents(contents.footer)}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div className="bg-gray-100 p-4 rounded text-center text-gray-600">
        Unsupported Flex type: {contents.type}
      </div>
    )
  }

  const renderBoxContents = (box: any) => {
    if (!box.contents) return null
    
    return (
      <div className={`space-y-2 ${box.layout === 'horizontal' ? 'flex space-x-2 space-y-0' : ''}`}>
        {box.contents.map((item: any, index: number) => renderComponent(item, index))}
      </div>
    )
  }

  const renderComponent = (component: any, index: number) => {
    switch (component.type) {
      case 'text':
        return (
          <div
            key={index}
            className={`text-sm ${
              component.weight === 'bold' ? 'font-bold' : ''
            } ${
              component.size === 'xl' ? 'text-lg' : 
              component.size === 'lg' ? 'text-base' : 
              component.size === 'sm' ? 'text-xs' : 'text-sm'
            }`}
            style={{ color: component.color || '#000000' }}
          >
            {component.text}
          </div>
        )
      
      case 'button':
        const hasAction = actionRules.some(rule => 
          rule.templateId === templateId && 
          rule.actionType === 'BUTTON_CLICK' && 
          rule.actionCondition.value === component.action?.label
        )
        
        return (
          <div key={index} className="relative">
            <button
              className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                component.style === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              } ${hasAction ? 'ring-2 ring-orange-300' : ''}`}
              style={component.color ? { backgroundColor: component.color } : {}}
            >
              {component.action?.label || 'Button'}
              {hasAction && (
                <Zap className="w-3 h-3 inline ml-1 text-orange-500" />
              )}
            </button>
          </div>
        )
      
      case 'spacer':
        return <div key={index} className="h-2" />
      
      case 'separator':
        return <hr key={index} className="border-gray-200" />
      
      default:
        return (
          <div key={index} className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            {component.type}: {JSON.stringify(component).substring(0, 50)}...
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              viewMode === 'preview'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-1" />
            プレビュー
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              viewMode === 'json'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code className="w-4 h-4 mr-1" />
            JSON
          </button>
        </div>
        
        {buttons.length > 0 && (
          <button
            onClick={() => setShowActions(!showActions)}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              showActions
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Zap className="w-4 h-4 mr-1" />
            ボタンアクション ({buttons.length})
          </button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'preview' ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          {renderFlexPreview(flexMessage.contents)}
        </div>
      ) : (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(flexMessage, null, 2)}
          </pre>
        </div>
      )}

      {/* Button Actions */}
      {showActions && buttons.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-orange-500" />
            ボタンアクション設定
          </h4>
          
          {buttons.map((buttonText) => (
            <ButtonActionBinding
              key={buttonText}
              templateId={templateId}
              packId={packId}
              buttonText={buttonText}
              existingRules={actionRules}
              tags={tags}
              statuses={statuses}
              onCreateRule={onCreateRule}
              onDeleteRule={onDeleteRule}
            />
          ))}
        </div>
      )}
    </div>
  )
}