'use client'

import { LineMessage, LineTextMessage, LineFlexMessage, User } from '@/types'
import { MessageCircle, Image, Layout, Send, Users, X, Phone, Calendar } from 'lucide-react'
import { useState } from 'react'

interface EnhancedLinePreviewProps {
  message: LineMessage | null
  className?: string
  showTestSend?: boolean
  users?: User[]
  onTestSend?: (userIds: string[], message: LineMessage) => Promise<void>
  showMockChat?: boolean
}

export function EnhancedLinePreview({ 
  message, 
  className = '', 
  showTestSend = false,
  users = [],
  onTestSend,
  showMockChat = true
}: EnhancedLinePreviewProps) {
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [mockChatHistory, setMockChatHistory] = useState([
    { type: 'system', content: 'ユーザーがトークに参加しました', time: '14:20' },
    { type: 'user', content: 'こんにちは！', time: '14:21' }
  ])

  const handleTestSend = async () => {
    if (!message || !onTestSend || selectedUsers.length === 0) return
    
    setIsSending(true)
    try {
      await onTestSend(selectedUsers, message)
      setShowUserSelector(false)
      setSelectedUsers([])
      
      // モックチャットに送信メッセージを追加
      if (showMockChat) {
        const newMessage = {
          type: 'bot',
          content: message.type === 'text' ? message.text : message.altText,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
        setMockChatHistory(prev => [...prev, newMessage])
      }
    } catch (error) {
      console.error('Test send failed:', error)
      alert('テスト送信に失敗しました')
    } finally {
      setIsSending(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const renderTextMessage = (textMessage: LineTextMessage) => {
    return (
      <div className="relative mb-2">
        <div className="bg-green-500 text-white rounded-2xl rounded-br-md p-3 shadow-sm max-w-[250px] ml-auto">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{textMessage.text}</p>
          {textMessage.quickReply && textMessage.quickReply.items.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {textMessage.quickReply.items.map((item, index) => (
                <span
                  key={index}
                  className="inline-block bg-white bg-opacity-20 text-xs px-3 py-1 rounded-full border border-white border-opacity-30"
                >
                  {item.action.label || item.action.text}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* メッセージの尻尾 */}
        <div className="absolute bottom-0 right-0 transform translate-x-1">
          <div className="w-0 h-0 border-l-4 border-l-green-500 border-t-4 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const renderFlexMessage = (flexMessage: LineFlexMessage) => {
    const { contents } = flexMessage

    if (contents.type === 'bubble') {
      return (
        <div className="bg-white border border-gray-200 rounded-2xl rounded-br-md overflow-hidden shadow-lg max-w-[250px] ml-auto mb-2">
          {/* Hero Image */}
          {contents.hero && contents.hero.type === 'image' && (
            <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center relative">
              <Image className="w-10 h-10 text-gray-500" />
              <div className="absolute inset-0 bg-black bg-opacity-5"></div>
            </div>
          )}

          {/* Header */}
          {contents.header && (
            <div className="px-4 py-3 border-b border-gray-100">
              {renderFlexBox(contents.header)}
            </div>
          )}

          {/* Body */}
          {contents.body && (
            <div className="px-4 py-3">
              {renderFlexBox(contents.body)}
            </div>
          )}

          {/* Footer */}
          {contents.footer && (
            <div className="px-4 py-3 border-t border-gray-100">
              {renderFlexBox(contents.footer)}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-2xl rounded-br-md p-4 max-w-[250px] ml-auto shadow-sm mb-2">
        <div className="flex items-center text-gray-500 text-sm">
          <Layout className="w-4 h-4 mr-2" />
          <span className="font-medium">Carousel</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          複数のカードを横スクロールで表示
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
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
            {component.action?.label || 'ボタン'}
          </button>
        )

      case 'image':
        return (
          <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
            <Image className="w-6 h-6 text-gray-400" />
            <div className="absolute inset-0 bg-black bg-opacity-5"></div>
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
    <div className={`relative ${className}`}>
      {/* LINEスマートフォン風のプレビューコンテナ */}
      <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-auto overflow-hidden border border-gray-200">
        {/* スマートフォンのステータスバー */}
        <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-xs">
          <span>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
            </div>
            <span className="ml-2">100%</span>
          </div>
        </div>

        {/* LINEヘッダー */}
        <div className="bg-green-500 text-white px-4 py-3 flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">あなたのLINE Bot</div>
            <div className="text-xs opacity-80">オンライン</div>
          </div>
          <div className="flex space-x-3">
            <Phone className="w-5 h-5 opacity-80" />
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          {showTestSend && message && (
            <button
              onClick={() => setShowUserSelector(true)}
              className="ml-3 bg-white bg-opacity-90 hover:bg-white text-green-600 hover:text-green-700 px-4 py-2 rounded-full text-xs font-medium flex items-center transition-all shadow-sm hover:shadow-md border border-white border-opacity-20 backdrop-blur-sm"
            >
              <Send className="w-3 h-3 mr-1.5" />
              テスト送信
            </button>
          )}
        </div>

        {/* チャットエリア */}
        <div className="bg-gray-50 h-96 p-4 overflow-y-auto">
          {!message ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">メッセージを作成してプレビューを表示</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* モックチャット履歴 */}
              {showMockChat && mockChatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : msg.type === 'bot' ? 'justify-end' : 'justify-center'}`}>
                  {msg.type === 'system' ? (
                    <div className="bg-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {msg.content}
                    </div>
                  ) : msg.type === 'user' ? (
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-br-md p-3 max-w-[200px] shadow-sm">
                      <p className="text-sm">{msg.content}</p>
                      <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
                    </div>
                  ) : (
                    <div className="max-w-[250px]">
                      <div className="bg-green-500 text-white rounded-2xl rounded-br-md p-3 shadow-sm">
                        <p className="text-sm">{msg.content}</p>
                        <div className="text-xs text-green-100 mt-1 text-right">{msg.time}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* 現在のメッセージプレビュー */}
              <div className="flex justify-end">
                <div>
                  {message.type === 'text' && renderTextMessage(message)}
                  {message.type === 'flex' && renderFlexMessage(message)}
                  
                  {/* 配信確認と時刻 */}
                  <div className="flex justify-end items-center text-xs text-gray-400 mt-1">
                    <span className="mr-1">
                      {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="bg-white border-t border-gray-200 p-3 flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-gray-500 text-sm">メッセージを入力</span>
          </div>
          <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* テスト送信モーダル */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">テスト送信先を選択</h3>
              <button
                onClick={() => setShowUserSelector(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4">
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">送信可能なユーザーがいません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.slice(0, 20).map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.lineUid ? `LINE: ${user.lineUid.slice(-8)}` : user.address || user.phone || 'ID: ' + user.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedUsers.length}人選択中
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUserSelector(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleTestSend}
                  disabled={selectedUsers.length === 0 || isSending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      送信
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}