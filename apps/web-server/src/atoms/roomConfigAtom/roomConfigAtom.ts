import { atom } from 'jotai/vanilla';
import { RoomConfig } from './types/roomConfig';

export const roomConfigAtom = atom<RoomConfig | null>(null);
