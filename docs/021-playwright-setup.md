# Ticket #71: Playwrightテスト環境構築

## 概要
PlaywrightとMCPを使用したE2Eテスト環境を構築する。自動テストの基盤を整備。

## 担当者
- QA Engineer / Frontend Developer

## 優先度
**中** - 品質保証の基盤

## 前提条件
- 基本的なアプリケーション機能が実装済み
- MCP (Model Context Protocol) が利用可能
- Playwright MCPサーバーが設定済み

## TODO リスト

### Playwright初期設定
- [ ] Playwrightのインストール
  ```bash
  npm install -D @playwright/test
  ```
- [ ] playwright.config.ts作成
  - [ ] ブラウザ設定（Chrome, Firefox, Safari）
  - [ ] ベースURL設定
  - [ ] タイムアウト設定
  - [ ] スクリーンショット設定
- [ ] テストディレクトリ構造
  ```
  e2e/
  ├── fixtures/        # テストフィクスチャ
  ├── pages/          # Page Object Model
  ├── tests/          # テストファイル
  └── utils/          # ヘルパー関数
  ```

### MCP Playwright設定
- [ ] MCP設定ファイルの確認
  - [ ] Playwright MCPサーバーの設定
  - [ ] ブラウザの自動起動設定
- [ ] MCPコマンドの確認
  - [ ] browser_navigate
  - [ ] browser_click
  - [ ] browser_snapshot
  - [ ] browser_fill_form
  - [ ] browser_take_screenshot

### テスト環境設定
- [ ] テスト用データベース設定
  - [ ] Supabaseテストプロジェクト（または分離環境）
  - [ ] シードデータの準備
- [ ] テスト用環境変数
  - [ ] .env.test設定
  - [ ] テストユーザー認証情報

### Page Object Model
- [ ] e2e/pages/base.page.ts
  - [ ] 共通メソッド
  - [ ] ナビゲーション
- [ ] e2e/pages/home.page.ts
- [ ] e2e/pages/login.page.ts
- [ ] e2e/pages/course.page.ts
- [ ] e2e/pages/video.page.ts

### テストユーティリティ
- [ ] e2e/utils/auth.ts
  - [ ] テストユーザーログイン
  - [ ] 認証状態の管理
- [ ] e2e/utils/database.ts
  - [ ] テストデータのセットアップ
  - [ ] クリーンアップ

### CI/CD設定
- [ ] GitHub Actions設定
  - [ ] .github/workflows/e2e-tests.yml
  - [ ] テスト実行トリガー設定
  - [ ] アーティファクト保存

## 完了条件
- Playwrightテスト環境が構築されている
- MCPを通じてテストが実行できる
- 基本的なテストが作成されている
- CI/CDでテストが自動実行される

## テスト項目
- [ ] Playwrightが正しくインストールされる
- [ ] MCPでブラウザを操作できる
- [ ] テストが正常に実行される
- [ ] スクリーンショットが保存される
- [ ] テストレポートが生成される

## 関連チケット
- #72: 認証フローE2Eテスト
- #73: コース視聴フローE2Eテスト
- #74: 管理画面E2Eテスト
- #75: クロスブラウザテスト

## MCP使用例
```typescript
// MCPを使用したテストの例
// browser_navigate でページ遷移
// browser_snapshot でページ状態取得
// browser_click で要素クリック
// browser_fill_form でフォーム入力
```

## 備考
- Playwrightの実行はMCP経由で行う
- テストはヘッドレスモードとヘッドフルモードの両方対応
- 失敗時のデバッグ情報を充実させる

## 完了日
-