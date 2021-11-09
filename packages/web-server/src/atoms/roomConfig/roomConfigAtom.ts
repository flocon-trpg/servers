import { atom } from 'jotai';
import { RoomConfig } from './types/roomConfig';

export const roomConfigAtom = atom<RoomConfig | null>(null);
