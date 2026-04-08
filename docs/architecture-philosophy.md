# アーキテクチャ思想

## 全体方針

- フロントエンドとバックエンドを明確に分離し、OpenAPI（Swagger JSON）を契約として接続する
- 認証と認可を分離する（Firebase Auth = 認証、アプリ側DB = 認可）
- マルチテナントはDB行レベル分離（tenant_id カラム）で実現する
- 監査ログを第一級の関心事として扱う

---

## フロントエンド: FSD Architecture（Feature-Sliced Design）

### レイヤー構成

```
shared → entities → features → widgets → routes
```

各レイヤーは上位レイヤーからのみ参照可能。逆方向の依存は禁止。

| レイヤー | 責務 | 例 |
| --- | --- | --- |
| shared | 横断的ユーティリティ、API基盤、認証、ガード | axios設定、Firebase Auth、ルートガード、PageLayout |
| entities | 業務エンティティの型・API・UI部品 | User, Tenant, Employee, Attendance |
| features | ユースケース単位の機能 | 打刻、打刻修正申請、休暇申請、承認、締め処理 |
| widgets | 複数entityやfeatureを組み合わせた大きなUI部品 | 勤怠一覧テーブル、ダッシュボード、監査ログテーブル |
| routes | 画面単位（ルーティングエントリポイント） | /system/*, /admin/*, /app/* |

### ルーティング設計

- 1つのSPAとして構成（マイクロフロントエンドにしない）
- ロール別にルートプレフィックスを分離:
  - `/system/*` — system_admin 向け
  - `/admin/*` — tenant_admin 向け
  - `/app/*` — tenant_user 向け
- `shared/guards/` にルートガードを配置し、ロール判定で権限外アクセスをブロック
- AppShell のサイドバーナビゲーションもロールに応じて表示項目を切り替え

### 状態管理方針

- サーバー状態: React Query（キャッシュ、再取得、楽観的更新）
- フォーム状態: react-hook-form + zod
- 認証状態: React Context（Firebase Auth のユーザー情報 + アプリ側ロール/テナント情報）
- グローバルUIステート: 必要最小限のみ（基本的にサーバー状態に寄せる）

### API呼び出し方針

- Orval で自動生成された API クライアント / React Query hooks を使用する
- axios を画面コンポーネントから直接呼ばない
- axios 共通インスタンスで Bearer token 自動付与、エラーハンドリング、ベースURL設定を一元管理

---

## バックエンド: Modular Monolith

### モジュール設計

```
server/src/
├── auth/           # 認証（Firebase token検証）
├── users/          # ユーザーCRUD、ロール管理
├── tenants/        # テナントCRUD、初期管理者設定
├── employees/      # 従業員管理
├── attendance/     # 打刻・勤怠集計
├── leave-requests/ # 休暇申請
├── approvals/      # 承認フロー
├── closing/        # 締め処理
└── audit-logs/     # 監査ログ記録・閲覧
```

### モジュール間ルール

- 各モジュールは Controller / Service / DTO / Prisma access を内部に閉じる
- モジュール間の依存は NestJS の Module imports + Service injection で明示的に行う
- 循環依存を避ける（必要な場合は forwardRef を検討するが、設計で回避を優先）
- `audit-logs` モジュールは他モジュールから呼び出されるユーティリティ的位置づけ

### 横断的関心事（share/）

```
server/src/share/
├── guards/       # AuthGuard（Firebase token検証）、RolesGuard（ロール制御）
├── decorators/   # @Roles(), @CurrentUser()
├── interceptors/ # ロギング、レスポンス変換
├── filters/      # 例外フィルタ（HttpException統一処理）
└── pipes/        # ValidationPipe設定
```

### 認可の実装パターン

1. `@Roles('system_admin')` デコレータでエンドポイントに必要ロールを宣言
2. `RolesGuard` がリクエストユーザーのロールを検証
3. `@CurrentUser()` デコレータでリクエストからユーザー情報（user_id, tenant_id, role）を取得
4. 各 Service でテナントスコープのデータアクセス時に `tenant_id` フィルタを適用

### エラーハンドリング

- NestJS の Exception Filter で統一的なエラーレスポンス形式を提供
- ビジネスロジックエラーはカスタム例外クラスで表現
- バリデーションエラーは class-validator + ValidationPipe で自動処理

---

## 認証・認可の分離原則

```
[Firebase Auth]          [アプリ側DB (PostgreSQL)]
  ↓                        ↓
  認証のみ                  認可の正本
  - ログイン                - ロール (system_admin / tenant_admin / tenant_user)
  - IDトークン発行           - テナント所属
  - トークン検証             - 権限判定
                            - ユーザー ↔ テナント紐付け
```

- Firebase custom claims は補助的にのみ使用（フロントでの初期ルーティング判定等）
- 正本は常にアプリ側DB
- バックエンドの認可判定は必ずDB上のロール情報を参照する

---

## マルチテナント戦略

- DB行レベル分離: 主要テーブルに `tenant_id` カラムを持たせる
- テナントスコープの強制: 各 Service で必ず `tenant_id` でフィルタする
- system_admin はテナント横断アクセスが可能（tenant_id フィルタなし）
- Firebase Auth の uid とアプリの user は別管理（user テーブルに firebase_uid を保持）
