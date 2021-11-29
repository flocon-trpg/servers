import { atom } from 'jotai';
import { characterEditorModalAtom } from '../../pageComponents/room/CharacterEditorModal';
import { dicePieceValueEditorModalAtom } from '../../pageComponents/room/DicePieceValueEditorModal';
import { boardContextMenuAtom } from './board/boardContextMenuAtom';
import { boardPopoverEditorAtom } from './board/boardPopoverEditorAtom';
import { boardTooltipAtom } from './board/boardTooltipAtom';
import { boardEditorDrawerAtom } from './boardDrawerAtom';
import { characterParameterNamesDrawerVisibilityAtom } from './characterParameterNamesDrawerVisibilityAtom';
import { commandEditorModalAtom } from './commandEditorModalAtom';
import { editRoomDrawerVisibilityAtom } from './editRoomDrawerVisibilityAtom';
import { imagePieceDrawerAtom } from './imagePieceDrawerAtom';
import { stringPieceDrawerAtom } from './stringPieceDrawerAtom';

export const hideAllOverlayActionAtom = atom<null, void>(null, (get, set) => {
    set(boardEditorDrawerAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesDrawerVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceValueEditorModalAtom, null);
    set(editRoomDrawerVisibilityAtom, false);
    set(imagePieceDrawerAtom, null);
    set(stringPieceDrawerAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
