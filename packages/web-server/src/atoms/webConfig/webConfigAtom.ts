import { atom } from 'jotai';
import { getConfig } from '../../config';
import { WebConfig } from '../../configType';

export const webConfigAtom = atom<WebConfig>(getConfig());
