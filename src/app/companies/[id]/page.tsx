'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CompanyDetail } from '@/components/CRM/CompanyManagement/CompanyDetail';
import { mockCompanies } from '@/data/mockCompanies';
import { mockJobPostingsData } from '@/data/mockJobPostings';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const company = mockCompanies.find(c => c.id === companyId);
  const companyJobPostings = mockJobPostingsData.filter(jp => jp.companyId === companyId);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">企業が見つかりません</h2>
          <p className="text-gray-600 mb-4">指定された企業は存在しません。</p>
          <button
            onClick={() => router.push('/companies')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            企業一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/companies');
  };

  const handleEdit = () => {
    alert(`企業「${company.name}」の編集画面を開きます（デモ）`);
  };

  const handleCreateJobPosting = () => {
    alert(`企業「${company.name}」の新規求人を作成します（デモ）`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CompanyDetail
          company={company}
          jobPostings={companyJobPostings}
          onBack={handleBack}
          onEdit={handleEdit}
          onCreateJobPosting={handleCreateJobPosting}
        />
      </div>
    </div>
  );
}