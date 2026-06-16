/**
 * Freemium tier configuration and utilities
 */

export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PREMIUM_PLUS: 'premium_plus',
};

export const DEFAULT_TIER = TIERS.FREE;

// Determine user tier (default to Free; integrate with payment later)
export function getUserTier(user) {
  return user?.tier || DEFAULT_TIER;
}

// Feature access checks
export const FEATURES = {
  // Modes
  MENSTRUAL_MODE: { tier: TIERS.FREE, name: 'Menstrual/PMDD Tracking' },
  PREGNANCY_MODE: { tier: TIERS.PREMIUM, name: 'Pregnancy Tracking' },
  POSTPARTUM_MODE: { tier: TIERS.PREMIUM, name: 'Postpartum Tracking' },
  PERIMENOPAUSE_MODE: { tier: TIERS.PREMIUM, name: 'Perimenopause Tracking' },
  MENOPAUSE_MODE: { tier: TIERS.PREMIUM, name: 'Menopause Tracking' },

  // Scales — PHQ-9 and GAD-7 are safety screening tools, free for all users
  DRSP_SCALE: { tier: TIERS.PREMIUM, name: 'Full DRSP Symptom Tracking' },
  PHQ9_SCALE: { tier: TIERS.FREE, name: 'PHQ-9 Depression Screening' },
  GAD7_SCALE: { tier: TIERS.FREE, name: 'GAD-7 Anxiety Screening' },
  EPDS_SCALE: { tier: TIERS.PREMIUM, name: 'EPDS Postpartum Depression Screening' },

  // Insights
  FULL_INSIGHTS: { tier: TIERS.PREMIUM, name: 'Advanced Insights' },
  PDF_REPORTS: { tier: TIERS.FREE, name: 'PDF Reports' },
  DOCTOR_SHARE: { tier: TIERS.FREE, name: 'Doctor Share Link' },
  VITALS_TRACKING: { tier: TIERS.FREE, name: 'Vitals Tracking' },
  CYCLE_LENGTH_INSIGHTS: { tier: TIERS.FREE, name: 'Average Cycle Length' },
  BLEEDING_INTENSITY_INSIGHTS: { tier: TIERS.FREE, name: 'Bleeding Intensity' },

  // Resources
  MENSTRUAL_RESOURCES: { tier: TIERS.FREE, name: 'Menstrual Resources' },
  ALL_RESOURCES: { tier: TIERS.PREMIUM, name: 'All Resources' },

  // AI — Luna
  AI_COMPANION: { tier: TIERS.PREMIUM, name: 'Luna AI (Basic)' },
  AI_COMPANION_FULL: { tier: TIERS.PREMIUM_PLUS, name: 'Luna AI (Full — API fallback + deep mode + ongoing training)' },
};

// Tier hierarchy for comparisons
const TIER_RANK = {
  [TIERS.FREE]: 0,
  [TIERS.PREMIUM]: 1,
  [TIERS.PREMIUM_PLUS]: 2,
};

export function canAccessFeature(user, feature) {
  const userTier = getUserTier(user);
  const requiredTier = FEATURES[feature]?.tier || TIERS.FREE;
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);
}

export function getFeatureRequiredTier(feature) {
  return FEATURES[feature]?.tier || TIERS.FREE;
}

export function getFeatureName(feature) {
  return FEATURES[feature]?.name || feature;
}

// Mode access control
export function canAccessMode(user, modeType) {
  const modeFeatures = {
    menstrual: 'MENSTRUAL_MODE',
    pregnancy: 'PREGNANCY_MODE',
    postpartum: 'POSTPARTUM_MODE',
    perimenopause: 'PERIMENOPAUSE_MODE',
    menopause: 'MENOPAUSE_MODE',
  };
  const feature = modeFeatures[modeType];
  return feature ? canAccessFeature(user, feature) : true;
}

// Get available modes for user
export function getAvailableModes(user) {
  const allModes = ['menstrual', 'pregnancy', 'postpartum', 'perimenopause', 'menopause'];
  return allModes.filter(mode => canAccessMode(user, mode));
}

// Scale access control
export function canAccessScale(user, scaleType) {
  const scaleFeatures = {
    drsp: 'DRSP_SCALE',
    phq9: 'PHQ9_SCALE',
    gad7: 'GAD7_SCALE',
    epds: 'EPDS_SCALE',
  };
  const feature = scaleFeatures[scaleType];
  return feature ? canAccessFeature(user, feature) : true;
}

// Luna-specific access helpers
export function canAccessLunaDeepMode(user) {
  return canAccessFeature(user, 'AI_COMPANION_FULL');
}

export function canAccessLuna(user) {
  return canAccessFeature(user, 'AI_COMPANION');
}