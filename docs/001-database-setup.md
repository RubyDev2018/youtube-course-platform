# Ticket #001: データベース構築

## 概要
Supabaseでデータベーススキーマを構築し、必要なテーブルとRLSポリシーを設定する。

## 担当者
- Backend Developer

## 優先度
**最優先** - 他の全ての機能の基盤となるため

## 前提条件
- Supabaseプロジェクトが作成済み
- プロジェクトIDが判明している

## TODO リスト

### 基本設定
- [x] UUID拡張機能を有効化
- [x] updated_at自動更新関数を作成

### テーブル作成
- [x] profilesテーブル作成
  - [x] auth.usersとの外部キー設定
  - [x] 必要なカラム定義（email, full_name, display_name, avatar_url）
  - [x] インデックス設定
- [x] coursesテーブル作成
  - [x] 講座情報のカラム定義
  - [x] slugカラムとインデックス
  - [x] is_publishedフラグ
- [x] sectionsテーブル作成
  - [x] coursesとの外部キー設定
  - [x] order_indexによる並び順管理
- [x] videosテーブル作成
  - [x] sectionsとの外部キー設定
  - [x] YouTube URL管理
  - [x] is_freeフラグ（無料動画識別）
  - [x] order_indexによる並び順管理
- [x] user_progressテーブル作成
  - [x] ユーザーと動画の組み合わせをユニークに
  - [x] 完了状態と視聴時間の記録

### トリガー設定
- [x] 新規ユーザー登録時の自動profile作成トリガー
- [x] 各テーブルのupdated_atトリガー

### RLS（Row Level Security）設定
- [x] 各テーブルでRLSを有効化
- [x] profilesテーブルのポリシー
  - [x] 全員が閲覧可能
  - [x] 自分のプロフィールのみ更新可能
- [x] coursesテーブルのポリシー
  - [x] 公開講座のみ表示
- [x] sectionsテーブルのポリシー
  - [x] 公開講座のセクションのみ表示
- [x] videosテーブルのポリシー
  - [x] 無料動画は誰でも視聴可能
  - [x] ログインユーザーは全動画視聴可能
- [x] user_progressテーブルのポリシー
  - [x] 自分の進捗のみCRUD可能

### ドキュメント
- [x] database-schema.mdファイル作成
- [x] セキュリティ設計の記載
- [x] auth.usersからのアクセス推奨事項を記載

## 完了条件
- 全てのテーブルが作成されている
- RLSポリシーが適切に設定されている
- トリガーが正常に動作する
- ドキュメントが完成している

## 関連チケット
- #002: Next.js初期設定
- #003: Supabase Client設定

## 備考
- emailとfull_nameはセキュリティのため、auth.usersから取得することを推奨
- profilesテーブルは公開情報のみを保持
- 将来的に管理者権限の実装も考慮

## 完了日
2025-10-19