import { atom } from 'jotai';
import { boardEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/BoardEditorModal/BoardEditorModal';
import { imagePieceModalAtom } from '@/components/models/room/Room/subcomponents/components/ImagePieceModal/ImagePieceModal';
import { characterEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/CharacterEditorModal/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '@/components/models/room/Room/subcomponents/components/CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import { boardContextMenuAtom } from '@/components/models/room/Room/subcomponents/atoms/boardContextMenuAtom/boardContextMenuAtom';
import { boardPopoverEditorAtom } from '@/components/models/room/Room/subcomponents/atoms/boardPopoverEditorAtom/boardPopoverEditorAtom';
import { boardTooltipAtom } from '@/components/models/room/Room/subcomponents/atoms/boardTooltipAtom/boardTooltipAtom';
import { editRoomDrawerVisibilityAtom } from '@/components/models/room/Room/subcomponents/atoms/editRoomDrawerVisibilityAtom/editRoomDrawerVisibilityAtom';
import { stringPieceModalAtom } from '@/components/models/room/Room/subcomponents/components/StringPieceEditorModal/StringPieceEditorModal';
import { dicePieceModalAtom } from '@/components/models/room/Room/subcomponents/components/DicePieceEditorModal/DicePieceEditorModal';
import { commandEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/CommandEditorModal/CommandEditorModal';

export const hideAllOverlayActionAtom = atom<null, void>(null, (get, set) => {
    set(boardEditorModalAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesEditorVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceModalAtom, null);
    set(editRoomDrawerVisibilityAtom, false);
    set(imagePieceModalAtom, null);
    set(stringPieceModalAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
