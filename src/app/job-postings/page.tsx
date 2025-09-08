'use client'

import { useState } from 'react'
import { JobPostingList } from '@/components/CRM/JobPostingList/JobPostingList'
import { JobPostingDetail } from '@/components/CRM/JobPostingDetail/JobPostingDetail'
import { mockJobPostingsData } from '@/data/mockJobPostings'
import { mockCompanies } from '@/data/mockCompanies'
import { JobPosting, JobPostingStatus, JobApplication, JobSeeker, ApplicationStatus } from '@/types'

export default function JobPostingsPage() {
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null)
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(mockJobPostingsData)

  const handleViewJobPosting = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting)
    setView('detail')
  }

  const handleEditJobPosting = (jobPosting: JobPosting) => {
    alert(`求人「${jobPosting.title}」の編集画面を開きます（デモ）`)
  }

  const handleCreateJobPosting = () => {
    console.log('新規求人作成')
  }

  const handleDuplicateJobPosting = (jobPosting: JobPosting) => {
    alert(`求人「${jobPosting.title}」を複製します（デモ）`)
  }

  const handleArchiveJobPosting = (jobPostingId: string) => {
    alert(`求人ID: ${jobPostingId} をアーカイブします（デモ）`)
  }

  const handleUpdateStatus = (jobPostingId: string, status: JobPostingStatus) => {
    setJobPostings(prev => 
      prev.map(jp => 
        jp.id === jobPostingId ? { ...jp, status } : jp
      )
    )
    alert(`求人のステータスを「${status}」に更新しました（デモ）`)
  }

  const handleBack = () => {
    setView('list')
    setSelectedJobPosting(null)
  }

  if (view === 'detail' && selectedJobPosting) {
    // Mock data for applications and job seekers
    const mockApplications: JobApplication[] = []
    const mockJobSeekers: JobSeeker[] = []
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <JobPostingDetail
            jobPosting={selectedJobPosting}
            applications={mockApplications}
            jobSeekers={mockJobSeekers}
            onBack={handleBack}
            onEdit={() => handleEditJobPosting(selectedJobPosting)}
            onDuplicate={handleDuplicateJobPosting}
            onArchive={handleArchiveJobPosting}
            onUpdateStatus={(jobPostingId, status) => handleUpdateStatus(jobPostingId, status)}
            onViewApplication={(application) => {
              alert(`応募ID: ${application.id} の詳細を表示（デモ）`)
            }}
            onViewJobSeeker={(jobSeeker) => {
              alert(`求職者: ${jobSeeker.name} の詳細を表示（デモ）`)
            }}
            onUpdateApplicationStatus={(applicationId, status) => {
              alert(`応募ID: ${applicationId} のステータスを ${status} に更新（デモ）`)
            }}
            onScheduleInterview={(applicationId) => {
              alert(`応募ID: ${applicationId} の面接をスケジュール（デモ）`)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobPostingList
          jobPostings={jobPostings}
          onCreateJobPosting={handleCreateJobPosting}
          onEditJobPosting={handleEditJobPosting}
          onViewJobPosting={handleViewJobPosting}
          onDuplicateJobPosting={handleDuplicateJobPosting}
          onArchiveJobPosting={handleArchiveJobPosting}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  )
}