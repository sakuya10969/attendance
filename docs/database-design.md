# データベース設計

## 方針

- PostgreSQL を使用
- Prisma ORM でスキーマ管理・マイグレーション
- 主要テーブルに `tenant_id` を持たせて行レベルのテナント分離
- 日時は UTC で保存、アプリ層で JST 変換
- UUID を主キーに使用
- 論理削除は使用しない（is_active フラグで制御するケースはUserのみ）

## ER図（概要）

```
Tenant ─┬── User
        ├── Employee ──── Attendance ──── BreakRecord
        │                     │
        │                ClockCorrection
        ├── Department
        ├── WorkPattern
        ├── LeaveRequest
        ├── ClosingRecord
        └── AuditLog
```

## テーブル定義

### tenants

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | テナントID |
| name | VARCHAR(255) | NOT NULL | テナント名 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active / suspended |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新日時 |

### users

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | ユーザーID |
| firebase_uid | VARCHAR(128) | UNIQUE, NOT NULL | Firebase UID |
| email | VARCHAR(255) | NOT NULL | メールアドレス |
| name | VARCHAR(255) | NOT NULL | 表示名 |
| role | VARCHAR(20) | NOT NULL | system_admin / tenant_admin / tenant_user |
| tenant_id | UUID | FK → tenants, NULL可 | 所属テナント |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 有効フラグ |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新日時 |

**インデックス**: `firebase_uid` (UNIQUE), `tenant_id`, `email`

### employees

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 従業員ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| user_id | UUID | FK → users, NULL可 | 紐付くユーザー |
| employee_number | VARCHAR(50) | NOT NULL | 社員番号 |
| name | VARCHAR(255) | NOT NULL | 氏名 |
| department_id | UUID | FK → departments, NULL可 | 部署 |
| work_pattern_id | UUID | FK → work_patterns, NULL可 | 勤務形態 |
| joined_at | DATE | NOT NULL | 入社日 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |

**インデックス**: `tenant_id`, `(tenant_id, employee_number)` UNIQUE

### departments

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 部署ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| name | VARCHAR(255) | NOT NULL | 部署名 |

**インデックス**: `tenant_id`

### work_patterns

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 勤務形態ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| name | VARCHAR(255) | NOT NULL | 勤務形態名 |
| start_time | TIME | NOT NULL | 所定開始時刻 |
| end_time | TIME | NOT NULL | 所定終了時刻 |
| break_minutes | INTEGER | NOT NULL, DEFAULT 60 | 所定休憩（分） |

**インデックス**: `tenant_id`

### attendances

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 勤怠ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| employee_id | UUID | FK → employees, NOT NULL | 従業員 |
| date | DATE | NOT NULL | 勤務日 |
| clock_in | TIMESTAMPTZ | NULL可 | 出勤打刻 |
| clock_out | TIMESTAMPTZ | NULL可 | 退勤打刻 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'working' | working / completed / absent / holiday |
| is_overnight | BOOLEAN | NOT NULL, DEFAULT false | 日跨ぎフラグ |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新日時 |

**インデックス**: `(tenant_id, employee_id, date)` UNIQUE, `tenant_id`

### break_records

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 休憩ID |
| attendance_id | UUID | FK → attendances, NOT NULL | 勤怠レコード |
| start_time | TIMESTAMPTZ | NOT NULL | 休憩開始 |
| end_time | TIMESTAMPTZ | NULL可 | 休憩終了 |

**インデックス**: `attendance_id`

### clock_corrections

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 申請ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| attendance_id | UUID | FK → attendances, NOT NULL | 対象勤怠 |
| requested_by | UUID | FK → employees, NOT NULL | 申請者 |
| original_clock_in | TIMESTAMPTZ | NULL可 | 修正前出勤 |
| original_clock_out | TIMESTAMPTZ | NULL可 | 修正前退勤 |
| corrected_clock_in | TIMESTAMPTZ | NULL可 | 修正後出勤 |
| corrected_clock_out | TIMESTAMPTZ | NULL可 | 修正後退勤 |
| reason | TEXT | NOT NULL | 修正理由 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending / approved / rejected |
| reviewed_by | UUID | FK → users, NULL可 | 承認者 |
| reviewed_at | TIMESTAMPTZ | NULL可 | 承認日時 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 申請日時 |

**インデックス**: `tenant_id`, `attendance_id`, `status`

### leave_requests

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 申請ID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| employee_id | UUID | FK → employees, NOT NULL | 申請者 |
| leave_type | VARCHAR(20) | NOT NULL | paid / unpaid / sick / other |
| start_date | DATE | NOT NULL | 開始日 |
| end_date | DATE | NOT NULL | 終了日 |
| reason | TEXT | NULL可 | 理由 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending / approved / rejected |
| reviewed_by | UUID | FK → users, NULL可 | 承認者 |
| reviewed_at | TIMESTAMPTZ | NULL可 | 承認日時 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 申請日時 |

**インデックス**: `tenant_id`, `employee_id`, `status`

### closing_records

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 締めID |
| tenant_id | UUID | FK → tenants, NOT NULL | テナント |
| year_month | VARCHAR(7) | NOT NULL | 対象年月（YYYY-MM） |
| closed_by | UUID | FK → users, NOT NULL | 実行者 |
| closed_at | TIMESTAMPTZ | NOT NULL | 実行日時 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'closed' | closed / reopened |

**インデックス**: `(tenant_id, year_month)` UNIQUE

### audit_logs

| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | ログID |
| tenant_id | UUID | FK → tenants, NULL可 | テナント（system操作はnull） |
| actor_id | UUID | FK → users, NOT NULL | 操作者 |
| action | VARCHAR(100) | NOT NULL | 操作種別 |
| target_type | VARCHAR(50) | NOT NULL | 対象エンティティ種別 |
| target_id | UUID | NULL可 | 対象エンティティID |
| detail | JSONB | NULL可 | 変更内容詳細 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 記録日時 |

**インデックス**: `tenant_id`, `actor_id`, `action`, `created_at`

---

## 共通ルール

- 全テーブルの主キーは UUID v4
- `created_at` は INSERT 時に自動設定
- `updated_at` は Prisma の `@updatedAt` で自動更新
- テナントスコープのクエリは必ず `WHERE tenant_id = ?` を含める
- TIMESTAMPTZ 型で UTC 保存を徹底
