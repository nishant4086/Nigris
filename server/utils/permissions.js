// Centralized role-based permissions for project collaboration.
// Each action maps to the minimum roles allowed to perform it.

const ROLE_HIERARCHY = ["viewer", "editor", "admin", "owner"];

const PERMISSIONS = {
  // Project management
  "project.delete":    ["owner"],
  "project.update":    ["owner", "admin"],
  "project.settings":  ["owner", "admin"],

  // User management
  "members.invite":    ["owner", "admin"],
  "members.remove":    ["owner", "admin"],
  "members.changeRole": ["owner"],
  "members.view":      ["owner", "admin", "editor", "viewer"],

  // Collections
  "collections.create": ["owner", "admin"],
  "collections.delete": ["owner", "admin"],
  "collections.update": ["owner", "admin", "editor"],

  // Entries
  "entries.create":    ["owner", "admin", "editor"],
  "entries.update":    ["owner", "admin", "editor"],
  "entries.delete":    ["owner", "admin", "editor"],
  "entries.read":      ["owner", "admin", "editor", "viewer"],

  // API Keys
  "apikeys.create":    ["owner", "admin"],
  "apikeys.delete":    ["owner", "admin"],
  "apikeys.view":      ["owner", "admin"],
};

export const hasPermission = (role, action) => {
  const allowed = PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
};

export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY.indexOf(role);
};

export { ROLE_HIERARCHY, PERMISSIONS };
