# 仕様一覧

## 1. 認証・認可

### 1.1 認証フロー
- フロントエンドで Firebase SDK を使い Google ログインまたはメール/パスワードでログイン
- ログイン成功後、Firebase IDトークンを取得
- axios 共通インスタンスの Authorization ヘッダに `Bearer <token>` を自動付与
- バックエンドの AuthGuard で firebase-admin により IDトークンを検証
- 検証後、firebase_uid から users テーブルを引き、アプリ独自の user/tenant/role を取得
- リクエストオブジェクトに `{ userId, tenantId, role }` をセット

### 1.2 認可
- RolesGuard + @Roles() デコレータでエンドポイント単位のロール制御
- ロール: system_admin / tenant_admin / tenant_user
- テナントスコープ: tenant_admin / tenant_user のAPIは必ず自テナントの tenant_id でフィルタ
- system_admin はテナント横断アクセス可能（tenant_id フィルタなし）
- テナント停止中（status = suspended）の場合、所属ユーザーのAPI呼び出しを拒否（403）

### 1.3 フロントエンド認可
- ルートガードでロール判定し、権限外ルートへのアクセスをリダイレクト
- AppShell サイドバーのナビゲーション項目をロールに応じて出し分け
- ログイン後、/auth/me でユーザー情報取得 → ロールに応じたルートへリダイレクト

---

## 2. テナント管理

### 2.1 テナントCRUD（system_admin）
- テナント一覧: ページネーション、ステータスフィルタ
- テナント作成: テナント名 + 初期管理者（メールアドレス・氏名）を指定
- テナント詳細: テナント情報 + 所属ユーザー数
- テナント停止: status を suspended に変更、監査ログ記録
- テナント再開: status を active に変更、監査ログ記録

### 2.2 初期管理者設定フロー
1. system_admin がテナント作成フォームで管理者メールアドレスと氏名を入力
2. バックエンドで Firebase Admin SDK により該当メールのユーザーを作成 or 取得
3. users テーブルにレコード作成（firebase_uid, email, name, role=tenant_admin, tenant_id）
4. 監査ログに「テナント作成」「ユーザー作成」を記録
5. 既にFirebaseユーザーが存在する場合は取得して紐付け（重複作成しない）

---

## 3. ユーザー管理

### 3.1 テナント内ユーザー管理（tenant_admin）
- ユーザー一覧: テナント内のユーザーをページネーション表示
- ユーザー作成: メールアドレス・氏名・ロール（tenant_admin or tenant_user）を指定
  - Firebase Admin SDK でユーザー作成 or 取得 → users テーブルに作成
- ユーザー更新: 氏名変更
- ロール変更: tenant_admin ↔ tenant_user の切り替え、監査ログ記録
- ユーザー無効化: is_active = false に変更（論理無効化）

---

## 4. 打刻

### 4.1 出勤打刻
- tenant_user が出勤ボタンを押下
- バックエンドで当日の attendances レコードを確認し、未出勤なら作成
- 既に出勤済みの場合はエラー（1日1回制限）
- clock_in に現在時刻（UTC）をセット、status = working

### 4.2 退勤打刻
- 出勤済み（clock_in あり、clock_out なし）の場合のみ可能
- clock_out に現在時刻をセット
- 日跨ぎ判定: clock_out の日付が clock_in の日付と異なる場合、is_overnight = true
- status = completed に更新

### 4.3 休憩
- 出勤中（status = working）の場合のみ開始可能
- break_records に start_time をセットして作成
- 休憩終了時に end_time をセット
- 1日に複数回の休憩を記録可能
- 未終了の休憩がある場合、新しい休憩は開始不可

### 4.4 打刻画面
- 現在の勤怠状態を表示（未出勤 / 勤務中 / 休憩中 / 退勤済み）
- 状態に応じたボタンを表示（出勤 / 退勤 / 休憩開始 / 休憩終了）
- 現在時刻をリアルタイム表示
- 本日の勤務時間・休憩時間を表示

---

## 5. 打刻修正

### 5.1 修正申請（tenant_user）
- 対象の勤怠レコードを選択し、修正後の出勤/退勤時刻と理由を入力
- clock_corrections レコードを作成（status = pending）
- 締め処理済みの月の勤怠は修正申請不可

### 5.2 承認・差し戻し（tenant_admin）
- pending の申請一覧を表示
- 承認: status = approved、対象の attendances レコードを修正値で更新、監査ログ記録
- 差し戻し: status = rejected、監査ログ記録

---

## 6. 休暇申請

### 6.1 申請（tenant_user）
- 休暇種別（paid / unpaid / sick / other）、開始日、終了日、理由を入力
- leave_requests レコードを作成（status = pending）
- 開始日 ≤ 終了日のバリデーション

### 6.2 承認・差し戻し（tenant_admin）
- pending の申請一覧を表示
- 承認: status = approved、対象日の attendances に status = holiday のレコードを作成、監査ログ記録
- 差し戻し: status = rejected、監査ログ記録

---

## 7. 締め処理

### 7.1 締め実行（tenant_admin）
- 対象年月を指定して締め実行
- closing_records レコードを作成（status = closed）
- 締め済みの月の勤怠データは変更不可（打刻修正申請も不可）
- 同一年月の重複締めはエラー
- 監査ログ記録

### 7.2 締め再開（tenant_admin）
- 締め済みレコードの status を reopened に変更
- 再開後は勤怠データの変更が可能になる
- 監査ログ記録

---

## 8. 勤怠集計

### 8.1 集計項目
- 総勤務時間（clock_in 〜 clock_out − 休憩時間）
- 残業時間（所定勤務時間を超えた分）
- 深夜時間（22:00–5:00 JST の勤務時間）
- 出勤日数 / 欠勤日数 / 休暇日数

### 8.2 閲覧範囲
- tenant_user: 自身の月次集計
- tenant_admin: テナント内全従業員の月次集計（一覧 + 個別）

### 8.3 表示
- TanStack Table で月次勤怠一覧を表示
- 日別の出勤/退勤/休憩/勤務時間を行表示
- 月合計を集計行で表示

---

## 9. 監査ログ

### 9.1 記録対象
- 打刻修正の承認/差し戻し
- 休暇申請の承認/差し戻し
- 締め処理の実行/再開
- テナントの作成/停止/再開
- ユーザーの作成/ロール変更/無効化

### 9.2 記録内容
- actor_id: 操作者のuser_id
- action: 操作種別（例: `clock_correction.approve`, `tenant.suspend`）
- target_type / target_id: 対象エンティティ
- detail: 変更前後の値をJSONBで保存

### 9.3 閲覧
- system_admin: 全テナントの監査ログ（/system/audit-logs）
- tenant_admin: 自テナントの監査ログ（/admin/audit-logs）
- フィルタ: 操作種別、操作者、日付範囲
- ページネーション対応

---

## 10. テナント設定（tenant_admin）

### 10.1 部署管理
- 部署の作成・更新・一覧表示
- 従業員に部署を紐付け

### 10.2 勤務形態管理
- 勤務形態の作成・更新・一覧表示
- 所定開始時刻、所定終了時刻、所定休憩時間を設定
- 従業員に勤務形態を紐付け

---

## 11. 初期セットアップ

### 11.1 初期システム管理者
- `scripts/create-system-admin.ts` で作成
- 引数: メールアドレス、氏名
- 処理: Firebase ユーザー作成/取得 → users テーブル作成 → system_admin ロール付与
- 冪等: 既存ユーザーがいれば再利用、重複作成しない
- NestJS ApplicationContext + Service 経由で処理（直接DB操作しない）
