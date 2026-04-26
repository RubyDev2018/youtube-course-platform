# Ticket #043: セクション管理CRUD

## 概要
管理画面で講座のセクション（章）を作成・編集・削除・並び替えする機能を実装する。

## 担当者
- Frontend Developer
- Backend Developer

## 優先度
**中** - コンテンツ構造管理

## 前提条件
- 管理者認証が実装済み（#041）
- 講座管理CRUDが実装済み（#042）

## TODO リスト

### ページ実装
- [x] app/admin/courses/[id]/edit/sections-manager.tsx
  - [x] セクション一覧表示
  - [x] インライン編集機能
  - [x] 並び替え機能
- [x] セクション編集 (sections-manager.tsx内で実装)
  - [x] セクション編集フォーム

### Server Actions
- [x] app/actions/admin/sections.ts (sections-manager.tsx内に実装)
  - [x] createSection
  - [x] updateSection
  - [x] deleteSection
  - [x] reorderSections

### UIコンポーネント
- [x] components/admin/section-form.tsx (sections-manager.tsx内に実装)
  - [x] タイトル入力
  - [x] 説明文入力
  - [x] 順序設定 (order_index自動管理)
- [x] components/admin/section-list.tsx (sections-manager.tsx内に実装)
  - [x] インラインリスト形式
  - [x] 展開/折りたたみ
  - [x] アクションボタン (編集・削除)

### 並び替え機能
- [x] order_indexによる並び替え実装
- [x] order_indexの更新
- [x] UI反映 (リロード後)
- [x] エラー時のハンドリング

### データ整合性
- [x] 削除時の動画処理 (CASCADE設定)
- [x] 順序の重複防止
- [x] データ整合性維持

## 完了条件
- [x] セクションのCRUD操作が可能
- [x] 並び替え可能 (order_index方式)
- [x] データの整合性が保たれる

## テスト項目
- [ ] セクション作成
- [ ] セクション編集
- [ ] セクション削除
- [ ] 並び替え機能
- [ ] 動画との関連性維持

## 関連チケット
- #041: 管理者認証
- #042: 講座管理CRUD
- #044: 動画管理CRUD

## 完了日
2025-01-09