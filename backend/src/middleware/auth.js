const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  // Skip authentication for OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...requirements) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];
    const userScopes = req.user.scopes || [];

    // System Admins have full access
    if (userRoles.includes('Admin') || userRoles.includes('Sistem Yöneticisi') || userPermissions.includes('*')) {
      return next();
    }

    // Check if any requirement is met (Roles or Permissions)
    const hasAccess = requirements.some(reqmt => 
      userRoles.includes(reqmt) || userPermissions.includes(reqmt)
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

const checkScope = (requiredScope) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') return next();

    const userScopes = req.user.scopes || [];
    const userRoles = req.user.roles || [];

    if (userRoles.includes('Admin') || userRoles.includes('Sistem Yöneticisi')) {
      return next();
    }

    // Hierarchy check: SYSTEM > GLOBAL > FACILITY > UNIT
    const scopeHierarchy = { 'SYSTEM': 4, 'GLOBAL': 3, 'FACILITY': 2, 'UNIT': 1 };
    const maxUserScope = Math.max(...userScopes.map(s => scopeHierarchy[s] || 0));
    const requiredLevel = scopeHierarchy[requiredScope] || 0;

    if (maxUserScope < requiredLevel) {
      return res.status(403).json({ error: `Scope level ${requiredScope} required` });
    }

    next();
  };
};

const checkFacilityAccess = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const facilityId = req.params.facilityId || req.body.facilityId || req.query.facilityId;
  
  if (!facilityId) {
    // If no facilityId is provided, check if the user is a Global/System user
    const userScopes = req.user.scopes || [];
    if (userScopes.includes('SYSTEM') || userScopes.includes('GLOBAL')) {
      return next();
    }
    return res.status(400).json({ error: 'Facility ID required' });
  }
  
  const userRoles = req.user.roles || [];
  const userScopes = req.user.scopes || [];
  
  if (userRoles.includes('Admin') || userRoles.includes('Sistem Yöneticisi') || userScopes.includes('SYSTEM') || userScopes.includes('GLOBAL')) {
    return next();
  }
  
  if (req.user.facilities && !req.user.facilities.includes(facilityId)) {
    return res.status(403).json({ error: 'No access to this facility' });
  }
  
  next();
};

module.exports = { auth, authorize, checkScope, checkFacilityAccess };
