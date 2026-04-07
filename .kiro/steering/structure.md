# ディレクトリ構成

## フロントエンド（FSD Architecture）

```
client/app/
├── shared/api/       # axios共通設定、Orval生成物
├── entities/         # User, Employee, Attendance等の業務エンティティ
├── features/         # 打刻、申請、承認、締め処理等のユースケース
├── widgets/          # テーブル、ダッシュボード等の大きなUI部品
└── routes/           # 画面単位
```

## バックエンド（Modular Monolith）

```
server/src/
├── auth/             # 認証（Firebase token検証）
├── users/            # ユーザー管理
├── employees/        # 従業員管理
├── attendance/       # 勤怠（打刻・集計）
├── leave-requests/   # 休暇申請
├── approvals/        # 承認フロー
└── closing/          # 締め処理
```

各モジュール内で Controller / Service / DTO / Prisma access を閉じる。
