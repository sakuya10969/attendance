# 技術スタック

## フロントエンド

- React Router / React Query / Mantine UI / axios / TanStack Table
- react-hook-form + zod（フォーム・バリデーション）
- dayjs（日付操作）
- orval（OpenAPIからAPI クライアント・型・React Query hooks自動生成）
- msw（モックAPI）
- アーキテクチャ: FSD Architecture

## バックエンド

- NestJS / PostgreSQL / Prisma
- @nestjs/swagger（OpenAPI生成）
- class-validator + class-transformer（DTO）
- firebase-admin（IDトークン検証）
- pino / nestjs-pino（ロギング）
- アーキテクチャ: Modular Monolith

## 認証

- Firebase Auth
- フロント: Firebase SDKでログイン → IDトークンをaxiosのAuthorizationヘッダに付与
- バックエンド: firebase-adminでトークン検証 → アプリ独自のuser/tenant/roleにマッピング
- Firebaseは認証のみ。認可・テナント管理はアプリ側DB

## API連携

- NestJSでSwagger JSON生成 → OrvalでTS型・APIクライアント・hooks自動生成
- 画面からaxiosを直接呼ばず、生成されたクライアント/hooksを使用
- axiosは共通インスタンスで認証ヘッダ・共通設定のみ担当
