'use client'

import ReactMarkdown from 'react-markdown'

interface Applicant {
  id: number
  name: string
  email: string
  phone: string
  position: string
  experience: string
  status: 'pending' | 'confirmed' | 'cancelled'
  availableDates: Array<{
    date: string
    timeSlots: string[]
  }>
  profile: string
}

interface ApplicantDetailProps {
  applicant: Applicant
}

export default function ApplicantDetail({ applicant }: ApplicantDetailProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">氏名</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">電話番号</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.phone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">希望職種</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.position}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">経験年数</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.experience}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">ステータス</dt>
            <dd className="mt-1">
              {applicant.status === 'pending' && (
                <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  調整中
                </span>
              )}
              {applicant.status === 'confirmed' && (
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  確定済
                </span>
              )}
              {applicant.status === 'cancelled' && (
                <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                  キャンセル
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">希望日程</h3>
        <div className="space-y-4">
          {applicant.availableDates.map((dateInfo, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-900">{dateInfo.date}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dateInfo.timeSlots.map((time, timeIndex) => (
                  <span
                    key={timeIndex}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">プロフィール詳細</h3>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{applicant.profile}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}