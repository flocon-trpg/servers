import { ImagePieceValueState, PieceState, simpleId } from '@flocon-trpg/core';
import { dualKeyRecordForEach } from '@flocon-trpg/utils';
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
                    dualKeyRecordForEach<PieceState>(piece.pieces, value => {
                        value.x += 20;
                        value.y += 20;
                    });
                });

                return produce(room, room => {
                    const me = room.participants[myUserUid];
                    if (me == null) {
                        return;
                    }
                    const newId = simpleId();
                    me.imagePieceValues[newId] = newImagePieceValue;
                });
            });
        },
        [setRoomState]
    );
};
