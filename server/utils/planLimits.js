// Centralized plan limits configuration
// Add new resource limits here and they apply everywhere automatically.

const PLAN_LIMITS = {
  free: {
    maxProjects: 1,
    maxApiKeys: 2,
    maxCollections: 3,
    requestLimit: 100,
  },
  pro: {
    maxProjects: 20,
    maxApiKeys: 50,
    maxCollections: 100,
    requestLimit: 10000,
  },
  enterprise: {
    maxProjects: -1, // unlimited
    maxApiKeys: -1,
    maxCollections: -1,
    requestLimit: 1000000,
  },
};

export const getPlanLimits = (planName) => {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
};

export default PLAN_LIMITS;
