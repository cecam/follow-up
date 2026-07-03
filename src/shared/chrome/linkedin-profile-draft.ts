export const OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE =
  'OPEN_FOLLOW_UP_FORM_FROM_LINKEDIN_PROFILE' as const;

export const LINKEDIN_PROFILE_DRAFT_STORAGE_KEY = 'linkedinProfileFollowUpDraft';
export const LINKEDIN_PROFILE_DRAFT_VERSION = 1 as const;
export const LINKEDIN_PROFILE_DRAFT_MAX_AGE_MS = 60_000;

export type LinkedInProfileDraftInput = {
  name: string;
  profileUrl: string;
};

export type LinkedInProfileDraft = LinkedInProfileDraftInput & {
  version: typeof LINKEDIN_PROFILE_DRAFT_VERSION;
  source: 'linkedin-profile';
  createdAt: number;
};

type LinkedInProfileDraftStorage = {
  [LINKEDIN_PROFILE_DRAFT_STORAGE_KEY]?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getSessionStorage = (): chrome.storage.StorageArea => {
  const sessionStorage = globalThis.chrome?.storage?.session;

  if (!sessionStorage) {
    throw new Error('SESSION_STORAGE_UNAVAILABLE');
  }

  return sessionStorage;
};

export const parseLinkedInProfileDraftInput = (value: unknown): LinkedInProfileDraftInput | null => {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.profileUrl !== 'string') {
    return null;
  }

  try {
    const url = new URL(value.profileUrl.trim());
    const pathname = url.pathname.replace(/\/+$/, '');

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'www.linkedin.com' ||
      !/^\/in\/[^/]+$/i.test(pathname)
    ) {
      return null;
    }

    return {
      name: value.name.trim(),
      profileUrl: `${url.origin}${pathname}`,
    };
  } catch {
    return null;
  }
};

export const parseLinkedInProfileDraft = (
  value: unknown,
  now = Date.now(),
): LinkedInProfileDraft | null => {
  if (
    !isRecord(value) ||
    value.version !== LINKEDIN_PROFILE_DRAFT_VERSION ||
    value.source !== 'linkedin-profile' ||
    typeof value.createdAt !== 'number' ||
    !Number.isFinite(value.createdAt)
  ) {
    return null;
  }

  const input = parseLinkedInProfileDraftInput(value);
  const age = now - value.createdAt;

  if (!input || age < 0 || age > LINKEDIN_PROFILE_DRAFT_MAX_AGE_MS) {
    return null;
  }

  return {
    ...input,
    version: LINKEDIN_PROFILE_DRAFT_VERSION,
    source: 'linkedin-profile',
    createdAt: value.createdAt,
  };
};

export const writeLinkedInProfileDraft = async (
  input: LinkedInProfileDraftInput,
): Promise<LinkedInProfileDraft> => {
  const normalizedInput = parseLinkedInProfileDraftInput(input);

  if (!normalizedInput) {
    throw new Error('INVALID_LINKEDIN_PROFILE_DRAFT');
  }

  const draft: LinkedInProfileDraft = {
    ...normalizedInput,
    version: LINKEDIN_PROFILE_DRAFT_VERSION,
    source: 'linkedin-profile',
    createdAt: Date.now(),
  };

  await getSessionStorage().set<LinkedInProfileDraftStorage>({
    [LINKEDIN_PROFILE_DRAFT_STORAGE_KEY]: draft,
  });

  return draft;
};

export const readLinkedInProfileDraft = async (): Promise<LinkedInProfileDraft | null> => {
  const result = await getSessionStorage().get<LinkedInProfileDraftStorage>(
    LINKEDIN_PROFILE_DRAFT_STORAGE_KEY,
  );

  return parseLinkedInProfileDraft(result[LINKEDIN_PROFILE_DRAFT_STORAGE_KEY]);
};

export const removeLinkedInProfileDraft = async (): Promise<void> => {
  await getSessionStorage().remove<LinkedInProfileDraftStorage>(
    LINKEDIN_PROFILE_DRAFT_STORAGE_KEY,
  );
};

export const consumeLinkedInProfileDraft = async (): Promise<LinkedInProfileDraft | null> => {
  const result = await getSessionStorage().get<LinkedInProfileDraftStorage>(
    LINKEDIN_PROFILE_DRAFT_STORAGE_KEY,
  );

  await removeLinkedInProfileDraft();
  return parseLinkedInProfileDraft(result[LINKEDIN_PROFILE_DRAFT_STORAGE_KEY]);
};
