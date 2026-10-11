import { can, type Permission } from './permissions'
import type { Role } from '@/modules/catalog/data'
// The caller must supply a principal from a verified server session, never request data.
export function requirePermission(principal: { id: string; role: Role; institutionId: string } | null, permission: Permission, institutionId: string) {
 if (!principal) throw new Error('Unauthorized')
 if (!can(principal.role, permission)) throw new Error('Forbidden')
 if (principal.role !== 'admin' && principal.institutionId !== institutionId) throw new Error('Forbidden institution')
 return principal
}
