# Ticket #044: 動画管理CRUD

## 概要
管理画面で動画コンテンツを追加・編集・削除・並び替えする機能を実装する。

## 担当者
- Frontend Developer
- Backend Developer

## 優先度
**中** - コンテンツ管理の中核

## 前提条件
- セクション管理CRUDが実装済み（#043）
- YouTube APIの理解

## TODO リスト

### ページ実装
- [x] app/admin/sections/[id]/videos/page.tsx
  - [x] 動画一覧表示
  - [x] 並び替え機能
- [x] app/admin/sections/[id]/videos/video-manager.tsx
  - [x] 動画編集フォーム (インライン実装)

### Server Actions
- [x] app/actions/admin/videos.ts (video-manager.tsx内に実装)
  - [x] createVideo
  - [x] updateVideo
  - [x] deleteVideo
  - [x] reorderVideos (order_index方式)
  - [ ] bulkUpdateVideos (将来実装)

### UIコンポーネント
- [x] components/admin/video-form.tsx (video-manager.tsx内に実装)
  - [x] タイトル入力
  - [x] YouTube URL入力
  - [x] 説明文入力
  - [x] is_freeフラグ設定
  - [x] 動画時間設定 (秒数入力)
- [x] components/admin/video-list.tsx (video-manager.tsx内に実装)
  - [x] テーブル表示
  - [x] order_indexによる並び替え
  - [ ] 一括選択 (将来実装)

### YouTube連携
- [x] YouTube URL検証 (URLフィールドで実装)
- [x] 動画ID抽出 (YouTube埋め込み時に実装)
- [ ] サムネイル取得 (将来実装)
- [x] 動画時間設定 (手動入力)

### 一括操作
- [ ] CSVインポート
- [ ] 複数動画の一括追加
- [ ] 一括削除
- [ ] 一括公開/非公開

## 完了条件
- [x] 動画のCRUD操作が可能
- [x] YouTube URLの保存
- [ ] 効率的な一括操作 (将来実装)
- [x] データの整合性維持

## テスト項目
- [ ] 動画追加（単体/複数）
- [ ] 動画情報編集
- [ ] 動画削除
- [ ] 並び替え
- [ ] YouTube URL検証

## 関連チケット
- #043: セクション管理CRUD
- #045: 動画一括アップロード

## 完了日
2025-01-09