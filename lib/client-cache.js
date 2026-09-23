/**
 * SkillLens Client Storage Cache Engine
 * Provides persistent, structured 24-hour caching in localStorage
 * to drastically reduce repetitive API calls for non-changeable / slow-changing user data.
 */

const CACHE_VERSION = 1;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours

/**
 * Low-level storage getter with TTL check
 * @param {string} fullKey
 * @returns {any|null}
 */
export function getStorageItem(fullKey) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (!payload || payload.v !== CACHE_VERSION) {
      localStorage.removeItem(fullKey);
      return null;
    }

    const now = Date.now();
    if (payload.expiresAt && now > payload.expiresAt) {
      console.log(`[STORAGE-CACHE] ⏰ Cache expired for "${fullKey}". Evicting.`);
      localStorage.removeItem(fullKey);
      return null;
    }

    return payload.data;
  } catch (err) {
    console.warn(`[STORAGE-CACHE] ⚠️ Failed to read "${fullKey}":`, err);
    return null;
  }
}

/**
 * Low-level storage setter with metadata & expiry
 * @param {string} fullKey
 * @param {any} data
 * @param {number} ttlMs
 */
export function setStorageItem(fullKey, data, ttlMs = DEFAULT_TTL_MS) {
  if (typeof window === "undefined") return;

  try {
    const now = Date.now();
    const payload = {
      v: CACHE_VERSION,
      timestamp: now,
      ttlMs,
      expiresAt: now + ttlMs,
      data,
    };
    localStorage.setItem(fullKey, JSON.stringify(payload));
    console.log(`[STORAGE-CACHE] 💾 Cached "${fullKey}" (valid for ${Math.round(ttlMs / 3600000)}h)`);
  } catch (err) {
    console.warn(`[STORAGE-CACHE] ⚠️ Failed to write "${fullKey}":`, err);
  }
}

/**
 * Low-level storage remover
 * @param {string} fullKey
 */
export function removeStorageItem(fullKey) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(fullKey);
  } catch (err) {
    console.warn(`[STORAGE-CACHE] ⚠️ Failed to remove "${fullKey}":`, err);
  }
}

// =========================================================================
// HIGH-LEVEL DOMAIN HELPERS FOR NON-CHANGEABLE / SLOW-CHANGING DATA
// =========================================================================

/**
 * 1. USER ONBOARDING CACHE (Role, Learning Mode, Onboarding Completed Status)
 */
export function getOnboardingCache(userId) {
  if (!userId) return null;
  return getStorageItem(`skilllens_user_${userId}_onboarding`);
}

export function setOnboardingCache(userId, onboardingData) {
  if (!userId || !onboardingData) return;
  setStorageItem(`skilllens_user_${userId}_onboarding`, onboardingData, DEFAULT_TTL_MS);
}

/**
 * 2. TEAMMATE BASIC DETAILS CACHE (Name, Username, Email, Selected Role)
 */
export function getTeammateDetailsCache(userId) {
  if (!userId) return null;
  return getStorageItem(`skilllens_user_${userId}_teammate_details`);
}

export function setTeammateDetailsCache(userId, teammateData) {
  if (!userId || !teammateData) return;
  setStorageItem(`skilllens_user_${userId}_teammate_details`, teammateData, DEFAULT_TTL_MS);
}

/**
 * 3. USER PROFILE DETAILS CACHE (User identity, Bio, GitHub link)
 */
export function getUserDetailsCache(userId) {
  if (!userId) return null;
  return getStorageItem(`skilllens_user_${userId}_details`);
}

export function setUserDetailsCache(userId, details) {
  if (!userId || !details) return;
  setStorageItem(`skilllens_user_${userId}_details`, details, DEFAULT_TTL_MS);
}

/**
 * 4. TEAMMATE PROGRESS SUMMARY CACHE (24h cached exam & roadmap stats)
 */
export function getTeammateProgressCache(teammateId) {
  if (!teammateId) return null;
  return getStorageItem(`skilllens_teammate_progress_${teammateId}`);
}

export function setTeammateProgressCache(teammateId, progressData) {
  if (!teammateId || !progressData) return;
  setStorageItem(`skilllens_teammate_progress_${teammateId}`, progressData, DEFAULT_TTL_MS);
}

/**
 * Invalidate all caches for a user (e.g. On onboarding re-submission or switch role)
 */
export function clearAllUserCaches(userId) {
  if (!userId) return;
  removeStorageItem(`skilllens_user_${userId}_onboarding`);
  removeStorageItem(`skilllens_user_${userId}_teammate_details`);
  removeStorageItem(`skilllens_user_${userId}_details`);
  console.log(`[STORAGE-CACHE] 🧹 Cleared all caches for user ${userId}`);
}
