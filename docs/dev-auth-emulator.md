# Firebase Auth Emulator 開発メモ

## 目的

- 本番環境では Google ログインを使う
- 開発環境では Firebase Auth Emulator + Email/Password を使う
- 認証ユーザー投入とアプリ業務データ投入を分離する

## 環境変数

### client/.env

```env
VITE_FIREBASE_USE_AUTH_EMULATOR="true"
VITE_FIREBASE_AUTH_EMULATOR_URL="http://127.0.0.1:9099"
```

- `VITE_FIREBASE_USE_AUTH_EMULATOR=true` のときだけ React 側で Auth Emulator に接続する
- 本番ビルドで `VITE_FIREBASE_USE_AUTH_EMULATOR=true` が入っていた場合は即失敗する

### server/.env

```env
FIREBASE_USE_AUTH_EMULATOR="true"
FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
ALLOW_DEV_SEED="true"
DEV_AUTH_SEED_PASSWORD="dev-password-1234"
```

- `FIREBASE_USE_AUTH_EMULATOR=true` のときだけ NestJS / Admin SDK が Auth Emulator を使う
- `NODE_ENV=production` で Emulator 関連変数が入っていた場合は起動時に失敗する
- `seed-auth` / `seed-app` は `ALLOW_DEV_SEED=true` かつ Emulator 有効時のみ実行できる

## 実行手順

1. PostgreSQL を起動する

```bash
docker compose up -d postgres
```

2. Firebase Auth Emulator を起動する

```bash
firebase emulators:start --only auth
```

3. 開発用認証ユーザーを投入する

```bash
cd server
pnpm run seed-auth
```

4. アプリ業務データを投入する

```bash
cd server
pnpm run seed-app
```

5. API とフロントを起動する

```bash
cd server
pnpm run start:dev
```

```bash
cd client
pnpm run dev
```

6. フロントで Email/Password ログインする

- `member1@example.com`
- パスワードは `DEV_AUTH_SEED_PASSWORD`

## seed の責務

### seed-auth

- Firebase Auth Emulator に Email/Password ユーザーを作成する
- 既存メールアドレスがある場合は再利用し、必要なら表示名やパスワードを更新する
- アプリケーション DB は触らない

### seed-app

- Firebase UID をキーに users / tenant / employee / attendance / leave_requests / clock_corrections / closing_records を投入する
- パスワードは扱わない
- `seed-auth` 済みの Emulator ユーザーを前提とする

## 開発用ユーザー

- `dev-admin@example.com`
- `manager@example.com`
- `member1@example.com`

## 注意点

- `seed-auth` は本番 Firebase に向けて実行できないようにガードされている
- `seed-app` も開発用 seed として同じガードを通す
- Auth Emulator を使わない環境では、既存どおり Google ログインが主導線になる
