'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Bot, User, Lightbulb, TrendingUp, Target, X, Minimize2, Maximize2 } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIChatAssistantProps {
  users: any[]
  scenarios: any[]
  deliveryLogs: any[]
  onExecuteAction?: (action: string, data: any) => void
}

export function AIChatAssistant({ users, scenarios, deliveryLogs, onExecuteAction }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'こんにちは！LINE マーケティングアシスタントです。\n\nデータ分析、セグメント作成、シナリオ最適化など、何でもお気軽にご相談ください。現在のシステム状況を確認して、最適な提案をいたします。',
      timestamp: new Date(),
      suggestions: [
        'パフォーマンスを分析して',
        'セグメント作成を手伝って',
        '配信タイミングを最適化して',
        'テンプレートを改善したい'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateAIResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase()
    
    // 現在のデータに基づく実際の分析
    const totalUsers = users.length
    const totalDeliveries = deliveryLogs.length
    const openRate = deliveryLogs.length > 0 ? 
      (deliveryLogs.filter(log => ['OPENED', 'CLICKED'].includes(log.status)).length / deliveryLogs.length * 100).toFixed(1) : '0'
    const activeScenarios = scenarios.filter(s => s.isActive).length

    let response = ''
    let suggestions: string[] = []

    if (lowerMessage.includes('パフォーマンス') || lowerMessage.includes('分析')) {
      response = `📊 **現在のパフォーマンス分析**

**主要指標:**
• 総ユーザー数: ${totalUsers}名
• 総配信数: ${totalDeliveries}件
• 開封率: ${openRate}%
• アクティブシナリオ: ${activeScenarios}個

**AIの推奨事項:**
1. 開封率が${openRate}%と${ parseFloat(openRate) > 25 ? '良好' : '改善の余地がある'}状況です
2. 高エンゲージメントユーザーを特定してVIPセグメント作成を推奨
3. A/Bテストでテンプレート最適化を実施することを提案

何か特定の指標について詳しく知りたいですか？`

      suggestions = [
        'VIPセグメントを作成したい',
        'A/Bテストを設定して',
        '配信タイミングを最適化したい',
        '収益向上の施策を提案して'
      ]
    } else if (lowerMessage.includes('セグメント')) {
      const vipUsers = users.filter(user => user.tags?.some((tag: any) => tag.name === 'VIP'))
      const newUsers = users.filter(user => user.tags?.some((tag: any) => tag.name === '新規'))
      
      response = `🎯 **セグメント分析と提案**

**現在の主要セグメント:**
• VIPユーザー: ${vipUsers.length}名
• 新規ユーザー: ${newUsers.length}名

**AIの推奨セグメント:**
1. **高エンゲージメント** - 開封率70%以上のユーザー
2. **休眠ユーザー** - 14日間無反応のユーザー
3. **高価値顧客** - 複数回購入履歴のあるユーザー

これらのセグメントを作成することで、ターゲティングの精度が向上し、ROIが20-30%改善することが期待できます。

どのセグメントから作成しますか？`

      suggestions = [
        '高エンゲージメントセグメントを作成',
        '休眠ユーザーセグメントを作成',
        '購買履歴でセグメント分け',
        '地域別セグメントを提案して'
      ]
    } else if (lowerMessage.includes('タイミング') || lowerMessage.includes('時間')) {
      response = `⏰ **配信タイミング最適化分析**

**現在の配信パターン分析:**
配信ログから最適なタイミングを分析した結果：

• **平日 10:00-12:00**: 開封率が最も高い傾向
• **火曜・水曜**: 週の中で最もエンゲージメントが高い
• **夜間 20:00-22:00**: クリック率が向上

**推奨配信スケジュール:**
1. ビジネス向け: 平日10:00
2. プロモーション: 火曜20:00
3. ウェルカムメッセージ: 登録直後

これらの時間に配信することで開封率18%向上が期待できます。`

      suggestions = [
        'シナリオの配信時間を変更して',
        '曜日別の配信戦略を教えて',
        'ユーザー別最適時間を分析',
        'A/Bテストで時間を検証'
      ]
    } else if (lowerMessage.includes('テンプレート') || lowerMessage.includes('メッセージ')) {
      response = `📝 **テンプレート最適化提案**

**現在のテンプレート分析:**
• テキストメッセージ vs Flexメッセージの比較
• 個人化要素の効果測定
• CTA文言の性能分析

**改善提案:**
1. **パーソナライゼーション強化**
   - ユーザー名の活用: 開封率+15%
   - 過去の行動に基づくコンテンツ

2. **ビジュアル要素の最適化**
   - Flexメッセージでエンゲージメント+25%
   - カラーパレットとブランディング統一

3. **CTA最適化**
   - 行動を促す文言への変更
   - ボタンの配置とデザイン改善

具体的にどのテンプレートを改善したいですか？`

      suggestions = [
        'ウェルカムメッセージを最適化',
        'Flexメッセージのデザイン改善',
        'CTA文言をA/Bテスト',
        'パーソナライゼーション強化'
      ]
    } else if (lowerMessage.includes('収益') || lowerMessage.includes('売上') || lowerMessage.includes('収入')) {
      response = `💰 **収益向上戦略**

**現在の収益機会分析:**

**即効性のある施策:**
1. **VIP向け限定オファー** - 期待ROI: +45%
2. **カート放棄防止シナリオ** - コンバージョン率+30%
3. **リピート購入促進** - LTV向上+25%

**中長期戦略:**
1. **サブスクリプション誘導**
2. **アップセル・クロスセル自動化**
3. **ロイヤルティプログラム**

最も効果的なのは、VIPユーザー${users.filter(u => u.tags?.some((t: any) => t.name === 'VIP')).length}名への限定オファーです。すぐに実装可能で、高い ROI が期待できます。`

      suggestions = [
        'VIP限定キャンペーンを作成',
        'カート放棄防止を設定',
        'リピート促進シナリオ',
        'サブスク誘導戦略を教えて'
      ]
    } else {
      // 一般的な応答
      response = `ご質問ありがとうございます！

現在のシステム状況を確認しますと：
• ${totalUsers}名のユーザーを管理
• ${totalDeliveries}件の配信実績
• ${activeScenarios}個のアクティブシナリオ

以下のような分野でお手伝いできます：
📊 パフォーマンス分析と改善提案
🎯 セグメント戦略の最適化  
⏰ 配信タイミングの最適化
📝 テンプレート・メッセージ改善
💰 収益向上戦略

具体的にどの分野でサポートが必要でしょうか？`

      suggestions = [
        'パフォーマンスを詳しく分析',
        'セグメント戦略を相談',
        '収益向上の具体策を教えて',
        'シナリオ最適化のアドバイス'
      ]
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // AIの応答をシミュレート
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-white/20 rounded-full">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AIアシスタント</h3>
            {!isMinimized && (
              <p className="text-xs text-white/80">マーケティング最適化をサポート</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-white/80 hover:text-white rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-white/80 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 h-[440px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-gray-700 hover:text-gray-900 transition-colors"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 入力エリア */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="質問やリクエストを入力..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}