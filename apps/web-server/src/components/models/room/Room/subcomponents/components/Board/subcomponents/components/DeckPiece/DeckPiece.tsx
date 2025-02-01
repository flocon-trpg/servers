import {
    State,
    arrayToIndexObjects,
    boardTemplate,
    deckPieceCardTemplate,
    deckPieceTemplate,
    indexObjectsToArray,
} from '@flocon-trpg/core';
import { loggerRef, recordForEach } from '@flocon-trpg/utils';
import { Result } from '@kizahasi/result';
import { produce } from 'immer';
import { atom, createStore, useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { useBoard } from '../../../../../hooks/useBoard';
import { useCellConfig } from '../../../../../hooks/useCellConfig';
import { useFindCard } from '../../../../../hooks/useFindCard';
import { useFindCardImage } from '../../../../../hooks/useFindCardImage';
import {
    CellConfig,
    PixelRect,
    PixelSize,
    setDragResultToPieceState,
    stateToPixelRect,
} from '../../../../../utils/positionAndSizeAndRect';
import { PieceGroup, PieceGroupProps } from '../../../../PieceGroup/PieceGroup';
import { AnimatedImageAsAnyProps } from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';
import { KonvaWarningIcon } from '@/components/ui/KonvaWarningIcon/KonvaWarningIcon';
import { success, useImageFromFilePath } from '@/hooks/imageHooks';
import { useMyUserUid } from '@/hooks/useMyUserUid';

const MoveMode = {
    pile: 'pile',
    topCard: 'topCard',
} as const;

type DeckPieceId = {
    boardId: string;
    pieceId: string;
};
const jotaiStore = createStore();

// 複数の DeckPiece にまたがって get および set されるため、atom として定義している。
const dropDeckAtom = atom<{ from: DeckPieceId; to: DeckPieceId } | null>(null);
const resizingDeckAtom = atom<DeckPieceId | null>(null);

export const useGetResizingDeck = () => {
    return useAtomValue(resizingDeckAtom, { store: jotaiStore });
};

type BoardState = State<typeof boardTemplate>;
type CardGroups = BoardState['cardGroups'];
type DeckPieceState = State<typeof deckPieceTemplate>;
type DeckPiecesState = Record<string, DeckPieceState | undefined>;
type DeckPieceCardState = State<typeof deckPieceCardTemplate>;

class PickedState {
    private constructor(
        private readonly _all: DeckPiecesState,
        private readonly _picked: DeckPieceState,
        private readonly _stateId: string,
    ) {}

    static create({
        states,
        stateId,
    }: {
        states: Record<string, DeckPieceState | undefined>;

        stateId: string;
    }) {
        const state = states[stateId];
        if (state == null) {
            return null;
        }
        return new PickedState(states, state, stateId);
    }

    get pickedState() {
        return this._picked;
    }

    get pickedStateId() {
        return this._stateId;
    }

    get allStates() {
        return this._all;
    }
}

const mergeDeck = ({
    state,
    deckIdToRemove,
    deckIdToBeAdded,
}: {
    state: DeckPiecesState;
    deckIdToRemove: string;
    deckIdToBeAdded: string;
}) => {
    return produce(state, deckPieces => {
        const thisDeckPiece = deckPieces[deckIdToRemove];
        if (thisDeckPiece == null) {
            return;
        }
        const thisDeck = thisDeckPiece.cards;

        const targetDeckPiece = deckPieces[deckIdToBeAdded];
        if (targetDeckPiece == null) {
            return;
        }
        const targetDeck = targetDeckPiece.cards;

        const thisDeckArrayResult = indexObjectsToArray(thisDeck ?? {});
        if (thisDeckArrayResult.isError) {
            return;
        }
        const thisDeckArray = thisDeckArrayResult.value;
        const targetDeckArrayResult = indexObjectsToArray(targetDeck ?? {});
        if (targetDeckArrayResult.isError) {
            return;
        }
        const targetDeckArray = targetDeckArrayResult.value;

        const concatDeckArray = [...thisDeckArray, ...targetDeckArray];

        thisDeckPiece.cards = {};
        targetDeckPiece.cards = arrayToIndexObjects(concatDeckArray);
    });
};

const moveCardToAnotherDeckOnTop = ({
    state,
    cardToRemove,
    deckIdToBeAdded,
}: {
    state: DeckPiecesState;
    cardToRemove: { deckId: string; cardId: string };
    deckIdToBeAdded: string;
}) => {
    return produce(state, deckPieces => {
        const thisDeckPiece = deckPieces[cardToRemove.deckId];
        if (thisDeckPiece == null) {
            return;
        }
        const thisDeck = thisDeckPiece.cards;

        const targetDeckPiece = deckPieces[deckIdToBeAdded];
        if (targetDeckPiece == null) {
            return;
        }
        const targetDeck = targetDeckPiece.cards;

        const thisDeckArrayResult = indexObjectsToArray(thisDeck ?? {});
        if (thisDeckArrayResult.isError) {
            return;
        }
        const thisDeckArray = thisDeckArrayResult.value;
        const targetDeckArrayResult = indexObjectsToArray(targetDeck ?? {});
        if (targetDeckArrayResult.isError) {
            return;
        }
        const targetDeckArray = targetDeckArrayResult.value;

        const index = thisDeckArray.findIndex(({ key }) => key === cardToRemove.cardId);
        if (index === -1) {
            return;
        }
        const [deletedCard] = thisDeckArray.splice(index, 1);
        if (deletedCard == null) {
            return;
        }
        targetDeckArray.unshift(deletedCard);

        thisDeckPiece.cards = arrayToIndexObjects(thisDeckArray);
        targetDeckPiece.cards = arrayToIndexObjects(targetDeckArray);
    });
};

const getStateIdToSnap = ({
    state,
    movingPiecePosition,
    cellConfig,
}: {
    state: PickedState;
    movingPiecePosition: PixelRect;
    cellConfig: CellConfig;
}) => {
    const getDistance = (rect1: PixelRect, rect2: PixelRect) => {
        const getCenterPosition = (rect: PixelRect) => {
            return {
                x: rect.x + rect.w / 2,
                y: rect.y + rect.h / 2,
            };
        };

        const position1 = getCenterPosition(rect1);
        const position2 = getCenterPosition(rect2);
        const triangleWidth = Math.abs(position1.x - position2.x);
        const triangleHeight = Math.abs(position1.y - position2.y);

        return Math.sqrt(triangleWidth * triangleWidth + triangleHeight * triangleHeight);
    };

    let nearestPiece = null as { stateId: string; distance: number } | null;
    recordForEach(state.allStates, (deckPieceState, deckPieceStateId) => {
        if (deckPieceStateId === state.pickedStateId) {
            return;
        }

        const distance = getDistance(
            stateToPixelRect({ state: deckPieceState, cellConfig }),
            movingPiecePosition,
        );
        if (nearestPiece == null || distance < nearestPiece.distance) {
            nearestPiece = {
                stateId: deckPieceStateId,
                distance,
            };
        }
    });

    if (nearestPiece == null) {
        return null;
    }

    const maxDistanceToSnap = 10;
    if (nearestPiece.distance <= maxDistanceToSnap) {
        return nearestPiece.stateId;
    }

    return null;
};

type CardImageProps = {
    state: DeckPieceState;
    cardGroups: CardGroups;
    cardIndex: number;
    showPile: boolean;
} & PixelSize;

const CardImage: React.FC<CardImageProps> = ({ state, cardGroups, cardIndex, showPile, w, h }) => {
    const topCardImageWithId = useFindCardImage(state, cardGroups, cardIndex);
    const image = useImageFromFilePath(topCardImageWithId?.value?.value?.filePath);
    const imageElement = image.type === success ? image.image : undefined;

    return (
        <>
            {showPile && (
                <ReactKonva.Rect
                    stroke={'#aaaa00'}
                    strokeWidth={2}
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                />
            )}
            {topCardImageWithId?.isError === true ? (
                <KonvaWarningIcon
                    x={2}
                    y={2}
                    w={w}
                    h={h}
                    // TODO: エラーメッセージをわかりやすくする
                    modal={{ content: topCardImageWithId.error.type }}
                />
            ) : (
                <AnimatedImageAsAnyProps
                    image={imageElement}
                    x={2}
                    y={2}
                    width={w - 4}
                    height={h - 4}
                />
            )}
        </>
    );
};

type BaseProps = {
    opacity: number;
    onDeckPiecesChange: (newDeckPieces: DeckPiecesState) => void;
    boardId: string;
} & Omit<PieceGroupProps, 'onDragEnd'>;

type DeckPieceByPickedStateProps = {
    state: PickedState;
    boardId: string;
} & BaseProps;

const DeckPieceByPickedState: React.FC<DeckPieceByPickedStateProps> = props => {
    const {
        onResizeStart,
        onResizeEnd,
        onMoveStart,
        onMove,
        state,
        boardId,
        onDeckPiecesChange,
        ...restProps
    } = props;
    const [isLongPressing, setIsLongPressing] = React.useState(false);
    const topCard = useFindCard(state.pickedState, 0);
    const moveMode = isLongPressing && topCard.value != null ? MoveMode.topCard : MoveMode.pile;
    const setResizingDeck = useSetAtom(resizingDeckAtom, { store: jotaiStore });
    const [dropDeck, setDropDeck] = useAtom(dropDeckAtom, { store: jotaiStore });
    const board = useBoard(boardId);
    const cellConfig = useCellConfig(boardId);
    // movingTopCard と topCard は独立して定義している。理由は、山札の一番上のカードを移動している際に、他のユーザーの操作によって山札の一番上のカードが変わる可能性があり、そのときに移動しているカードが変わらないようにするため。
    const [movingTopCard, setMovingTopCard] = React.useState<{
        key: string;
        value: DeckPieceCardState;
    }>();

    if (cellConfig == null) {
        return null;
    }

    const background = (
        <PieceGroup
            x={props.x}
            y={props.y}
            w={props.w}
            h={props.h}
            isSelected={false}
            draggable={false}
            resizable={false}
            listening={false}
            label={props.label}
        >
            <CardImage
                {...props}
                state={state.pickedState}
                cardGroups={board?.cardGroups}
                showPile={true}
                cardIndex={1}
            />
        </PieceGroup>
    );

    const showDropMarker =
        dropDeck == null
            ? false
            : (['from', 'to'] as const).find(propName => {
                  return (
                      dropDeck[propName].boardId === boardId &&
                      dropDeck[propName].pieceId === state.pickedStateId
                  );
              });

    const foreground = (
        <PieceGroup
            {...restProps}
            longPress={{ enable: true, threshold: 1000 }}
            onLongPressChange={setIsLongPressing}
            onResizeStart={() => {
                setResizingDeck({ boardId, pieceId: state.pickedStateId });
                onResizeStart && onResizeStart();
            }}
            onResizeEnd={() => {
                setResizingDeck(null);
                onResizeEnd && onResizeEnd();
            }}
            onMoveStart={() => {
                const cards = indexObjectsToArray(state.pickedState.cards ?? {});
                if (cards.isError) {
                    loggerRef.warn(
                        'Could not create a card array at NonGroupedDeckPiece. The deck is not shown. Message: ' +
                            cards.error,
                    );
                    return;
                }
                setMovingTopCard(cards.value[0]);

                onMoveStart && onMoveStart();
            }}
            onMove={e => {
                const toSnap = getStateIdToSnap({
                    state,
                    cellConfig,
                    movingPiecePosition: {
                        x: e.newPosition?.x ?? props.x,
                        y: e.newPosition?.y ?? props.y,
                        w: props.w,
                        h: props.h,
                    },
                });
                setDropDeck(
                    toSnap == null || toSnap === state.pickedStateId
                        ? null
                        : {
                              from: { boardId, pieceId: state.pickedStateId },
                              to: { boardId, pieceId: toSnap },
                          },
                );
                onMove && onMove(e);
            }}
            onDragEnd={e => {
                const dropDeck$ = dropDeck;
                setDropDeck(null);

                if (movingTopCard == null) {
                    if (dropDeck$ == null) {
                        const newDeckPieces = produce(props.state.allStates, deckPieces => {
                            const deckPiece = deckPieces[props.state.pickedStateId];
                            if (deckPiece == null) {
                                return;
                            }
                            setDragResultToPieceState({ e, piece: deckPiece, cellConfig });
                        });
                        onDeckPiecesChange(newDeckPieces);
                        return;
                    }

                    if (dropDeck$.from.boardId !== dropDeck$.to.boardId) {
                        // 通常はここには来ないはず
                        return;
                    }

                    const newDeckPieces = mergeDeck({
                        state: props.state.allStates,
                        deckIdToRemove: dropDeck$.from.pieceId,
                        deckIdToBeAdded: dropDeck$.to.pieceId,
                    });
                    onDeckPiecesChange(newDeckPieces);
                    return;
                }

                if (dropDeck$ == null) {
                    const newDeckPieces = produce(state.allStates, deckPieces => {
                        const deckPiece = deckPieces[state.pickedStateId];
                        if (deckPiece == null) {
                            return;
                        }
                        setDragResultToPieceState({ e, piece: deckPiece, cellConfig });
                    });
                    onDeckPiecesChange(newDeckPieces);
                    return;
                }

                if (dropDeck$.from.boardId !== dropDeck$.to.boardId) {
                    // 通常はここには来ないはず
                    return;
                }

                const newDeckPieces = moveCardToAnotherDeckOnTop({
                    state: state.allStates,
                    cardToRemove: { deckId: dropDeck$.from.pieceId, cardId: movingTopCard.key },
                    deckIdToBeAdded: dropDeck$.to.pieceId,
                });
                onDeckPiecesChange(newDeckPieces);
            }}
        >
            <CardImage
                {...restProps}
                state={state.pickedState}
                cardGroups={board?.cardGroups}
                cardIndex={0}
                showPile={moveMode === MoveMode.pile}
            />
            {showDropMarker && (
                <ReactKonva.Rect fill={'#aa000070'} x={0} y={0} width={props.w} height={props.h} />
            )}
        </PieceGroup>
    );

    return (
        <>
            {moveMode === MoveMode.topCard && background}
            {foreground}
        </>
    );
};

type Props = {
    // 他の山札の上にカードをドラッグする機能に必要なため、ボード上にあるすべての山札を states として渡して、コマとなる対象の山札を stateId で指定するようにしている。
    states: Record<string, DeckPieceState | undefined>;

    stateId: string;
} & BaseProps;

export const DeckPiece: React.FC<Props> = props => {
    const pickedState = React.useMemo(
        () => PickedState.create({ states: props.states, stateId: props.stateId }),
        [props.states, props.stateId],
    );
    if (pickedState == null) {
        return null;
    }

    return <DeckPieceByPickedState {...props} state={pickedState} />;
};
