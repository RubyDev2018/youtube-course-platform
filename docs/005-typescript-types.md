# Ticket #5: TypeScript型定義

## 概要
Supabaseのデータベース型定義を生成し、アプリケーション全体で使用する型を整備する。

## 担当者
- Backend Developer

## 優先度
**最優先** - 型安全性の基盤

## 前提条件
- データベーススキーマが作成済み（#1）
- Supabase CLIがインストール可能

## TODO リスト

### Supabase型生成
- [x] Supabase MCPを使用して型生成
  - [x] mcp__supabase__generate_typescript_types実行
- [x] lib/types/database.types.ts作成
  - [x] 自動生成された型を保存
- [x] package.jsonにスクリプト追加
  - [x] gen:typesスクリプト追加（MCPの使用方法を記載）

### カスタム型定義
- [x] lib/types/index.ts作成
  - [x] データベース型のエクスポート
  - [x] カスタム型の定義
  - [x] 基本テーブル型のエクスポート
  - [x] 拡張型の定義（CourseWithSections等）
  - [x] 進捗関連型の定義
  - [x] Auth関連型の定義
- [ ] lib/types/auth.types.ts（将来実装）
  - [ ] より詳細なユーザー関連の型
- [ ] lib/types/course.types.ts（将来実装）
  - [ ] より複雑な講座関連の型

### 型ユーティリティ
- [ ] lib/types/utils.ts（将来実装）
  - [ ] Nullable型
  - [ ] DeepPartial型
  - [ ] APIレスポンス型

### 型定義例
```typescript
// 基本的な型定義
export type Course = Database['public']['Tables']['courses']['Row'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];

// 拡張型
export type CourseWithSections = Course & {
  sections: (Section & {
    videos: Video[];
  })[];
};

// 進捗付き講座型
export type CourseWithProgress = Course & {
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
};
```

### バリデーション
- [ ] zodスキーマの作成
  - [ ] フォームバリデーション用
  - [ ] APIリクエスト検証用
- [ ] 型ガード関数
  - [ ] isAdmin
  - [ ] isCourseOwner
  - [ ] isAuthenticated

## 完了条件
- データベース型が自動生成されている
- カスタム型が定義されている
- 型エラーがない
- 開発時の補完が効く

## テスト項目
- [ ] 型生成コマンドが動作する
- [ ] TypeScriptのビルドが通る
- [ ] 型の補完が効く
- [ ] 型エラーが適切に検出される

## 関連チケット
- #1: データベース構築
- #3: Supabase Client設定

## メンテナンス
- スキーマ変更時は型を再生成
- CI/CDで型チェックを実行
- 定期的な型定義の見直し

## 完了日
2025-01-09