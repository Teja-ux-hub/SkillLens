// Role compatibility map for Skill Exchange matching
// Users with complementary skills can pair up to teach/learn from each other

export const ROLE_COMPATIBILITY = {
  'webdeveloper': ['ai/mlengineer', 'Agentic AI Engineer', 'cybersecurityspecialist', 'cloudarchitect'],
  'ai/mlengineer': ['webdeveloper', 'dataengineer', 'cloudarchitect', 'backendengineer'],
  'Agentic AI Engineer': ['webdeveloper', 'ai/mlengineer', 'cloudarchitect', 'dataengineer'],
  'cybersecurityspecialist': ['webdeveloper', 'cloudarchitect', 'backendengineer', 'devopsengineer'],
  'cloudarchitect': ['webdeveloper', 'ai/mlengineer', 'backendengineer', 'devopsengineer'],
  'dataengineer': ['ai/mlengineer', 'backendengineer', 'Agentic AI Engineer', 'cloudarchitect'],
  'backendengineer': ['webdeveloper', 'dataengineer', 'cloudarchitect', 'devopsengineer'],
  'frontendengineer': ['webdeveloper', 'backendengineer', 'ui/uxdesigner', 'mobileappdeveloper'],
  'mobileappdeveloper': ['webdeveloper', 'frontendengineer', 'backendengineer', 'ui/uxdesigner'],
  'devopsengineer': ['cloudarchitect', 'backendengineer', 'cybersecurityspecialist', 'webdeveloper'],
  'ui/uxdesigner': ['frontendengineer', 'webdeveloper', 'mobileappdeveloper', 'productmanager'],
  'productmanager': ['ui/uxdesigner', 'webdeveloper', 'backendengineer', 'dataengineer'],
  'blockchainengineer': ['webdeveloper', 'backendengineer', 'cybersecurityspecialist', 'cloudarchitect'],
  'gameengineer': ['webdeveloper', 'frontendengineer', 'ai/mlengineer', 'mobileappdeveloper'],
  'embeddediot': ['cybersecurityspecialist', 'cloudarchitect', 'backendengineer', 'ai/mlengineer']
};

/**
 * Check if two roles are compatible for Skill Exchange
 * @param {string} role1 - First user's role
 * @param {string} role2 - Second user's role
 * @returns {boolean} - True if roles are compatible
 */
export function areRolesCompatible(role1, role2) {
  if (!role1 || !role2) return false;
  if (role1 === role2) return false; // Same roles not compatible for exchange
  
  const compatibleRoles = ROLE_COMPATIBILITY[role1] || [];
  return compatibleRoles.includes(role2);
}

/**
 * Get list of compatible roles for a given role
 * @param {string} role - User's selected role
 * @returns {string[]} - Array of compatible role names
 */
export function getCompatibleRoles(role) {
  return ROLE_COMPATIBILITY[role] || [];
}
