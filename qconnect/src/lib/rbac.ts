export const ROLES = {
  ADMIN: ["create", "read", "update", "delete"],
  PATIENT: ["read"],
};

export function hasPermission(role: string | undefined, action: string) {
  if (!role) return false;
  const perms = (ROLES as any)[role.toUpperCase()];
  if (!perms) return false;
  return perms.includes(action);
}