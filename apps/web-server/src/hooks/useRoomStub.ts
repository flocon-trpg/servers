import React from 'react';
import { roomAtom } from '../atoms/room/roomAtom';
import { useImmerUpdateAtom } from '../atoms/useImmerUpdateAtom';
import { joined } from './useRoomState';
import { useAtomValue } from 'jotai';
import { storybookAtom } from '../atoms/storybook/storybookAtom';
import { useLatest } from 'react-use';
import { State as S, apply as a, roomTemplate } from '@flocon-trpg/core';

type State = S<typeof roomTemplate>;
const apply = a(roomTemplate);

const errorMessage =
    'You called useRoomStub but useAtomValue(storybookAtom).isStorybook is false. If this is storybook, change storybookAtom value. If this is not storybook, do not call useRoomStub.';

export const useRoomStub = ({ roomId, room }: { roomId?: string; room: State }) => {
    const isStorybook = useAtomValue(storybookAtom).isStorybook;
    const isStorybookRef = useLatest(isStorybook);

    const setRoom = useImmerUpdateAtom(roomAtom);

    React.useEffect(() => {
        setRoom(roomAtomValue => {
            roomAtomValue.roomState = {
                type: joined,
                state: room,
                setState: newState => {
                    if (!isStorybookRef.current) {
                        throw new Error(errorMessage);
                    }
                    setRoom(prevRoom => {
                        if (prevRoom.roomState?.state == null) {
                            return;
                        }
                        if (typeof newState === 'function') {
                            prevRoom.roomState.state = newState(prevRoom.roomState.state);
                        } else {
                            prevRoom.roomState.state = newState;
                        }
                    });
                },
                setStateByApply: operation => {
                    if (!isStorybookRef.current) {
                        throw new Error(errorMessage);
                    }
                    setRoom(prevRoom => {
                        if (prevRoom.roomState?.state == null) {
                            return;
                        }
                        const newRoom = apply({ state: prevRoom.roomState.state, operation });
                        if (newRoom.isError) {
                            throw newRoom.error;
                        }
                        prevRoom.roomState.state = newRoom.value;
                    });
                },
            };
        });
    }, [isStorybookRef, setRoom]);

    React.useEffect(() => {
        setRoom(roomAtomValue => {
            roomAtomValue.roomId = roomId;
        });
    }, [roomId, setRoom]);
};
