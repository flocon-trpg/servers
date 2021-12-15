import { atom } from 'jotai';
import { UserConfig } from './types';

export const userConfigAtom = atom<UserConfig | null>(null);
