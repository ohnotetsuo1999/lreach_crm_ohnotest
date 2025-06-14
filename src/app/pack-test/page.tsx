'use client'

import { useState } from 'react'
import { PackManagement } from '@/components/PackManagement/PackManagement'
import { Pack, Template } from '@/types'

export default function PackTestPage() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [templates] = useState<Template[]>([
    {
      id: 'template_001',
      name: 'ウェルカムメッセージ',
      content: 'こんにちは！友達追加ありがとうございます🎉\n\nお得な情報をお届けします！\n下のボタンを押してサービスをチェック👇',
      type: 'TEXT',
      folderId: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'template_002', 
      name: 'フォローアップメッセージ',
      content: 'まだサービスをご確認いただけていませんか？😊\n\n特別割引をご用意しました！\n今なら30%OFF で体験できます🎁',
      type: 'TEXT',
      folderId: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'template_003',
      name: 'リマインダーメッセージ', 
      content: '最後のご案内です💌\n\nあなたに合ったプランをご提案します！\n個別相談も承っております。お気軽にご連絡ください📞',
      type: 'TEXT',
      folderId: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ])

  const handleCreatePack = (packData: Omit<Pack, 'id' | 'createdAt'>) => {
    const newPack: Pack = {
      ...packData,
      id: `pack_${Date.now()}`,
      createdAt: new Date(),
      scenarioId: 'scenario_test'
    }
    setPacks([...packs, newPack])
  }

  const handleEditPack = (pack: Pack) => {
    // 編集機能は後で実装
    console.log('Edit pack:', pack)
  }

  const handleDeletePack = (packId: string) => {
    setPacks(packs.filter(p => p.id !== packId))
  }

  const handleDuplicatePack = (pack: Pack) => {
    const duplicatedPack: Pack = {
      ...pack,
      id: `pack_${Date.now()}`,
      order: packs.length + 1,
      createdAt: new Date()
    }
    setPacks([...packs, duplicatedPack])
  }

  return (
    <div className="container mx-auto p-6">
      <PackManagement
        packs={packs}
        templates={templates}
        onCreatePack={handleCreatePack}
        onEditPack={handleEditPack}
        onDeletePack={handleDeletePack}
        onDuplicatePack={handleDuplicatePack}
      />
    </div>
  )
}