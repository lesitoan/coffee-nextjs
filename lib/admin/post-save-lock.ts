const postSaveLockPrefix = "admin-post-save-lock:";
export const postSaveLockDelayMs = 90 * 1000;

export type PostSaveLock = {
  slug: string;
  savedAt: number;
  unlockAt: number;
};

function storageKey(slug: string) {
  return `${postSaveLockPrefix}${slug}`;
}

export function setPostSaveLock(slug: string, savedAt = Date.now()) {
  if (typeof window === "undefined") return;
  const lock: PostSaveLock = {
    slug,
    savedAt,
    unlockAt: savedAt + postSaveLockDelayMs
  };
  window.localStorage.setItem(storageKey(slug), JSON.stringify(lock));
}

export function getPostSaveLock(slug: string, now = Date.now()) {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey(slug));
  if (!raw) return null;

  try {
    const lock = JSON.parse(raw) as PostSaveLock;
    if (!lock.unlockAt || lock.unlockAt <= now) {
      window.localStorage.removeItem(storageKey(slug));
      return null;
    }
    return lock;
  } catch {
    window.localStorage.removeItem(storageKey(slug));
    return null;
  }
}

export function getPostSaveRemainingSeconds(slug: string, now = Date.now()) {
  const lock = getPostSaveLock(slug, now);
  if (!lock) return 0;
  return Math.ceil((lock.unlockAt - now) / 1000);
}
