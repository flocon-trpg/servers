import { ImagePieceValueState, simpleId } from '@flocon-trpg/core';
import { recordForEach } from '@flocon-trpg/utils';
import produce from 'immer';
import React from 'react';
import { useSetRoomState } from '../useSetRoomState';

export const useCloneImagePiece = () => {
    const setRoomState = useSetRoomState();

    return React.useCallback(
        ({ source, myUserUid }: { source: ImagePieceValueState; myUserUid: string }) => {
            setRoomState(room => {
                const me = room.participants[myUserUid];
                if (me == null) {
                    return room;
                }

                const newImagePieceValue = produce(source, piece => {
                    // 少なくとも現状では1つの画像コマにつき1ボードにしか置かれていないため、このようにすべてのボードの位置を変更するだけで構わない。
                    recordForEach(piece.pieces, value => {
                        value.x += 20;
                        value.y += 20;
                    });
                });
                newImagePieceValue.ownerParticipantId = myUserUid;

                return produce(room, room => {
                    const newId = simpleId();
                    room.imagePieceValues[newId] = newImagePieceValue;
                });
            });
        },
        [setRoomState]
    );
};
