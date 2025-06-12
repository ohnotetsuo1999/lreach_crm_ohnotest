'use client'

import { useState, useRef } from 'react'
import { Pack, PackWithTemplates, Template, ActionRule, ScenarioActionRule } from '@/types'
import { Plus, Clock, Move, Edit2, Trash2, Play, Zap, AlertCircle, Calendar } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { TimelineTemplatePreview } from './TimelineTemplatePreview'

interface TimelineEditorProps {
  packs: Pack[]
  onUpdatePacks: (packs: Pack[]) => void
  onEditPack: (pack: Pack) => void
  onDeletePack: (packId: string) => void
  onAddPack: () => void
  onPreviewScenario: () => void
  actionRules?: ScenarioActionRule[]
}

export function TimelineEditor({
  packs,
  onUpdatePacks,
  onEditPack,
  onDeletePack,
  onAddPack,
  onPreviewScenario,
  actionRules = []
}: TimelineEditorProps) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(packs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order values
    const updatedPacks = items.map((pack, index) => ({
      ...pack,
      order: index + 1
    }))

    onUpdatePacks(updatedPacks)
  }

  const getTotalDuration = () => {
    return packs.filter(pack => pack.packType !== 'reminder').reduce((total, pack) => total + pack.offsetMinutes, 0)
  }

  const getPackPosition = (packIndex: number) => {
    const previousPacks = packs.slice(0, packIndex).filter(pack => pack.packType !== 'reminder')
    return previousPacks.reduce((total, pack) => total + pack.offsetMinutes, 0)
  }

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'すぐに'
    if (minutes < 60) return `${minutes}分後`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}時間${minutes % 60 ? `${minutes % 60}分` : ''}後`
    return `${Math.floor(minutes / 1440)}日${Math.floor((minutes % 1440) / 60) ? `${Math.floor((minutes % 1440) / 60)}時間` : ''}後`
  }

  const getPackActionRules = (packId: string) => {
    return actionRules.filter(rule => rule.packTemplateId === packId || rule.packTemplateId.startsWith(`${packId}-`))
  }

  const getReminderDisplay = (pack: Pack) => {
    if (pack.packType !== 'reminder' || !pack.reminderSettings) return null
    
    const settings = pack.reminderSettings
    let baseText = ''
    
    switch (settings.targetType) {
      case 'manual':
        baseText = settings.targetDate && settings.targetTime
          ? `${settings.targetDate} ${settings.targetTime}`
          : '指定日時'
        break
      case 'reservation':
        baseText = settings.reservationField 
          ? `予約（${settings.reservationField}）`
          : '予約日時'
        break
      case 'user_field':
        baseText = settings.userField
          ? `ユーザー項目（${settings.userField}）`
          : 'ユーザー指定日時'
        break
      default:
        baseText = '指定日時'
    }
    
    const hours = Math.floor(Math.abs(settings.offsetMinutes) / 60)
    const mins = Math.abs(settings.offsetMinutes) % 60
    let offsetText = ''
    
    if (hours === 0) {
      offsetText = `${mins}分`
    } else if (mins === 0) {
      offsetText = `${hours}時間`
    } else {
      offsetText = `${hours}時間${mins}分`
    }
    
    return `${baseText}の${offsetText}${settings.offsetType === 'before' ? '前' : '後'}`
  }


  const getPackTypeColor = (pack: Pack) => {
    if (pack.packType === 'reminder') {
      return 'bg-orange-100 text-orange-800'
    }
    return 'bg-blue-100 text-blue-800'
  }


  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">タイムライン</h3>
            <p className="text-sm text-gray-600">
              {packs.length}個のPack（通常: {packs.filter(p => p.packType !== 'reminder').length}件、リマインダー: {packs.filter(p => p.packType === 'reminder').length}件）・総実行時間: {formatDuration(getTotalDuration())}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onPreviewScenario}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Play className="w-4 h-4 mr-2" />
              プレビュー
            </button>
            
            <button
              onClick={onAddPack}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Pack追加
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {packs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              Packが作成されていません
            </div>
            <button
              onClick={onAddPack}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              最初のPackを作成
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="packs">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {/* タイムライン開始点 */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full" />
                    <div className="ml-4 text-sm font-medium text-gray-900">
                      シナリオ開始
                    </div>
                  </div>

                  {packs.map((pack, index) => {
                    const position = getPackPosition(index)
                    
                    return (
                      <Draggable key={pack.id} draggableId={pack.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            {/* タイミング表示 */}
                            {pack.packType === 'reminder' ? (
                              <div className="flex items-center mb-2">
                                <div className="flex-shrink-0 w-px h-8 bg-orange-300 ml-2" />
                                <div className="ml-4 flex items-center text-sm text-orange-600">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  リマインダー実行
                                </div>
                              </div>
                            ) : pack.offsetMinutes > 0 && (
                              <div className="flex items-center mb-2">
                                <div className="flex-shrink-0 w-px h-8 bg-gray-300 ml-2" />
                                <div className="ml-4 flex items-center text-sm text-gray-500">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {formatDuration(pack.offsetMinutes)}待機
                                </div>
                              </div>
                            )}

                            {/* Pack カード */}
                            <div
                              className={`relative bg-white border rounded-lg p-4 ${
                                selectedPack === pack.id
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedPack(
                                selectedPack === pack.id ? null : pack.id
                              )}
                            >
                              {/* ドラッグハンドル */}
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <Move className="w-4 h-4" />
                              </div>

                              <div className="flex items-start justify-between pr-8">
                                <div className="flex items-center space-x-3">
                                  <div className={`flex-shrink-0 w-8 h-8 ${getPackTypeColor(pack)} rounded-full flex items-center justify-center text-sm font-medium`}>
                                    {pack.packType === 'reminder' ? (
                                      <AlertCircle className="w-4 h-4" />
                                    ) : (
                                      pack.order
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {pack.packType === 'reminder' ? `リマインダーPack ${pack.order}` : `Pack ${pack.order}`}
                                      </h4>
                                      {pack.packType === 'reminder' && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          イベント連動
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                                      <span>{(pack as PackWithTemplates).templates?.length || 0}件のメッセージ</span>
                                      {getPackActionRules(pack.id).length > 0 && (
                                        <span className="inline-flex items-center text-xs text-orange-600">
                                          <Zap className="w-3 h-3 mr-1" />
                                          {getPackActionRules(pack.id).length}ルール
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEditPack(pack)
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm('このPackを削除しますか？')) {
                                        onDeletePack(pack.id)
                                      }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* 詳細情報（展開時） */}
                              {selectedPack === pack.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  {pack.packType === 'reminder' ? (
                                    <div className="grid grid-cols-1 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">実行タイミング:</span>
                                        <span className="ml-2 font-medium text-orange-700">
                                          {getReminderDisplay(pack) || 'リマインダー設定'}
                                        </span>
                                      </div>
                                      {pack.reminderSettings?.description && (
                                        <div>
                                          <span className="text-gray-500">説明:</span>
                                          <span className="ml-2 font-medium">
                                            {pack.reminderSettings.description}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">実行タイミング:</span>
                                        <span className="ml-2 font-medium">
                                          {position === 0 ? 'すぐに' : formatDuration(position)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">待機時間:</span>
                                        <span className="ml-2 font-medium">
                                          {pack.offsetMinutes === 0 ? 'なし' : formatDuration(pack.offsetMinutes)}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {pack.conditionJson && (
                                    <div className="mt-2">
                                      <span className="text-gray-500 text-sm">条件:</span>
                                      <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                                        条件付き実行
                                      </span>
                                    </div>
                                  )}

                                  {(pack as PackWithTemplates).templates && (pack as PackWithTemplates).templates.length > 0 && (
                                    <div className="mt-3">
                                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                                        メッセージテンプレート ({(pack as PackWithTemplates).templates.length}件)
                                      </h5>
                                      <div className="space-y-3">
                                        {(pack as PackWithTemplates).templates.slice(0, 2).map((template: Template) => (
                                          <TimelineTemplatePreview
                                            key={template.id}
                                            template={template}
                                            actionRules={actionRules}
                                            isExpanded={true}
                                          />
                                        ))}
                                        {(pack as PackWithTemplates).templates.slice(2, 5).map((template: Template) => (
                                          <TimelineTemplatePreview
                                            key={template.id}
                                            template={template}
                                            actionRules={actionRules}
                                            isExpanded={false}
                                          />
                                        ))}
                                        {(pack as PackWithTemplates).templates.length > 5 && (
                                          <div className="text-sm text-gray-500 bg-gray-50 rounded p-2 text-center">
                                            他{(pack as PackWithTemplates).templates.length - 5}件のテンプレート...
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  })}

                  {provided.placeholder}

                  {/* タイムライン終了点 */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-4 h-4 bg-gray-400 rounded-full" />
                    <div className="ml-4 text-sm font-medium text-gray-500">
                      シナリオ完了
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}