'use client'

import React from 'react'
import RecommendationRequestForm from '@/components/ATS/RecommendationRequestForm'
import type { MaskedProfile, JobPosting, Company, RecommendationRequest } from '@/types'

interface ATSRecommendationProps {
  profile: MaskedProfile
  jobPostings: JobPosting[]
  companies: Company[]
  onSubmit: (request: Partial<RecommendationRequest>) => void
  onCancel: () => void
}

export default function ATSRecommendation({
  profile,
  jobPostings,
  companies,
  onSubmit,
  onCancel
}: ATSRecommendationProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <RecommendationRequestForm
        profile={profile}
        jobPostings={jobPostings}
        maskedProfiles={[profile]}
        companies={companies}
        company={companies[0]}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  )
}