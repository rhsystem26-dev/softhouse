export const WRITE_ROLES = ["admin", "socio"] as const;
export type WriteRole = (typeof WRITE_ROLES)[number];
export const canWrite = (role: string): boolean =>
  (WRITE_ROLES as readonly string[]).includes(role);

export const MANAGE_ROLES = ["admin", "socio", "gerente"] as const;
export type ManageRole = (typeof MANAGE_ROLES)[number];
export const canManage = (role: string): boolean =>
  (MANAGE_ROLES as readonly string[]).includes(role);
