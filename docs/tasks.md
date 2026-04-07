# タスク一覧

## フェーズ1: 基盤構築

### 1.1 バックエンド基盤
- [ ] Prisma スキーマ定義（tenants, users, employees, departments, work_patterns, attendances, break_records, clock_corrections, leave_requests, closing_records, audit_logs）
- [ ] マイグレーション実行・PostgreSQL接続確認
- [ ] PrismaService 作成（NestJS グローバルモジュール）
- [ ] 共通基盤: AuthGuard（firebase-admin IDトークン検証）
- [ ] 共通基盤: RolesGuard + @Roles() デコレータ
- [ ] 共通基盤: @CurrentUser() デコレータ（userId, tenantId, role をリクエストから取得）
- [ ] 共通基盤: HttpException フィルタ（統一エラーレスポンス形式）
- [ ] 共通基盤: ValidationPipe 設定（class-validator）
- [ ] Firebase Admin SDK 初期化（環境変数でサービスアカウント設定）
- [ ] @nestjs/swagger 設定、Swagger UI 表示確認
- [ ] pino / nestjs-pino ロガー設定

### 1.2 フロントエンド基盤
- [ ] Mantine UI セットアップ、テーマ設定（DESIGN.md準拠）
- [ ] AppShell レイアウト（Header + Sidebar + Main）
- [ ] PageLayout 共通コンポーネント（タイトル + アクションバー）
- [ ] axios 共通インスタンス（ベースURL、Bearer token自動付与、エラーハンドリング）
- [ ] React Query セットアップ（QueryClientProvider）
- [ ] Firebase Auth 初期化、認証コンテキスト（AuthProvider）
- [ ] ログイン画面（メール/パスワード）
- [ ] ルートガード実装（ロール判定 → 権限外リダイレクト）
- [ ] ロール別ルーティング設定（/system/*, /admin/*, /app/*）
- [ ] サイドバーナビゲーション（ロールに応じた出し分け）

### 1.3 ブートストラップ
- [ ] `scripts/create-system-admin.ts` 実装
  - NestJS ApplicationContext 起動
  - Firebase Admin SDK でユーザー作成 or 取得
  - users テーブルに system_admin ロールで作成
  - 冪等性確保（既存チェック）
  - 実行確認

---

## フェーズ2: テナント・ユーザー管理

### 2.1 テナント管理API（system_admin）
- [ ] TenantsModule 作成（Controller / Service / DTO）
- [ ] POST /api/v1/tenants — テナント作成 + 初期管理者設定
  - Firebase Admin SDK でユーザー作成/取得 → users作成 → tenant_admin付与
- [ ] GET /api/v1/tenants — テナント一覧（ページネーション、ステータスフィルタ）
- [ ] GET /api/v1/tenants/:id — テナント詳細
- [ ] PATCH /api/v1/tenants/:id — テナント更新
- [ ] POST /api/v1/tenants/:id/suspend — テナント停止 + 監査ログ
- [ ] POST /api/v1/tenants/:id/resume — テナント再開 + 監査ログ

### 2.2 ユーザー管理API（tenant_admin）
- [ ] UsersModule 作成（Controller / Service / DTO）
- [ ] POST /api/v1/users — ユーザー作成（Firebase連携）
- [ ] GET /api/v1/users — テナント内ユーザー一覧
- [ ] PATCH /api/v1/users/:id — ユーザー更新
- [ ] PATCH /api/v1/users/:id/role — ロール変更 + 監査ログ
- [ ] PATCH /api/v1/users/:id/deactivate — ユーザー無効化

### 2.3 テナント管理画面（system_admin）
- [ ] /system/tenants — テナント一覧画面（TanStack Table）
- [ ] /system/tenants/new — テナント作成フォーム（初期管理者入力含む）
- [ ] /system/tenants/:id — テナント詳細画面

### 2.4 ユーザー管理画面（tenant_admin）
- [ ] /admin/users — ユーザー一覧画面
- [ ] /admin/users/new — ユーザー作成フォーム
- [ ] ロール変更・無効化のUI

---

## フェーズ3: 勤怠コア機能

### 3.1 打刻API
- [ ] AttendanceModule 作成（Controller / Service / DTO）
- [ ] POST /api/v1/attendance/clock-in — 出勤打刻（1日1回制限、重複チェック）
- [ ] POST /api/v1/attendance/clock-out — 退勤打刻（日跨ぎ判定、is_overnight設定）
- [ ] POST /api/v1/attendance/break/start — 休憩開始（未終了チェック）
- [ ] POST /api/v1/attendance/break/end — 休憩終了
- [ ] GET /api/v1/attendance/today — 本日の勤怠状態取得

### 3.2 勤怠一覧API
- [ ] GET /api/v1/attendance — 自身の勤怠一覧（月指定、ページネーション）
- [ ] GET /api/v1/attendance/summary — 自身の月次集計
- [ ] GET /api/v1/admin/attendance — テナント内全従業員の勤怠一覧（tenant_admin）
- [ ] GET /api/v1/admin/attendance/summary — テナント内月次集計（tenant_admin）

### 3.3 従業員管理API
- [ ] EmployeesModule 作成（Controller / Service / DTO）
- [ ] CRUD API（一覧・作成・詳細・更新）

### 3.4 打刻画面
- [ ] /app/clock — 打刻画面
  - 現在の勤怠状態表示（未出勤/勤務中/休憩中/退勤済み）
  - 状態に応じたボタン表示
  - 現在時刻リアルタイム表示
  - 本日の勤務時間・休憩時間表示

### 3.5 勤怠一覧画面
- [ ] /app/attendance — 自身の月次勤怠一覧（TanStack Table）
- [ ] /admin/attendance — テナント内勤怠一覧（tenant_admin）

---

## フェーズ4: 申請・承認

### 4.1 打刻修正API
- [ ] ClockCorrectionsModule 作成
- [ ] POST /api/v1/clock-corrections — 修正申請作成（締め済みチェック）
- [ ] GET /api/v1/clock-corrections — 自身の申請一覧
- [ ] GET /api/v1/admin/clock-corrections — テナント内申請一覧（tenant_admin）
- [ ] POST /api/v1/admin/clock-corrections/:id/approve — 承認（attendances更新 + 監査ログ）
- [ ] POST /api/v1/admin/clock-corrections/:id/reject — 差し戻し + 監査ログ

### 4.2 休暇申請API
- [ ] LeaveRequestsModule 作成
- [ ] POST /api/v1/leave-requests — 休暇申請作成（日付バリデーション）
- [ ] GET /api/v1/leave-requests — 自身の申請一覧
- [ ] GET /api/v1/admin/leave-requests — テナント内申請一覧（tenant_admin）
- [ ] POST /api/v1/admin/leave-requests/:id/approve — 承認（holiday レコード作成 + 監査ログ）
- [ ] POST /api/v1/admin/leave-requests/:id/reject — 差し戻し + 監査ログ

### 4.3 申請画面
- [ ] /app/corrections — 打刻修正申請一覧・作成フォーム
- [ ] /app/leaves — 休暇申請一覧・作成フォーム

### 4.4 承認管理画面
- [ ] /admin/clock-corrections — 打刻修正承認画面
- [ ] /admin/leave-requests — 休暇申請承認画面

---

## フェーズ5: 締め・集計

### 5.1 締め処理API
- [ ] ClosingModule 作成
- [ ] POST /api/v1/admin/closing — 締め実行（重複チェック + 監査ログ）
- [ ] POST /api/v1/admin/closing/:id/reopen — 締め再開 + 監査ログ
- [ ] GET /api/v1/admin/closing — 締め履歴一覧

### 5.2 集計ロジック
- [ ] 月次集計: 総勤務時間、残業時間、深夜時間（22:00–5:00 JST）、出勤/欠勤/休暇日数
- [ ] 所定勤務時間は work_patterns から取得

### 5.3 締め・集計画面
- [ ] /admin/closing — 締め管理画面（実行・再開・履歴）
- [ ] 集計表示（月合計行付きテーブル）

---

## フェーズ6: 監査ログ・設定

### 6.1 監査ログ
- [ ] AuditLogsModule 作成
- [ ] AuditLogService.record() — 各モジュールから呼び出す共通記録メソッド
- [ ] GET /api/v1/system/audit-logs — 全体監査ログ（system_admin）
- [ ] GET /api/v1/admin/audit-logs — テナント内監査ログ（tenant_admin）
- [ ] フィルタ: action, actor_id, 日付範囲 / ページネーション

### 6.2 監査ログ画面
- [ ] /system/audit-logs — 全体監査ログ画面
- [ ] /admin/audit-logs — テナント内監査ログ画面

### 6.3 テナント設定API
- [ ] 部署CRUD API（/api/v1/admin/departments）
- [ ] 勤務形態CRUD API（/api/v1/admin/work-patterns）

### 6.4 テナント設定画面
- [ ] /admin/settings — 部署・勤務形態管理画面

---

## フェーズ7: OpenAPI連携・仕上げ

### 7.1 API自動生成
- [ ] @nestjs/swagger で全エンドポイントのSwagger JSON生成確認
- [ ] Orval 設定・実行（TS型 / axiosクライアント / React Query hooks 生成）
- [ ] フロントエンドを生成クライアント/hooksに切り替え

### 7.2 テスト・品質
- [ ] バックエンド: 主要Service のユニットテスト
- [ ] バックエンド: 主要エンドポイントのE2Eテスト
- [ ] フロントエンド: 主要画面のコンポーネントテスト
