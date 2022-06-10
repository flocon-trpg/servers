import { atom } from 'jotai';
import { boardEditorModalAtom } from '../../components/models/room/Room/subcomponents/BoardEditorModal/BoardEditorModal';
import { imagePieceModalAtom } from '../../components/models/room/Room/subcomponents/ImagePieceModal/ImagePieceModal';
import { characterEditorModalAtom } from '../../components/models/room/Room/subcomponents/CharacterEditorModal/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../../components/models/room/Room/subcomponents/CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
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
