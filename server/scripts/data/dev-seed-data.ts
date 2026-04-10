export const tenantSeed = {
  name: 'Development Tenant',
  workPattern: {
    name: 'Standard Day',
    startTime: '09:00',
    endTime: '18:00',
    breakMinutes: 60,
  },
  departments: ['Operations', 'Storefront', 'Sales', 'Support'] as const,
} as const

export const authSeedUsers = [
  {
    email: 'dev-admin@example.com',
    displayName: 'Dev Admin',
  },
  {
    email: 'manager@example.com',
    displayName: 'Manager User',
  },
  {
    email: 'member1@example.com',
    displayName: 'Member One',
  },
  {
    email: 'member2@example.com',
    displayName: 'Member Two',
  },
  {
    email: 'member3@example.com',
    displayName: 'Member Three',
  },
  {
    email: 'member4@example.com',
    displayName: 'Member Four',
  },
] as const

export const appSeedUsers = [
  {
    email: 'dev-admin@example.com',
    name: 'Dev Admin',
    role: 'tenant_admin',
    employeeNumber: 'A-001',
    departmentName: 'Operations',
  },
  {
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'tenant_admin',
    employeeNumber: 'A-002',
    departmentName: 'Operations',
  },
  {
    email: 'member1@example.com',
    name: 'Member One',
    role: 'tenant_user',
    employeeNumber: 'A-003',
    departmentName: 'Storefront',
  },
  {
    email: 'member2@example.com',
    name: 'Member Two',
    role: 'tenant_user',
    employeeNumber: 'A-004',
    departmentName: 'Sales',
  },
  {
    email: 'member3@example.com',
    name: 'Member Three',
    role: 'tenant_user',
    employeeNumber: 'A-005',
    departmentName: 'Support',
  },
  {
    email: 'member4@example.com',
    name: 'Member Four',
    role: 'tenant_user',
    employeeNumber: 'A-006',
    departmentName: 'Storefront',
  },
] as const
