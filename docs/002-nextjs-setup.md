# Ticket #002: Next.js初期設定

## 概要
Next.js 15とApp Routerを使用したプロジェクトの初期設定と基本構造の構築。

## 担当者
- Frontend Developer

## 優先度
**最優先** - アプリケーションの基盤となるため

## 前提条件
- Node.js 18以上がインストール済み
- npmまたはyarnが使用可能

## TODO リスト

### プロジェクト初期化
- [x] Next.js 15プロジェクト作成（完了済みの場合はスキップ）
- [x] 必要な依存関係のインストール
  - [x] @supabase/ssr
  - [x] @supabase/supabase-js
  - [x] react 19
  - [x] next 15
- [x] TypeScript設定の確認

### ディレクトリ構造
- [x] app/ディレクトリ構造の整理
  ```
  app/
  ├── (auth)/          # 認証関連ページ ✅
  ├── (dashboard)/     # ダッシュボード (部分的)
  ├── courses/         # 講座関連 (未実装)
  ├── api/            # API Routes (auth/callbackのみ)
  ├── layout.tsx       ✅
  ├── page.tsx         ✅
  └── globals.css      ✅
  ```
- [x] components/ディレクトリ作成
  ```
  components/
  ├── ui/             # 再利用可能なUIコンポーネント (未実装)
  ├── features/       # 機能別コンポーネント (未実装)
  └── layouts/        # レイアウトコンポーネント ✅
  ```
- [x] lib/ディレクトリ作成
  ```
  lib/
  ├── supabase/       # Supabase関連 ✅
  ├── utils/          # ユーティリティ関数 (未実装)
  └── types/          # 型定義 (未実装)
  ```

### 基本設定ファイル
- [x] tsconfig.jsonの設定確認
  - [x] パスエイリアス設定（@/*）
  - [x] strict mode有効化
- [x] next.config.jsの設定
  - [ ] 画像ドメイン設定（YouTube、Supabase）(必要に応じて追加)
  - [x] 環境変数の設定
- [x] tailwind.config.jsの設定
  - [ ] カスタムカラー定義 (デフォルト使用中)
  - [x] フォント設定

### レイアウトとスタイリング
- [x] app/layout.tsxの設定
  - [x] Geistフォントの設定
  - [x] メタデータの基本設定
  - [x] 基本的なHTML構造
- [x] グローバルCSS設定
  - [x] Tailwind CSS v4のディレクティブ
  - [x] カスタムCSS変数
- [x] 共通レイアウトコンポーネント作成
  - [x] Header ✅
  - [ ] Footer
  - [x] Navigation (Headerに含まれる)

### エラーハンドリング
- [ ] app/error.tsxの作成
- [ ] app/not-found.tsxの作成
- [ ] app/loading.tsxの作成

### SEOとメタデータ
- [ ] favicon.icoの配置
- [ ] apple-icon.pngの作成
- [ ] opengraph-image.pngの作成
- [ ] robots.txtの作成
- [ ] sitemap.xmlの設定

## 完了条件
- プロジェクト構造が整理されている
- 基本的なレイアウトが動作する
- TypeScriptの型チェックが通る
- Tailwind CSSが正しく動作する

## テスト項目
- [x] npm run devでエラーなく起動する
- [x] npm run buildが成功する (環境変数設定後)
- [x] TypeScriptの型チェックが通る
- [x] 基本的なページが表示される

## 関連チケット
- #001: データベース構築
- #003: Supabase Client設定
- #004: 環境変数設定

## 備考
- App Routerを使用（Pages Routerは使用しない）
- Server Componentsをデフォルトで使用
- Client Componentsは必要最小限に

## 完了日
-