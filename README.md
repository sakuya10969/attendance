# 勤怠管理 SaaS

マルチテナント対応の勤怠管理 Web アプリケーション。  
企業ごとにテナントを分離し、従業員の出退勤・休暇・承認・締め処理を一元管理します。

## 主要機能

- 出退勤打刻（日跨ぎ勤務対応）
- 休憩管理
- 打刻修正・申請・承認フロー
- 休暇申請・承認
- 締め処理
- 勤怠一覧・集計
- テナント管理（作成・停止・再開）
- ユーザー管理（テナント内）
- 部署・勤務形態設定
- 監査ログ閲覧（全体 / テナント内）

## ロール

| ロール | スコープ | 主な操作 |
|--------|----------|----------|
| `system_admin` | 全テナント横断 | テナント CRUD、全体監査ログ閲覧 |
| `tenant_admin` | 自テナント内 | ユーザー管理、各種設定、テナント内監査ログ |
| `tenant_user` | 自身のデータ | 打刻、修正申請、休暇申請、勤怠閲覧 |

## 技術スタック

### フロントエンド (`client/`)

| カテゴリ | ライブラリ |
|----------|-----------|
| フレームワーク | React + React Router v7 |
| UI | Mantine UI v9 |
| サーバー状態管理 | TanStack React Query |
| テーブル | TanStack Table |
| フォーム | react-hook-form + zod |
| HTTP | axios |
| 認証 | Firebase Auth SDK |
| 日付操作 | dayjs |
| API 生成 | Orval（Swagger JSON → 型 / クライアント / hooks 自動生成） |
| アーキテクチャ | Feature-Sliced Design (FSD) |

### バックエンド (`server/`)

| カテゴリ | ライブラリ |
|----------|-----------|
| フレームワーク | NestJS v11 |
| ORM | Prisma v7 |
| DB | PostgreSQL 16 |
| 認証 | Firebase Admin SDK |
| バリデーション | class-validator + class-transformer |
| API ドキュメント | @nestjs/swagger（Swagger UI + JSON 自動生成） |
| ログ | pino + nestjs-pino |
| アーキテクチャ | Modular Monolith |

### インフラ

| サービス | 用途 |
|----------|------|
| Docker Compose | PostgreSQL ローカル環境 |
| Firebase Auth | 認証（IDトークン発行・検証） |
| Firebase Emulator | ローカル開発用認証エミュレータ |

## ディレクトリ構成

```
.
├── client/                # フロントエンド（React Router + Mantine）
│   ├── app/
│   │   ├── shared/        # API基盤、認証、共通UI、ガード
│   │   ├── routes/        # 画面ルート（system/*, admin/*, app/*）
│   │   └── widgets/       # 複合UIコンポーネント
│   └── orval.config.ts    # API クライアント自動生成設定
├── server/                # バックエンド（NestJS）
│   ├── src/
│   │   ├── auth/          # Firebase token 検証
│   │   ├── users/         # ユーザー CRUD・ロール管理
│   │   ├── tenants/       # テナント CRUD
│   │   ├── employees/     # 従業員管理
│   │   ├── attendance/    # 打刻・勤怠集計
│   │   ├── leave-requests/# 休暇申請
│   │   ├── closing/       # 締め処理
│   │   ├── audit-logs/    # 監査ログ
│   │   ├── settings/      # 部署・勤務形態設定
│   │   ├── share/         # Guard, Decorator, Filter, Pipe
│   │   └── prisma/        # Prisma Service
│   ├── prisma/
│   │   └── schema.prisma  # DB スキーマ定義
│   └── scripts/           # 管理スクリプト
├── docs/                  # 設計ドキュメント
├── docker-compose.yml     # PostgreSQL コンテナ
├── firebase.json          # Firebase Emulator 設定
└── DESIGN.md              # デザインシステム定義
```

## セットアップ

### 前提条件

- Node.js v20+
- pnpm（サーバー側）
- bun（クライアント側）
- Docker / Docker Compose
- Firebase CLI（`npm install -g firebase-tools`）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. PostgreSQL の起動

```bash
docker compose up -d
```

PostgreSQL が `localhost:5432` で起動します（DB: `attendance`, User: `admin`, Password: `password`）。

### 3. バックエンドのセットアップ

```bash
cd server
pnpm install
pnpm db:generate    # Prisma Client 生成
pnpm db:migrate     # マイグレーション実行
```

### 4. フロントエンドのセットアップ

```bash
cd client
bun install
bun run generate:api  # Swagger JSON から API クライアント生成
```

### 5. Firebase Emulator の起動

```bash
firebase emulators:start
```

Auth Emulator が `localhost:9099` で起動します。  
Emulator UI は自動的に利用可能になります。

### 6. 開発サーバーの起動

バックエンド:

```bash
cd server
pnpm start:dev
```

サーバーが `http://localhost:3000` で起動します。  
Swagger UI: `http://localhost:3000/api/docs`

フロントエンド:

```bash
cd client
bun run dev
```

## 初期データ

### システム管理者の作成

初回セットアップ時に、CLI スクリプトでシステム管理者を作成します。

```bash
cd server
pnpm create-system-admin
```

このスクリプトは冪等性があり、既存ユーザーがいる場合は再利用します。

### 開発用シードデータ

```bash
cd server
pnpm seed-auth    # Firebase Emulator にテスト用ユーザーを作成
pnpm seed-app     # アプリ DB にテストデータを投入
```

## API クライアント生成

バックエンドの Swagger JSON からフロントエンドの型定義・API クライアント・React Query hooks を自動生成します。

```bash
# サーバーを起動した状態で swagger.json を最新化後
cd client
bun run generate:api
```

生成先: `client/app/shared/api/`（endpoints / model）

## 認証・認可

- 認証: Firebase Auth（IDトークンの発行・検証）
- 認可: アプリ側 DB（PostgreSQL）がロール・テナント所属の正本
- Firebase custom claims は補助的にのみ使用

フロー:
1. フロントエンドで Firebase SDK によりログイン → IDトークン取得
2. axios の Authorization ヘッダに Bearer token として付与
3. バックエンドで firebase-admin により IDトークンを検証
4. アプリ独自の user / tenant / role にマッピングして認可判定

## ルーティング

ロール別にルートプレフィックスを分離:

| プレフィックス | 対象ロール | 画面例 |
|---------------|-----------|--------|
| `/system/*` | system_admin | テナント一覧・作成・詳細 |
| `/admin/*` | tenant_admin | ユーザー管理、各種設定 |
| `/app/*` | tenant_user | 打刻、勤怠一覧、修正申請、休暇申請 |

## 主要コマンド一覧

### サーバー

| コマンド | 説明 |
|---------|------|
| `pnpm start:dev` | 開発サーバー起動（ホットリロード） |
| `pnpm build` | プロダクションビルド |
| `pnpm db:migrate` | Prisma マイグレーション実行 |
| `pnpm db:generate` | Prisma Client 再生成 |
| `pnpm db:studio` | Prisma Studio（DB GUI）起動 |
| `pnpm db:reset` | DB リセット（全データ削除 + 再マイグレーション） |
| `pnpm create-system-admin` | 初期システム管理者作成 |
| `pnpm seed-auth` | Firebase Emulator にテストユーザー作成 |
| `pnpm seed-app` | アプリ DB にシードデータ投入 |
| `pnpm test` | テスト実行 |
| `pnpm lint` | ESLint 実行 |

### クライアント

| コマンド | 説明 |
|---------|------|
| `bun run dev` | 開発サーバー起動 |
| `bun run build` | プロダクションビルド |
| `bun run generate:api` | Orval で API クライアント自動生成 |
| `bun run typecheck` | 型チェック |
| `bun run format` | Prettier フォーマット |
