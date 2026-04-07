# 技術スタック

## フロントエンド

### コアライブラリ
- React Router — ルーティング、ロール別ルート分離（/system/*, /admin/*, /app/*）
- React Query — サーバー状態管理、キャッシュ、楽観的更新
- Mantine UI — UIコンポーネント、AppShellによるレイアウト
- axios — HTTP通信の共通クライアント（認証ヘッダ自動付与）
- TanStack Table — 一覧・集計・勤怠テーブル表示（ソート・フィルタ・ページネーション）

### 補助ライブラリ
- react-hook-form — 打刻修正、休暇申請、承認フォーム等の入力管理
- zod — フロント側入力バリデーション（react-hook-formと連携）
- dayjs — 勤怠に必要な日付・時刻操作（JST変換、深夜判定等）
- orval — NestJSが生成するSwagger JSONからTS型・APIクライアント・React Query hooksを自動生成
- msw — API未実装時のモック、画面先行開発・テスト用

### アーキテクチャ
- FSD Architecture（Feature-Sliced Design）
- ロール別ルーティング: /system/*, /admin/*, /app/*
- ルートガードでロールに応じたアクセス制御

## バックエンド

### コアライブラリ
- NestJS — フレームワーク
- PostgreSQL — データベース
- Prisma — ORM

### 補助ライブラリ
- @nestjs/swagger — Swagger UI表示、swagger.json / openapi.json 生成
- class-validator — Request DTOのバリデーション
- class-transformer — DTOの変換・整形
- firebase-admin — Firebase Auth IDトークン検証、ユーザー作成（テナント初期管理者・システム管理者）
- pino / nestjs-pino — APIログ、監査ログの出力基盤

### アーキテクチャ
- Modular Monolith（modules配下で業務単位に分割）
- 各モジュール内で Controller / Service / DTO / Prisma access を閉じる

## 認証・認可

### 認証（Firebase Auth）
- フロント: Firebase SDKでログイン → IDトークン取得 → axiosのAuthorizationヘッダにBearer tokenとして付与
- バックエンド: firebase-adminでIDトークン検証 → アプリ独自のuser/tenant/roleにマッピング
- Firebase は認証のみ担当

### 認可（アプリ側DB）
- ロール・テナント所属は PostgreSQL で管理（正本）
- Firebase custom claims は補助的にのみ使用（正本にしない）
- ロール: system_admin / tenant_admin / tenant_user
- バックエンドのGuard/Decoratorでロールベースのアクセス制御を実装
- フロントエンドのルートガードでロール別画面制御

### テナント作成時の初期管理者フロー
1. system_admin がGUIからテナント作成 + 初期管理者のメールアドレスを指定
2. バックエンドで Firebase Admin SDK によりユーザー作成 or 取得
3. アプリのuserテーブルに作成
4. tenant紐付け + tenant_admin ロール付与

### 初期システム管理者（ブートストラップ）
- `scripts/create-system-admin.ts` で作成（GUIに依存しない）
- NestJS ApplicationContext を利用し、Service経由で処理
- 冪等性あり（既存ユーザー再利用、重複防止）
- 用途: 初回環境構築・本番初期化・障害復旧

## API連携

### OpenAPI駆動
- NestJS側で @nestjs/swagger により Swagger JSON を生成
- フロント側で Orval を使い、Swagger JSON から以下を自動生成:
  - TypeScript 型定義
  - axios ベースの API クライアント
  - React Query hooks

### 運用方針
- フロントエンドは原則として axios を直接画面から叩かない
- 生成された API クライアント / hooks を利用する
- axios は共通インスタンスを持ち、認証ヘッダ（Bearer token）や共通設定のみを担当する
