import { defaultLibSource } from './defaultLibSource';

export const characterCommandLibSource =
    defaultLibSource +
    `
declare const room: Room;
declare const character: Character;
`;
