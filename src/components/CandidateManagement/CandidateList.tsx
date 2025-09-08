import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, MessageSquare, Calendar, Building2, CheckCircle, XCircle, Clock, AlertCircle, Link, User, Plus, Bell, Settings, PlusCircle, FileText, Users, Video, MapPin, MoreVertical, X, ChevronRight, ArrowRight } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  kana: string;
  age: number;
  status: string;
  salary: string;
  location: string;
  profile: string;
  insight: string;
  recommendReason: string;
  availableTime: string;
  license: string;
  resume: string;
  cv: string;
  appliedCompanies: Company[];
  slackUrl: string;
  registeredDate: string;
  lastUpdated: string;
  nextAction: string;
  taskOwner: string;
  taskStatus: string;
}

interface Company {
  id?: string;
  name: string;
  documentPassed: boolean | null;
  contactedCandidate: boolean;
  candidateReply: boolean;
  scheduleCandidates: string;
  interviewDate: string;
  interviewTime?: string;
  interviewType?: 'online' | 'offline';
  meetingUrl?: string;
  nextInterview: string;
  result: string;
  notes: string;
  nextAction?: string;
  actionOwner?: 'candidate' | 'company' | 'us';
  actionDeadline?: string;
  actionAssignee?: string;
  reminder?: {
    enabled: boolean;
    date?: string;
    message?: string;
  };
  dayBeforeReminder?: boolean;
  currentStage?: 'document' | 'test' | 'first' | 'second' | 'final' | 'offer';
  history?: {
    date: string;
    stage: string;
    status: string;
    note?: string;
  }[];
}

interface CompanySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  candidateName: string;
  onUpdate: (updatedCompany: Company) => void;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ isOpen, onClose, company, candidateName, onUpdate }) => {
  const [editedCompany, setEditedCompany] = useState<Company | null>(company);
  const [activeTab, setActiveTab] = useState<'status' | 'action' | 'schedule' | 'timeline'>('status');

  useEffect(() => {
    setEditedCompany(company);
  }, [company]);

  if (!company || !editedCompany) return null;

  const handleStageChange = (stage: Company['currentStage']) => {
    const updated = { ...editedCompany, currentStage: stage };
    setEditedCompany(updated);
    onUpdate(updated);
  };

  const handleResultChange = (result: string) => {
    const updated = { ...editedCompany, result };
    setEditedCompany(updated);
    onUpdate(updated);
  };

  const handleActionUpdate = () => {
    onUpdate(editedCompany);
  };

  // 次のステージを推奨
  const getNextStage = (currentStage?: string): Company['currentStage'] | null => {
    switch (currentStage) {
      case 'document': return 'test';
      case 'test': return 'first';
      case 'first': return 'second';
      case 'second': return 'final';
      case 'final': return 'offer';
      default: return null;
    }
  };

  const nextStage = getNextStage(editedCompany.currentStage);

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* サイドバー */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">選考管理</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">{candidateName}</p>
            <p className="text-sm font-medium text-gray-900">{company.name}</p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              activeTab === 'status' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ステータス
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              activeTab === 'action' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            アクション
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              activeTab === 'schedule' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            日程
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              activeTab === 'timeline' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            タイムライン
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* 現在のステージ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">現在のステージ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['document', 'test', 'first', 'second', 'final', 'offer'] as const).map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        editedCompany.currentStage === stage
                          ? getStageBadgeStyle(stage).replace('text-white', 'text-white bg-opacity-100')
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {getStageLabel(stage)}
                    </button>
                  ))}
                </div>
              </div>

              {/* クイック結果入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">選考結果</label>
                <div className="space-y-2">
                  {editedCompany.currentStage && editedCompany.currentStage !== 'offer' && (
                    <button
                      onClick={() => {
                        if (nextStage) {
                          handleStageChange(nextStage);
                          setEditedCompany({ ...editedCompany, currentStage: nextStage, result: '' });
                        }
                      }}
                      className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center justify-between group"
                    >
                      <span className="font-medium">通過 → {nextStage && getStageLabel(nextStage)}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleResultChange('不採用')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        editedCompany.result === '不採用'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      不採用
                    </button>
                    <button
                      onClick={() => handleResultChange('辞退')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        editedCompany.result === '辞退'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      辞退
                    </button>
                  </div>
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                <textarea
                  value={editedCompany.notes || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, notes: e.target.value })}
                  onBlur={handleActionUpdate}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="面接の感想など..."
                />
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-6">
              {/* ネクストアクション */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ネクストアクション</label>
                <textarea
                  value={editedCompany.nextAction || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, nextAction: e.target.value })}
                  onBlur={handleActionUpdate}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 面接日程の調整"
                />
              </div>

              {/* 期限設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">期限</label>
                <input
                  type="datetime-local"
                  value={editedCompany.actionDeadline || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, actionDeadline: e.target.value })}
                  onBlur={handleActionUpdate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {editedCompany.actionDeadline && (
                  <div className="mt-1 text-xs text-gray-500">
                    期限: {new Date(editedCompany.actionDeadline).toLocaleString('ja-JP')}
                  </div>
                )}
              </div>

              {/* 担当者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">担当者</label>
                <input
                  type="text"
                  value={editedCompany.actionAssignee || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, actionAssignee: e.target.value })}
                  onBlur={handleActionUpdate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 田中太郎"
                />
              </div>

              {/* アクション責任者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">責任者</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['candidate', 'company', 'us'] as const).map((owner) => (
                    <button
                      key={owner}
                      onClick={() => {
                        setEditedCompany({ ...editedCompany, actionOwner: owner });
                        handleActionUpdate();
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        editedCompany.actionOwner === owner
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {owner === 'candidate' ? '👤 候補者' : owner === 'company' ? '🏢 企業' : '🏠 弊社'}
                    </button>
                  ))}
                </div>
              </div>

              {/* アクションリマインダー */}
              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedCompany.reminder?.enabled || false}
                    onChange={(e) => {
                      setEditedCompany({
                        ...editedCompany,
                        reminder: {
                          ...editedCompany.reminder,
                          enabled: e.target.checked
                        }
                      });
                      handleActionUpdate();
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">リマインダーを設定</span>
                </label>
                
                {editedCompany.reminder?.enabled && (
                  <div className="mt-3 space-y-3">
                    <input
                      type="datetime-local"
                      value={editedCompany.reminder?.date || ''}
                      onChange={(e) => {
                        setEditedCompany({
                          ...editedCompany,
                          reminder: {
                            ...editedCompany.reminder,
                            enabled: true,
                            date: e.target.value
                          }
                        });
                        handleActionUpdate();
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editedCompany.reminder?.message || ''}
                      onChange={(e) => {
                        setEditedCompany({
                          ...editedCompany,
                          reminder: {
                            ...editedCompany.reminder,
                            enabled: true,
                            message: e.target.value
                          }
                        });
                      }}
                      onBlur={handleActionUpdate}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="リマインドメッセージ..."
                    />
                  </div>
                )}
              </div>

              {/* 推奨アクション */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">推奨アクション</label>
                <div className="space-y-2">
                  {editedCompany.currentStage === 'document' && (
                    <>
                      <button
                        onClick={() => {
                          setEditedCompany({ 
                            ...editedCompany, 
                            nextAction: '書類選考結果待ち',
                            actionOwner: 'company'
                          });
                          handleActionUpdate();
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="text-sm font-medium">書類選考結果待ち</div>
                        <div className="text-xs text-gray-500">企業からの回答を待つ</div>
                      </button>
                      <button
                        onClick={() => {
                          setEditedCompany({ 
                            ...editedCompany, 
                            nextAction: '書類再提出依頼',
                            actionOwner: 'candidate'
                          });
                          handleActionUpdate();
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="text-sm font-medium">書類再提出依頼</div>
                        <div className="text-xs text-gray-500">候補者に追加書類を依頼</div>
                      </button>
                    </>
                  )}
                  {(editedCompany.currentStage === 'first' || editedCompany.currentStage === 'second' || editedCompany.currentStage === 'final') && (
                    <>
                      <button
                        onClick={() => {
                          setEditedCompany({ 
                            ...editedCompany, 
                            nextAction: '面接日程調整',
                            actionOwner: 'us'
                          });
                          handleActionUpdate();
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="text-sm font-medium">面接日程調整</div>
                        <div className="text-xs text-gray-500">候補者と企業の日程を調整</div>
                      </button>
                      <button
                        onClick={() => {
                          setEditedCompany({ 
                            ...editedCompany, 
                            nextAction: '面接準備',
                            actionOwner: 'candidate'
                          });
                          handleActionUpdate();
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="text-sm font-medium">面接準備</div>
                        <div className="text-xs text-gray-500">候補者に面接対策を実施</div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* 面接日時 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">面接日</label>
                <input
                  type="date"
                  value={editedCompany.interviewDate || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, interviewDate: e.target.value })}
                  onBlur={handleActionUpdate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">面接時間</label>
                <input
                  type="time"
                  value={editedCompany.interviewTime || ''}
                  onChange={(e) => setEditedCompany({ ...editedCompany, interviewTime: e.target.value })}
                  onBlur={handleActionUpdate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 面接形式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">面接形式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEditedCompany({ ...editedCompany, interviewType: 'online' });
                      handleActionUpdate();
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      editedCompany.interviewType === 'online'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🎥 オンライン
                  </button>
                  <button
                    onClick={() => {
                      setEditedCompany({ ...editedCompany, interviewType: 'offline' });
                      handleActionUpdate();
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      editedCompany.interviewType === 'offline'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📍 対面
                  </button>
                </div>
              </div>

              {/* オンラインURL */}
              {editedCompany.interviewType === 'online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MTG URL</label>
                  <input
                    type="url"
                    value={editedCompany.meetingUrl || ''}
                    onChange={(e) => setEditedCompany({ ...editedCompany, meetingUrl: e.target.value })}
                    onBlur={handleActionUpdate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://zoom.us/j/..."
                  />
                  {editedCompany.meetingUrl && (
                    <a
                      href={editedCompany.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Link className="w-3 h-3" />
                      URLを開く
                    </a>
                  )}
                </div>
              )}

              {/* 前日リマインド */}
              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedCompany.dayBeforeReminder || false}
                    onChange={(e) => {
                      setEditedCompany({ ...editedCompany, dayBeforeReminder: e.target.checked });
                      handleActionUpdate();
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">前日リマインド</span>
                </label>
                {editedCompany.dayBeforeReminder && editedCompany.interviewDate && (
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    {new Date(editedCompany.interviewDate + 'T00:00:00').getTime() - 24 * 60 * 60 * 1000 > 0 && (
                      <>
                        📅 {new Date(new Date(editedCompany.interviewDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')} にリマインドを送信します
                        {editedCompany.interviewTime && ` (面接: ${editedCompany.interviewTime})`}
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">選考タイムライン</div>
              
              {/* タイムライン */}
              <div className="relative">
                {/* 縦線 */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                {/* タイムラインアイテム */}
                <div className="space-y-4">
                  {editedCompany.history && editedCompany.history.length > 0 ? (
                    editedCompany.history.map((entry, idx) => (
                      <div key={idx} className="relative flex items-start">
                        {/* 点 */}
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${
                          entry.status === '通過' ? 'bg-green-500' :
                          entry.status === '不採用' ? 'bg-red-500' :
                          entry.status === '辞退' ? 'bg-gray-500' :
                          'bg-blue-500'
                        }`}></div>
                        
                        {/* コンテンツ */}
                        <div className="ml-8 bg-white rounded-lg border border-gray-200 p-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(entry.date).toLocaleDateString('ja-JP')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${getStageBadgeStyle(entry.stage as Company['currentStage'])}`}>
                                {getStageLabel(entry.stage as Company['currentStage'])}
                              </span>
                              {entry.status && (
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  entry.status === '通過' ? 'bg-green-100 text-green-700' :
                                  entry.status === '不採用' ? 'bg-red-100 text-red-700' :
                                  entry.status === '辞退' ? 'bg-gray-100 text-gray-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {entry.status}
                                </span>
                              )}
                            </div>
                          </div>
                          {entry.note && (
                            <div className="text-sm text-gray-600">{entry.note}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* 仮データ */
                    <>
                      <div className="relative flex items-start">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white bg-blue-500"></div>
                        <div className="ml-8 bg-white rounded-lg border border-gray-200 p-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date().toLocaleDateString('ja-JP')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-500 text-white">
                                書類
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                                応募
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">応募書類を提出しました</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                        <div className="ml-8 bg-white rounded-lg border border-gray-200 p-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-500 text-white">
                                書類
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                                通過
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">書類選考を通過しました。一次面接の日程調整中です。</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white bg-yellow-500"></div>
                        <div className="ml-8 bg-white rounded-lg border border-gray-200 p-3 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-500 text-white">
                                1次
                              </span>
                              <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">
                                予定
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">一次面接が予定されています</div>
                          <div className="text-xs text-gray-500 mt-1">14:00 - オンライン</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* アクション追加 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  + イベントを追加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ステージラベルを取得する関数
const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'document': return '書類';
    case 'test': return 'テスト';
    case 'first': return '1次';
    case 'second': return '2次';
    case 'final': return '最終';
    case 'offer': return '内定';
    default: return '未設定';
  }
};

// ステージに応じたバッジのスタイルを取得
const getStageBadgeStyle = (stage?: string) => {
  switch (stage) {
    case 'document': return 'bg-gray-500 text-white';
    case 'test': return 'bg-yellow-500 text-white';
    case 'first': return 'bg-blue-500 text-white';
    case 'second': return 'bg-indigo-500 text-white';
    case 'final': return 'bg-purple-500 text-white';
    case 'offer': return 'bg-green-500 text-white';
    default: return 'bg-gray-300 text-gray-600';
  }
};

const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCompany, setSelectedCompany] = useState<{company: Company, candidateName: string, candidateId: string} | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    // モックデータを設定
    const mockData: Candidate[] = [
      {
        id: '1',
        name: '山田 郁希',
        kana: 'やまだ ゆうき',
        age: 27,
        status: '転職活動中',
        salary: '希望：※貴社規定に従います',
        location: '大阪',
        profile: '現職の販売職で培った「人と話す喜び」を強みとする一方、「数字を追う業務は苦手」と率直に語る誠実な人物。',
        insight: '数字より顧客満足を重視する対人支援志向',
        recommendReason: '顧客対応で磨いたコミュニケーション力と傾聴力は、サポート職やバックオフィス業務で即戦力となる。',
        availableTime: '応相談',
        license: '普通免許',
        resume: '山田 郁希_履歴書.pdf',
        cv: '山田 郁希_職務経歴書.pdf',
        slackUrl: '7月11日17:03',
        registeredDate: '2025-07-11',
        lastUpdated: '2025-07-29',
        nextAction: '書類回収リマインド',
        taskOwner: '完了',
        taskStatus: '結果待ち',
        appliedCompanies: [
          {
            id: '1-1',
            name: '株式会社オープンハウス・アーキテクト',
            documentPassed: null,
            contactedCandidate: false,
            candidateReply: false,
            scheduleCandidates: '',
            interviewDate: '',
            nextInterview: '',
            result: '',
            notes: '',
            nextAction: '書類選考結果待ち',
            actionOwner: 'company',
            currentStage: 'document'
          },
          {
            id: '1-2',
            name: '株式会社コプロコンストラクション',
            documentPassed: true,
            contactedCandidate: false,
            candidateReply: false,
            scheduleCandidates: '',
            interviewDate: '2025-08-05',
            interviewTime: '14:00',
            interviewType: 'online',
            meetingUrl: 'https://zoom.us/j/123456789',
            nextInterview: '',
            result: '',
            notes: '2025/07/16 書類通過',
            nextAction: '一次面接実施',
            actionOwner: 'us',
            actionDeadline: '2025-08-05T14:00',
            actionAssignee: '田中太郎',
            currentStage: 'first',
            dayBeforeReminder: true,
            reminder: {
              enabled: true,
              date: '2025-08-04T10:00',
              message: '明日14:00からZoom面接です。URLを確認してください。'
            },
            history: [
              {
                date: '2025-07-10',
                stage: 'document',
                status: '応募',
                note: '書類提出完了'
              },
              {
                date: '2025-07-16',
                stage: 'document',
                status: '通過',
                note: '書類選考通過、一次面接へ'
              }
            ]
          },
          {
            id: '1-3',
            name: '株式会社ハウスプロデュース',
            documentPassed: false,
            contactedCandidate: true,
            candidateReply: true,
            scheduleCandidates: '',
            interviewDate: '',
            nextInterview: '',
            result: '不採用',
            notes: '経験不足のため',
            nextAction: '',
            actionOwner: 'us',
            currentStage: 'document'
          },
          {
            id: '1-4',
            name: '株式会社ワット・コンサルティング',
            documentPassed: true,
            contactedCandidate: true,
            candidateReply: true,
            scheduleCandidates: '',
            interviewDate: '2025-08-10',
            interviewTime: '11:00',
            interviewType: 'offline',
            nextInterview: '',
            result: '',
            notes: '',
            nextAction: '最終面接実施',
            actionOwner: 'candidate',
            actionDeadline: '2025-08-10T11:00',
            actionAssignee: '山田候補者',
            currentStage: 'final',
            history: [
              {
                date: '2025-07-05',
                stage: 'document',
                status: '応募',
                note: '書類提出'
              },
              {
                date: '2025-07-12',
                stage: 'document',
                status: '通過',
                note: '書類選考通過'
              },
              {
                date: '2025-07-20',
                stage: 'first',
                status: '通過',
                note: '一次面接通過、高評価'
              },
              {
                date: '2025-07-28',
                stage: 'second',
                status: '通過',
                note: '二次面接通過、最終面接へ'
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: '田畑 心將',
        kana: 'たばた きよと',
        age: 23,
        status: '転職活動中',
        salary: '希望：※貴社規定に従います',
        location: '東京',
        profile: 'デザイン職での2年間の経験を持ち海外での多様な労働環境を通じて柔軟性や適応力を培ってきました。',
        insight: '人間関係や社内の雰囲気を重視し、離職率の低い会社を希望',
        recommendReason: '人と関わる仕事への意欲が高くこれまでのデザイン職で培った観察力や課題解決力を営業職に活かせる方です。',
        availableTime: '応相談',
        license: '普通自動車免許1種、普通自動車免許2種',
        resume: '田畑 心將_履歴書.pdf',
        cv: '田畑 心將_職務経歴書.pdf',
        slackUrl: '7月9日21:05',
        registeredDate: '2025-07-09',
        lastUpdated: '2025-07-09',
        nextAction: 'foresma',
        taskOwner: '',
        taskStatus: '推薦企業選定',
        appliedCompanies: []
      },
      {
        id: '3',
        name: '猪又光次',
        kana: 'いのまた みつひで',
        age: 27,
        status: '転職活動中',
        salary: '希望：※貴社規定に従います',
        location: '東京',
        profile: '銀座で3年間パーソナルトレーナーとして顧客の目標達成を支援しリピート率7割を維持した20代後半の人物です。',
        insight: '夜間に週3〜4時間の指導を継続しながら昼間は営業職で年収1,000万円を狙う',
        recommendReason: '丁寧なヒアリングと成果志向の提案力そして時間管理の巧みさが電話越しにも伝わり受け答えは簡潔で筋が通っていた。',
        availableTime: '応相談',
        license: '',
        resume: '',
        cv: '',
        slackUrl: '7月9日 20:37',
        registeredDate: '2025-07-09',
        lastUpdated: '2025-07-09',
        nextAction: '',
        taskOwner: '',
        taskStatus: '初期登録',
        appliedCompanies: [
          {
            id: '3-1',
            name: '株式会社マーケットエンタープライズ',
            documentPassed: true,
            contactedCandidate: true,
            candidateReply: true,
            scheduleCandidates: '2025/07/31',
            interviewDate: '2025/07/31',
            interviewTime: '15:00',
            interviewType: 'offline',
            nextInterview: '',
            result: '',
            notes: '',
            nextAction: '適性検査実施',
            actionOwner: 'candidate',
            currentStage: 'test'
          }
        ]
      }
    ];
    setCandidates(mockData);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '書類選考':
        return 'bg-blue-100 text-blue-800';
      case '日程回収':
        return 'bg-yellow-100 text-yellow-800';
      case '面接予定':
        return 'bg-purple-100 text-purple-800';
      case '結果待ち':
        return 'bg-orange-100 text-orange-800';
      case '内定':
        return 'bg-green-100 text-green-800';
      case '不採用':
        return 'bg-red-100 text-red-800';
      case '辞退':
        return 'bg-gray-100 text-gray-800';
      case '推薦企業選定':
        return 'bg-indigo-100 text-indigo-800';
      case '初期登録':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionOwnerIcon = (owner?: string) => {
    switch (owner) {
      case 'candidate':
        return '👤';
      case 'company':
        return '🏢';
      case 'us':
        return '🏠';
      default:
        return '';
    }
  };

  const handleCompanyUpdate = (updatedCompany: Company) => {
    if (!selectedCompany) return;
    
    setCandidates(prev => {
      return prev.map(candidate => {
        if (candidate.id === selectedCompany.candidateId) {
          return {
            ...candidate,
            appliedCompanies: candidate.appliedCompanies.map(company => {
              if (company.id === selectedCompany.company.id) {
                return updatedCompany;
              }
              return company;
            })
          };
        }
        return candidate;
      });
    });
  };

  const handleCompanyClick = (company: Company, candidateName: string, candidateId: string) => {
    setSelectedCompany({ company, candidateName, candidateId });
    setShowSidebar(true);
  };

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.kana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' || candidate.taskStatus === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'age':
          compareValue = a.age - b.age;
          break;
        case 'lastUpdated':
          compareValue = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        case 'status':
          compareValue = a.taskStatus.localeCompare(b.taskStatus);
          break;
        default:
          compareValue = 0;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">候補者管理</h1>
            <p className="mt-1 text-sm text-gray-600">候補者の情報と選考状況を管理</p>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="候補者名、かな、勤務地で検索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">すべてのステータス</option>
                  <option value="初期登録">初期登録</option>
                  <option value="推薦企業選定">推薦企業選定</option>
                  <option value="書類選考">書類選考</option>
                  <option value="日程回収">日程回収</option>
                  <option value="面接予定">面接予定</option>
                  <option value="結果待ち">結果待ち</option>
                  <option value="内定">内定</option>
                  <option value="不採用">不採用</option>
                  <option value="辞退">辞退</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="lastUpdated">更新日順</option>
                  <option value="name">氏名順</option>
                  <option value="age">年齢順</option>
                  <option value="status">ステータス順</option>
                </select>
                
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '昇順' : '降順'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1400px]">
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center px-6 py-3">
                  <div className="w-64 text-xs font-medium text-gray-500 uppercase tracking-wider">候補者</div>
                  <div className="w-32 text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</div>
                  <div className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">応募企業</div>
                  <div className="w-32 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">操作</div>
                </div>
              </div>

              <div className="bg-white divide-y divide-gray-200">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-start px-6 py-4 hover:bg-gray-50">
                    {/* 候補者情報 */}
                    <div className="w-64 pr-4">
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-xs text-gray-500">{candidate.kana}</div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>{candidate.age}歳 / {candidate.location}</div>
                        <div className="text-xs text-gray-500">
                          更新: {new Date(candidate.lastUpdated).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>

                    {/* ステータス */}
                    <div className="w-32 pr-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(candidate.taskStatus)}`}>
                        {candidate.taskStatus || '未設定'}
                      </span>
                      {candidate.nextAction && (
                        <div className="mt-2 text-xs text-gray-500">
                          {candidate.nextAction}
                        </div>
                      )}
                    </div>

                    {/* 応募企業 - シンプルなカード形式 */}
                    <div className="flex-1 overflow-x-auto">
                      {candidate.appliedCompanies.length > 0 ? (
                        <div className="flex gap-2 pb-2">
                          {candidate.appliedCompanies.map((company, idx) => (
                            <div 
                              key={idx} 
                              className="group relative flex-shrink-0 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 p-2 min-w-[200px] cursor-pointer transition-all"
                              onClick={() => handleCompanyClick(company, candidate.name, candidate.id)}
                            >
                              {/* 結果がある場合は結果を大きく表示 */}
                              {company.result ? (
                                <div className="text-center py-2">
                                  <div className="text-xs text-gray-600 mb-1 truncate" title={company.name}>
                                    {company.name}
                                  </div>
                                  <div className={`text-lg font-bold ${
                                    company.result === '内定' ? 'text-green-600' :
                                    company.result === '不採用' ? 'text-red-600' :
                                    company.result === '辞退' ? 'text-gray-600' :
                                    'text-orange-600'
                                  }`}>
                                    {company.result}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* 企業名とステージ */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 mr-2">
                                      <div className="text-xs font-medium text-gray-900 truncate" title={company.name}>
                                        {company.name}
                                      </div>
                                    </div>
                                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${getStageBadgeStyle(company.currentStage)}`}>
                                      {getStageLabel(company.currentStage)}
                                    </span>
                                  </div>

                                  {/* ネクストアクションまたは面接情報 */}
                                  {company.interviewDate ? (
                                    <div className="flex items-center gap-1 text-xs text-gray-700 mb-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(company.interviewDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}</span>
                                      {company.interviewTime && <span>{company.interviewTime}</span>}
                                      {company.interviewType === 'online' && <span>🎥</span>}
                                    </div>
                                  ) : company.nextAction ? (
                                    <div className="text-xs text-gray-600">
                                      <span className="mr-1">{getActionOwnerIcon(company.actionOwner)}</span>
                                      <span className="truncate">{company.nextAction}</span>
                                    </div>
                                  ) : null}

                                  {/* オンラインURL */}
                                  {company.meetingUrl && (
                                    <a
                                      href={company.meetingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Link className="w-3 h-3" />
                                      URL
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">応募企業なし</div>
                      )}
                    </div>

                    {/* 操作ボタン */}
                    <div className="w-32 flex items-center justify-center gap-2">
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="詳細を見る"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="メッセージ"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* スライドサイドバー */}
      <CompanySidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        company={selectedCompany?.company || null}
        candidateName={selectedCompany?.candidateName || ''}
        onUpdate={handleCompanyUpdate}
      />
    </div>
  );
};

export default CandidateList;