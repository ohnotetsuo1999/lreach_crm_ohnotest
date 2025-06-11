'use client'

import { useState } from 'react'
import { TimelineEditor } from './TimelineEditor'
import { PackDrawer } from './PackDrawer'
import { ScenarioActionRulesSummary } from './ScenarioActionRulesSummary'
import { Scenario, Pack, Template, TriggerType, ActionRule, Tag, Status } from '@/types'
import { Save, Play, ArrowLeft } from 'lucide-react'

interface ScenarioEditorProps {
  scenario: Scenario | null
  onSave: (scenario: Scenario) => void
  onBack: () => void
  onAddTemplate: (packId: string) => void
  onEditTemplate: (template: Template) => void
  onDeleteTemplate: (templateId: string) => void
  onPreviewScenario: (scenario: Scenario) => void
  onReorderTemplates: (packId: string, templates: Template[]) => void
  actionRules?: ActionRule[]
  tags?: Tag[]
  statuses?: Status[]
  onCreateActionRule?: (rule: Omit<ActionRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateActionRule?: (ruleId: string, rule: Partial<ActionRule>) => void
  onDeleteActionRule?: (ruleId: string) => void
  templates?: Template[]
  onCreateTemplate?: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ScenarioEditor({
  scenario,
  onSave,
  onBack,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onPreviewScenario,
  onReorderTemplates,
  actionRules = [],
  tags = [],
  statuses = [],
  onCreateActionRule,
  onUpdateActionRule,
  onDeleteActionRule,
  templates = [],
  onCreateTemplate
}: ScenarioEditorProps) {
  const [scenarioData, setScenarioData] = useState<Scenario>(
    scenario || {
      id: '',
      campaignId: '',
      name: '',
      trigger: 'MANUAL',
      triggerValue: '',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      packs: []
    }
  )
  
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)
  const [isPackDrawerOpen, setIsPackDrawerOpen] = useState(false)

  const triggerOptions: { value: TriggerType, label: string, description: string }[] = [
    { 
      value: 'MANUAL', 
      label: '手動実行', 
      description: '管理者が手動で実行するシナリオ' 
    },
    { 
      value: 'SCHEDULE', 
      label: 'スケジュール', 
      description: '指定した日時に自動実行' 
    },
    { 
      value: 'USER_ACTION', 
      label: 'ユーザーアクション', 
      description: 'ユーザーの特定の行動をトリガーとする' 
    },
    { 
      value: 'TAG_ADDED', 
      label: 'タグ追加', 
      description: '特定のタグが追加された際に実行' 
    },
    { 
      value: 'STATUS_CHANGED', 
      label: 'ステータス変更', 
      description: 'ユーザーのステータスが変更された際に実行' 
    },
    { 
      value: 'TIME_BASED', 
      label: '時間ベース', 
      description: '定期的に条件をチェックして実行' 
    }
  ]

  const handleSaveScenario = () => {
    if (!scenarioData.name.trim()) {
      alert('シナリオ名を入力してください')
      return
    }

    if (scenarioData.packs.length === 0) {
      alert('少なくとも1つのPackを作成してください')
      return
    }

    onSave({
      ...scenarioData,
      updatedAt: new Date()
    })
  }

  const handleAddPack = () => {
    const newPack: Pack = {
      id: `pack_${Date.now()}`,
      scenarioId: scenarioData.id,
      order: scenarioData.packs.length + 1,
      offsetMinutes: 0,
      createdAt: new Date(),
      templates: []
    }

    setScenarioData({
      ...scenarioData,
      packs: [...scenarioData.packs, newPack]
    })

    setSelectedPack(newPack)
    setIsPackDrawerOpen(true)
  }

  const handleEditPack = (pack: Pack) => {
    setSelectedPack(pack)
    setIsPackDrawerOpen(true)
  }

  const handleDeletePack = (packId: string) => {
    const updatedPacks = scenarioData.packs
      .filter(pack => pack.id !== packId)
      .map((pack, index) => ({
        ...pack,
        order: index + 1
      }))

    setScenarioData({
      ...scenarioData,
      packs: updatedPacks
    })
  }

  const handleUpdatePacks = (packs: Pack[]) => {
    setScenarioData({
      ...scenarioData,
      packs
    })
  }

  const handleSavePack = (updatedPack: Pack) => {
    const updatedPacks = scenarioData.packs.map(pack =>
      pack.id === updatedPack.id ? updatedPack : pack
    )

    setScenarioData({
      ...scenarioData,
      packs: updatedPacks
    })
  }

  const getTriggerValuePlaceholder = (trigger: TriggerType) => {
    switch (trigger) {
      case 'SCHEDULE':
        return '例: 2024-12-25 09:00'
      case 'USER_ACTION':
        return '例: click_button, open_message'
      case 'TAG_ADDED':
        return '例: premium, interested'
      case 'STATUS_CHANGED':
        return '例: lead, customer'
      case 'TIME_BASED':
        return '例: daily, weekly, monthly'
      default:
        return ''
    }
  }

  const isComplete = scenarioData.name.trim() && scenarioData.packs.length > 0

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {scenario ? 'シナリオ編集' : '新規シナリオ'}
            </h1>
            <p className="text-sm text-gray-600">
              自動化されたメッセージ配信フローを作成
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onPreviewScenario(scenarioData)}
            disabled={!isComplete}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            プレビュー
          </button>
          
          <button
            onClick={handleSaveScenario}
            disabled={!isComplete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </button>
        </div>
      </div>

      {/* 基本設定 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本設定</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              シナリオ名 *
            </label>
            <input
              type="text"
              value={scenarioData.name}
              onChange={(e) => setScenarioData({ ...scenarioData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 新規登録ウェルカムシリーズ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トリガー種別 *
            </label>
            <select
              value={scenarioData.trigger}
              onChange={(e) => setScenarioData({ 
                ...scenarioData, 
                trigger: e.target.value as TriggerType,
                triggerValue: '' // Reset trigger value when type changes
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {triggerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {triggerOptions.find(opt => opt.value === scenarioData.trigger)?.description}
            </p>
          </div>

          {scenarioData.trigger !== 'MANUAL' && (
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                トリガー値
              </label>
              <input
                type="text"
                value={scenarioData.triggerValue || ''}
                onChange={(e) => setScenarioData({ ...scenarioData, triggerValue: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={getTriggerValuePlaceholder(scenarioData.trigger)}
              />
            </div>
          )}

          <div className="lg:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={scenarioData.isActive}
                onChange={(e) => setScenarioData({ ...scenarioData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                作成後すぐにアクティブにする
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              アクティブなシナリオは条件に応じて自動実行されます
            </p>
          </div>
        </div>
      </div>

      {/* タイムライン */}
      <TimelineEditor
        packs={scenarioData.packs}
        onUpdatePacks={handleUpdatePacks}
        onEditPack={handleEditPack}
        onDeletePack={handleDeletePack}
        onAddPack={handleAddPack}
        onPreviewScenario={() => onPreviewScenario(scenarioData)}
        actionRules={actionRules}
      />

      {/* アクションルールサマリー */}
      {actionRules.length > 0 && (
        <ScenarioActionRulesSummary
          packs={scenarioData.packs}
          actionRules={actionRules}
          tags={tags}
          statuses={statuses}
          onDeleteRule={onDeleteActionRule}
        />
      )}

      {/* Pack設定ドロワー */}
      <PackDrawer
        pack={selectedPack}
        isOpen={isPackDrawerOpen}
        onClose={() => setIsPackDrawerOpen(false)}
        onSave={handleSavePack}
        onAddTemplate={onAddTemplate}
        onEditTemplate={onEditTemplate}
        onDeleteTemplate={onDeleteTemplate}
        onReorderTemplates={onReorderTemplates}
        actionRules={actionRules}
        tags={tags}
        statuses={statuses}
        onCreateActionRule={onCreateActionRule}
        onUpdateActionRule={onUpdateActionRule}
        onDeleteActionRule={onDeleteActionRule}
        availableTemplates={templates || []}
        onCreateTemplate={(template) => {
          // Create new template and add to pack
          const newTemplate = {
            ...template,
            id: `template_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          // Add to global templates list
          if (onCreateTemplate) {
            onCreateTemplate(template)
          }
          
          // Update the pack with new template
          if (selectedPack) {
            const updatedPack = {
              ...selectedPack,
              templates: [...(selectedPack.templates || []), newTemplate]
            }
            handleSavePack(updatedPack)
          }
        }}
      />

      {/* 完了状況 */}
      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">完了するには</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!scenarioData.name.trim() && (
              <li>• シナリオ名を入力してください</li>
            )}
            {scenarioData.packs.length === 0 && (
              <li>• 少なくとも1つのPackを作成してください</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}