import React, { createContext, useContext, useState, useEffect } from 'react';

const RbacContext = createContext();

export const ROLE_HIERARCHY = {
  SYSTEM_PROVIDER: {
    level: 1,
    roleName: 'System Provider',
    badge: 'PROVIDER',
    permissions: [
      'PROVISION_TENANT',
      'MANAGE_GLOBAL_TENANTS',
      'VIEW_TELEMETRY',
      'KILL_PROCESS',
      'DISABLE_PERSISTENCE',
      'MANAGE_USB',
      'EXPORT_REPORTS',
      'VERIFY_AUDIT_LOGS',
      'CLEAR_AUDIT_LOGS'
    ]
  },
  TENANT_ADMIN: {
    level: 2,
    roleName: 'Tenant Administrator',
    badge: 'TENANT ADMIN',
    permissions: [
      'MANAGE_ORGANIZATION',
      'MANAGE_TENANT_USERS',
      'VIEW_TELEMETRY',
      'KILL_PROCESS',
      'DISABLE_PERSISTENCE',
      'MANAGE_USB',
      'EXPORT_REPORTS',
      'VERIFY_AUDIT_LOGS'
    ]
  },
  TENANT_ANALYST: {
    level: 3,
    roleName: 'SOC Security Analyst',
    badge: 'ANALYST',
    permissions: [
      'VIEW_TELEMETRY',
      'KILL_PROCESS',
      'MANAGE_USB',
      'EXPORT_REPORTS',
      'VERIFY_AUDIT_LOGS'
    ]
  },
  TENANT_MEMBER: {
    level: 4,
    roleName: 'Tenant Member / Operator',
    badge: 'MEMBER',
    permissions: [
      'VIEW_TELEMETRY',
      'EXPORT_REPORTS'
    ]
  }
};

const EMPTY_USER = {
  id: '',
  name: '',
  email: '',
  role: '',
  roleName: '',
  badge: '',
  orgId: '',
  permissions: [],
  isGoogleLinked: false,
  isProfileComplete: false
};

export function RbacProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const roleKey = parsed.role === 'owner' || parsed.role === 'admin' 
          ? 'TENANT_ADMIN' 
          : parsed.role === 'analyst' 
          ? 'TENANT_ANALYST' 
          : (parsed.role || 'TENANT_ADMIN');
        const roleConfig = ROLE_HIERARCHY[roleKey] || ROLE_HIERARCHY.TENANT_ADMIN;
        return {
          id: parsed._id || parsed.id || '',
          name: parsed.name || '',
          email: parsed.email || '',
          role: roleKey,
          roleName: roleConfig.roleName,
          badge: roleConfig.badge,
          orgId: parsed.tenantId || parsed.orgId || '',
          permissions: roleConfig.permissions,
          isGoogleLinked: Boolean(parsed.isGoogleLinked),
          isProfileComplete: Boolean(parsed.isProfileComplete)
        };
      }
    } catch (e) {
      console.warn('Failed to parse active user from storage', e);
    }
    return EMPTY_USER;
  });

  const [rbacGuardModal, setRbacGuardModal] = useState({ 
    isOpen: false, 
    requiredPermission: '', 
    actionName: '' 
  });

  // Function to set current logged-in user dynamically upon login/setup
  const updateUserSession = (userData) => {
    if (!userData) {
      setCurrentUser(EMPTY_USER);
      localStorage.removeItem('user');
      return;
    }

    const roleKey = userData.role === 'owner' || userData.role === 'admin' 
      ? 'TENANT_ADMIN' 
      : userData.role === 'analyst' 
      ? 'TENANT_ANALYST' 
      : (userData.role || 'TENANT_ADMIN');
    const roleConfig = ROLE_HIERARCHY[roleKey] || ROLE_HIERARCHY.TENANT_ADMIN;
    
    const updated = {
      id: userData._id || userData.id || '',
      name: userData.name || '',
      email: userData.email || '',
      role: roleKey,
      roleName: roleConfig.roleName,
      badge: roleConfig.badge,
      orgId: userData.tenantId || userData.orgId || '',
      permissions: roleConfig.permissions,
      isGoogleLinked: Boolean(userData.isGoogleLinked),
      isProfileComplete: Boolean(userData.isProfileComplete)
    };
    
    setCurrentUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const hasPermission = (permission) => {
    return currentUser.permissions.includes(permission);
  };

  const checkPermissionOrGuard = (permission, actionName, onSuccess) => {
    if (hasPermission(permission)) {
      if (onSuccess) onSuccess();
      return true;
    } else {
      setRbacGuardModal({
        isOpen: true,
        requiredPermission: permission,
        actionName: actionName || 'execute this security operation'
      });
      return false;
    }
  };

  const closeGuardModal = () => {
    setRbacGuardModal({ isOpen: false, requiredPermission: '', actionName: '' });
  };

  return (
    <RbacContext.Provider value={{
      currentUser,
      updateUserSession,
      hasPermission,
      checkPermissionOrGuard,
      rbacGuardModal,
      closeGuardModal,
      roleHierarchy: ROLE_HIERARCHY
    }}>
      {children}
    </RbacContext.Provider>
  );
}

export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRbac must be used within an RbacProvider');
  }
  return context;
}

