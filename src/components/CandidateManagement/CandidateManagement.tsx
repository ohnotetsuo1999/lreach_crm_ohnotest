import React, { useState } from 'react';
import CandidateList from './CandidateList';
import SelectionFlowBoard from './SelectionFlowBoard';
import { Users, GitBranch, BarChart3, Settings } from 'lucide-react';

type ViewType = 'list' | 'flow' | 'analytics' | 'settings';

const CandidateManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');

  const navigationItems = [
    { id: 'list', label: '候補者一覧', icon: Users },
    { id: 'flow', label: '選考フロー', icon: GitBranch },
    { id: 'analytics', label: '分析', icon: BarChart3 },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return <CandidateList />;
      case 'flow':
        return <SelectionFlowBoard />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CandidateList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">候補者管理システム</h1>
            </div>
            <div className="flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      <main>{renderContent()}</main>
    </div>
  );
};

const AnalyticsView: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">採用分析ダッシュボード</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="応募者総数" value="156" change="+12%" positive />
            <StatCard title="選考通過率" value="42%" change="+5%" positive />
            <StatCard title="平均選考日数" value="18日" change="-3日" positive />
            <StatCard title="内定承諾率" value="75%" change="-2%" positive={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月別応募者推移</h3>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12" />
                <span className="ml-2">グラフ表示エリア</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">選考ステージ別分布</h3>
              <div className="space-y-3">
                <ProgressBar label="書類選考" value={35} total={156} color="blue" />
                <ProgressBar label="一次面接" value={28} total={156} color="purple" />
                <ProgressBar label="最終面接" value={15} total={156} color="indigo" />
                <ProgressBar label="内定" value={8} total={156} color="green" />
                <ProgressBar label="不採用/辞退" value={70} total={156} color="red" />
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">企業別採用状況</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">企業名</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">応募者数</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">選考中</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">内定</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">採用率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-4 text-sm">株式会社オープンハウス・アーキテクト</td>
                    <td className="text-center py-2 px-4 text-sm">24</td>
                    <td className="text-center py-2 px-4 text-sm">8</td>
                    <td className="text-center py-2 px-4 text-sm">3</td>
                    <td className="text-center py-2 px-4 text-sm">12.5%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-4 text-sm">株式会社コプロコンストラクション</td>
                    <td className="text-center py-2 px-4 text-sm">18</td>
                    <td className="text-center py-2 px-4 text-sm">5</td>
                    <td className="text-center py-2 px-4 text-sm">2</td>
                    <td className="text-center py-2 px-4 text-sm">11.1%</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-4 text-sm">株式会社ワールドコーポレーション</td>
                    <td className="text-center py-2 px-4 text-sm">21</td>
                    <td className="text-center py-2 px-4 text-sm">7</td>
                    <td className="text-center py-2 px-4 text-sm">2</td>
                    <td className="text-center py-2 px-4 text-sm">9.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">設定</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm text-gray-700">新規応募者の通知</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" defaultChecked />
                  <span className="text-sm text-gray-700">ステータス更新の通知</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm text-gray-700">日次レポートの送信</span>
                </label>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス管理</h3>
              <p className="text-sm text-gray-600 mb-3">選考ステージのカスタマイズ</p>
              <div className="space-y-2">
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="初期登録" />
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="書類選考" />
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="一次面接" />
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="最終面接" />
                <button className="text-sm text-blue-600 hover:text-blue-800">+ ステージを追加</button>
              </div>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">データ管理</h3>
              <div className="space-y-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  CSVエクスポート
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ml-3">
                  CSVインポート
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, positive }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
    </div>
  );
};

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
  const percentage = (value / total) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600">{value}人 ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CandidateManagement;
export { CandidateManagement };