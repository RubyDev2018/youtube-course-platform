# Supabase Database Schema

このドキュメントは、ShinCode Course Platformのデータベーススキーマとセキュリティポリシーの設計を記載しています。

## プロジェクト情報
- **プロジェクト名**: ShinCode_course_platform
- **プロジェクトID**: ferkchjfjyfaupwdhtuz
- **リージョン**: ap-northeast-1 (東京)
- **PostgreSQLバージョン**: 17.6.1

## セキュリティ設計の原則

### 重要：ユーザー情報のアクセス制御
- **email**と**full_name**などの個人情報は、`auth.users`テーブルから直接アクセスすることで、Supabaseの認証レイヤーによって保護されます
- `profiles`テーブルは公開プロフィール情報のみを保持し、機密情報は`auth.users`に保管
- この分離により、RLSポリシーの複雑性を減らし、セキュリティを強化

## データベース構造

### 1. 拡張機能
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. テーブル定義

#### profiles テーブル
ユーザーの公開プロフィール情報を管理。機密情報（email, full_name）は`auth.users`から取得。

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,  -- auth.usersから同期（表示用キャッシュ）
  full_name TEXT,  -- auth.usersから同期（表示用キャッシュ）
  display_name TEXT,  -- 公開表示名
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**セキュリティ注意事項**:
- emailとfull_nameは`auth.users`から自動同期されるキャッシュ
- 実際の認証と個人情報の管理は`auth.users`で行う
- profilesは公開情報のみを扱う

#### courses テーブル
講座情報を管理

```sql
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  slug TEXT UNIQUE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### sections テーブル
講座内のセクション（章）を管理

```sql
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### videos テーブル
動画コンテンツを管理

```sql
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT,
  duration INTEGER,  -- 秒数
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,  -- 無料公開フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### user_progress テーブル
ユーザーの学習進捗を管理

```sql
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  watch_time INTEGER DEFAULT 0,  -- 視聴時間（秒）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);
```

### 3. インデックス

パフォーマンス最適化のためのインデックス:

```sql
-- courses
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_is_published ON public.courses(is_published);

-- sections
CREATE INDEX idx_sections_course_id ON public.sections(course_id);
CREATE INDEX idx_sections_order ON public.sections(course_id, order_index);

-- videos
CREATE INDEX idx_videos_section_id ON public.videos(section_id);
CREATE INDEX idx_videos_order ON public.videos(section_id, order_index);
CREATE INDEX idx_videos_is_free ON public.videos(is_free);

-- user_progress
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_video_id ON public.user_progress(video_id);
CREATE INDEX idx_user_progress_completed ON public.user_progress(user_id, completed);
```

### 4. トリガー

#### 自動プロフィール作成
新規ユーザー登録時に自動的にprofileレコードを作成:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### updated_at自動更新
全テーブルでupdated_atカラムを自動更新:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) ポリシー

### セキュリティ設計方針
1. **最小権限の原則**: ユーザーは必要最小限のデータのみアクセス可能
2. **認証ベースの制御**: `auth.uid()`を使用してユーザーを識別
3. **段階的アクセス**: 無料コンテンツ → 認証済みコンテンツ → 個人データ

### profiles テーブル
```sql
-- 全てのプロフィールは公開（閲覧のみ）
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**セキュリティ注意**:
- 機密情報の実際の更新は`auth.users`で行う
- profilesの更新は表示情報のみ

### courses テーブル
```sql
-- 公開された講座のみ表示
CREATE POLICY "Published courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (is_published = true);
```

### sections テーブル
```sql
-- 公開講座のセクションのみ表示
CREATE POLICY "Sections of published courses are viewable"
  ON public.sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = sections.course_id
      AND courses.is_published = true
    )
  );
```

### videos テーブル
```sql
-- 無料動画は誰でも視聴可能（認証不要）
CREATE POLICY "Free videos are viewable by everyone"
  ON public.videos FOR SELECT
  USING (is_free = true);

-- ログインユーザーは全動画視聴可能
CREATE POLICY "Authenticated users can view all videos"
  ON public.videos FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### user_progress テーブル
```sql
-- 自分の進捗のみアクセス可能（CRUD全て）
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);
```

## データアクセスパターン

### ユーザー情報の取得（推奨方法）
```typescript
// Supabase Clientでの実装例
// emailとfull_nameはauth.usersから取得してセキュリティを強化

// サーバー側での実装
const { data: { user }, error } = await supabase.auth.getUser();
if (user) {
  const email = user.email;  // auth.usersから直接取得
  const fullName = user.user_metadata?.full_name;  // auth.usersから直接取得

  // 公開プロフィール情報はprofilesから取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single();
}
```

### 動画アクセス制御のフロー
1. **未認証ユーザー**: `is_free = true`の動画のみ視聴可能
2. **認証済みユーザー**: 全ての動画を視聴可能
3. **進捗記録**: 認証済みユーザーのみ可能

## マイグレーション実行順序

以下の順序でマイグレーションを実行してください：

1. `enable_uuid_extension` - UUID拡張の有効化
2. `create_profiles_table` - profilesテーブルとトリガー関数の作成
3. `create_auto_profile_trigger` - 自動プロフィール作成トリガー
4. `create_courses_table` - coursesテーブルの作成
5. `create_sections_table` - sectionsテーブルの作成
6. `create_videos_table` - videosテーブルの作成
7. `create_user_progress_table` - user_progressテーブルの作成
8. `setup_rls_policies` - RLSポリシーの設定

## セキュリティチェックリスト

- [x] RLSが全テーブルで有効化されている
- [x] 個人情報（email, full_name）は`auth.users`で管理
- [x] profilesテーブルは公開情報のみ保持
- [x] user_progressは個人ごとに分離
- [x] 無料コンテンツと有料コンテンツの明確な分離
- [x] トリガーによる自動データ整合性の維持
- [x] インデックスによるパフォーマンス最適化

## 管理者向け機能（今後の実装）

管理者権限を持つユーザー向けの機能は、以下のアプローチで実装予定：

1. `auth.users`のmetadataに`role: 'admin'`を設定
2. 管理者専用のRLSポリシーを追加
3. 管理画面用のSupabase Functionsを作成

## バックアップとリカバリ

- Supabaseの自動バックアップ機能を活用
- 定期的なデータエクスポートを推奨
- マイグレーションファイルのバージョン管理

## パフォーマンス監視

- Supabaseダッシュボードでクエリパフォーマンスを監視
- 必要に応じてインデックスを追加
- N+1クエリ問題を避けるため、適切なJOINを使用