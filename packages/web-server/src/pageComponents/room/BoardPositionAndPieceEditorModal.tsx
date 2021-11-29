import { Modal } from 'antd';
import { atom } from 'jotai';
import { useAtom } from 'jotai';
import React from 'react';
import { BoardPositionEditor } from '../../components/BoardPositionAndPiece/BoardPositionEditor';
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
          boardPositionId: string;
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
            const portrait = character?.portraitPositions?.[atomValue.boardPositionId];
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
                                roomState.characters[atomValue.characterId]?.portraitPositions?.[
                                    atomValue.boardPositionId
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
            const portrait = character?.pieces?.[atomValue.pieceId];
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
