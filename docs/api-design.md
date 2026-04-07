# APIデザイン

## 共通仕様

- ベースパス: `/api/v1`
- 認証: Bearer token（Firebase IDトークン）を Authorization ヘッダに付与
- レスポンス形式: JSON
- エラーレスポンス: `{ statusCode, message, error }`
- ページネーション: `?page=1&limit=20` → `{ data, total, page, limit }`
- 日時: ISO 8601（UTC）

---

## 認証

| メソッド | パス | 説明 | ロール |
| --- | --- | --- | --- |
| GET | /api/v1/auth/me | 現在のユーザー情報取得 | 全ロール |

---

## テナント管理（system_admin）

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /api/v1/tenants | テナント一覧 |
| POST | /api/v1/tenants | テナント作成（初期管理者メール指定） |
| GET | /api/v1/tenants/:id | テナント詳細 |
| PATCH | /api/v1/tenants/:id | テナント更新 |
| POST | /api/v1/tenants/:id/suspend | テナント停止 |
| POST | /api/v1/tenants/:id/resume | テナント再開 |

### テナント作成リクエスト例

```json
{
  "name": "株式会社サンプル",
  "adminEmail": "admin@example.com",
  "adminName": "田中太郎"
}
```

バックエンド処理:
1. テナントレコード作成
2. Firebase Admin SDK で adminEmail のユーザー作成 or 取得
3. users テーブルに作成
4. tenant_admin ロール付与
5. 監査ログ記録

---

## ユーザー管理（tenant_admin）

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /api/v1/users | テナント内ユーザー一覧 |
| POST | /api/v1/users | ユーザー作成 |
| GET | /api/v1/users/:id | ユーザー詳細 |
| PATCH | /api/v1/users/:id | ユーザー更新 |
| PATCH | /api/v1/users/:id/role | ロール変更 |
| PATCH | /api/v1/users/:id/deactivate | ユーザー無効化 |

---

## 従業員管理（tenant_admin）

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /api/v1/employees | 従業員一覧 |
| POST | /api/v1/employees | 従業員作成 |
| GET | /api/v1/employees/:id | 従業員詳細 |
| PATCH | /api/v1/employees/:id | 従業員更新 |

---

## 打刻（tenant_user）

| メソッド | パス | 説明 |
| --- | --- | --- |
| POST | /api/v1/attendance/clock-in | 出勤打刻 |
| POST | /api/v1/attendance/clock-out | 退勤打刻 |
| GET | /api/v1/attendance/today | 本日の勤怠状態取得 |

---

## 休憩（tenant_user）

| メソッド | パス | 説明 |
| --- | --- | --- |
| POST | /api/v1/attendance/break/start | 休憩開始 |
| POST | /api/v1/attendance/break/end | 休憩終了 |

---

## 勤怠一覧・集計

| メソッド | パス | 説明 | ロール |
| --- | --- | --- | --- |
| GET | /api/v1/attendance | 自身の勤怠一覧 | tenant_user |
| GET | /api/v1/attendance/summary | 月次集計 | tenant_user |
| GET | /api/v1/admin/attendance | テナント内全従業員の勤怠一覧 | tenant_admin |
| GET | /api/v1/admin/attendance/summary | テナント内月次集計 | tenant_admin |

クエリパラメータ: `?year=2026&month=4&employee_id=xxx`

---

## 打刻修正申請

| メソッド | パス | 説明 | ロール |
| --- | --- | --- | --- |
| POST | /api/v1/clock-corrections | 修正申請作成 | tenant_user |
| GET | /api/v1/clock-corrections | 自身の申請一覧 | tenant_user |
| GET | /api/v1/admin/clock-corrections | テナント内申請一覧 | tenant_admin |
| POST | /api/v1/admin/clock-corrections/:id/approve | 承認 | tenant_admin |
| POST | /api/v1/admin/clock-corrections/:id/reject | 差し戻し | tenant_admin |

---

## 休暇申請

| メソッド | パス | 説明 | ロール |
| --- | --- | --- | --- |
| POST | /api/v1/leave-requests | 休暇申請作成 | tenant_user |
| GET | /api/v1/leave-requests | 自身の申請一覧 | tenant_user |
| GET | /api/v1/admin/leave-requests | テナント内申請一覧 | tenant_admin |
| POST | /api/v1/admin/leave-requests/:id/approve | 承認 | tenant_admin |
| POST | /api/v1/admin/leave-requests/:id/reject | 差し戻し | tenant_admin |

---

## 締め処理（tenant_admin）

| メソッド | パス | 説明 |
| --- | --- | --- |
| POST | /api/v1/admin/closing | 締め実行 |
| POST | /api/v1/admin/closing/:id/reopen | 締め再開 |
| GET | /api/v1/admin/closing | 締め履歴一覧 |

リクエスト例: `{ "yearMonth": "2026-04" }`

---

## テナント設定（tenant_admin）

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /api/v1/admin/departments | 部署一覧 |
| POST | /api/v1/admin/departments | 部署作成 |
| PATCH | /api/v1/admin/departments/:id | 部署更新 |
| GET | /api/v1/admin/work-patterns | 勤務形態一覧 |
| POST | /api/v1/admin/work-patterns | 勤務形態作成 |
| PATCH | /api/v1/admin/work-patterns/:id | 勤務形態更新 |

---

## 監査ログ

| メソッド | パス | 説明 | ロール |
| --- | --- | --- | --- |
| GET | /api/v1/system/audit-logs | 全体監査ログ | system_admin |
| GET | /api/v1/admin/audit-logs | テナント内監査ログ | tenant_admin |

クエリパラメータ: `?action=xxx&actor_id=xxx&from=2026-04-01&to=2026-04-30&page=1&limit=50`
