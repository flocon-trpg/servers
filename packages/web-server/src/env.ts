// これらを変更したら、あわせて.env.localのテンプレートも変更する必要がある

export const NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG = 'NEXT_PUBLIC_FLOCON_FIREBASE_CONFIG';
export const NEXT_PUBLIC_FLOCON_API_HTTP = 'NEXT_PUBLIC_FLOCON_API_HTTP';
export const NEXT_PUBLIC_FLOCON_API_WS = 'NEXT_PUBLIC_FLOCON_API_WS';
export const NEXT_PUBLIC_FLOCON_AUTH_PROVIDERS = 'NEXT_PUBLIC_FLOCON_AUTH_PROVIDERS';
export const NEXT_PUBLIC_FLOCON_FIREBASE_UPLOADER_ENABLED =
    'NEXT_PUBLIC_FLOCON_FIREBASE_UPLOADER_ENABLED';

// TODO: これら以外にも対応させる。.env.localのテンプレート内の説明もあわせて変更する。
export const email = 'email';
export const google = 'google';
export const facebook = 'facebook';
export const github = 'github';
export const twitter = 'twitter';
export const phone = 'phone';
