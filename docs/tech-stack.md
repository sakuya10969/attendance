# 技術スタック

## フロントエンド

### コアライブラリ

| ライブラリ | 用途 |
| --- | --- |
| React Router | ルーティング、ロール別ルート分離（/system/*, /admin/*, /app/*） |
| React Query (TanStack Query) | サーバー状態管理、キャッシュ、楽観的更新 |
| Mantine UI | UIコンポーネント、AppShellレイアウト、テーマ管理 |
| axios | HTTP通信の共通クライアント（認証ヘッダ自動付与） |
| TanStack Table | 一覧・集計・勤怠テーブル表示（ソート・フィルタ・ページネーション） |

### 補助ライブラリ

| ライブラリ | 用途 |
| --- | --- |
| react-hook-form | 打刻修正、休暇申請、承認フォーム等の入力管理 |
| zod | フロント側入力バリデーション（react-hook-formと連携） |
| dayjs | 日付・時刻操作（JST変換、深夜判定、日跨ぎ計算等） |
| orval | NestJS Swagger JSONからTS型・APIクライアント・React Query hooksを自動生成 |
| msw | API未実装時のモック、画面先行開発・テスト用 |

### アーキテクチャ
- FSD Architecture（Feature-Sliced Design）
- shared / entities / features / widgets / routes のレイヤー構成

## バックエンド

### コアライブラリ

| ライブラリ | 用途 |
| --- | --- |
| NestJS | アプリケーションフレームワーク |
| PostgreSQL | データベース |
| Prisma | ORM、マイグレーション、型安全なDBアクセス |

### 補助ライブラリ

| ライブラリ | 用途 |
| --- | --- |
| @nestjs/swagger | Swagger UI表示、swagger.json / openapi.json 生成 |
| class-validator | Request DTOのバリデーション |
| class-transformer | DTOの変換・整形 |
| firebase-admin | IDトークン検証、ユーザー作成（テナント初期管理者・システム管理者） |
| pino / nestjs-pino | 構造化ログ出力（APIログ、監査ログ基盤） |

### アーキテクチャ
- Modular Monolith（modules配下で業務単位に分割）
- 各モジュール内で Controller / Service / DTO / Prisma access を閉じる

## 認証・認可

| 層 | 技術 | 責務 |
| --- | --- | --- |
| 認証 | Firebase Auth | ログイン、IDトークン発行・検証 |
| 認可 | PostgreSQL + NestJS Guards | ロール管理、テナント所属、アクセス制御 |

- Firebase custom claims は補助的利用のみ（正本はアプリ側DB）
- ロール: system_admin / tenant_admin / tenant_user

## API連携

- NestJS → @nestjs/swagger → Swagger JSON 生成
- Orval → Swagger JSON から TypeScript型 / axiosクライアント / React Query hooks を自動生成
- フロントエンドは生成されたクライアント/hooksを使用（axiosを直接呼ばない）
- axiosは共通インスタンスで認証ヘッダ・共通設定のみ担当

## インフラ

- Docker Compose によるローカル開発環境
- PostgreSQL コンテナ
- フロント / バックエンドそれぞれDockerfile あり
