'use client'

interface Applicant {
  id: number
  name: string
  position: string
  status: 'pending' | 'confirmed' | 'cancelled'
  availableDates: Array<{
    date: string
    timeSlots: string[]
  }>
}

interface ApplicantListProps {
  applicants: Applicant[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function ApplicantList({ applicants, selectedId, onSelect }: ApplicantListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
            調整中
          </span>
        )
      case 'confirmed':
        return (
          <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
            確定済
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
            キャンセル
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 space-y-2">
      {applicants.map((applicant) => (
        <div
          key={applicant.id}
          onClick={() => onSelect(applicant.id)}
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedId === applicant.id
              ? 'bg-blue-50 border-2 border-blue-500'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
              <p className="text-sm text-gray-600">{applicant.position}</p>
            </div>
            {getStatusBadge(applicant.status)}
          </div>
          <div className="text-xs text-gray-500">
            希望日程: {applicant.availableDates.length}件
          </div>
        </div>
      ))}
    </div>
  )
}