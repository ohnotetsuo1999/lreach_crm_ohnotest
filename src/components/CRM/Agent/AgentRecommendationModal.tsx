'use client'

import React, { useState } from 'react'
import { JobSeeker, JobPosting } from '@/types'
import {
  X,
  Search,
  UserPlus,
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface AgentRecommendationModalProps {
  jobSeekers: JobSeeker[]
  jobPostings: JobPosting[]
  preselectedJobId?: string
  preselectedJobSeekerId?: string
  onClose: () => void
  onSubmit: (data: {
    jobPostingId: string
    jobSeekerId: string
    notes?: string
  }) => void
}

export function AgentRecommendationModal({
  jobSeekers,
  jobPostings,
  preselectedJobId,
  preselectedJobSeekerId,
  onClose,
  onSubmit
}: AgentRecommendationModalProps) {
  const [selectedJobSeekerId, setSelectedJobSeekerId] = useState<string>(preselectedJobSeekerId || '')
  const [selectedJobPostingId, setSelectedJobPostingId] = useState<string>(preselectedJobId || '')
  const [notes, setNotes] = useState('')
  const [searchJobSeeker, setSearchJobSeeker] = useState('')
  const [searchJobPosting, setSearchJobPosting] = useState('')

  const availableJobSeekers = jobSeekers.filter(js => 
    js.status !== 'hired' && js.status !== 'rejected'
  )

  const availableJobPostings = jobPostings.filter(jp => 
    (jp.status === 'published' || jp.status === 'active')
  )

  const filteredJobSeekers = availableJobSeekers.filter(js =>
    js.name.toLowerCase().includes(searchJobSeeker.toLowerCase()) ||
    js.email.toLowerCase().includes(searchJobSeeker.toLowerCase())
  )

  const filteredJobPostings = availableJobPostings.filter(jp =>
    jp.title.toLowerCase().includes(searchJobPosting.toLowerCase()) ||
    jp.department?.toLowerCase().includes(searchJobPosting.toLowerCase()) ||
    jp.company?.toLowerCase().includes(searchJobPosting.toLowerCase())
  )

  const handleSubmit = () => {
    if (selectedJobSeekerId && selectedJobPostingId) {
      onSubmit({
        jobSeekerId: selectedJobSeekerId,
        jobPostingId: selectedJobPostingId,
        notes
      })
    }
  }

  const selectedJobSeeker = jobSeekers.find(js => js.id === selectedJobSeekerId)
  const selectedJobPosting = jobPostings.find(jp => jp.id === selectedJobPostingId)

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">候補者を推薦</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 gap-6">
            {/* Job Seeker Selection */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">求職者を選択</h4>
              
              {!preselectedJobSeekerId && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="名前またはメールで検索"
                      value={searchJobSeeker}
                      onChange={(e) => setSearchJobSeeker(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {selectedJobSeeker ? (
                <div className="border border-green-500 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{selectedJobSeeker.name}</h5>
                      <p className="text-sm text-gray-600">{selectedJobSeeker.email}</p>
                      {selectedJobSeeker.currentCompany && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedJobSeeker.currentCompany} - {selectedJobSeeker.currentPosition}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedJobSeeker.skills && selectedJobSeeker.skills.slice(0, 3).map((skill, index) => (
                          <span key={skill.id || `skill-${index}`} className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!preselectedJobSeekerId && (
                      <button
                        onClick={() => setSelectedJobSeekerId('')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        変更
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredJobSeekers.length > 0 ? (
                    filteredJobSeekers.map(js => (
                      <button
                        key={js.id}
                        onClick={() => setSelectedJobSeekerId(js.id)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{js.name}</div>
                        <div className="text-sm text-gray-600">{js.email}</div>
                        {js.skills && js.skills.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {js.skills.slice(0, 3).map((skill, index) => (
                              <span key={skill.id || `skill-${index}`} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>候補者が見つかりません</p>
                      <p className="text-sm mt-1">他の検索条件をお試しください</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Job Posting Selection */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">求人を選択</h4>
              
              {!preselectedJobId && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="求人タイトルで検索"
                      value={searchJobPosting}
                      onChange={(e) => setSearchJobPosting(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {selectedJobPosting ? (
                <div className="border border-green-500 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{selectedJobPosting.title}</h5>
                      {selectedJobPosting.company && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Building className="w-4 h-4" />
                          {selectedJobPosting.company}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJobPosting.location}
                      </p>
                      {selectedJobPosting.salaryRange && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ¥{(selectedJobPosting.salaryRange.min / 10000).toFixed(0)}万 - 
                          ¥{(selectedJobPosting.salaryRange.max / 10000).toFixed(0)}万
                        </p>
                      )}
                    </div>
                    {!preselectedJobId && (
                      <button
                        onClick={() => setSelectedJobPostingId('')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        変更
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredJobPostings.length > 0 ? (
                    filteredJobPostings.map(jp => (
                      <button
                        key={jp.id}
                        onClick={() => setSelectedJobPostingId(jp.id)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{jp.title}</div>
                        {jp.company && (
                          <div className="text-sm text-gray-600">{jp.company}</div>
                        )}
                        <div className="text-sm text-gray-600">{jp.location}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>求人が見つかりません</p>
                      <p className="text-sm mt-1">他の検索条件をお試しください</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Match Analysis */}
          {selectedJobSeeker && selectedJobPosting && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                マッチング分析
              </h4>
              
              <div className="space-y-2">
                {/* Skills Match */}
                <div>
                  <span className="text-sm font-medium text-gray-700">スキルマッチ:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedJobPosting.requiredSkills?.map(skill => {
                      const hasSkill = selectedJobSeeker.skills?.some(s => s.name === skill)
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-1 text-xs rounded-full ${
                            hasSkill
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {skill}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Location Match */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">勤務地:</span>
                  <span className="text-gray-600">
                    {selectedJobPosting.location}
                    {selectedJobSeeker.desiredLocation?.includes(selectedJobPosting.location) && (
                      <span className="ml-2 text-green-600">✓ 希望勤務地と一致</span>
                    )}
                  </span>
                </div>

                {/* Salary Match */}
                {selectedJobPosting.salary && selectedJobSeeker.desiredSalary && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">給与:</span>
                    <span className="text-gray-600">
                      求人: ¥{selectedJobPosting.salary.min}万 - 
                      ¥{selectedJobPosting.salary.max}万
                      {selectedJobSeeker.desiredSalary.min <= selectedJobPosting.salary.max &&
                       selectedJobSeeker.desiredSalary.max >= selectedJobPosting.salary.min && (
                        <span className="ml-2 text-green-600">✓ 希望給与範囲内</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推薦メモ（任意）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="なぜこの候補者がこの求人にマッチするのか、特筆すべき点などを記入してください"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedJobSeekerId || !selectedJobPostingId}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedJobSeekerId && selectedJobPostingId
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              推薦する
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}