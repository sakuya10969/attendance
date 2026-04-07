# ドメイン設計

## エンティティ一覧

### Tenant（テナント）

企業単位の論理的な分離境界。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | テナントID |
| name | string | テナント名（企業名） |
| status | enum | active / suspended |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### User（ユーザー）

認証・認可の主体。Firebase Auth と紐付くが、業務データの正本はこのテーブル。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | ユーザーID |
| firebase_uid | string | Firebase Auth の UID |
| email | string | メールアドレス |
| name | string | 表示名 |
| role | enum | system_admin / tenant_admin / tenant_user |
| tenant_id | UUID? | 所属テナント（system_adminはnull可） |
| is_active | boolean | 有効/無効 |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### Employee（従業員）

テナント内の勤怠管理対象。Userと1:1で紐付く場合もあるが、概念的には分離。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 従業員ID |
| tenant_id | UUID | 所属テナント |
| user_id | UUID? | 紐付くユーザー（任意） |
| employee_number | string | 社員番号 |
| name | string | 氏名 |
| department_id | UUID? | 所属部署 |
| work_pattern_id | UUID? | 勤務形態 |
| joined_at | date | 入社日 |
| created_at | datetime | 作成日時 |

### Department（部署）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 部署ID |
| tenant_id | UUID | 所属テナント |
| name | string | 部署名 |

### WorkPattern（勤務形態）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 勤務形態ID |
| tenant_id | UUID | 所属テナント |
| name | string | 勤務形態名（例: 通常勤務、フレックス） |
| start_time | time | 所定開始時刻 |
| end_time | time | 所定終了時刻 |
| break_minutes | int | 所定休憩時間（分） |

### Attendance（勤怠レコード）

1日1レコード。打刻・休憩・集計値を保持。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 勤怠ID |
| tenant_id | UUID | テナント |
| employee_id | UUID | 従業員 |
| date | date | 勤務日 |
| clock_in | datetime? | 出勤打刻 |
| clock_out | datetime? | 退勤打刻 |
| status | enum | working / completed / absent / holiday |
| is_overnight | boolean | 日跨ぎ勤務フラグ |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### BreakRecord（休憩記録）

Attendanceに紐付く。1日に複数回の休憩を記録可能。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 休憩ID |
| attendance_id | UUID | 勤怠レコード |
| start_time | datetime | 休憩開始 |
| end_time | datetime? | 休憩終了 |

### ClockCorrection（打刻修正申請）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 申請ID |
| tenant_id | UUID | テナント |
| attendance_id | UUID | 対象勤怠レコード |
| requested_by | UUID | 申請者（employee_id） |
| original_clock_in | datetime? | 修正前出勤 |
| original_clock_out | datetime? | 修正前退勤 |
| corrected_clock_in | datetime? | 修正後出勤 |
| corrected_clock_out | datetime? | 修正後退勤 |
| reason | string | 修正理由 |
| status | enum | pending / approved / rejected |
| reviewed_by | UUID? | 承認者 |
| reviewed_at | datetime? | 承認日時 |
| created_at | datetime | 申請日時 |

### LeaveRequest（休暇申請）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 申請ID |
| tenant_id | UUID | テナント |
| employee_id | UUID | 申請者 |
| leave_type | enum | paid / unpaid / sick / other |
| start_date | date | 開始日 |
| end_date | date | 終了日 |
| reason | string? | 理由 |
| status | enum | pending / approved / rejected |
| reviewed_by | UUID? | 承認者 |
| reviewed_at | datetime? | 承認日時 |
| created_at | datetime | 申請日時 |

### ClosingRecord（締め処理）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | 締めID |
| tenant_id | UUID | テナント |
| year_month | string | 対象年月（YYYY-MM） |
| closed_by | UUID | 実行者 |
| closed_at | datetime | 実行日時 |
| status | enum | closed / reopened |

### AuditLog（監査ログ）

| フィールド | 型 | 説明 |
| --- | --- | --- |
| id | UUID | ログID |
| tenant_id | UUID? | テナント（system操作はnull） |
| actor_id | UUID | 操作者（user_id） |
| action | string | 操作種別（例: clock_correction.approve） |
| target_type | string | 対象エンティティ種別 |
| target_id | UUID? | 対象エンティティID |
| detail | jsonb | 変更内容の詳細 |
| created_at | datetime | 記録日時 |

---

## サービス層の責務

| サービス | 責務 |
| --- | --- |
| AuthService | Firebase IDトークン検証、ユーザーマッピング |
| UserService | ユーザーCRUD、ロール管理、Firebase連携 |
| TenantService | テナントCRUD（作成・停止・再開）、初期管理者設定 |
| EmployeeService | 従業員CRUD、部署・勤務形態紐付け |
| AttendanceService | 打刻処理、勤怠集計、日跨ぎ判定 |
| BreakService | 休憩開始・終了の記録 |
| ClockCorrectionService | 打刻修正申請の作成・承認・差し戻し |
| LeaveRequestService | 休暇申請の作成・承認・差し戻し |
| ClosingService | 月次締め処理の実行・再開 |
| AuditLogService | 監査ログの記録・検索・閲覧 |

---

## ドメインルール（主要なもの）

- 出勤打刻は1日1回のみ（重複打刻はエラー）
- 退勤打刻は出勤後のみ可能
- 日跨ぎ勤務: 退勤が翌日になる場合、出勤日の勤怠レコードに紐付ける
- 締め処理後の勤怠データは原則変更不可（再開が必要）
- 打刻修正・休暇申請は承認フローを経由する
- テナント停止中はそのテナントのユーザーはログイン後の操作不可
- 深夜時間帯（22:00–5:00）は集計時に区別する
