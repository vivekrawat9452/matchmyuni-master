import type {UserDto} from '../api/types';

export type AppRole = 'student' | 'agent';

const PARTNER_ROLES = new Set(['agent', 'partner', 'counsellor']);

/** True when the user should see the partner (agent) app after login. */
export function isPartnerAppUser(user: UserDto | null, storedRole: AppRole | null): boolean {
  if (storedRole === 'agent') {
    return true;
  }
  if (storedRole === 'student') {
    return false;
  }
  const r = user?.role?.toLowerCase();
  return !!r && PARTNER_ROLES.has(r);
}

/** Map API role string to app navigation role. */
export function appRoleFromUser(user: UserDto | null): AppRole {
  return isPartnerAppUser(user, null) ? 'agent' : 'student';
}
