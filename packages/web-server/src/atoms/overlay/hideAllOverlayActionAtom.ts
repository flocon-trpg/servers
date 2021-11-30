import { atom } from 'jotai';
import { characterEditorModalAtom } from '../../pageComponents/room/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../../pageComponents/room/CharacterParameterNamesEditorModal';
import { dicePieceValueEditorModalAtom } from '../../pageComponents/room/DicePieceValueEditorModal';
import { stringPieceEditorModalAtom } from '../../pageComponents/room/StringPieceValueEditorModal';
import { boardContextMenuAtom } from './board/boardContextMenuAtom';
import { boardPopoverEditorAtom } from './board/boardPopoverEditorAtom';
import { boardTooltipAtom } from './board/boardTooltipAtom';
import { boardEditorDrawerAtom } from './boardDrawerAtom';
import { commandEditorModalAtom } from './commandEditorModalAtom';
import { editRoomDrawerVisibilityAtom } from './editRoomDrawerVisibilityAtom';
import { imagePieceDrawerAtom } from './imagePieceDrawerAtom';

export const hideAllOverlayActionAtom = atom<null, void>(null, (get, set) => {
    set(boardEditorDrawerAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesEditorVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceValueEditorModalAtom, null);
    set(editRoomDrawerVisibilityAtom, false);
    set(imagePieceDrawerAtom, null);
    set(stringPieceEditorModalAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
