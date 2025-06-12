'use client'

import { useState } from 'react'
import { ScenarioActionRule, Tag, Status, Pack, PackWithTemplates, Template } from '@/types'
import { ActionRuleGroupDisplay } from '../ActionRules/ActionRuleGroupDisplay'
import { Zap, Package, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

interface ScenarioActionRulesSummaryProps {
  packs: Pack[]
  actionRules: ScenarioActionRule[]
  tags: Tag[]
  statuses: Status[]
  onDeleteRule?: (ruleId: string) => void
}

export function ScenarioActionRulesSummary({
  packs,
  actionRules,
  tags,
  statuses,
  onDeleteRule
}: ScenarioActionRulesSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (actionRules.length === 0) {
    return null
  }

  // シナリオレベル、Pack、Templateのルールを分類
  const scenarioRules = actionRules.filter(rule => !rule.packTemplateId || rule.packTemplateId === 'scenario')
  const packRules = actionRules.filter(rule => rule.packTemplateId && !rule.packTemplateId.includes('-'))
  const templateRules = actionRules.filter(rule => rule.packTemplateId && rule.packTemplateId.includes('-'))

  // Pack別でグループ化
  const packGroups = packs.map(pack => {
    const packWithTemplates = pack as PackWithTemplates
    return {
      pack,
      packRules: packRules.filter(rule => rule.packTemplateId === pack.id),
      templateRules: templateRules.filter(rule => 
        packWithTemplates.templates?.some((template: Template) => rule.packTemplateId === `${pack.id}-${template.id}`)
      )
    }
  }).filter(group => group.packRules.length > 0 || group.templateRules.length > 0)

  // 競合や重複の検出
  const getConflicts = () => {
    const conflicts: string[] = []
    
    // 同じボタンに対する複数のルール
    const buttonRules = actionRules.filter(rule => rule.actionType === 'BUTTON_CLICK')
    const buttonGroups = buttonRules.reduce((groups, rule) => {
      const key = rule.actionCondition.value
      if (!groups[key]) groups[key] = []
      groups[key].push(rule)
      return groups
    }, {} as { [key: string]: ScenarioActionRule[] })

    Object.entries(buttonGroups).forEach(([buttonText, rules]) => {
      if (rules.length > 1) {
        const differentActions = new Set(rules.flatMap(r => r.tagActions.map(a => `${a.type}:${a.tagId || a.statusId}`)))
        if (differentActions.size > 1) {
          conflicts.push(`「${buttonText}」ボタンに異なるアクションが${rules.length}件設定されています`)
        }
      }
    })

    return conflicts
  }

  const conflicts = getConflicts()

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="text-base font-medium text-gray-900">
              シナリオのアクションルール
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {actionRules.length}件
            </span>
            {conflicts.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                {conflicts.length}件の注意
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* サマリー（折りたたみ時） */}
      {!isExpanded && (
        <div className="px-4 py-3 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {scenarioRules.length > 0 && (
              <span>シナリオ全体: {scenarioRules.length}件</span>
            )}
            {packGroups.length > 0 && (
              <span>Pack別: {packGroups.length}個のPackに設定</span>
            )}
            {templateRules.length > 0 && (
              <span>テンプレート別: {templateRules.length}件</span>
            )}
          </div>
          {conflicts.length > 0 && (
            <div className="mt-2 text-yellow-700 text-xs">
              ⚠️ {conflicts.length}件の競合があります
            </div>
          )}
        </div>
      )}

      {/* 詳細表示 */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {/* 競合警告 */}
          {conflicts.length > 0 && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  アクションルールの競合が検出されました
                </span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {conflict}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* シナリオレベルのルール */}
          {scenarioRules.length > 0 && (
            <div className="p-4">
              <ActionRuleGroupDisplay
                rules={scenarioRules}
                tags={tags}
                statuses={statuses}
                title="シナリオ全体のルール"
                context="scenario"
                onDeleteRule={onDeleteRule}
                showContext={true}
              />
            </div>
          )}

          {/* Pack別のルール */}
          {packGroups.map((group) => (
            <div key={group.pack.id} className="p-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    Pack {group.pack.order}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({group.packRules.length + group.templateRules.length}件のルール)
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Pack共通ルール */}
                  {group.packRules.length > 0 && (
                    <ActionRuleGroupDisplay
                      rules={group.packRules}
                      tags={tags}
                      statuses={statuses}
                      title="Pack共通ルール"
                      context="pack"
                      onDeleteRule={onDeleteRule}
                      showContext={false}
                    />
                  )}

                  {/* テンプレート別ルール */}
                  {group.templateRules.length > 0 && (
                    <div>
                      {(group.pack as PackWithTemplates).templates?.map((template: Template) => {
                        const templateSpecificRules = group.templateRules.filter(
                          rule => rule.packTemplateId === `${group.pack.id}-${template.id}`
                        )
                        
                        if (templateSpecificRules.length === 0) return null

                        return (
                          <div key={template.id} className="ml-4 mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-3 h-3 text-purple-500" />
                              <span className="text-sm font-medium text-gray-800">
                                テンプレート {template.order}
                              </span>
                            </div>
                            <ActionRuleGroupDisplay
                              rules={templateSpecificRules}
                              tags={tags}
                              statuses={statuses}
                              title="テンプレート専用ルール"
                              context="template"
                              onDeleteRule={onDeleteRule}
                              showContext={false}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}