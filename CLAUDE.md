# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な指示

**タスク完了時の必須作業:**
タスクを完了したら、必ず `docs/` 配下の該当ドキュメントファイル内のチェックボックスを `[x]` に更新すること。
進捗状況を常に最新に保つことで、プロジェクトの状態を正確に把握できます。

## Project Overview

This is a course platform built with Next.js 15 using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project name is `shincode-course-platform`.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Uses Next.js with Turbopack for faster development builds. The server runs on http://localhost:3001.

### Building for Production
```bash
npm run build
```
Uses Next.js with Turbopack to create an optimized production build.

### Starting Production Server
```bash
npm start
```
Runs the production server after building.

## Architecture & Structure

### Next.js App Router
This project uses the Next.js App Router (not Pages Router). All routes are defined in the `app/` directory:
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Homepage component
- `app/globals.css` - Global styles with Tailwind directives

### TypeScript Configuration
- Path alias: `@/*` maps to the project root
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler

### Styling
- Tailwind CSS v4 with PostCSS
- Uses Geist Sans and Geist Mono fonts via `next/font/google`
- CSS variables for font families: `--font-geist-sans` and `--font-geist-mono`

### Static Assets
Public assets are in the `public/` directory and can be referenced from the root path (e.g., `/next.svg`).

## Technology Stack

- **Framework**: Next.js 15.5.6
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Turbopack (via Next.js)
- **Backend/Database**: Supabase
- **Authentication**: Supabase Auth (Google OAuth)
- **Hosting**: Vercel
- **Content**: YouTube動画埋め込み

## プロジェクト要件

### 概要
shinさんのYouTube講座(約330本の動画)をUdemyのような講座プラットフォームとして提供するMVP

- **YouTube チャンネル**: https://www.youtube.com/@programming_tutorial_youtube
- **ターゲットユーザー**: AIでプログラム開発したいエンジニアと非エンジニアの両方

### 重要な前提条件・確認事項
- [ ] shinさん本人から動画利用の許可を取得済みか確認
- [ ] YouTube利用規約の確認(特に有料化する場合)
- [ ] 330本の動画データの投入方法を決定(CSV、YouTube API、手動等)

### 機能要件

#### フロントエンド(ユーザー向け)

**1. ホームページ** ✅
- [x] UIデザイン完成（Udemy風）
- [x] ヒーローセクション
- [x] カテゴリー表示
- [x] フッター
- [x] 講座一覧表示（データ連携完了）
- [x] 各講座のサムネイル、タイトル、説明文を表示
- [x] 動画数・セクション数の表示

**2. 講座詳細ページ** ✅
- [x] セクション・動画の構造表示(Udemyライクなカリキュラム構成)
- [x] 進捗表示(完了した動画数/全体の動画数)
- [x] セクションごとに動画をグループ化
- [x] 動画の順序を表示
- [x] 無料動画の表示
- [x] 統計情報表示（総動画数、総時間、セクション数）

**3. 動画視聴ページ** ✅
- [x] YouTube動画埋め込み
- [x] 完了マーク機能（トグル対応）
- [x] 次の動画への遷移ボタン
- [x] 前の動画への遷移ボタン
- [x] プレイリストサイドバー
- [x] 認証が必要な動画のロック表示
- [x] 無料動画は認証なしで視聴可能

**4. 認証機能** ✅
- [x] ログイン(Supabase Auth)
- [x] サインアップ(Supabase Auth)
- [x] Google OAuth統合
- [x] Udemy風UIデザイン（ログイン・サインアップページ）
- [x] **認証ルール**:
  - [x] 各講座の最初の動画は誰でも視聴可能(認証不要) - 実装準備完了
  - [x] 2本目以降の動画は認証必須 - Middleware実装済み

**5. プロフィール/ダッシュボード** ✅
- [x] 受講中講座一覧（Udemy風グリッド表示）
- [x] 進捗一覧
- [x] ユーザー情報表示（ヘッダーのアバター＋ドロップダウン）
- [x] Google OAuthアバターの自動保存
- [x] Udemy風UIデザイン（ダッシュボードページ）

**6. ヘッダー/ナビゲーション** ✅
- [x] Udemy風ヘッダーデザイン
- [x] 検索バー
- [x] ユーザーアバター表示
- [x] ドロップダウンメニュー
- [x] レスポンシブ対応

#### 管理画面

**1. 講座管理**
- [ ] 講座の作成
- [ ] 講座の編集
- [ ] 講座の削除

**2. セクション管理**
- [ ] セクションの作成
- [ ] セクションの編集
- [ ] セクションの並び替え(order_index)

**3. 動画管理**
- [ ] 動画の追加
- [ ] 動画の編集
- [ ] YouTube URL設定
- [ ] is_free フラグの設定(最初の動画をフリーに設定)

### データベース設計(Supabase)

#### 認証とユーザー管理
Supabaseでは`auth.users`テーブルが自動的に提供されます。このテーブルには以下が含まれます:
- id (UUID)
- email
- created_at
- その他の認証関連情報

ユーザーの追加情報（プロフィール等）を管理するため、`profiles`テーブルを作成します。

#### テーブル構造

```sql
-- プロフィールテーブル（auth.usersと1:1）
-- 注意: emailとfull_nameはセキュリティのため、auth.usersから取得すること
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 新規ユーザー登録時に自動でprofileを作成するトリガー
-- Google OAuthのアバターURLを自動保存
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 講座テーブル
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- セクションテーブル
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 動画テーブル
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  duration INTEGER, -- 秒数
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 進捗テーブル
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- RLS (Row Level Security) ポリシー
-- profilesテーブル
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_progressテーブル
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- coursesテーブル（全員が閲覧可能）
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

-- sectionsテーブル（全員が閲覧可能）
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections are viewable by everyone"
  ON sections FOR SELECT
  USING (true);

-- videosテーブル（全員が閲覧可能）
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);
```

#### テーブルリレーション
```
auth.users (1) ----< (1) profiles
courses (1) ----< (N) sections
sections (1) ----< (N) videos
videos (1) ----< (N) user_progress
auth.users (1) ----< (N) user_progress
```

#### 重要な注意点
- `auth.users` はSupabaseが管理する認証専用テーブル（直接編集不可）
- ユーザー情報の拡張は `profiles` テーブルで行う
- トリガーにより新規ユーザー登録時に自動的に `profiles` レコードが作成される
- RLSポリシーにより、ユーザーは自分のデータのみアクセス可能

### UI/UX要件
- Udemyのようなカリキュラム構成
- 学習進捗が見えるデザイン
- レスポンシブデザイン(モバイル対応)
- 直感的なナビゲーション

### マネタイゼーション
- MVPはまず**無料**で提供
- 将来的には有料プラン、サブスクリプションモデルを検討

### MVP実装の優先順位

**Phase 1: 基本セットアップ** ✅
1. [x] Next.js プロジェクトのセットアップ
2. [x] Supabase プロジェクトのセットアップ
3. [x] データベーステーブルの作成（マイグレーションファイル作成済み）
4. [x] データベーストリガーの実装（プロフィール自動作成、アバター保存）

**Phase 2: 認証機能** ✅
5. [x] Supabase Auth の統合
6. [x] ログイン/サインアップページ（Udemy風UI）
7. [x] 認証ミドルウェアの実装
8. [x] Google OAuth統合
9. [x] アバター自動保存機能
10. [x] セキュリティ対策（profiles テーブルから email/full_name 削除）

**Phase 2.5: UI/UX デザイン** ✅
11. [x] Udemy風ヘッダーデザイン実装
12. [x] ホームページUIデザイン（ヒーロー、カテゴリー、フッター）
13. [x] ダッシュボードUIデザイン（グリッドレイアウト）
14. [x] ログイン/サインアップページの洗練
15. [x] レスポンシブデザイン対応
16. [x] ユーザードロップダウンメニュー実装

**Phase 3: コンテンツ表示** ✅
17. [x] サンプル講座データの投入（3コース、13動画）
18. [x] ホームページ(講座一覧) - データ連携完了
19. [x] 講座詳細ページ(セクション・動画構造) - 完成
20. [x] 動画視聴ページ(YouTube埋め込み) - 完成
21. [ ] 実際の330本の動画データ投入（今後の作業）

**Phase 4: 進捗管理** ✅
22. [x] 動画完了マーク機能 - API実装完了
23. [x] 進捗計算ロジック - 実装完了
24. [x] プロフィール/ダッシュボード（完全実装済み）

**Phase 5: 管理画面(後回し可能)**
25. [ ] 講座管理CRUD
26. [ ] セクション管理CRUD
27. [ ] 動画管理CRUD

### Next.jsベストプラクティス

このプロジェクトでは、Next.js 15のベストプラクティスに従って開発を行います。

**App Routerの使用**
- すべてのルーティングは `app/` ディレクトリで管理
- Pages Routerは使用しない
- ファイルベースのルーティング規則に従う

**Server ComponentsとClient Components**
- デフォルトはServer Componentsを使用
- インタラクティブな要素(useState、useEffect、イベントハンドラー等)が必要な場合のみClient Components(`'use client'`)を使用
- Client Componentsは可能な限り葉のコンポーネント(leaf components)に配置
- Server ComponentsからClient Componentsへのprops渡しはシリアライズ可能なデータのみ

**データフェッチング**
- Server Componentsで直接データフェッチを行う(async/await)
- `fetch()`のキャッシュオプションを適切に設定
- 動的データには `cache: 'no-store'` または `revalidate` を使用
- Server ActionsをフォームやミューテーションAPIとして活用

**ルーティングとナビゲーション**
- `next/link`の`<Link>`コンポーネントを使用
- プログラマティックなナビゲーションには`useRouter`(Client Component)または`redirect`(Server Component)を使用
- Dynamic Routesは`[id]`のようなフォルダ名で定義

**パフォーマンス最適化**
- `next/image`の`<Image>`コンポーネントを必ず使用
- 画像の`width`、`height`、`alt`属性を適切に設定
- loading="lazy"を活用(デフォルト)
- Critical imagesには`priority`属性を設定

**メタデータ管理**
- `metadata`オブジェクトまたは`generateMetadata`関数を使用
- 各ページで適切なタイトル、description、OGタグを設定
- `favicon.ico`、`icon.png`、`apple-icon.png`を`app/`ディレクトリに配置

**エラーハンドリング**
- `error.tsx`でエラーバウンダリーを実装
- `not-found.tsx`で404ページをカスタマイズ
- `loading.tsx`でローディング状態を管理(Suspense境界)

**環境変数**
- クライアント側で使用する環境変数には`NEXT_PUBLIC_`プレフィックスを使用
- サーバー側のみの環境変数にはプレフィックス不要
- `.env.local`をgitignoreに追加(すでに設定済み)

**TypeScript**
- 型安全性を最大限に活用
- `any`の使用を避ける
- Supabaseの型定義を自動生成して使用
- コンポーネントのPropsは明示的に型定義

**ディレクトリ構造**
```
app/
  ├── (auth)/          # Route Groups(認証関連ページ)
  ├── (dashboard)/     # Route Groups(ダッシュボード)
  ├── courses/         # 講座関連ページ
  │   └── [id]/        # Dynamic Route
  ├── api/             # API Routes
  ├── layout.tsx       # Root Layout
  ├── page.tsx         # Homepage
  └── globals.css      # Global Styles
components/
  ├── ui/              # 再利用可能なUIコンポーネント
  ├── features/        # 機能別コンポーネント
  └── layouts/         # レイアウトコンポーネント
lib/
  ├── supabase/        # Supabase関連ユーティリティ
  ├── utils/           # 汎用ユーティリティ関数
  └── types/           # 型定義
```

**コード品質**
- ESLintのルールに従う
- コンポーネントは単一責任の原則に従う
- 再利用可能なロジックはカスタムフックに抽出
- 適切なコメントを記述(特に複雑なロジック)

### 技術的考慮事項

**Supabase Auth Helpers for Next.js**
- `@supabase/ssr` パッケージを使用(最新の推奨パッケージ)
- Server側とBrowser側で異なるクライアントを使用
- 各コンテキストで適切なクライアント作成関数を使用

**Browser Client (クライアント側)**
- Client Componentsで使用
- `createBrowserClient` を使用

```typescript
// lib/supabase/client.ts
'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// 使用例: Client Component
'use client'
import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  // クライアント側のロジック（ログイン、サインアップ等）
}
```

**Server Client (サーバー側)**
- Server Components、Route Handlers、Server Actionsで使用
- `createServerClient` を使用
- クッキーの読み書きに対応

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Componentからset/removeは呼べない場合がある
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Componentからset/removeは呼べない場合がある
          }
        },
      },
    }
  )
}
```

```typescript
// 使用例: Server Component
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  // サーバー側でのデータフェッチング
}
```

```typescript
// 使用例: Route Handler
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  // API処理
}
```

**Middlewareでの使用**
- Middlewareでは独自の実装が必要
- セッションリフレッシュを処理

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // セッションリフレッシュ（重要）
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**認証ルールの実装方針**
- Row Level Security (RLS) をSupabaseで設定
- `is_free=true` の動画は認証なしでアクセス可能
- それ以外の動画は `auth.users` に基づいてアクセス制御
- Middlewareで認証が必要なルートを保護
- セッションのリフレッシュはMiddlewareで自動的に処理

**YouTube埋め込み**
- YouTube IFrame API を使用
- レスポンシブ対応のアスペクト比維持
- `next/dynamic`で動的インポートを活用してバンドルサイズを削減

**パフォーマンス**
- 講座一覧はページネーションまたは無限スクロール
- 画像は Next.js の Image コンポーネントで最適化
- Supabase のキャッシュ戦略を活用
- React Suspenseを使用してストリーミングSSRを実装
- 重いコンポーネントは動的インポート(`next/dynamic`)を使用

### 成功指標(MVP)
- [ ] ユーザーが講座を閲覧できる（データ投入必要）
- [ ] 最初の動画を認証なしで視聴できる（ページ作成必要）
- [x] ユーザー登録・ログインができる ✅
- [x] Google OAuthで簡単にログインできる ✅
- [x] ユーザーアバターが自動保存される ✅
- [ ] ログイン後、全ての動画を視聴できる（ページ作成必要）
- [ ] 動画の完了状態を保存できる（機能実装必要）
- [x] 進捗が視覚的に表示される ✅ (ダッシュボードUIで実装済み、データ連携必要)
- [x] Udemy風のプロフェッショナルなUIデザイン ✅
- [ ] 管理画面から講座・セクション・動画を管理できる

### 現在の進捗状況（2025年1月）

**完了済み (Phase 1 & 2 & 2.5 & 3 & 4)** ✅
- プロジェクトセットアップ完了
- 認証機能完全実装（Google OAuth含む）
- セキュリティ対策実施
- Udemy風UI/UXデザイン完成（全ページ）
- レスポンシブデザイン対応
- アバター自動保存機能
- **サンプル講座データ投入完了（3コース、13動画）**
- **ホームページ講座一覧表示完成**
- **講座詳細ページ完成**
- **動画視聴ページ完成（YouTube埋め込み）**
- **動画完了マーク機能実装**
- **進捗管理機能完成**

**MVP達成状況: 約80%完了** 🎉

**次のステップ (Phase 5以降)**
1. 実際の330本の動画データ投入
2. 管理画面の実装（講座・セクション・動画のCRUD）
3. 検索機能の追加
4. フィルタリング機能の追加

**現在使用可能な機能**
- ✅ ユーザー登録・ログイン
- ✅ Google OAuthログイン
- ✅ 講座一覧の閲覧
- ✅ 講座詳細の確認
- ✅ 無料動画の視聴（認証不要）
- ✅ ログイン後の全動画視聴
- ✅ 動画完了マーク
- ✅ 学習進捗の自動保存
- ✅ ダッシュボードでの進捗確認

### 今後の拡張機能(MVP後)
- コメント・Q&A機能
- 検索機能
- フィルタリング機能(難易度、カテゴリー)
- 修了証・バッジ機能
- お気に入り・ブックマーク機能
- 動画のプレビュー機能
- レビュー・評価機能
- 有料プランの実装
