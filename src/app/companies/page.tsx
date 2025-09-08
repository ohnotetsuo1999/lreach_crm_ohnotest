'use client'

import { useState } from 'react'
import { CompanyList } from '@/components/CRM/CompanyManagement/CompanyList'
import { CompanyDetail } from '@/components/CRM/CompanyManagement/CompanyDetail'
import { mockCompanies } from '@/data/mockCompanies'
import { mockJobPostingsData } from '@/data/mockJobPostings'
import { Company } from '@/types'

export default function CompaniesPage() {
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setView('detail')
  }

  const handleEditCompany = (company: Company) => {
    // 編集モーダルを開く処理
    alert(`企業「${company.name}」の編集画面を開きます（デモ）`)
  }

  const handleCreateCompany = () => {
    // 新規企業作成処理
    console.log('新規企業作成')
  }

  const handleCreateJobPosting = () => {
    // 新規求人作成処理
    alert(`企業「${selectedCompany?.name}」の新規求人を作成します（デモ）`)
  }

  const handleBack = () => {
    setView('list')
    setSelectedCompany(null)
  }

  if (view === 'detail' && selectedCompany) {
    // 選択された企業の求人を取得
    const companyJobPostings = mockJobPostingsData.filter(
      jp => jp.companyId === selectedCompany.id
    )

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CompanyDetail
            company={selectedCompany}
            jobPostings={companyJobPostings}
            onBack={handleBack}
            onEdit={() => handleEditCompany(selectedCompany)}
            onCreateJobPosting={handleCreateJobPosting}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyList
          companies={mockCompanies}
          onCreateCompany={handleCreateCompany}
          onEditCompany={handleEditCompany}
          onViewCompany={handleViewCompany}
        />
      </div>
    </div>
  )
}