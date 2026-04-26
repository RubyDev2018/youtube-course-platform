# Ticket #011: Supabase Auth基本設定

## 概要
Supabase Authの基本設定を行い、メール/パスワード認証とGoogle OAuth認証を実装する。

## 担当者
- Backend Developer
- Frontend Developer

## 優先度
**高** - ユーザー認証は必須機能

## 前提条件
- Supabase Client設定が完了している（#003）
- データベースのprofilesテーブルが作成済み（#001）

## TODO リスト

### Supabase Dashboard設定
- [x] Authentication設定
  - [x] Email/Password認証を有効化
  - [x] Email確認を必須に設定
  - [x] パスワードポリシー設定（最小8文字）
- [x] Email Templates設定
  - [x] 確認メール
  - [x] パスワードリセットメール
  - [x] 招待メール
- [x] URL Configuration
  - [x] サイトURLの設定
  - [x] リダイレクトURLの設定

### 認証ヘルパー関数
- [x] lib/supabase/auth-helpers.ts作成
  - [x] signUp関数 (直接Supabaseクライアント使用)
  - [x] signIn関数 (直接Supabaseクライアント使用)
  - [x] signOut関数 (直接Supabaseクライアント使用)
  - [ ] resetPassword関数
  - [ ] updatePassword関数
  - [x] getUser関数 (lib/auth/session.tsに実装)

### Server Actions
- [x] app/actions/auth.ts作成
  - [x] signUpAction (ログイン/サインアップページで直接実装)
  - [x] signInAction (ログイン/サインアップページで直接実装)
  - [x] signOutAction (Headerコンポーネントで直接実装)
  - [ ] resetPasswordAction

### 認証フック
- [x] hooks/useAuth.ts作成
  - [x] useUser (components/auth/auth-provider.tsxのuseAuthで実装)
  - [x] useSession (components/auth/auth-provider.tsxのuseAuthで実装)
  - [x] useSignIn (ログイン/サインアップページで直接実装)
  - [x] useSignUp (ログイン/サインアップページで直接実装)
  - [x] useSignOut (Headerコンポーネントで直接実装)

### エラーハンドリング
- [x] 認証エラーメッセージの日本語化
- [x] エラー状態の管理
- [ ] トースト通知の実装

### セッション管理
- [x] リアルタイムセッション監視
- [x] セッション期限切れ処理
- [x] 自動ログアウト機能

## 完了条件
- [x] メール/パスワードでサインアップできる
- [x] ログイン/ログアウトが正常に動作する
- [ ] パスワードリセットが機能する
- [x] セッション管理が適切に動作する

## テスト項目
- [x] 新規ユーザー登録ができる
- [x] profilesテーブルに自動でレコードが作成される
- [x] ログイン後、認証状態が維持される
- [x] ログアウトが正常に動作する
- [ ] パスワードリセットメールが送信される
- [x] 不正なログイン試行が拒否される

## 関連チケット
- #003: Supabase Client設定
- #012: ログインページ実装
- #013: サインアップページ実装
- #015: Google OAuth設定

## 備考
- メールアドレスの確認を必須にする
- セキュリティを考慮した実装
- ユーザビリティを重視

## 完了日
2025-01-09