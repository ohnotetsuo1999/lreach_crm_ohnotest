'use client'

import { EnhancedLinePreview } from '../TemplatePreview/EnhancedLinePreview'
import { LineMessage, User } from '@/types'

// テスト用サンプルデータ
const sampleTextMessage: LineMessage = {
  type: 'text',
  text: 'こんにちは！これはテストメッセージです。\n\nLINE風のプレビューが正しく表示されているかテストしています。'
}

const sampleFlexMessage: LineMessage = {
  type: 'flex',
  altText: 'Flexメッセージのサンプル',
  contents: {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'サンプルタイトル',
          weight: 'bold',
          size: 'lg'
        },
        {
          type: 'text',
          text: 'これはFlexメッセージのサンプルです。'
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
            label: 'サンプルボタン',
            uri: 'https://example.com'
          }
        }
      ]
    }
  }
}

const sampleUsers: User[] = [
  {
    id: 'user1',
    name: '田中太郎',
    lineUid: 'line123456789',
    address: '東京都渋谷区',
    phone: '090-1234-5678',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    statusHistory: []
  },
  {
    id: 'user2', 
    name: '佐藤花子',
    lineUid: 'line987654321',
    address: '大阪府大阪市',
    phone: '080-9876-5432',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    statusHistory: []
  }
]

export function LinePreviewTest() {
  const handleTestSend = async (userIds: string[], message: LineMessage) => {
    console.log('テスト送信:', { userIds, message })
    alert(`${userIds.length}人にテスト送信しました！`)
  }

  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">LINE Preview Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* テキストメッセージテスト */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">テキストメッセージ</h2>
            <EnhancedLinePreview
              message={sampleTextMessage}
              showTestSend={true}
              users={sampleUsers}
              onTestSend={handleTestSend}
              showMockChat={true}
            />
          </div>

          {/* Flexメッセージテスト */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Flexメッセージ</h2>
            <EnhancedLinePreview
              message={sampleFlexMessage}
              showTestSend={true}
              users={sampleUsers}
              onTestSend={handleTestSend}
              showMockChat={true}
            />
          </div>

          {/* メッセージなしテスト */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">メッセージなし</h2>
            <EnhancedLinePreview
              message={null}
              showTestSend={false}
              users={sampleUsers}
              onTestSend={handleTestSend}
              showMockChat={true}
            />
          </div>

          {/* シンプル表示テスト */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">シンプル表示</h2>
            <EnhancedLinePreview
              message={sampleTextMessage}
              showTestSend={false}
              users={[]}
              showMockChat={false}
            />
          </div>
        </div>

        {/* 診断情報 */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-lg font-semibold mb-4">診断情報</h2>
          <div className="space-y-2 text-sm">
            <div>✅ EnhancedLinePreview コンポーネント読み込み</div>
            <div>✅ サンプルデータ準備完了</div>
            <div>✅ テスト送信ハンドラー設定済み</div>
            <div>📱 上記のプレビューが正しく表示されるかテストしてください</div>
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="bg-gray-50 p-6 rounded-lg shadow mt-4">
          <h3 className="text-md font-semibold mb-2">デバッグ情報</h3>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto">
            {JSON.stringify({
              textMessage: sampleTextMessage,
              flexMessage: sampleFlexMessage,
              users: sampleUsers.map(u => ({ id: u.id, name: u.name }))
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}