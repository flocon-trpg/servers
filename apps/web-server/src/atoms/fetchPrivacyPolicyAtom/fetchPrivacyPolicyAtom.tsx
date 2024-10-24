import { createFetchAtom } from '../createFetchAtom/createFetchAtom';

export const privacyPolicyFileName = 'privacy_policy.md';

export const fetchPrivacyPolicyAtom = createFetchAtom(`/${privacyPolicyFileName}`);
