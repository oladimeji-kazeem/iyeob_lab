import type { Role } from '@/modules/catalog/data'
export type Permission = 'submit' | 'grade' | 'manage'
export const can = (role: Role, permission: Permission) => ({ submit: ['student'], grade: ['lecturer'], manage: ['admin'] }[permission].includes(role))
