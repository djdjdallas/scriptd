/**
 * Team Permissions Utility
 * Handles role-based permissions for team operations
 */

// Role hierarchy (higher number = more permissions)
export const ROLES = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

// Role display names
export const ROLE_NAMES = {
  viewer: 'Viewer',
  editor: 'Editor',
  admin: 'Admin',
  owner: 'Owner',
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  viewer: 'Can view team content and scripts',
  editor: 'Can view and edit team scripts',
  admin: 'Can manage team members and settings',
  owner: 'Has full control over the team',
};

// Permission definitions
export const PERMISSIONS = {
  // Team management
  VIEW_TEAM: 'view_team',
  UPDATE_TEAM: 'update_team',
  DELETE_TEAM: 'delete_team',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
  
  // Member management
  VIEW_MEMBERS: 'view_members',
  INVITE_MEMBERS: 'invite_members',
  REMOVE_MEMBERS: 'remove_members',
  UPDATE_MEMBER_ROLES: 'update_member_roles',
  
  // Script management
  VIEW_SCRIPTS: 'view_scripts',
  CREATE_SCRIPTS: 'create_scripts',
  EDIT_SCRIPTS: 'edit_scripts',
  DELETE_SCRIPTS: 'delete_scripts',
  
  // Activity and analytics
  VIEW_ACTIVITY: 'view_activity',
  VIEW_ANALYTICS: 'view_analytics',
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  viewer: [
    PERMISSIONS.VIEW_TEAM,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.VIEW_SCRIPTS,
  ],
  editor: [
    PERMISSIONS.VIEW_TEAM,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.VIEW_SCRIPTS,
    PERMISSIONS.CREATE_SCRIPTS,
    PERMISSIONS.EDIT_SCRIPTS,
  ],
  admin: [
    PERMISSIONS.VIEW_TEAM,
    PERMISSIONS.UPDATE_TEAM,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.INVITE_MEMBERS,
    PERMISSIONS.REMOVE_MEMBERS,
    PERMISSIONS.UPDATE_MEMBER_ROLES,
    PERMISSIONS.VIEW_SCRIPTS,
    PERMISSIONS.CREATE_SCRIPTS,
    PERMISSIONS.EDIT_SCRIPTS,
    PERMISSIONS.DELETE_SCRIPTS,
    PERMISSIONS.VIEW_ACTIVITY,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  owner: [
    PERMISSIONS.VIEW_TEAM,
    PERMISSIONS.UPDATE_TEAM,
    PERMISSIONS.DELETE_TEAM,
    PERMISSIONS.TRANSFER_OWNERSHIP,
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.INVITE_MEMBERS,
    PERMISSIONS.REMOVE_MEMBERS,
    PERMISSIONS.UPDATE_MEMBER_ROLES,
    PERMISSIONS.VIEW_SCRIPTS,
    PERMISSIONS.CREATE_SCRIPTS,
    PERMISSIONS.EDIT_SCRIPTS,
    PERMISSIONS.DELETE_SCRIPTS,
    PERMISSIONS.VIEW_ACTIVITY,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) {
    return false;
  }
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if user role is higher than or equal to required role
 */
export function hasRoleLevel(userRole, requiredRole) {
  const userLevel = ROLES[userRole] || 0;
  const requiredLevel = ROLES[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check if user can perform an action on another user
 */
export function canManageUser(managerRole, targetRole) {
  const managerLevel = ROLES[managerRole] || 0;
  const targetLevel = ROLES[targetRole] || 0;
  
  // Can't manage users with equal or higher role
  // Exception: owners can manage other owners for transfers
  if (managerRole === 'owner' && targetRole === 'owner') {
    return true;
  }
  
  return managerLevel > targetLevel;
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(userRole) {
  const userLevel = ROLES[userRole] || 0;
  
  return Object.keys(ROLES).filter(role => {
    const roleLevel = ROLES[role];
    // Users can assign roles lower than their own
    // Exception: owners can assign any role including owner (for transfers)
    if (userRole === 'owner') {
      return true;
    }
    return roleLevel < userLevel;
  });
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role) {
  const colors = {
    owner: 'bg-purple-100 text-purple-800 border-purple-200',
    admin: 'bg-red-100 text-red-800 border-red-200',
    editor: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return colors[role] || colors.viewer;
}

/**
 * Get role icon for UI
 */
export function getRoleIcon(role) {
  const icons = {
    owner: '👑',
    admin: '🔧',
    editor: '✏️',
    viewer: '👁️',
  };
  
  return icons[role] || icons.viewer;
}

/**
 * Validate role assignment
 */
export function validateRoleAssignment({ assignerRole, currentRole, newRole }) {
  // Check if assigner can manage the target user
  if (!canManageUser(assignerRole, currentRole)) {
    return {
      valid: false,
      error: 'You do not have permission to manage this user',
    };
  }
  
  // Check if assigner can assign the new role
  const assignableRoles = getAssignableRoles(assignerRole);
  if (!assignableRoles.includes(newRole)) {
    return {
      valid: false,
      error: 'You cannot assign this role level',
    };
  }
  
  // Special case: transferring ownership
  if (newRole === 'owner' && assignerRole === 'owner') {
    return {
      valid: true,
      isOwnershipTransfer: true,
    };
  }
  
  return { valid: true };
}

/**
 * Get permissions for a role (for display purposes)
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check multiple permissions at once
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get user's effective permissions based on role
 */
export function getUserPermissions(role) {
  return {
    role,
    level: ROLES[role] || 0,
    permissions: ROLE_PERMISSIONS[role] || [],
    canInvite: hasPermission(role, PERMISSIONS.INVITE_MEMBERS),
    canManageMembers: hasPermission(role, PERMISSIONS.REMOVE_MEMBERS),
    canEditSettings: hasPermission(role, PERMISSIONS.UPDATE_TEAM),
    canDeleteTeam: hasPermission(role, PERMISSIONS.DELETE_TEAM),
    canCreateScripts: hasPermission(role, PERMISSIONS.CREATE_SCRIPTS),
    canEditScripts: hasPermission(role, PERMISSIONS.EDIT_SCRIPTS),
    canDeleteScripts: hasPermission(role, PERMISSIONS.DELETE_SCRIPTS),
    canViewAnalytics: hasPermission(role, PERMISSIONS.VIEW_ANALYTICS),
  };
}