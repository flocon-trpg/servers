import { State as S, apply as a, roomTemplate } from '@flocon-trpg/core';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useLatest } from 'react-use';
import { roomAtom } from '../atoms/roomAtom/roomAtom';
import { storybookAtom } from '../atoms/storybookAtom/storybookAtom';
import { useImmerUpdateAtom } from './useImmerUpdateAtom';
import { joined } from './useRoomState';

type State = S<typeof roomTemplate>;
const apply = a(roomTemplate);

const errorMessage =
    'You called useMockRoom but useAtomValue(storybookAtom).isStorybook is false. If this is storybook, change storybookAtom value. If this is not storybook, do not call useMockRoom.';

export const useMockRoom = ({ roomId, room }: { roomId?: string; room: State }) => {
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
    }, [isStorybookRef, room, setRoom]);

    React.useEffect(() => {
        setRoom(roomAtomValue => {
            roomAtomValue.roomId = roomId;
        });
    }, [roomId, setRoom]);
};
