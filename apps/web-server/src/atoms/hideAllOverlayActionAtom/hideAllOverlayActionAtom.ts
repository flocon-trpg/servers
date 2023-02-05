import { atom } from 'jotai/vanilla';
import { boardContextMenuAtom } from '@/components/models/room/Room/subcomponents/atoms/boardContextMenuAtom/boardContextMenuAtom';
import { boardPopoverEditorAtom } from '@/components/models/room/Room/subcomponents/atoms/boardPopoverEditorAtom/boardPopoverEditorAtom';
import { boardTooltipAtom } from '@/components/models/room/Room/subcomponents/atoms/boardTooltipAtom/boardTooltipAtom';
import { editRoomModalVisibilityAtom } from '@/components/models/room/Room/subcomponents/atoms/editRoomModalVisibilityAtom/editRoomModalVisibilityAtom';
import { boardEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/BoardEditorModal/BoardEditorModal';
import { characterEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/CharacterEditorModal/CharacterEditorModal';
import { characterParameterNamesEditorVisibilityAtom } from '@/components/models/room/Room/subcomponents/components/CharacterParameterNamesEditorModal/CharacterParameterNamesEditorModal';
import { commandEditorModalAtom } from '@/components/models/room/Room/subcomponents/components/CommandEditorModal/CommandEditorModal';
import { dicePieceModalAtom } from '@/components/models/room/Room/subcomponents/components/DicePieceEditorModal/DicePieceEditorModal';
import { imagePieceModalAtom } from '@/components/models/room/Room/subcomponents/components/ImagePieceModal/ImagePieceModal';
import { stringPieceModalAtom } from '@/components/models/room/Room/subcomponents/components/StringPieceEditorModal/StringPieceEditorModal';

export const hideAllOverlayActionAtom = atom(null, (get, set) => {
    set(boardEditorModalAtom, null);
    set(characterEditorModalAtom, null);
    set(characterParameterNamesEditorVisibilityAtom, false);
    set(commandEditorModalAtom, null);
    set(dicePieceModalAtom, null);
    set(editRoomModalVisibilityAtom, false);
    set(imagePieceModalAtom, null);
    set(stringPieceModalAtom, null);

    set(boardContextMenuAtom, null);
    set(boardPopoverEditorAtom, null);
    set(boardTooltipAtom, null);
});
