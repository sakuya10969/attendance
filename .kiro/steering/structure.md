# ディレクトリ構成

## フロントエンド（FSD Architecture）

```
client/app/
├── shared/
│   ├── api/              # axios共通インスタンス、Orval生成物（型・クライアント・hooks）
│   ├── auth/             # Firebase Auth初期化、認証コンテキスト、トークン管理
│   ├── guards/           # ロールベースルートガード（system_admin / tenant_admin / tenant_user）
│   ├── hooks/            # 共通カスタムフック
│   ├── lib/              # dayjs設定、ユーティリティ
│   └── ui/               # 共通UIコンポーネント（PageLayout等）
├── entities/
│   ├── user/             # ユーザーエンティティ
│   ├── tenant/           # テナントエンティティ
│   ├── employee/         # 従業員エンティティ
│   └── attendance/       # 勤怠エンティティ
├── features/
│   ├── clock/            # 打刻（出勤・退勤）
│   ├── clock-correction/ # 打刻修正申請
│   ├── leave-request/    # 休暇申請
│   ├── approval/         # 承認フロー
│   ├── closing/          # 締め処理
│   ├── tenant-mgmt/      # テナント管理（system_admin用: 作成・停止・再開）
│   └── user-mgmt/        # ユーザー管理（tenant_admin用）
├── widgets/
│   ├── attendance-table/ # 勤怠一覧テーブル
│   ├── dashboard/        # ダッシュボード
│   └── audit-log-table/  # 監査ログテーブル
└── routes/
    ├── system/           # /system/* — system_admin向け画面
    │   ├── tenants/      # テナント一覧・作成・詳細
    │   └── audit-logs/   # 全体監査ログ
    ├── admin/            # /admin/* — tenant_admin向け画面
    │   ├── users/        # テナント内ユーザー管理
    │   ├── settings/     # 部署・勤務形態・休日・承認フロー・締め設定
    │   └── audit-logs/   # テナント内監査ログ
    └── app/              # /app/* — tenant_user向け画面
        ├── clock/        # 打刻画面
        ├── attendance/   # 勤怠一覧
        ├── corrections/  # 打刻修正申請
        └── leaves/       # 休暇申請
```

### ルーティング方針
- 1つのアプリとして構成（分割しない）
- ロールごとにルートプレフィックスを分離: `/system/*`, `/admin/*`, `/app/*`
- `shared/guards/` のルートガードでロール判定し、権限外アクセスをブロック
- ナビゲーション（AppShell Sidebar）もロールに応じて表示項目を切り替え

## バックエンド（Modular Monolith）

```
server/
├── src/
│   ├── share/
│   │   ├── guards/           # AuthGuard（Firebase token検証）、RolesGuard（ロール制御）
│   │   ├── decorators/       # @Roles(), @CurrentUser() 等のカスタムデコレータ
│   │   ├── interceptors/     # ロギング、レスポンス変換
│   │   ├── filters/          # 例外フィルタ
│   │   └── pipes/            # バリデーションパイプ
│   ├── modules/
│   │   ├── auth/             # Firebase token検証、認証ミドルウェア
│   │   ├── users/            # ユーザーCRUD、ロール管理
│   │   ├── tenants/          # テナントCRUD（作成・停止・再開）、初期管理者設定
│   │   ├── employees/        # 従業員管理
│   │   ├── attendance/       # 勤怠（打刻・集計）
│   │   ├── leave-requests/   # 休暇申請
│   │   ├── approvals/        # 承認フロー
│   │   ├── closing/          # 締め処理
│   │   └── audit-logs/       # 監査ログ（記録・閲覧）
│   ├── prisma/               # PrismaService、マイグレーション
│   ├── app.module.ts
│   └── main.ts
├── scripts/
│   └── create-system-admin.ts  # 初期system_admin作成スクリプト（冪等）
├── prisma/
│   └── schema.prisma
└── test/
```

### モジュール設計方針
- 各モジュール内で Controller / Service / DTO / Prisma access を閉じる
- モジュール間の依存は Service の import で明示的に行う
- `common/` に横断的関心事（認証Guard、ロールGuard、デコレータ）を配置
- `audit-logs` モジュールは他モジュールから呼び出されて監査ログを記録する

### 認可の実装箇所
- `common/guards/RolesGuard` — ロールベースのアクセス制御
- `common/decorators/@Roles()` — エンドポイントに必要ロールを宣言
- `common/decorators/@CurrentUser()` — リクエストからユーザー情報を取得
- テナントスコープのデータアクセスは各Serviceで `tenant_id` フィルタを適用
