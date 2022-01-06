import { atom } from 'jotai';
import { boardEditorModalAtom } from '../../components/contextual/room/board/BoardEditorModal';
import { imagePieceModalAtom } from '../../components/contextual/room/board/ImagePieceModal';
import { characterEditorModalAtom } from '../../components/contextual/room/character/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../../components/contextual/room/character/CharacterParameterNamesEditorModal';
import {
    dicePieceValueEditorAtom,
    stringPieceValueEditorAtom,
} from '../pieceValueEditor/pieceValueEditorAtom';
import { boardContextMenuAtom } from './board/boardContextMenuAtom';
import { boardPopoverEditorAtom } from './board/boardPopoverEditorAtom';
import { boardTooltipAtom } from './board/boardTooltipAtom';
import { commandEditorModalAtom } from './commandEditorModalAtom';
import { editRoomDrawerVisibilityAtom } from './editRoomDrawerVisibilityAtom';

export const hideAllOverlayActionAtom = atom<null, void>(null, (get, set) => {
    set(boardEditorModalAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesEditorVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceValueEditorAtom, null);
    set(editRoomDrawerVisibilityAtom, false);
    set(imagePieceModalAtom, null);
    set(stringPieceValueEditorAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
