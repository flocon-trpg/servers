// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const NEXT_PUBLIC_FIREBASE_CONFIG = 'NEXT_PUBLIC_FIREBASE_CONFIG';
export const NEXT_PUBLIC_API_HTTP = 'NEXT_PUBLIC_API_HTTP';
export const NEXT_PUBLIC_API_WS = 'NEXT_PUBLIC_API_WS';
export const NEXT_PUBLIC_AUTH_PROVIDERS = 'NEXT_PUBLIC_AUTH_PROVIDERS';
export const NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED = 'NEXT_PUBLIC_FIREBASE_STORAGE_ENABLED';

// TODO: これら以外にも対応させる。.env.localのテンプレート内の説明もあわせて変更する。
export const email = 'email';
export const google = 'google';
export const facebook = 'facebook';
export const github = 'github';
export const twitter = 'twitter';
export const phone = 'phone';