'use client'

import React, { useState } from 'react'
import { 
  MessageSquare, 
  Send, 
  Edit, 
  Eye, 
  User,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  ChevronRight
} from 'lucide-react'
import type { RecommendationRequest, JobSeeker } from '@/types'

interface LineSenderProps {
  request: RecommendationRequest
  jobSeeker: JobSeeker
  onSend: (message: string) => void
  onClose: () => void
}

export default function LineSender({ 
  request, 
  jobSeeker,
  onSend,
  onClose 
}: LineSenderProps) {
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // デフォルトメッセージの生成
  const generateDefaultMessage = () => {
    const company = request.requesterCompany
    const position = request.jobPosting?.title || '求人'
    const location = request.jobPosting?.location || '東京'
    const salary = request.offeredSalary 
      ? `年収${request.offeredSalary.min}万円~${request.offeredSalary.max}万円` 
      : '年収は経験・スキルに応じて決定'

    return `${jobSeeker.name}様

お世話になっております。
新しい求人のご案内です。

【企業名】${company}
【ポジション】${position}
【勤務地】${location}
【年収】${salary}

${request.message}

${request.benefits ? `【福利厚生】
${Array.isArray(request.benefits) ? request.benefits.join('、') : request.benefits}` : ''}

ご興味がございましたら、下記のボタンからご回答ください。
詳細な情報をお送りさせていただきます。

ご検討のほど、よろしくお願いいたします。`
  }

  useState(() => {
    setMessage(generateDefaultMessage())
  })

  const handleSend = () => {
    onSend(message)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-5/6 flex overflow-hidden">
        {/* 左側：エディター */}
        <div className="flex-1 flex flex-col border-r">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                LINE メッセージ作成
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 送信先情報 */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{jobSeeker.name}</p>
                <p className="text-sm text-gray-600">
                  {jobSeeker.currentPosition} @ {jobSeeker.currentCompany}
                </p>
              </div>
            </div>
          </div>

          {/* メッセージエディター */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-gray-700">
                メッセージ内容
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMessage(generateDefaultMessage())}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  デフォルトに戻す
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  {isEditing ? '編集完了' : '編集'}
                </button>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-full p-4 border rounded-lg resize-none"
              placeholder="メッセージを入力してください"
              readOnly={!isEditing}
            />
          </div>

          {/* アクションボタン */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  送信後、候補者の回答を待ちます
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  LINEで送信
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：プレビュー */}
        <div className="w-96 bg-gray-100 flex flex-col">
          <div className="p-4 bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold">LINE プレビュー</span>
            </div>
          </div>

          {/* スマホ風プレビュー */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-sm max-w-sm mx-auto">
              {/* メッセージバブル */}
              <div className="p-4">
                <div className="bg-green-100 rounded-lg p-3 relative">
                  <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-green-100 border-b-8 border-b-transparent"></div>
                  <p className="text-sm whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              </div>

              {/* クイックリプライボタン */}
              <div className="p-4 border-t">
                <p className="text-xs text-gray-600 mb-3">クイックリプライ</p>
                <div className="space-y-2">
                  <button className="w-full p-3 bg-green-500 text-white rounded-lg flex items-center justify-between hover:bg-green-600">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      興味があります
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full p-3 bg-gray-500 text-white rounded-lg flex items-center justify-between hover:bg-gray-600">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      今回は見送ります
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      詳細を教えてください
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* 求人情報カード */}
              <div className="m-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{request.jobPosting?.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{request.requesterCompany}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {request.jobPosting?.location}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {request.offeredSalary 
                          ? `${request.offeredSalary.min}~${request.offeredSalary.max}万円`
                          : '応相談'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* プレビュー情報 */}
          <div className="p-4 border-t bg-white">
            <p className="text-xs text-gray-600">
              ※ 実際のLINE表示とは若干異なる場合があります
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}