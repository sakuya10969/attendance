export interface CurrentUser {
  userId: string;
  tenantId: string | null;
  role: string;
}
