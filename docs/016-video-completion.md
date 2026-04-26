# Ticket #032: 動画完了マーク機能

## 概要
ユーザーが動画を視聴完了したことをマークし、進捗を記録する機能を実装。

## 担当者
- Frontend Developer
- Backend Developer

## 優先度
**高** - 学習進捗管理の基本機能

## 前提条件
- 動画プレイヤーが実装済み（#023）
- user_progressテーブルが作成済み

## TODO リスト

### Server Actions
- [x] app/api/videos/[videoId]/complete/route.ts作成
  - [x] markVideoComplete (POSTリクエストで実装)
  - [x] markVideoIncomplete (完了状態トグル実装)
  - [ ] updateWatchTime (将来実装)
  - [x] getVideoProgress (ページ内で直接取得)

### 自動完了判定
- [ ] YouTube Player APIとの連携
  - [ ] 再生時間の追跡
  - [ ] 90%以上視聴で自動完了
  - [ ] 再生終了イベントの検知
- [ ] バックグラウンド保存
  - [ ] 30秒ごとの進捗保存
  - [ ] ページ離脱時の保存

### UI実装
- [x] components/features/completion-button.tsx (ページ内に実装)
  - [x] フォーム形式の完了ボタン
  - [x] 「完了」ボタン実装
  - [x] 完了状態の視覚的表示
  - [x] トグル機能実装
- [x] 完了時のフィードバック
  - [x] ページリロードで状態更新
  - [x] 進捗バーの更新
  - [x] サイドバーでの完了表示

### 進捗計算
- [x] lib/utils/progress.ts作成 (各ページで直接実装)
  - [x] calculateCourseProgress
  - [x] calculateSectionProgress
  - [x] getNextUnwatchedVideo
  - [x] getCompletedVideoCount

### データ同期
- [x] Optimistic UI更新
  - [x] フォーム送信でサーバー処理
  - [x] リダイレクトで状態更新
  - [x] エラーハンドリング実装
- [ ] リアルタイム同期 (将来実装)
  - [ ] 複数デバイス間の同期
  - [ ] Supabase Realtimeの活用（オプション）

### 進捗表示統合
- [x] 講座一覧ページ
  - [x] 進捗パーセンテージ表示
  - [x] プログレスバー
- [x] 講座詳細ページ
  - [x] 完了動画数表示
  - [x] セクションごとの進捗
- [x] ダッシュボード
  - [x] 全体の学習進捗

### データ整合性
- [x] 重複完了の防止
- [x] タイムスタンプの管理
  - [x] completed_at
  - [x] updated_at
- [ ] 視聴時間の累積 (将来実装)

## 完了条件
- [x] 動画を完了マークできる
- [x] 進捗が自動的に計算される
- [x] 完了状態が永続化される
- [x] UIに進捗が反映される

## テスト項目
- [ ] 手動で完了マークができる
- [ ] 90%視聴で自動完了される
- [ ] 完了状態が保存される
- [ ] ページリロード後も状態が維持される
- [ ] 進捗が正しく計算される
- [ ] 完了を取り消せる
- [ ] 複数デバイスで同期される（オプション）

## 関連チケット
- #023: 動画プレイヤー実装
- #031: 進捗トラッキング基盤
- #033: 進捗表示コンポーネント

## 技術的考慮事項
- デバウンスで過度なAPI呼び出しを防ぐ
- IndexedDBでオフライン対応（オプション）
- バッチ更新で効率化

## UI/UXポイント
- 完了時の達成感を演出
- スムーズなアニメーション
- 明確な視覚的フィードバック
- アクセシビリティ対応

## データ構造
```typescript
interface VideoProgress {
  user_id: string;
  video_id: string;
  completed: boolean;
  completed_at?: Date;
  last_watched_at: Date;
  watch_time: number; // 秒
}
```

## 完了日
2025-01-09