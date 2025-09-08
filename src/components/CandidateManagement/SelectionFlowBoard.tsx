import React, { useState, useEffect } from 'react';
import { ChevronRight, User, FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  kana: string;
  age: number;
  location: string;
  appliedCompany: string;
  currentStage: string;
  registeredDate: string;
  lastUpdated: string;
  daysInStage: number;
  priority: 'high' | 'medium' | 'low';
}

interface Stage {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  candidates: Candidate[];
}

const SelectionFlowBoard: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filterCompany, setFilterCompany] = useState('all');
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    // モックデータを設定
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        name: '山田 郁希',
        kana: 'やまだ ゆうき',
        age: 27,
        location: '大阪',
        appliedCompany: '株式会社オープンハウス・アーキテクト',
        currentStage: 'documentReview',
        registeredDate: '2025-07-11',
        lastUpdated: '2025-07-16',
        daysInStage: 5,
        priority: 'high'
      },
      {
        id: '2',
        name: '田畑 心將',
        kana: 'たばた きよと',
        age: 23,
        location: '東京',
        appliedCompany: '株式会社コプロコンストラクション',
        currentStage: 'initial',
        registeredDate: '2025-07-09',
        lastUpdated: '2025-07-09',
        daysInStage: 2,
        priority: 'medium'
      },
      {
        id: '3',
        name: '猪又 光次',
        kana: 'いのまた みつひで',
        age: 27,
        location: '東京',
        appliedCompany: '株式会社ワールドコーポレーション',
        currentStage: 'scheduling',
        registeredDate: '2025-07-09',
        lastUpdated: '2025-07-15',
        daysInStage: 3,
        priority: 'high'
      },
      {
        id: '4',
        name: '佐藤 美咲',
        kana: 'さとう みさき',
        age: 25,
        location: '神奈川',
        appliedCompany: '株式会社リレーション',
        currentStage: 'firstInterview',
        registeredDate: '2025-07-05',
        lastUpdated: '2025-07-18',
        daysInStage: 2,
        priority: 'high'
      },
      {
        id: '5',
        name: '鈴木 太郎',
        kana: 'すずき たろう',
        age: 30,
        location: '千葉',
        appliedCompany: '株式会社ワット・コンサルティング',
        currentStage: 'finalInterview',
        registeredDate: '2025-07-01',
        lastUpdated: '2025-07-20',
        daysInStage: 1,
        priority: 'high'
      },
      {
        id: '6',
        name: '高橋 花子',
        kana: 'たかはし はなこ',
        age: 28,
        location: '埼玉',
        appliedCompany: '株式会社ハウスプロデュース',
        currentStage: 'offer',
        registeredDate: '2025-06-28',
        lastUpdated: '2025-07-21',
        daysInStage: 1,
        priority: 'high'
      },
      {
        id: '7',
        name: '伊藤 健太',
        kana: 'いとう けんた',
        age: 26,
        location: '大阪',
        appliedCompany: '株式会社オープンハウス・アーキテクト',
        currentStage: 'rejected',
        registeredDate: '2025-07-08',
        lastUpdated: '2025-07-19',
        daysInStage: 2,
        priority: 'low'
      }
    ];

    // 企業リストを抽出
    const uniqueCompanies = Array.from(new Set(mockCandidates.map(c => c.appliedCompany)));
    setCompanies(uniqueCompanies);

    // ステージごとに候補者を振り分け
    const stageData: Stage[] = [
      {
        id: 'initial',
        name: '初期登録',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: <User className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'documentReview',
        name: '書類選考',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <FileText className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'scheduling',
        name: '日程調整',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <Calendar className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'firstInterview',
        name: '一次面接',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: <Clock className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'finalInterview',
        name: '最終面接',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100',
        icon: <AlertCircle className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'offer',
        name: '内定',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />,
        candidates: []
      },
      {
        id: 'rejected',
        name: '不採用/辞退',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-4 h-4" />,
        candidates: []
      }
    ];

    // 候補者を各ステージに振り分け
    mockCandidates.forEach(candidate => {
      const stage = stageData.find(s => s.id === candidate.currentStage);
      if (stage) {
        stage.candidates.push(candidate);
      }
    });

    setStages(stageData);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-400 bg-red-50';
      case 'medium':
        return 'border-yellow-400 bg-yellow-50';
      case 'low':
        return 'border-gray-300 bg-white';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getDaysColor = (days: number) => {
    if (days > 7) return 'text-red-600 font-semibold';
    if (days > 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    e.dataTransfer.setData('candidateId', candidate.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    
    setStages(prevStages => {
      const newStages = prevStages.map(stage => ({ ...stage, candidates: [...stage.candidates] }));
      let candidateToMove: Candidate | undefined;
      
      // 候補者を探して削除
      for (const stage of newStages) {
        const candidateIndex = stage.candidates.findIndex(c => c.id === candidateId);
        if (candidateIndex !== -1) {
          candidateToMove = stage.candidates[candidateIndex];
          stage.candidates.splice(candidateIndex, 1);
          break;
        }
      }
      
      // 新しいステージに追加
      if (candidateToMove) {
        const targetStage = newStages.find(s => s.id === targetStageId);
        if (targetStage) {
          targetStage.candidates.push({
            ...candidateToMove,
            currentStage: targetStageId,
            lastUpdated: new Date().toISOString().split('T')[0],
            daysInStage: 0
          });
        }
      }
      
      return newStages;
    });
  };

  const filteredStages = stages.map(stage => ({
    ...stage,
    candidates: filterCompany === 'all' 
      ? stage.candidates 
      : stage.candidates.filter(c => c.appliedCompany === filterCompany)
  }));

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">選考フロー管理</h1>
            <p className="mt-1 text-sm text-gray-600">候補者の選考状況をステージごとに管理</p>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">企業でフィルター:</label>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              >
                <option value="all">すべての企業</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
              
              <div className="ml-auto flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span>高優先度</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>中優先度</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>低優先度</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {filteredStages.map((stage) => (
            <div 
              key={stage.id} 
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="bg-white rounded-lg shadow-sm">
                <div className={`p-4 ${stage.bgColor} border-b border-gray-200 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={stage.color}>{stage.icon}</span>
                      <h3 className={`font-semibold ${stage.color}`}>{stage.name}</h3>
                    </div>
                    <span className={`text-sm font-medium ${stage.color}`}>
                      {stage.candidates.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-2 max-h-[600px] overflow-y-auto">
                  <div className="space-y-2">
                    {stage.candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        className={`p-3 border-2 rounded-lg cursor-move hover:shadow-md transition-shadow ${getPriorityColor(candidate.priority)}`}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-xs text-gray-500">{candidate.kana}</div>
                          </div>
                          <div className={`text-xs ${getDaysColor(candidate.daysInStage)}`}>
                            {candidate.daysInStage}日経過
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">年齢:</span>
                            <span>{candidate.age}歳</span>
                            <span className="mx-1">•</span>
                            <span>{candidate.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">応募:</span>
                            <span className="truncate">{candidate.appliedCompany}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">更新:</span>
                            <span>{new Date(candidate.lastUpdated).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {stage.candidates.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      <div className="mb-2">候補者なし</div>
                      <div className="text-xs">ドラッグ&ドロップで候補者を移動</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">全候補者数</div>
            <div className="text-2xl font-bold text-gray-900">
              {stages.reduce((sum, stage) => sum + stage.candidates.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">選考中</div>
            <div className="text-2xl font-bold text-blue-600">
              {stages
                .filter(s => !['offer', 'rejected'].includes(s.id))
                .reduce((sum, stage) => sum + stage.candidates.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">内定者数</div>
            <div className="text-2xl font-bold text-green-600">
              {stages.find(s => s.id === 'offer')?.candidates.length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600 mb-1">対応必要</div>
            <div className="text-2xl font-bold text-red-600">
              {stages.reduce((sum, stage) => 
                sum + stage.candidates.filter(c => c.priority === 'high').length, 0
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 候補者詳細モーダル */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">候補者詳細</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">氏名</label>
                  <p className="text-gray-900">{selectedCandidate.name}</p>
                  <p className="text-sm text-gray-500">{selectedCandidate.kana}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">年齢/勤務地</label>
                  <p className="text-gray-900">{selectedCandidate.age}歳 / {selectedCandidate.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">応募企業</label>
                  <p className="text-gray-900">{selectedCandidate.appliedCompany}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">現在のステージ</label>
                  <p className="text-gray-900">
                    {stages.find(s => s.id === selectedCandidate.currentStage)?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">登録日</label>
                  <p className="text-gray-900">
                    {new Date(selectedCandidate.registeredDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">最終更新</label>
                  <p className="text-gray-900">
                    {new Date(selectedCandidate.lastUpdated).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  詳細を見る
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  メッセージを送る
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  ステータスを更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionFlowBoard;