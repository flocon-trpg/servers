import { atom } from 'jotai';
import { boardEditorModalAtom } from '../../components/contextual/room/board/BoardEditorModal';
import { characterEditorModalAtom } from '../../components/contextual/room/character/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../../components/contextual/room/character/CharacterParameterNamesEditorModal';
import { dicePieceEditorModalAtom } from '../../components/contextual/room/board/DicePieceEditorModal';
import { stringPieceEditorModalAtom } from '../../components/contextual/room/board/StringPieceEditorModal';
import { boardContextMenuAtom } from './board/boardContextMenuAtom';
import { boardPopoverEditorAtom } from './board/boardPopoverEditorAtom';
import { boardTooltipAtom } from './board/boardTooltipAtom';
import { commandEditorModalAtom } from './commandEditorModalAtom';
import { editRoomDrawerVisibilityAtom } from './editRoomDrawerVisibilityAtom';
import { imagePieceDrawerAtom } from './imagePieceDrawerAtom';

export const hideAllOverlayActionAtom = atom<null, void>(null, (get, set) => {
    set(boardEditorModalAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesEditorVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceEditorModalAtom, null);
    set(editRoomDrawerVisibilityAtom, false);
    set(imagePieceDrawerAtom, null);
    set(stringPieceEditorModalAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
