'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatConversation, ChatMessage, ChatParticipant, JobSeeker, Agent } from '@/types'
import {
  Send,
  Paperclip,
  Image,
  File,
  MoreVertical,
  Search,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Clock,
  Check,
  CheckCheck,
  Smile,
  MessageCircle,
  Users,
  Bot
} from 'lucide-react'

interface ChatInterfaceProps {
  conversations: ChatConversation[]
  currentUser: Agent
  jobSeekers: JobSeeker[]
  agents: Agent[]
  onSendMessage: (conversationId: string, message: string, attachments?: File[]) => void
  onCreateConversation: (participants: string[], type: 'jobseeker_line' | 'agent_internal') => void
  onArchiveConversation: (conversationId: string) => void
  onBack?: () => void
}

export function ChatInterface({
  conversations,
  currentUser,
  jobSeekers,
  agents,
  onSendMessage,
  onCreateConversation,
  onArchiveConversation,
  onBack
}: ChatInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [conversationType, setConversationType] = useState<'jobseeker_line' | 'agent_internal'>('jobseeker_line')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 会話の種類でフィルタリング
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesSearch
  })

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      onSendMessage(selectedConversation.id, messageInput.trim())
      setMessageInput('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0 && selectedConversation) {
      // ファイル付きメッセージとして送信
      onSendMessage(selectedConversation.id, messageInput || 'ファイルを送信しました', files)
      setMessageInput('')
    }
  }

  const handleCreateConversation = () => {
    if (selectedParticipants.length > 0) {
      onCreateConversation(selectedParticipants, conversationType)
      setShowNewConversation(false)
      setSelectedParticipants([])
    }
  }

  const getParticipantInfo = (participant: ChatParticipant) => {
    if (participant.type === 'jobseeker') {
      const jobSeeker = jobSeekers.find(js => js.id === participant.id)
      return {
        name: jobSeeker?.name || participant.name,
        subtitle: jobSeeker?.currentPosition || '求職者',
        imageUrl: jobSeeker?.profileImageUrl || participant.profileImageUrl
      }
    } else if (participant.type === 'agent') {
      const agent = agents.find(a => a.id === participant.id)
      return {
        name: agent?.name || participant.name,
        subtitle: agent?.position || 'エージェント',
        imageUrl: agent?.profileImageUrl || participant.profileImageUrl
      }
    }
    return {
      name: participant.name,
      subtitle: 'システム',
      imageUrl: participant.profileImageUrl
    }
  }

  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return '昨日'
    } else {
      return messageDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
    }
  }

  const renderMessageStatus = (message: ChatMessage) => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 会話リスト */}
      <div className="w-80 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-semibold text-gray-900">チャット</h3>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="会話を検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {filteredConversations.map(conversation => {
            const otherParticipants = conversation.participants.filter(p => p.id !== currentUser.id)
            const mainParticipant = otherParticipants[0] || conversation.participants[0]
            const participantInfo = getParticipantInfo(mainParticipant)
            
            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {participantInfo.imageUrl ? (
                      <img
                        src={participantInfo.imageUrl}
                        alt={participantInfo.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {participantInfo.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {participantInfo.name}
                      </p>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || participantInfo.subtitle}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {conversation.type === 'jobseeker_line' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          LINE
                        </span>
                      )}
                      {conversation.contextType && (
                        <span className="text-xs text-gray-500">
                          {
                            {
                              'job_application': '応募関連',
                              'general_inquiry': '一般問い合わせ',
                              'interview_schedule': '面接調整'
                            }[conversation.contextType]
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* チャットエリア */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* チャットヘッダー */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const otherParticipants = selectedConversation.participants.filter(p => p.id !== currentUser.id)
                  const mainParticipant = otherParticipants[0] || selectedConversation.participants[0]
                  const participantInfo = getParticipantInfo(mainParticipant)
                  
                  return (
                    <>
                      {participantInfo.imageUrl ? (
                        <img
                          src={participantInfo.imageUrl}
                          alt={participantInfo.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {participantInfo.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{participantInfo.name}</p>
                        <p className="text-sm text-gray-600">{participantInfo.subtitle}</p>
                      </div>
                    </>
                  )
                })()}
              </div>
              
              <div className="flex items-center gap-2">
                {selectedConversation.type === 'jobseeker_line' && (
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Info className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ダミーメッセージ（実際にはselectedConversationのメッセージを表示） */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">システム</p>
                <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                  <p className="text-sm">会話を開始しました</p>
                </div>
              </div>
            </div>

            {/* 送信メッセージの例 */}
            <div className="flex items-end gap-3 justify-end">
              <div className="flex items-end gap-1">
                <div className="bg-green-500 text-white rounded-lg p-3 max-w-md">
                  <p className="text-sm">こんにちは。本日はお時間をいただきありがとうございます。</p>
                </div>
                {renderMessageStatus({ status: 'read' } as ChatMessage)}
              </div>
            </div>

            {/* 受信メッセージの例 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">相手</p>
                <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                  <p className="text-sm">こちらこそ、よろしくお願いします。</p>
                </div>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* メッセージ入力エリア */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="メッセージを入力..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={1}
                />
                <button className="absolute right-2 bottom-2 p-1 rounded hover:bg-gray-100">
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  messageInput.trim()
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">会話を選択してチャットを開始</p>
          </div>
        </div>
      )}

      {/* 新規会話作成モーダル */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">新規会話</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会話タイプ
                </label>
                <select
                  value={conversationType}
                  onChange={(e) => setConversationType(e.target.value as 'jobseeker_line' | 'agent_internal')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="jobseeker_line">求職者（LINE）</option>
                  <option value="agent_internal">エージェント（内部）</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参加者を選択
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {conversationType === 'jobseeker_line' ? (
                    jobSeekers.filter(js => js.lineUserId).map(jobSeeker => (
                      <label
                        key={jobSeeker.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(jobSeeker.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, jobSeeker.id])
                            } else {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== jobSeeker.id))
                            }
                          }}
                          className="rounded text-green-500"
                        />
                        <span className="text-sm">{jobSeeker.name}</span>
                      </label>
                    ))
                  ) : (
                    agents.filter(a => a.id !== currentUser.id).map(agent => (
                      <label
                        key={agent.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(agent.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, agent.id])
                            } else {
                              setSelectedParticipants(selectedParticipants.filter(id => id !== agent.id))
                            }
                          }}
                          className="rounded text-green-500"
                        />
                        <span className="text-sm">{agent.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewConversation(false)
                  setSelectedParticipants([])
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={selectedParticipants.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                会話を開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}