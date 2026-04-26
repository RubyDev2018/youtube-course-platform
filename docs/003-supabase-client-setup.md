# Ticket #003: Supabase Client設定

## 概要
Next.js App RouterでSupabaseクライアントを適切に設定し、サーバー側とクライアント側の両方で使用可能にする。

## 担当者
- Backend Developer
- Frontend Developer

## 優先度
**最優先** - 認証とデータベースアクセスの基盤となるため

## 前提条件
- Supabaseプロジェクトが作成済み
- 環境変数が設定済み
- @supabase/ssrパッケージがインストール済み

## TODO リスト

### 環境変数設定
- [x] .env.localファイル作成 ✅
  - [x] NEXT_PUBLIC_SUPABASE_URL ✅
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- [x] .env.exampleファイル作成（リポジトリ用） ✅

### Supabaseクライアント作成
- [x] lib/supabase/client.ts作成（Browser Client） ✅
  ```typescript
  // Client Components用
  createBrowserClient実装 ✅
  ```
- [x] lib/supabase/server.ts作成（Server Client） ✅
  ```typescript
  // Server Components、Route Handlers用
  createServerClient実装 ✅
  ```
- [x] middleware.ts作成 ✅
  ```typescript
  // セッションリフレッシュ処理 ✅
  // 認証が必要なルートの保護 ✅
  ```

### 型定義
- [ ] lib/types/database.types.ts作成
  - [ ] Supabase CLIで型を自動生成
  - [ ] カスタム型定義の追加
- [ ] lib/types/index.ts作成
  - [ ] 共通型定義のエクスポート

### ユーティリティ関数
- [x] lib/auth/session.ts作成 ✅
  - [x] getUser関数 ✅
  - [x] getSession関数 ✅
  - [x] getUserProfile関数 ✅
- [ ] lib/supabase/queries.ts作成
  - [ ] 共通クエリ関数
  - [ ] エラーハンドリング

### Middlewareの設定
- [x] 認証が必要なルートの定義 ✅
  - [x] /dashboard/* ✅
  - [ ] /courses/*/videos/* (is_free=falseの場合) (未実装)
  - [ ] /profile/* (未実装)
- [x] publicルートの定義 ✅
  - [x] / ✅
  - [x] /auth/* ✅
  - [ ] /courses (一覧) (未実装)
- [x] セッション自動リフレッシュ ✅

### Context/Provider設定
- [x] components/auth/auth-provider.tsx作成 ✅
  - [x] 認証コンテキスト ✅
  - [x] セッション管理 ✅
- [x] app/layout.tsxにProviderを追加 ✅

## 完了条件
- Server ComponentsでSupabaseが使用できる
- Client ComponentsでSupabaseが使用できる
- Middlewareでセッションがリフレッシュされる
- 型安全性が保証されている

## テスト項目
- [x] Server Componentでデータ取得ができる ✅
- [x] Client Componentで認証操作ができる ✅
- [x] Middlewareが正しくルートを保護する ✅
- [x] セッションが自動的にリフレッシュされる ✅
- [ ] 型定義が正しく適用される (未実装)

## 関連チケット
- #001: データベース構築
- #002: Next.js初期設定
- #011: Supabase Auth基本設定

## 備考
- @supabase/ssrを使用（最新の推奨方法）
- Server/Client で異なるクライアント作成方法を使用
- クッキーの読み書きに注意

## 完了日
-