# Ticket #4: 環境変数設定

## 概要
Next.jsとSupabaseに必要な環境変数を設定し、開発環境を整備する。

## 担当者
- DevOps / Backend Developer

## 優先度
**最優先** - 全ての機能の前提条件

## 前提条件
- Supabaseプロジェクトが作成済み
- Next.jsプロジェクトが初期化済み

## TODO リスト

### 環境変数ファイル
- [ ] .env.local作成
  ```
  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=

  # Optional: Admin設定
  ADMIN_EMAILS=

  # Optional: YouTube API（将来的な拡張用）
  YOUTUBE_API_KEY=
  ```
- [ ] .env.example作成（リポジトリ用）
- [ ] .env.test作成（テスト環境用）

### Supabase環境変数取得
- [ ] Supabaseダッシュボードから取得
  - [ ] Project URL
  - [ ] Anon Key
  - [ ] Service Role Key（管理機能用）
- [ ] 環境変数の検証スクリプト作成

### 環境変数の型定義
- [ ] lib/env.ts作成
  - [ ] 環境変数の型定義
  - [ ] 必須チェック関数
  - [ ] デフォルト値設定

### Git設定
- [ ] .gitignoreの確認
  - [ ] .env.local
  - [ ] .env.production
  - [ ] .env*.local
- [ ] .env.exampleのコミット

### Vercelデプロイ設定（将来用）
- [ ] 環境変数設定手順書作成
- [ ] Production/Preview/Development環境の分離

## 完了条件
- 環境変数が正しく設定されている
- アプリケーションが環境変数を読み込める
- セキュリティが保たれている

## テスト項目
- [ ] 環境変数が正しく読み込まれる
- [ ] Supabaseに接続できる
- [ ] 環境変数なしでエラーが出る
- [ ] .env.localがGitにコミットされない

## 関連チケット
- #3: Supabase Client設定
- #11: Supabase Auth基本設定

## セキュリティ注意事項
- Service Role Keyは絶対に公開しない
- NEXT_PUBLIC_プレフィックスの理解
- 環境変数のローテーション計画

## 完了日
-