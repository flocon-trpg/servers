import { Modal } from 'antd';
import { atom } from 'jotai';
import { useAtom } from 'jotai';
import React from 'react';
import { BoardPositionEditor } from '../../components/PiecePosition/BoardPositionEditor';
import { PiecePositionEditor } from '../../components/PiecePosition/PiecePositionEditor';
import { useCharacter } from '../../hooks/state/useCharacter';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';

export const characterPiece = 'characterPiece';
export const characterPortrait = 'characterPortrait';

type State =
    | {
          type: typeof characterPiece;
          characterId: string;
          pieceId: string;
      }
    | {
          type: typeof characterPortrait;
          characterId: string;
          pieceId: string;
      };

export const boardPositionAndPieceEditorModalAtom = atom<State | undefined>(undefined);

export const BoardPositionAndPieceEditorModal: React.FC = () => {
    const setRoomState = useSetRoomStateWithImmer();
    const [atomValue, setAtomValue] = useAtom(boardPositionAndPieceEditorModalAtom);
    const character = useCharacter(atomValue?.characterId);

    let modalChildren: JSX.Element | null;
    switch (atomValue?.type) {
        case undefined:
            modalChildren = null;
            break;
        case characterPortrait: {
            const portrait = character?.portraitPieces?.[atomValue.pieceId];
            if (portrait == null) {
                modalChildren = null;
                break;
            }
            modalChildren = (
                <BoardPositionEditor
                    state={portrait}
                    onUpdate={recipe => {
                        setRoomState(roomState => {
                            const pos =
                                roomState.characters[atomValue.characterId]?.portraitPieces?.[
                                    atomValue.pieceId
                                ];
                            if (pos == null) {
                                return;
                            }
                            recipe(pos);
                        });
                    }}
                />
            );
            break;
        }
        case characterPiece: {
            const piece = character?.pieces?.[atomValue.pieceId];
            if (piece == null) {
                modalChildren = null;
                break;
            }
            modalChildren = (
                <PiecePositionEditor
                    state={piece}
                    onUpdate={recipe => {
                        setRoomState(roomState => {
                            const pos =
                                roomState.characters[atomValue.characterId]?.pieces?.[
                                    atomValue.pieceId
                                ];
                            if (pos == null) {
                                return;
                            }
                            recipe(pos);
                        });
                    }}
                />
            );
            break;
        }
    }

    return (
        <Modal
            visible={modalChildren != null}
            maskClosable
            closable
            cancelText='閉じる'
            okButtonProps={{ style: { display: 'none' } }}
            onCancel={() => setAtomValue(undefined)}
        >
            {modalChildren}
        </Modal>
    );
};
