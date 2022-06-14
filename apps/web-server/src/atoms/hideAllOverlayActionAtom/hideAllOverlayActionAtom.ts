import { atom } from 'jotai';
import { boardEditorModalAtom } from '../../components/models/room/Room/subcomponents/components/BoardEditorModal/BoardEditorModal';
import { imagePieceModalAtom } from '../../components/models/room/Room/subcomponents/components/ImagePieceModal/ImagePieceModal';
import { characterEditorModalAtom } from '../../components/models/room/Room/subcomponents/components/CharacterEditorModal/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '../../components/models/room/Room/subcomponents/components/CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import {
    dicePieceValueEditorAtom,
    stringPieceValueEditorAtom,
} from '../../components/models/room/Room/subcomponents/atoms/pieceValueEditorAtom/pieceValueEditorAtom';
import { boardContextMenuAtom } from '../../components/models/room/Room/subcomponents/atoms/boardContextMenuAtom/boardContextMenuAtom';
import { boardPopoverEditorAtom } from '../../components/models/room/Room/subcomponents/atoms/boardPopoverEditorAtom/boardPopoverEditorAtom';
import { boardTooltipAtom } from '../../components/models/room/Room/subcomponents/atoms/boardTooltipAtom/boardTooltipAtom';
import { commandEditorModalAtom } from '../../components/models/room/Room/subcomponents/atoms/commandEditorModalAtom/commandEditorModalAtom';
import { editRoomDrawerVisibilityAtom } from '../../components/models/room/Room/subcomponents/atoms/editRoomDrawerVisibilityAtom/editRoomDrawerVisibilityAtom';

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
