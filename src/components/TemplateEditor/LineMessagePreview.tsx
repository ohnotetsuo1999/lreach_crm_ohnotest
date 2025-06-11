'use client'

import { LineMessage, LineTextMessage, LineFlexMessage } from '@/types'
import { MessageCircle, Image, Layout } from 'lucide-react'

interface LineMessagePreviewProps {
  message: LineMessage | null
  className?: string
}

export function LineMessagePreview({ message, className = '' }: LineMessagePreviewProps) {
  if (!message) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>メッセージを作成してプレビューを表示</p>
      </div>
    )
  }

  const renderTextMessage = (textMessage: LineTextMessage) => {
    return (
      <div className="bg-green-500 text-white rounded-lg p-3 max-w-xs ml-auto">
        <p className="text-sm whitespace-pre-wrap">{textMessage.text}</p>
        {textMessage.quickReply && textMessage.quickReply.items.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {textMessage.quickReply.items.map((item, index) => (
              <span
                key={index}
                className="inline-block bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full"
              >
                {item.action.label || item.action.text}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFlexMessage = (flexMessage: LineFlexMessage) => {
    const { contents } = flexMessage

    if (contents.type === 'bubble') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg max-w-xs ml-auto overflow-hidden shadow-sm">
          {/* Hero Image */}
          {contents.hero && contents.hero.type === 'image' && (
            <div className="h-32 bg-gray-200 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Header */}
          {contents.header && (
            <div className="p-3 border-b border-gray-100">
              {renderFlexBox(contents.header)}
            </div>
          )}

          {/* Body */}
          {contents.body && (
            <div className="p-3">
              {renderFlexBox(contents.body)}
            </div>
          )}

          {/* Footer */}
          {contents.footer && (
            <div className="p-3 border-t border-gray-100">
              {renderFlexBox(contents.footer)}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg max-w-xs ml-auto p-3">
        <div className="flex items-center text-gray-500 text-sm">
          <Layout className="w-4 h-4 mr-2" />
          Flex Message (Carousel)
        </div>
      </div>
    )
  }

  const renderFlexBox = (box: any) => {
    if (!box.contents) return null

    return (
      <div className={`flex ${
        box.layout === 'horizontal' ? 'flex-row space-x-2' : 
        box.layout === 'baseline' ? 'flex-row items-baseline space-x-2' :
        'flex-col space-y-1'
      }`}>
        {box.contents.map((component: any, index: number) => (
          <div key={index}>
            {renderFlexComponent(component)}
          </div>
        ))}
      </div>
    )
  }

  const renderFlexComponent = (component: any) => {
    switch (component.type) {
      case 'text':
        return (
          <span 
            className={`${
              component.weight === 'bold' ? 'font-bold' : ''
            } ${
              component.size === 'sm' ? 'text-sm' :
              component.size === 'xs' ? 'text-xs' :
              component.size === 'lg' ? 'text-lg' :
              component.size === 'xl' ? 'text-xl' :
              'text-base'
            }`}
            style={{ color: component.color || 'inherit' }}
          >
            {component.text}
          </span>
        )

      case 'button':
        return (
          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
            {component.action?.label || 'ボタン'}
          </button>
        )

      case 'image':
        return (
          <div className="h-16 bg-gray-200 rounded flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
        )

      case 'spacer':
        return <div className="h-2" />

      case 'separator':
        return <div className="border-t border-gray-200 my-2" />

      default:
        return null
    }
  }

  return (
    <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
      {/* LINE UI Header */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center bg-white px-3 py-1 rounded-full text-xs text-gray-600 border">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          LINE Bot
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        {message.type === 'text' && renderTextMessage(message)}
        {message.type === 'flex' && renderFlexMessage(message)}
      </div>

      {/* Message Info */}
      <div className="mt-3 text-xs text-gray-500 text-right">
        {message.type === 'text' ? 'テキストメッセージ' : 'Flexメッセージ'}
      </div>
    </div>
  )
}