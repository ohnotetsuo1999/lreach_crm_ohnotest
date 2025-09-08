'use client'

import React, { useState, useEffect } from 'react'
import { XCircle, History, User, Calendar, FileText, Layers, ListChecks, Info, Plus } from 'lucide-react'

interface SelectionStage {
  id: string
  name: string
  order: number
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'withdrawn'
  date?: Date | null
  assignee?: string
  notes?: string
}

interface Action {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assignee?: string
  notes?: string
}

interface Selection {
  id: string
  candidateId?: string
  jobPostingId?: string
  jobTitle?: string
  companyName?: string
  status: 'active' | 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'on-hold'
  applicationDate: Date
  currentStage: string
  stages: SelectionStage[]
  actions?: Action[]
  nextAction?: string
  nextActionDate?: Date
  nextActionAssignee?: string
  notes?: string
  jobPosting?: {
    title: string
    company: {
      name: string
    }
    salary?: string
    location?: string
  }
}

interface Candidate {
  id: string
  name: string
  email?: string
  phone?: string
  location?: string
  currentTitle?: string
  currentCompany?: string
  desiredSalary?: string
  availability?: string
  experience?: number
  assignee?: string
}

interface HistoryEntry {
  id: string
  timestamp: Date
  user: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  description: string
}

interface SelectionDetailEditModalProps {
  isOpen: boolean
  onClose: () => void
  selection: Selection | null
  candidate: Candidate | null
  onSave?: (selection: Selection, actions: Action[]) => void
  history?: HistoryEntry[]
}

export function SelectionDetailEditModal({ 
  isOpen, 
  onClose, 
  selection, 
  candidate,
  onSave,
  history = []
}: SelectionDetailEditModalProps) {
  const [editingSelection, setEditingSelection] = useState<Selection | null>(null)
  const [editingActions, setEditingActions] = useState<Action[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'stages' | 'actions' | 'history'>('info')
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (selection) {
      setEditingSelection(selection)
      setEditingActions(selection.actions || [])
      // Initialize with mock history or provided history
      setLocalHistory(history.length > 0 ? history : getMockHistory())
    }
  }, [selection, history])

  // Mock history data for demonstration
  const getMockHistory = (): HistoryEntry[] => {
    const now = new Date()
    return [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        user: '山田 太郎',
        action: 'ステータス変更',
        field: 'status',
        oldValue: '書類選考',
        newValue: '一次面接',
        description: '書類選考を通過し、一次面接へ進みました'
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        user: '佐藤 花子',
        action: 'アクション追加',
        description: '面接日程調整のアクションを追加しました'
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        user: '田中 真由美',
        action: 'メモ更新',
        field: 'notes',
        description: '候補者の強みと懸念点についてメモを追加しました'
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        user: '山田 太郎',
        action: 'ステージ完了',
        field: 'stage',
        oldValue: '実施中',
        newValue: '合格',
        description: '一次面接が合格となりました'
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        user: '鈴木 一郎',
        action: '担当者変更',
        field: 'assignee',
        oldValue: '山田 太郎',
        newValue: '佐藤 花子',
        description: '二次面接の担当者を変更しました'
      },
      {
        id: '6',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        user: '佐藤 花子',
        action: 'アクション完了',
        description: '「面接フィードバック送信」を完了しました'
      },
      {
        id: '7',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        user: '田中 真由美',
        action: '日程更新',
        field: 'date',
        oldValue: '2024-01-20',
        newValue: '2024-01-25',
        description: '最終面接の日程を変更しました'
      },
      {
        id: '8',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        user: '山田 太郎',
        action: 'ステータス変更',
        field: 'status',
        oldValue: '選考中',
        newValue: 'オファー中',
        description: 'オファーレターを送付しました'
      }
    ]
  }

  // Add new history entry when changes are made
  const addHistoryEntry = (action: string, field?: string, oldValue?: string, newValue?: string, description?: string) => {
    const newEntry: HistoryEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date(),
      user: '現在のユーザー', // In real app, get from auth context
      action,
      field,
      oldValue,
      newValue,
      description: description || `${action}を実行しました`
    }
    setLocalHistory([newEntry, ...localHistory])
  }

  if (!isOpen || !selection || !candidate) return null

  const handleAddAction = () => {
    const newAction: Action = {
      id: `new-action-${Date.now()}`,
      title: '',
      status: 'pending',
      dueDate: undefined,
      assignee: '',
      notes: ''
    }
    setEditingActions([...editingActions, newAction])
  }

  const handleUpdateAction = (actionId: string, field: keyof Action, value: any) => {
    setEditingActions(editingActions.map(action => 
      action.id === actionId ? { ...action, [field]: value } : action
    ))
  }

  const handleDeleteAction = (actionId: string) => {
    setEditingActions(editingActions.filter(action => action.id !== actionId))
  }

  const handleSave = () => {
    if (onSave && editingSelection) {
      onSave(editingSelection, editingActions)
    } else {
      console.log('保存するアクション:', editingActions)
      alert('保存しました（デモ）')
    }
    onClose()
  }

  const jobTitle = editingSelection?.jobTitle || editingSelection?.jobPosting?.title || ''
  const companyName = editingSelection?.companyName || editingSelection?.jobPosting?.company?.name || ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">選考詳細編集</h2>
            <p className="text-sm text-gray-600 mt-1">
              {candidate.name} - {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <Info className="w-4 h-4" />
            基本情報
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'stages' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('stages')}
          >
            <Layers className="w-4 h-4" />
            選考ステージ
            {editingSelection?.stages && editingSelection.stages.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {editingSelection.stages.length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'actions' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('actions')}
          >
            <ListChecks className="w-4 h-4" />
            アクション管理
            {editingActions.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {editingActions.length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4" />
            編集履歴
            {localHistory.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                {localHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <>
            {/* 基本情報 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">基本情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">求職者</label>
                  <p className="text-sm text-gray-900">{candidate.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">求人</label>
                  <p className="text-sm text-gray-900">{jobTitle}</p>
                  <p className="text-xs text-gray-600">{companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                  <select 
                    value={editingSelection?.status || 'active'}
                    onChange={(e) => {
                      if (editingSelection) {
                        setEditingSelection({
                          ...editingSelection,
                          status: e.target.value as Selection['status']
                        })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">選考中</option>
                    <option value="offered">オファー中</option>
                    <option value="accepted">内定承諾</option>
                    <option value="rejected">不採用</option>
                    <option value="withdrawn">辞退</option>
                    <option value="on-hold">保留</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">応募日</label>
                  <input
                    type="date"
                    value={editingSelection?.applicationDate ? new Date(editingSelection.applicationDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (editingSelection && e.target.value) {
                        setEditingSelection({
                          ...editingSelection,
                          applicationDate: new Date(e.target.value)
                        })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* メモ */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">メモ</h3>
              <textarea
                value={editingSelection?.notes || ''}
                onChange={(e) => {
                  if (editingSelection) {
                    setEditingSelection({
                      ...editingSelection,
                      notes: e.target.value
                    })
                  }
                }}
                placeholder="選考に関するメモを入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
          </>
        )}

        {activeTab === 'stages' && (
          <>
            {/* 選考ステージ */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">選考ステージ</h3>
              <div className="space-y-3">
            {editingSelection?.stages.map((stage) => (
              <div key={stage.id} className="border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">ステージ</label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => {
                        if (editingSelection) {
                          const updatedStages = editingSelection.stages.map(s =>
                            s.id === stage.id ? { ...s, name: e.target.value } : s
                          )
                          setEditingSelection({ ...editingSelection, stages: updatedStages })
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">状態</label>
                    <select 
                      value={stage.status}
                      onChange={(e) => {
                        if (editingSelection) {
                          const updatedStages = editingSelection.stages.map(s =>
                            s.id === stage.id ? { ...s, status: e.target.value as SelectionStage['status'] } : s
                          )
                          setEditingSelection({ ...editingSelection, stages: updatedStages })
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">未実施</option>
                      <option value="in-progress">実施中</option>
                      <option value="passed">合格</option>
                      <option value="failed">不合格</option>
                      <option value="withdrawn">辞退</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">日付</label>
                    <input
                      type="date"
                      value={stage.date ? new Date(stage.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (editingSelection) {
                          const updatedStages = editingSelection.stages.map(s =>
                            s.id === stage.id ? { ...s, date: e.target.value ? new Date(e.target.value) : null } : s
                          )
                          setEditingSelection({ ...editingSelection, stages: updatedStages })
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">担当者</label>
                    <input
                      type="text"
                      value={stage.assignee || ''}
                      onChange={(e) => {
                        if (editingSelection) {
                          const updatedStages = editingSelection.stages.map(s =>
                            s.id === stage.id ? { ...s, assignee: e.target.value } : s
                          )
                          setEditingSelection({ ...editingSelection, stages: updatedStages })
                        }
                      }}
                      placeholder="担当者名"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={stage.notes || ''}
                    onChange={(e) => {
                      if (editingSelection) {
                        const updatedStages = editingSelection.stages.map(s =>
                          s.id === stage.id ? { ...s, notes: e.target.value } : s
                        )
                        setEditingSelection({ ...editingSelection, stages: updatedStages })
                      }
                    }}
                    placeholder="メモを入力"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                if (editingSelection) {
                  const newStage: SelectionStage = {
                    id: `stage-${Date.now()}`,
                    name: '',
                    order: editingSelection.stages.length + 1,
                    status: 'pending',
                    date: null,
                    assignee: '',
                    notes: ''
                  }
                  setEditingSelection({
                    ...editingSelection,
                    stages: [...editingSelection.stages, newStage]
                  })
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              ステージを追加
            </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'actions' && (
          <>
            {/* アクション管理 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">アクション管理</h3>
          <div className="space-y-3">
            {editingActions.map((action) => (
              <div key={action.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => handleDeleteAction(action.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">アクション</label>
                    <input
                      type="text"
                      value={action.title}
                      onChange={(e) => handleUpdateAction(action.id, 'title', e.target.value)}
                      placeholder="例: 二次面接実施"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">状態</label>
                    <select 
                      value={action.status}
                      onChange={(e) => handleUpdateAction(action.id, 'status', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">未着手</option>
                      <option value="in-progress">進行中</option>
                      <option value="completed">完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">期限</label>
                    <input
                      type="date"
                      value={action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleUpdateAction(action.id, 'dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">担当者</label>
                    <select
                      value={action.assignee || ''}
                      onChange={(e) => handleUpdateAction(action.id, 'assignee', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">選択してください</option>
                      <optgroup label="関係者">
                        <option value="self">自分</option>
                        <option value="candidate">{candidate?.name || '求職者'}</option>
                        <option value="company">{companyName || '企業'}</option>
                      </optgroup>
                      <optgroup label="チームメンバー">
                        <option value="member-sato">佐藤 花子</option>
                        <option value="member-tanaka">田中 真由美</option>
                        <option value="member-suzuki">鈴木 一郎</option>
                        <option value="member-yamada">山田 太郎</option>
                      </optgroup>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">メモ</label>
                  <textarea
                    value={action.notes || ''}
                    onChange={(e) => handleUpdateAction(action.id, 'notes', e.target.value)}
                    placeholder="アクションに関するメモ"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            {editingActions.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                アクションがありません
              </div>
            )}
            <button 
              onClick={handleAddAction}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              アクションを追加
            </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          /* History Tab */
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <History className="w-5 h-5" />
                変更履歴
              </h3>
              
              {localHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">履歴がありません</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {localHistory.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{entry.user}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                          {entry.action}
                        </span>
                      </div>
                      
                      <div className="ml-10">
                        <p className="text-sm text-gray-700 mb-1">{entry.description}</p>
                        
                        {entry.oldValue && entry.newValue && (
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded">
                              {entry.oldValue}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                              {entry.newValue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Export/Filter Options */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">すべての変更</option>
                  <option value="status">ステータス変更</option>
                  <option value="stage">ステージ変更</option>
                  <option value="action">アクション変更</option>
                  <option value="note">メモ変更</option>
                </select>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="開始日"
                />
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="終了日"
                />
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                履歴をエクスポート
              </button>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}