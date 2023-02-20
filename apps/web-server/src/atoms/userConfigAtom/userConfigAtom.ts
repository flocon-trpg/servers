import { atom } from 'jotai/vanilla';
import { UserConfig } from './types';

export const userConfigAtom = atom<UserConfig | null>(null);
