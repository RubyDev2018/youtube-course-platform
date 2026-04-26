# Ticket #042: 講座管理CRUD実装

## 概要
管理画面で講座の作成・読み取り・更新・削除（CRUD）機能を実装する。

## 担当者
- Frontend Developer
- Backend Developer

## 優先度
**中** - コンテンツ管理の中核機能

## 前提条件
- 管理者認証が実装済み（#041）
- coursesテーブルが作成済み

## TODO リスト

### ページ作成
- [x] app/admin/courses/page.tsx
  - [x] 講座一覧表示
  - [ ] ページネーション (将来実装)
  - [ ] 検索・フィルター機能 (将来実装)
- [x] app/admin/courses/new/page.tsx
  - [x] 新規講座作成フォーム
- [x] app/admin/courses/[id]/edit/page.tsx
  - [x] 講座編集フォーム

### Server Actions
- [x] app/actions/admin/courses.ts (フォーム内に実装)
  - [x] createCourse
  - [x] updateCourse
  - [x] deleteCourse
  - [x] publishCourse (is_publishedフラグで実装)
  - [x] unpublishCourse (is_publishedフラグで実装)

### UIコンポーネント
- [x] components/admin/course-form.tsx (ページ内に実装)
  - [x] タイトル入力
  - [x] 説明文入力（textareaで実装）
  - [x] サムネイルURL入力
  - [x] スラッグ入力
  - [x] 公開/非公開トグル (is_published)
- [x] components/admin/course-table.tsx (ページ内に実装)
  - [x] テーブル表示
  - [ ] ソート機能 (将来実装)
  - [x] アクション列（編集・削除）
- [x] components/admin/course-actions.tsx (テーブル内に実装)
  - [x] 編集ボタン
  - [x] 削除ボタン（確認ダイアログ付き）
  - [x] 公開/非公開状態表示

### データバリデーション
- [x] フォームバリデーション
  - [x] 必須項目チェック (HTML5 required)
  - [x] 文字数制限
  - [x] スラッグの重複チェック
- [x] サーバー側バリデーション
  - [x] データ整合性チェック
  - [x] 権限チェック (管理者認証)

### 画像アップロード
- [x] Supabase Storageの設定
  - [x] 画像URLの入力方式で実装
  - [x] 外部URL対応
- [ ] 画像アップロード機能 (将来実装)
  - [ ] ドラッグ&ドロップ対応
  - [ ] プレビュー表示
  - [ ] 画像圧縮・リサイズ

### 一覧ページ機能
- [ ] フィルター機能
  - [ ] 公開/非公開
  - [ ] 作成日
  - [ ] 更新日
- [ ] 検索機能
  - [ ] タイトル検索
  - [ ] 説明文検索
- [ ] 一括操作
  - [ ] 複数選択
  - [ ] 一括削除
  - [ ] 一括公開/非公開

### エラーハンドリング
- [ ] 作成失敗時の処理
- [ ] 更新競合の処理
- [ ] 削除時の依存関係チェック
  - [ ] セクション・動画の存在確認

## 完了条件
- [x] 講座の作成ができる
- [x] 講座一覧が表示される
- [x] 講座の編集ができる
- [x] 講座の削除ができる
- [x] 公開/非公開の切り替えができる

## テスト項目
- [ ] 新規講座が作成できる
- [ ] 講座一覧が正しく表示される
- [ ] 講座情報が更新できる
- [ ] 講座が削除できる（関連データも削除）
- [ ] バリデーションが動作する
- [ ] 画像アップロードが動作する
- [ ] 権限のないユーザーはアクセスできない

## 関連チケット
- #041: 管理者認証
- #043: セクション管理CRUD
- #044: 動画管理CRUD

## UI/UX考慮事項
- 作成・更新時のローディング表示
- 成功/エラーのトースト通知
- 削除前の確認ダイアログ
- unsavedな変更の警告

## データ構造
```typescript
interface CourseForm {
  title: string;
  description: string;
  thumbnail_url?: string;
  slug: string;
  is_published: boolean;
}
```

## 完了日
2025-01-09