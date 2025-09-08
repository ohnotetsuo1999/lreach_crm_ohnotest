export const applicantsData = [
  {
    id: 1,
    name: '田中 太郎',
    email: 'tanaka@example.com',
    phone: '080-1234-5678',
    position: 'フロントエンドエンジニア',
    experience: '5年',
    status: 'pending' as const,
    availableDates: [
      { date: '2025年1月20日（月）', timeSlots: ['13:00', '14:00', '15:00', '16:00'] },
      { date: '2025年1月22日（水）', timeSlots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'] },
      { date: '2025年1月24日（金）', timeSlots: ['10:00', '11:00', '12:00'] }
    ],
    profile: `## 経歴概要
- 大手IT企業でフロントエンドエンジニアとして5年間勤務
- React、TypeScript、Next.jsを使用した大規模プロジェクトの経験あり
- チームリーダーとして3名のメンバーをマネジメント

## スキルセット
### フロントエンド
- **React**: 5年
- **TypeScript**: 4年  
- **Next.js**: 3年
- **Vue.js**: 2年

### バックエンド
- Node.js: 3年
- Express: 2年

## 希望条件
- **希望年収**: 600-800万円
- **勤務形態**: フルリモート希望
- **その他**: 技術的なチャレンジができる環境を希望`
  },
  {
    id: 2,
    name: '鈴木 花子',
    email: 'suzuki@example.com',
    phone: '090-9876-5432',
    position: 'バックエンドエンジニア',
    experience: '7年',
    status: 'confirmed' as const,
    availableDates: [
      { date: '2025年1月21日（火）', timeSlots: ['13:00', '14:00', '15:00', '16:00', '17:00'] },
      { date: '2025年1月23日（木）', timeSlots: ['9:00', '10:00', '11:00'] }
    ],
    profile: `## 経歴概要
- SaaS企業でバックエンドエンジニアとして7年間の経験
- マイクロサービスアーキテクチャの設計・実装
- インフラ構築からアプリケーション開発まで幅広く対応

## スキルセット
### バックエンド
- **Go**: 5年
- **Python**: 7年
- **Node.js**: 3年

### インフラ
- AWS: 5年
- Docker/Kubernetes: 4年
- Terraform: 3年

## 希望条件
- **希望年収**: 700-900万円
- **勤務形態**: ハイブリッド（週2-3日出社可）
- **その他**: 技術選定に関われるポジションを希望`
  },
  {
    id: 3,
    name: '佐藤 次郎',
    email: 'sato@example.com',
    phone: '070-1111-2222',
    position: 'フルスタックエンジニア',
    experience: '4年',
    status: 'pending' as const,
    availableDates: [
      { date: '2025年1月25日（土）', timeSlots: ['9:00', '10:00', '11:00'] },
      { date: '2025年1月27日（月）', timeSlots: ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
      { date: '2025年1月28日（火）', timeSlots: ['13:00', '14:00', '15:00', '16:00'] }
    ],
    profile: `## 経歴概要
- スタートアップ企業でフルスタックエンジニアとして4年間勤務
- プロダクトの立ち上げから運用まで一貫して担当
- アジャイル開発の経験豊富

## スキルセット
### フロントエンド
- React: 4年
- Vue.js: 2年
- TypeScript: 3年

### バックエンド
- Ruby on Rails: 4年
- Node.js: 2年
- PostgreSQL: 4年

## 希望条件
- **希望年収**: 500-650万円
- **勤務形態**: フルリモート希望
- **その他**: スタートアップで新規事業に携わりたい`
  }
]