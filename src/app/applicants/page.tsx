'use client'

import { useState } from 'react'
import { SidebarLayout, SidebarHeader, ContentHeader, ContentBody } from '@/components/Common/SidebarLayout'
import ApplicantList from '@/components/ApplicantManagement/ApplicantList'
import ApplicantDetail from '@/components/ApplicantManagement/ApplicantDetail'
import ScheduleConfirmation from '@/components/ApplicantManagement/ScheduleConfirmation'
import { applicantsData } from '@/data/applicants'

export default function ApplicantsPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<number | null>(null)
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false)

  const applicant = selectedApplicant !== null 
    ? applicantsData.find(a => a.id === selectedApplicant)
    : null

  const handleScheduleConfirm = () => {
    setShowScheduleConfirm(true)
  }

  const handleScheduleComplete = (date: string, time: string, agent: string) => {
    console.log(`面談確定: ${date} ${time} 担当: ${agent}`)
    setShowScheduleConfirm(false)
    // ここで実際のデータベース更新処理を行う
  }

  const sidebar = (
    <>
      <SidebarHeader 
        title="求職者一覧"
        stats={[
          { label: '全求職者', value: applicantsData.length, color: 'bg-blue-50' },
          { label: '調整中', value: applicantsData.filter(a => a.status === 'pending').length, color: 'bg-yellow-50' },
          { label: '確定済', value: applicantsData.filter(a => a.status === 'confirmed').length, color: 'bg-green-50' }
        ]}
      />
      <div className="flex-1 overflow-y-auto">
        <ApplicantList 
          applicants={applicantsData}
          selectedId={selectedApplicant}
          onSelect={setSelectedApplicant}
        />
      </div>
    </>
  )

  return (
    <SidebarLayout sidebar={sidebar}>
      {showScheduleConfirm && applicant ? (
        <>
          <ContentHeader 
            title="日程調整"
            subtitle={`${applicant.name}様との面談日程を確定`}
            actions={
              <button
                onClick={() => setShowScheduleConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                戻る
              </button>
            }
          />
          <ContentBody>
            <ScheduleConfirmation
              applicant={applicant}
              onConfirm={handleScheduleComplete}
              onCancel={() => setShowScheduleConfirm(false)}
            />
          </ContentBody>
        </>
      ) : selectedApplicant && applicant ? (
        <>
          <ContentHeader 
            title={applicant.name}
            subtitle={`${applicant.position} 希望`}
            actions={
              <button
                onClick={handleScheduleConfirm}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                面談日程を確定
              </button>
            }
          />
          <ContentBody>
            <ApplicantDetail applicant={applicant} />
          </ContentBody>
        </>
      ) : (
        <>
          <ContentHeader 
            title="求職者を選択してください"
            subtitle="左側のリストから求職者を選択すると詳細が表示されます"
          />
          <ContentBody>
            <div className="flex items-center justify-center h-full text-gray-500">
              求職者を選択してください
            </div>
          </ContentBody>
        </>
      )}
    </SidebarLayout>
  )
}