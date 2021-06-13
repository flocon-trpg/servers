import React from 'react';
import { useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import * as Icons from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardEditorPanelConfig } from '../../states/BoardEditorPanelConfig';
import { KonvaEventObject } from 'konva/types/Node';
import { replace, update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { MyKonva } from '../../components/MyKonva';
import { Message, publicMessage, useFilteredRoomMessages } from '../../hooks/useRoomMessages';
import { useSelector } from '../../store';
import { useOperate } from '../../hooks/useOperate';
import { useMe } from '../../hooks/useMe';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import { Piece } from '../../utils/piece';
import { useBoards } from '../../hooks/state/useBoards';
import { NumberPieceValue } from '../../utils/numberPieceValue';
import { BoardLocation } from '../../utils/boardLocation';
import { BoardConfig, defaultBoardConfig } from '../../states/BoardConfig';
import { ActiveBoardPanelConfig } from '../../states/ActiveBoardPanelConfig';
import { ActiveBoardSelectorModal } from './ActiveBoardSelecterModal';
import { executeCharacterFlocommand, listCharacterFlocommand } from '../../flocommand/main';
import useConstant from 'use-constant';
import { debounceTime } from 'rxjs/operators';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { NewTabLinkify } from '../../components/NewTabLinkify';
import { CharacterState, UpOperation, PieceState, PieceUpOperation, BoardLocationUpOperation, BoardState, BoardLocationState, NumberPieceValueState, DicePieceValueState, dicePieceValueStrIndexes } from '@kizahasi/flocon-core';
import { $free, CompositeKey, compositeKeyEquals, compositeKeyToString, dualKeyRecordToDualKeyMap, ReadonlyStateMap, stringToCompositeKey } from '@kizahasi/util';
import _ from 'lodash';
import { NumberPieceValueElement, useNumberPieceValues } from '../../hooks/state/useNumberPieceValues';
import { tripleKeyToString } from '../../utils/tripleKeyToString';
import { create, roomDrawerModule } from '../../modules/roomDrawerModule';
import { DicePieceValueElement, useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { InputDie } from '../../components/InputDie';
import { noValue } from '../../utils/dice';

namespace Resource {
    export const cellSizeIsTooSmall = 'セルが小さすぎるため、無効化されています';

    export namespace Popup {
        export const backgroundColor = '#202020E8';
        export const padding = 8;
    }
}

const createPiecePostOperation = ({
    e,
    piece,
    board,
}: {
    e: MyKonva.DragEndResult;
    piece: PieceState;
    board: BoardState;
}): PieceUpOperation => {
    const pieceOperation: PieceUpOperation = { $version: 1 };
    if (piece.isCellMode) {
        if (e.newLocation != null) {
            const position = Piece.getCellPosition({ ...e.newLocation, board });
            pieceOperation.cellX = { newValue: position.cellX };
            pieceOperation.cellY = { newValue: position.cellY };
        }
        if (e.newSize != null) {
            const size = Piece.getCellSize({ ...e.newSize, board });
            pieceOperation.cellW = { newValue: size.cellW };
            pieceOperation.cellH = { newValue: size.cellH };
        }
    } else {
        if (e.newLocation != null) {
            pieceOperation.x = { newValue: e.newLocation.x };
            pieceOperation.y = { newValue: e.newLocation.y };
        }
        if (e.newSize != null) {
            pieceOperation.w = { newValue: e.newSize.w };
            pieceOperation.h = { newValue: e.newSize.h };
        }
    }
    return pieceOperation;
};

const createTachieLocationPostOperation = ({
    e,
}: {
    e: MyKonva.DragEndResult;
}): PieceUpOperation => {
    const pieceOperation: BoardLocationUpOperation = { $version: 1 };
    if (e.newLocation != null) {
        pieceOperation.x = { newValue: e.newLocation.x };
        pieceOperation.y = { newValue: e.newLocation.y };
    }
    if (e.newSize != null) {
        pieceOperation.w = { newValue: e.newSize.w };
        pieceOperation.h = { newValue: e.newSize.h };
    }
    return pieceOperation;
};

const background = 'background';
const character = 'character';
const tachie = 'tachie';
const dicePieceValue = 'dicePieceValue';
const numberPieceValue = 'numberPieceValue';

type SelectedPieceKey = {
    type: typeof character;
    characterKey: CompositeKey;
} | {
    type: typeof tachie;
    characterKey: CompositeKey;
} | {
    type: typeof dicePieceValue | typeof numberPieceValue;
    stateId: string;
}

type ClickOn = {
    type: typeof dicePieceValue;
    element: DicePieceValueElement;
} | {
    type: typeof numberPieceValue;
    element: NumberPieceValueElement;
} | {
    type: typeof character | typeof tachie;
    characterKey: CompositeKey;
    character: CharacterState;
}

type MouseOverOn = {
    type: typeof background;
} | ClickOn

const publicMessageFilter = (message: Message): boolean => {
    return message.type === publicMessage;
};

/**
   * カーソルが一定時間止まったかどうかを示し、一定時間止まったときはその位置を返すHook。
   * カーソルが動くたびにonMoveを呼び出さなければならない。
   */
const useGetStoppedCursor = () => {
    const [stoppedCursor, setStoppedCursor] = React.useState<Vector2d | null>(null);
    const subject = useConstant(() => new Subject<Vector2d>());
    const onMove = React.useCallback((newCursor: Vector2d) => {
        setStoppedCursor(null);
        subject.next(newCursor);
    }, [subject]);
    React.useEffect(() => {
        subject.pipe(debounceTime(500)).subscribe(cursor => {
            setStoppedCursor(cursor);
        });
    }, [subject]);
    return { stoppedCursor, onMove };
};

type OnTooltipParams = { offset: MyKonva.Vector2; mouseOverOn: MouseOverOn };

const PieceTooltip: React.FC<OnTooltipParams> = ({ offset, mouseOverOn }: OnTooltipParams) => {
    const left = offset.x - 30;
    const top = offset.y + 1;

    switch (mouseOverOn.type) {
        case character:
        case tachie:
            return (
                <div style={({
                    position: 'absolute',
                    left,
                    top,
                    padding: Resource.Popup.padding,
                    backgroundColor: Resource.Popup.backgroundColor,
                    maxWidth: 200
                })}>
                    <div>{mouseOverOn.character.name}</div>
                    {mouseOverOn.character.memo.trim() !== '' && <hr style={{ transform: 'scaleY(0.5)', borderWidth: '1px 0 0 0', borderStyle: 'solid', borderColor: '#FFFFFFD0' }} />}
                    <NewTabLinkify>
                        <span style={{ whiteSpace: 'pre-wrap' /* これがないと、stringに存在する改行が無視されてしまう */ }}>
                            {mouseOverOn.character.memo}
                        </span>
                    </NewTabLinkify>
                </div>);
        default:
            return null;
    }
};

namespace PopupEditorBase {
    type DicePieceValueProps = {
        element: DicePieceValueElement;
    }

    export const DicePieceValue: React.FC<DicePieceValueProps> = ({ element }: DicePieceValueProps) => {
        const operate = useOperate();

        const characters = useCharacters();
        const dicePieceValue = React.useMemo(() => {
            const character = characters?.get({ createdBy: element.characterKey.createdBy, id: element.characterKey.id });
            if (character == null) {
                return undefined;
            }
            const dicePieceValue = character.dicePieceValues[element.valueId];
            if (dicePieceValue == null) {
                return undefined;
            }
            return dicePieceValue;
        }, [characters, element.characterKey.createdBy, element.characterKey.id, element.valueId]);

        if (dicePieceValue == null) {
            return null;
        }

        const titleWidth = 60;

        return (<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {dicePieceValueStrIndexes.map(key => {
                const die = dicePieceValue.dice[key];
                return (<div key={key} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minHeight: 26 }}>
                    <div style={{ flex: 0, minWidth: titleWidth, width: titleWidth }}>{`ダイス${key}`}</div>
                    <InputDie
                        size='small'
                        state={die ?? null}
                        onChange={e => {
                            operate({
                                $version: 1,
                                characters: {
                                    [element.characterKey.createdBy]: {
                                        [element.characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                dicePieceValues: {
                                                    [element.valueId]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            dice: {
                                                                [key]: e.type === replace ? {
                                                                    type: replace,
                                                                    replace: {
                                                                        newValue: e.newValue == null ? undefined : {
                                                                            $version: 1,
                                                                            dieType: e.newValue.dieType,
                                                                            isValuePrivate: false,
                                                                            value: null,
                                                                        },
                                                                    }
                                                                } : {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        value: { newValue: e.newValue === noValue ? null : e.newValue },
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }}
                        onIsValuePrivateChange={e => {
                            operate({
                                $version: 1,
                                characters: {
                                    [element.characterKey.createdBy]: {
                                        [element.characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                dicePieceValues: {
                                                    [element.valueId]: {
                                                        type: update,
                                                        update: {
                                                            $version: 1,
                                                            dice: {
                                                                [key]: {
                                                                    type: update,
                                                                    update: {
                                                                        $version: 1,
                                                                        isValuePrivate: { newValue: e },
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }} />
                </div>);
            })}
        </div>);
    };
}

type OnPopupEditorParams = { offset: MyKonva.Vector2; dblClickOn: ClickOn };

const PopupEditor: React.FC<OnPopupEditorParams> = ({ offset, dblClickOn }: OnPopupEditorParams) => {
    const left = offset.x - 30;
    const top = offset.y + 1;

    let children: JSX.Element | null;
    switch (dblClickOn.type) {
        case dicePieceValue:
            children = <PopupEditorBase.DicePieceValue element={dblClickOn.element} />;
            break;
        default:
            children = null;
            break;
    }

    if (children == null) {
        return null;
    }

    return (<div style={({
        position: 'absolute',
        left,
        top,
        padding: Resource.Popup.padding,
        backgroundColor: Resource.Popup.backgroundColor,
    })}>
        {children}
    </div>);
};

type BoardCoreProps = {
    board: BoardState;
    boardConfig: BoardConfig;
    boardKey: CompositeKey;
    boardEditorPanelId: string | null; // nullならばactiveBoardPanelとして扱われる
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: MyKonva.Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    onTooltip?: (params: OnTooltipParams | null) => void;
    onPopupEditor?: (params: OnPopupEditorParams | null) => void;
    canvasWidth: number;
    canvasHeight: number;
}

const BoardCore: React.FC<BoardCoreProps> = ({
    board,
    boardConfig,
    boardKey,
    boardEditorPanelId,
    onClick,
    onContextMenu,
    onTooltip,
    onPopupEditor,
    canvasWidth,
    canvasHeight
}: BoardCoreProps) => {
    const roomId = useSelector(state => state.roomModule.roomId);
    const characters = useCharacters();
    const participants = useParticipants();
    const dicePieceValues = useDicePieceValues();
    const numberPieceValues = useNumberPieceValues();

    const onTooltipRef = useReadonlyRef(onTooltip);
    const onPopoverEditorRef = useReadonlyRef(onPopupEditor);
    const unsetPopoverEditor = () => {
        if (onPopoverEditorRef.current == null) {
            return;
        }
        onPopoverEditorRef.current(null);
    };

    const mouseOverOnRef = React.useRef<MouseOverOn>({ type: background });
    const { stoppedCursor, onMove } = useGetStoppedCursor();
    React.useEffect(() => {
        if (onTooltipRef.current == null) {
            return;
        }
        if (stoppedCursor == null) {
            onTooltipRef.current(null);
            return;
        }
        onTooltipRef.current({ offset: stoppedCursor, mouseOverOn: mouseOverOnRef.current });
    }, [stoppedCursor, onTooltipRef]);
    const [selectedPieceKey, setSelectedPieceKey] = React.useState<SelectedPieceKey>();
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const dispatch = useDispatch();
    const operate = useOperate();
    const publicMessages = useFilteredRoomMessages({ filter: publicMessageFilter });
    const { userUid: myUserUid } = useMe();

    if (myUserUid == null || roomId == null || characters == null || participants == null || numberPieceValues == null) {
        return null;
    }

    const lastPublicMessage = (() => {
        if (publicMessages.length === 0) {
            return undefined;
        }
        const lastMessage = publicMessages[publicMessages.length - 1];
        if (lastMessage == null) {
            return;
        }
        if (lastMessage.type !== publicMessage) {
            return undefined;
        }
        return lastMessage.value;
    })();

    const grid = (() => {
        if (board.cellRowCount <= 0 ||
            board.cellColumnCount <= 0 ||
            board.cellHeight <= 0 ||
            board.cellWidth <= 0) {
            return null;
        }
        const cellWidth = board.cellWidth;
        const cellHeight = board.cellHeight;
        // TODO: Lineの色を変える
        const verticalLines = [...new Array(board.cellRowCount + 1)].map((_, i) => {
            const height = board.cellColumnCount * cellHeight;
            return (<ReactKonva.Line key={i} points={[i * cellWidth + board.cellOffsetX, board.cellOffsetY, i * cellHeight + board.cellOffsetX, height + board.cellOffsetY]} stroke={'red'} tension={1} />);
        });
        const horizontalLines = [...new Array(board.cellColumnCount + 1)].map((_, i) => {
            const width = board.cellRowCount * cellWidth;
            return (<ReactKonva.Line key={i} points={[board.cellOffsetX, i * cellWidth + board.cellOffsetY, width + board.cellOffsetX, i * cellHeight + board.cellOffsetY]} stroke={'red'} tension={1} />);
        });
        return (
            <>
                {verticalLines}
                {horizontalLines}
            </>);
    })();

    const pieces = (() => {
        const characterPieces = _(characters.toArray()).map(([characterKey, character]) => {
            const piece = dualKeyRecordToDualKeyMap<PieceState>(character.pieces).toArray().find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
            });
            if (piece == null) {
                return null;
            }
            const [, pieceValue] = piece;
            if (character.image == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <MyKonva.Image
                {...Piece.getPosition({ ...board, state: pieceValue })}
                key={compositeKeyToString(characterKey)}
                filePath={character.image}
                draggable
                listening
                isSelected={selectedPieceKey?.type === 'character' && compositeKeyEquals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => {
                    unsetPopoverEditor();
                    setSelectedPieceKey({ type: 'character', characterKey });
                }}
                onDblClick={e => {
                    if (onPopoverEditorRef.current == null) {
                        return;
                    }
                    onPopoverEditorRef.current({
                        offset: { x: e.evt.offsetX, y: e.evt.offsetY },
                        dblClickOn: { type: 'character', character, characterKey }
                    });
                }}
                onMouseEnter={() => mouseOverOnRef.current = { type: 'character', character, characterKey }}
                onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                onDragEnd={e => {
                    const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                    const operation: UpOperation = {
                        $version: 1,
                        characters: {
                            [characterKey.createdBy]: {
                                [characterKey.id]: {
                                    type: update,
                                    update: {
                                        $version: 1,
                                        pieces: {
                                            [boardKey.createdBy]: {
                                                [boardKey.id]: {
                                                    type: update,
                                                    update: pieceOperation,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    operate(operation);
                }} />;
        }).compact().value();

        const tachieLocations = _(characters.toArray()).map(([characterKey, character]) => {
            const tachieLocation = _(dualKeyRecordToDualKeyMap<BoardLocationState>(character.tachieLocations).toArray()).find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
            });
            if (tachieLocation == null) {
                return null;
            }
            const [, pieceValue] = tachieLocation;
            if (character.tachieImage == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <MyKonva.Image
                message={lastPublicMessage}
                messageFilter={msg => {
                    return msg.createdBy === characterKey.createdBy && msg.character?.stateId === characterKey.id && msg.channelKey !== $free;
                }}
                x={pieceValue.x}
                y={pieceValue.y}
                w={pieceValue.w}
                h={pieceValue.h}
                opacity={0.75 /* TODO: opacityの値が適当 */}
                key={compositeKeyToString(characterKey)}
                filePath={character.tachieImage}
                draggable
                listening
                isSelected={selectedPieceKey?.type === 'tachie' && compositeKeyEquals(selectedPieceKey.characterKey, characterKey)}
                onClick={() => {
                    unsetPopoverEditor();
                    setSelectedPieceKey({ type: 'tachie', characterKey });
                }}
                onDblClick={e => {
                    if (onPopoverEditorRef.current == null) {
                        return;
                    }
                    onPopoverEditorRef.current({
                        offset: { x: e.evt.offsetX, y: e.evt.offsetY },
                        dblClickOn: { type: 'tachie', character, characterKey }
                    });
                }}
                onMouseEnter={() => mouseOverOnRef.current = { type: 'tachie', character, characterKey }}
                onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                onDragEnd={e => {
                    const tachieLocationOperation = createTachieLocationPostOperation({ e });
                    const operation: UpOperation = {
                        $version: 1,
                        characters: {
                            [characterKey.createdBy]: {
                                [characterKey.id]: {
                                    type: update,
                                    update: {
                                        $version: 1,
                                        tachieLocations: {
                                            [boardKey.createdBy]: {
                                                [boardKey.id]: {
                                                    type: update,
                                                    update: tachieLocationOperation,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    operate(operation);
                }} />;
        }).compact().value();

        const dicePieces = _(dicePieceValues)
            .map(element => {
                const piece = dualKeyRecordToDualKeyMap<PieceState>(element.value.pieces).toArray().find(([boardKey$]) => {
                    return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
                });
                if (piece == null) {
                    return null;
                }
                const [, pieceValue] = piece;
                return <MyKonva.Piece
                    {...Piece.getPosition({ ...board, state: pieceValue })}
                    key={tripleKeyToString(element.characterKey.createdBy, element.characterKey.id, element.valueId)}
                    state={{ type: MyKonva.dicePiece, state: element.value }}
                    createdByMe={element.characterKey.createdBy === myUserUid}
                    draggable
                    listening
                    isSelected={selectedPieceKey?.type === 'dicePieceValue' && (selectedPieceKey.stateId === element.valueId)}
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceKey({ type: 'dicePieceValue', stateId: element.valueId });
                    }}
                    onDblClick={e => {
                        if (onPopoverEditorRef.current == null) {
                            return;
                        }
                        onPopoverEditorRef.current({
                            offset: { x: e.evt.offsetX, y: e.evt.offsetY },
                            dblClickOn: { type: 'dicePieceValue', element }
                        });
                    }}
                    onMouseEnter={() => mouseOverOnRef.current = { type: 'dicePieceValue', element }}
                    onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                        const operation: UpOperation = {
                            $version: 1,
                            characters: {
                                [element.characterKey.createdBy]: {
                                    [element.characterKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            dicePieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        pieces: {
                                                            [boardKey.createdBy]: {
                                                                [boardKey.id]: {
                                                                    type: update,
                                                                    update: pieceOperation,
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        operate(operation);
                    }} />;
            }).compact().value();

        const numberPieces = _(numberPieceValues)
            .map(element => {
                const piece = dualKeyRecordToDualKeyMap<PieceState>(element.value.pieces).toArray().find(([boardKey$]) => {
                    return boardKey.createdBy === boardKey$.first && boardKey.id === boardKey$.second;
                });
                if (piece == null) {
                    return null;
                }
                const [, pieceValue] = piece;
                return <MyKonva.Piece
                    {...Piece.getPosition({ ...board, state: pieceValue })}
                    key={tripleKeyToString(element.characterKey.createdBy, element.characterKey.id, element.valueId)}
                    state={{ type: MyKonva.numberPiece, state: element.value }}
                    createdByMe={element.characterKey.createdBy === myUserUid}
                    draggable
                    listening
                    isSelected={selectedPieceKey?.type === 'numberPieceValue' && (selectedPieceKey.stateId === element.valueId)}
                    onClick={() => {
                        unsetPopoverEditor();
                        setSelectedPieceKey({ type: 'numberPieceValue', stateId: element.valueId });
                    }}
                    onDblClick={e => {
                        if (onPopoverEditorRef.current == null) {
                            return;
                        }
                        onPopoverEditorRef.current({
                            offset: { x: e.evt.offsetX, y: e.evt.offsetY },
                            dblClickOn: { type: 'numberPieceValue', element }
                        });
                    }}
                    onMouseEnter={() => mouseOverOnRef.current = { type: 'numberPieceValue', element }}
                    onMouseLeave={() => mouseOverOnRef.current = { type: 'background' }}
                    onDragEnd={e => {
                        const pieceOperation = createPiecePostOperation({ e, piece: pieceValue, board });
                        const operation: UpOperation = {
                            $version: 1,
                            characters: {
                                [element.characterKey.createdBy]: {
                                    [element.characterKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            numberPieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        pieces: {
                                                            [boardKey.createdBy]: {
                                                                [boardKey.id]: {
                                                                    type: update,
                                                                    update: pieceOperation,
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        operate(operation);
                    }} />;
            }).compact().value();

        return (
            <ReactKonva.Layer>
                {tachieLocations}
                {characterPieces}
                {dicePieces}
                {numberPieces}
            </ReactKonva.Layer>);
    })();

    const backgroundImageKonva = backgroundImage.type === 'success' ?
        <ReactKonva.Image
            image={backgroundImage.image}
            scaleX={Math.max(board.backgroundImageZoom, 0)}
            scaleY={Math.max(board.backgroundImageZoom, 0)}
            onClick={e => e.evt.preventDefault()} /> :
        null;

    const scale = Math.pow(2, boardConfig.zoom);

    return (
        <ReactKonva.Stage
            width={canvasWidth}
            height={canvasHeight}
            onClick={e => {
                setSelectedPieceKey(undefined);
                unsetPopoverEditor();
                onClick == null ? undefined : onClick(e);
            }}
            onContextMenu={e => {
                if (onContextMenu == null) {
                    return;
                }
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onContextMenu(e, {
                    x: (e.evt.offsetX / scale) + boardConfig.offsetX,
                    y: (e.evt.offsetY / scale) + boardConfig.offsetY,
                });
            }}
            onMouseMove={e => {
                // CONSIDER: scale === 0 のケースに対応していない。configのほうで boardConfig.zoom === -Inf にならないようにするほうが自然か。
                onMove({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                });
            }}
            offsetX={boardConfig.offsetX}
            offsetY={boardConfig.offsetY}
            scaleX={scale}
            scaleY={scale}
            onWheel={e => {
                e.evt.preventDefault();
                dispatch(roomConfigModule.actions.zoomBoard({
                    roomId,
                    boardKey,
                    boardEditorPanelId: boardEditorPanelId,
                    zoomDelta: e.evt.deltaY > 0 ? -0.25 : 0.25,
                    prevCanvasWidth: canvasWidth,
                    prevCanvasHeight: canvasHeight,
                }));
            }}>
            {/* background: ドラッグで全体を動かせる */}
            <ReactKonva.Layer
                onMouseDown={e => {
                    if ((e.evt.buttons & 1) !== 0) {
                        setIsBackgroundDragging(true);
                    }
                }}
                onMouseUp={e => {
                    if ((e.evt.buttons & 1) !== 0) {
                        setIsBackgroundDragging(false);
                    }
                }}
                onMouseLeave={() => {
                    setIsBackgroundDragging(false);
                }}
                onMouseMove={e => {
                    // マウスの左ボタンが押下されていない場合は抜ける
                    if ((e.evt.buttons & 1) === 0) {
                        return;
                    }
                    if (!isBackgroundDragging) {
                        return;
                    }
                    const nonZeroScale = scale === 0 ? 0.01 : scale;
                    dispatch(roomConfigModule.actions.updateBoard({
                        roomId,
                        boardKey,
                        boardEditorPanelId: boardEditorPanelId,
                        offsetXDelta: -e.evt.movementX / nonZeroScale,
                        offsetYDelta: -e.evt.movementY / nonZeroScale,
                    }));
                }}>
                {/* このRectがないと画像がないところで位置をドラッグで変えることができない。ただもっといい方法があるかも */}
                <ReactKonva.Rect
                    x={-100000}
                    y={-100000}
                    width={200000}
                    height={200000} />
                {backgroundImageKonva}
                {grid}
            </ReactKonva.Layer>
            {/* pieces: ドラッグでpieceのみを動かせる */}
            {pieces}
        </ReactKonva.Stage>);
};

const toBoardPosition = ({
    konvaOffset,
    boardConfig,
}: {
    konvaOffset: { x: number; y: number };
    boardConfig: BoardConfig;
}): { x: number; y: number } => {
    const scale = Math.pow(2, boardConfig.zoom);
    return {
        x: (konvaOffset.x / scale) + boardConfig.offsetX,
        y: (konvaOffset.y / scale) + boardConfig.offsetY,
    };
};


namespace ContextMenu {
    export type State = {
        x: number;
        y: number;
        characterPiecesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: CharacterState; piece: PieceState }>;
        tachiesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: CharacterState; tachieLocation: BoardLocationState }>;
        dicePieceValuesOnCursor: ReadonlyArray<{
            characterKey: CompositeKey;
            dicePieceValueKey: string;
            dicePieceValue: DicePieceValueState;
            piece: PieceState;
        }>;
        numberPieceValuesOnCursor: ReadonlyArray<{
            characterKey: CompositeKey;
            numberPieceValueKey: string;
            numberPieceValue: NumberPieceValueState;
            piece: PieceState;
        }>;
    }

    type SelectedCharacterPiecesMenuProps = {
        characterPiecesOnCursor: State['characterPiecesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
    }

    const selectedCharacterPiecesMenu = ({
        characterPiecesOnCursor,
        onContextMenuClear,
        boardKey,
        dispatch,
        operate,
    }: SelectedCharacterPiecesMenuProps): JSX.Element | null => {
        if (characterPiecesOnCursor.length === 0) {
            return null;
        }
        return (
            <>
                {
                    characterPiecesOnCursor.map(({ characterKey, character }) =>
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected-piece'} title={`${character.name} (コマ)`}>
                            <Menu.Item
                                onClick={() => {
                                    dispatch(roomDrawerModule.actions.set({
                                        characterDrawerType: {
                                            type: update,
                                            boardKey,
                                            stateKey: characterKey,
                                        }
                                    }));
                                    onContextMenuClear();
                                }}>
                                編集
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    const operation: UpOperation = {
                                        $version: 1,
                                        characters: {
                                            [characterKey.createdBy]: {
                                                [characterKey.id]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        pieces: {
                                                            [boardKey.createdBy]: {
                                                                [boardKey.id]: {
                                                                    type: replace,
                                                                    replace: { newValue: undefined },
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    operate(operation);
                                    onContextMenuClear();
                                }}>
                                削除
                            </Menu.Item>
                        </Menu.SubMenu>
                    )
                }
                <Menu.Divider />
            </>);
    };

    type SelectedTachiesPiecesMenuProps = {
        tachiesOnCursor: State['tachiesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
    }

    export const selectedTachiePiecesMenu = ({
        tachiesOnCursor,
        onContextMenuClear,
        boardKey,
        dispatch,
        operate,
    }: SelectedTachiesPiecesMenuProps): JSX.Element | null => {
        if (tachiesOnCursor.length === 0) {
            return null;
        }
        return (
            <>
                {
                    tachiesOnCursor.map(({ characterKey, character }) =>
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected-tachie'} title={`${character.name} (立ち絵)`}>
                            <Menu.Item
                                onClick={() => {
                                    dispatch(roomDrawerModule.actions.set({
                                        characterDrawerType: {
                                            type: update,
                                            boardKey: boardKey,
                                            stateKey: characterKey,
                                        }
                                    }));
                                    onContextMenuClear();
                                }}>
                                編集
                            </Menu.Item>
                            <Menu.Item
                                onClick={() => {
                                    const operation: UpOperation = {
                                        $version: 1,
                                        characters: {
                                            [characterKey.createdBy]: {
                                                [characterKey.id]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        tachieLocations: {
                                                            [boardKey.createdBy]: {
                                                                [boardKey.id]: {
                                                                    type: replace,
                                                                    replace: { newValue: undefined },
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    operate(operation);
                                    onContextMenuClear();
                                }}>
                                削除
                            </Menu.Item>
                        </Menu.SubMenu>
                    )
                }
                <Menu.Divider />
            </>);
    };

    type SelectedCharacterCommandsMenuProps = {
        characterPiecesOnCursor: State['characterPiecesOnCursor'];
        tachiesOnCursor: State['tachiesOnCursor'];
        onContextMenuClear: () => void;
        operate: ReturnType<typeof useOperate>;
    }

    const selectedCharacterCommandsMenu = ({
        characterPiecesOnCursor,
        tachiesOnCursor,
        onContextMenuClear,
        operate,
    }: SelectedCharacterCommandsMenuProps): JSX.Element | null => {
        if (characterPiecesOnCursor.length + tachiesOnCursor.length === 0) {
            return null;
        }

        const characters: { key: CompositeKey; value: CharacterState }[] = [];
        [...characterPiecesOnCursor, ...tachiesOnCursor].forEach(elem => {
            if (characters.some(exists => exists.key.createdBy === elem.characterKey.createdBy && exists.key.id === elem.characterKey.id)) {
                return;
            }
            characters.push({ key: elem.characterKey, value: elem.character });
        });
        const itemGroups = _(characters).map(pair => {
            if (pair.value.privateCommand.trim() === '') {
                return null;
            }
            const key = compositeKeyToString(pair.key);
            const commands = listCharacterFlocommand(pair.value.privateCommand);
            if (commands.isError) {
                return (<Menu.ItemGroup key={key}>
                    <Menu.Item disabled><Tooltip title={commands.error}>(コマンド文法エラー)</Tooltip></Menu.Item>
                </Menu.ItemGroup>);
            }
            const menuItems = [...commands.value].map(([commandKey,]) => {
                return (<Menu.Item
                    key={commandKey}
                    onClick={() => {
                        const operation = executeCharacterFlocommand({ action: commands.value, characterKey: pair.key, character: pair.value, commandKey });
                        if (operation == null) {
                            return;
                        }
                        operate(operation);
                        onContextMenuClear();
                    }}>
                    {commandKey}
                </Menu.Item>);
            });
            return (<Menu.ItemGroup key={key} title={pair.value.name}>
                {menuItems}
            </Menu.ItemGroup>);
        }).compact().value();
        if (itemGroups.length === 0) {
            return null;
        }
        return (<>
            <Menu.SubMenu title='キャラクターコマンド'>
                {itemGroups}
            </Menu.SubMenu>
            <Menu.Divider />
        </>);
    };

    const youCannotEditPieceMessage = '自分以外が作成したコマでは、値を編集することはできません。';

    type SelectedDicePiecesMenuProps = {
        dicePieceValuesOnCursor: State['dicePieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        myUserUid: string;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
    }

    const selectedDicePiecesMenu = ({
        dicePieceValuesOnCursor,
        onContextMenuClear,
        boardKey: boardKeyToShow,
        myUserUid,
        dispatch,
        operate,
    }: SelectedDicePiecesMenuProps): JSX.Element | null => {
        if (dicePieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <>
                {
                    dicePieceValuesOnCursor.map(({ dicePieceValueKey, dicePieceValue, characterKey }) =>
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu key={dicePieceValueKey + '@selected'} title={DicePieceValue.stringify(dicePieceValue, myUserUid === characterKey.createdBy)}>
                            {characterKey.createdBy === myUserUid ? <Menu.Item
                                onClick={() => {
                                    dispatch(roomDrawerModule.actions.set({
                                        dicePieceValueDrawerType: {
                                            type: update,
                                            boardKey: boardKeyToShow,
                                            stateKey: dicePieceValueKey,
                                            characterKey,
                                        }
                                    }));
                                    onContextMenuClear();
                                }}>
                                編集
                            </Menu.Item> :
                                <Menu.Item disabled>
                                    <Tooltip title={youCannotEditPieceMessage}>
                                        編集
                                    </Tooltip>
                                </Menu.Item>}
                            <Menu.Item
                                onClick={() => {
                                    const operation: UpOperation = {
                                        $version: 1,
                                        characters: {
                                            [characterKey.createdBy]: {
                                                [characterKey.id]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        dicePieceValues: {
                                                            [dicePieceValueKey]: {
                                                                type: replace,
                                                                replace: { newValue: undefined }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    operate(operation);
                                    onContextMenuClear();
                                }}>
                                削除
                            </Menu.Item>
                        </Menu.SubMenu>
                    )
                }
                <Menu.Divider />
            </>);
    };

    type SelectedNumberPiecesMenuProps = {
        numberPieceValuesOnCursor: State['numberPieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        myUserUid: string;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
    }

    const selectedNumberPiecesMenu = ({
        numberPieceValuesOnCursor,
        onContextMenuClear,
        boardKey: boardKeyToShow,
        myUserUid,
        dispatch,
        operate,
    }: SelectedNumberPiecesMenuProps): JSX.Element | null => {
        if (numberPieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <>
                {
                    numberPieceValuesOnCursor.map(({ numberPieceValueKey, numberPieceValue, characterKey }) =>
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu key={numberPieceValueKey + '@selected'} title={NumberPieceValue.stringify(numberPieceValue)}>
                            {characterKey.createdBy === myUserUid ? <Menu.Item
                                onClick={() => {
                                    dispatch(roomDrawerModule.actions.set({
                                        numberPieceValueDrawerType: {
                                            type: update,
                                            boardKey: boardKeyToShow,
                                            stateKey: numberPieceValueKey,
                                            characterKey,
                                        }
                                    }));
                                    onContextMenuClear();
                                }}>
                                編集
                            </Menu.Item> :
                                <Menu.Item disabled>
                                    <Tooltip title={youCannotEditPieceMessage}>
                                        編集
                                    </Tooltip>
                                </Menu.Item>}
                            <Menu.Item
                                onClick={() => {
                                    const operation: UpOperation = {
                                        $version: 1,
                                        characters: {
                                            [characterKey.createdBy]: {
                                                [characterKey.id]: {
                                                    type: update,
                                                    update: {
                                                        $version: 1,
                                                        numberPieceValues: {
                                                            [numberPieceValueKey]: {
                                                                type: replace,
                                                                replace: { newValue: undefined }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    };
                                    operate(operation);
                                    onContextMenuClear();
                                }}>
                                削除
                            </Menu.Item>
                        </Menu.SubMenu>
                    )
                }
                <Menu.Divider />
            </>);
    };

    type BasicMenuProps = {
        contextMenuState: State;
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        boardConfig: BoardConfig;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
        characters: ReadonlyStateMap<CharacterState>;
        board: BoardState;
    }

    const basicMenu = ({
        contextMenuState,
        onContextMenuClear,
        boardKey,
        boardConfig,
        operate,
        dispatch,
        characters,
        board,
    }: BasicMenuProps): JSX.Element | null => {
        const pieceExists = (character: CharacterState) => dualKeyRecordToDualKeyMap(character.pieces).toArray().some(([pieceBoardKey]) => boardKey.id === pieceBoardKey.second && boardKey.createdBy === pieceBoardKey.first);
        const tachieExists = (character: CharacterState) => dualKeyRecordToDualKeyMap(character.tachieLocations).toArray().some(([pieceBoardKey]) => boardKey.id === pieceBoardKey.second && boardKey.createdBy === pieceBoardKey.first);

        const { x, y } = toBoardPosition({ konvaOffset: contextMenuState, boardConfig });
        const cellPosition = Piece.getCellPosition({ x, y, board });
        // TODO: x,y,w,h の値が適当
        const pieceLocationWhichIsCellMode: PieceState = {
            $version: 1,
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            cellX: cellPosition.cellX,
            cellY: cellPosition.cellY,
            cellW: 1,
            cellH: 1,
            isCellMode: true,
            isPrivate: false,
        };

        const pieceLocationWhichIsNotCellMode: PieceState = {
            $version: 1,
            x,
            y,
            w: 50,
            h: 50,
            isCellMode: false,
            isPrivate: false,
            cellX: 0,
            cellY: 0,
            cellW: 1,
            cellH: 1,
        };

        const tachieLocationWhichIsNotCellMode: BoardLocationState = {
            $version: 1,
            x,
            y,
            w: 100,
            h: 150,
            isPrivate: false,
        };

        const pieceMenus = [...characters.toArray()].map(([characterKey, character]) => {
            return <Menu.SubMenu key={compositeKeyToString(characterKey)} title={character.name}>
                <Menu.SubMenu title='追加' disabled={pieceExists(character)}>
                    <Menu.Item
                        onClick={() => {
                            operate({
                                $version: 1,
                                characters: {
                                    [characterKey.createdBy]: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                pieces: {
                                                    [boardKey.createdBy]: {
                                                        [boardKey.id]: {
                                                            type: replace,
                                                            replace: {
                                                                newValue: pieceLocationWhichIsCellMode,
                                                            }
                                                        },
                                                    }
                                                },
                                            },
                                        }
                                    }
                                }
                            });
                            onContextMenuClear();
                        }}>
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            operate({
                                $version: 1,
                                characters: {
                                    [characterKey.createdBy]: {
                                        [characterKey.id]: {
                                            type: update,
                                            update: {
                                                $version: 1,
                                                pieces: {
                                                    [boardKey.createdBy]: {
                                                        [boardKey.id]: {
                                                            type: replace,
                                                            replace: {
                                                                newValue: pieceLocationWhichIsNotCellMode,
                                                            }
                                                        },
                                                    }
                                                },
                                            },
                                        }
                                    }
                                }
                            });
                            onContextMenuClear();
                        }}>
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.Item
                    disabled={!pieceExists(character)}
                    onClick={() => {
                        operate({
                            $version: 1,
                            characters: {
                                [characterKey.createdBy]: {
                                    [characterKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            pieces: {
                                                [boardKey.createdBy]: {
                                                    [boardKey.id]: {
                                                        type: replace,
                                                        replace: {
                                                            newValue: undefined,
                                                        }
                                                    },
                                                }
                                            },
                                        },
                                    }
                                }
                            }
                        });
                        onContextMenuClear();
                    }}>
                    削除
                </Menu.Item>
            </Menu.SubMenu>;
        });

        const tachieMenus = [...characters.toArray()].map(([characterKey, character]) => {
            return <Menu.SubMenu key={compositeKeyToString(characterKey)} title={character.name}>
                <Menu.Item
                    disabled={tachieExists(character)}
                    onClick={() => {
                        operate({
                            $version: 1,
                            characters: {
                                [characterKey.createdBy]: {
                                    [characterKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            tachieLocations: {
                                                [boardKey.createdBy]: {
                                                    [boardKey.id]: {
                                                        type: replace,
                                                        replace: {
                                                            newValue: tachieLocationWhichIsNotCellMode,
                                                        }
                                                    },
                                                }
                                            },
                                        },
                                    }
                                }
                            }
                        });
                        onContextMenuClear();
                    }}>
                    追加
                </Menu.Item>
                <Menu.Item
                    disabled={!tachieExists(character)}
                    onClick={() => {
                        operate({
                            $version: 1,
                            characters: {
                                [characterKey.createdBy]: {
                                    [characterKey.id]: {
                                        type: update,
                                        update: {
                                            $version: 1,
                                            tachieLocations: {
                                                [boardKey.createdBy]: {
                                                    [boardKey.id]: {
                                                        type: replace,
                                                        replace: {
                                                            newValue: undefined,
                                                        }
                                                    },
                                                }
                                            },
                                        },
                                    }
                                }
                            }
                        });
                        onContextMenuClear();
                    }}>
                    削除
                </Menu.Item>
            </Menu.SubMenu>;
        });

        return <>
            <Menu.SubMenu title='キャラクターコマ'>
                {pieceMenus}
            </Menu.SubMenu>
            <Menu.SubMenu title='キャラクター立ち絵'>
                {tachieMenus}
            </Menu.SubMenu>
            <Menu.SubMenu title='ダイスコマを追加'>
                <Menu.Item onClick={() => {
                    dispatch(roomDrawerModule.actions.set({
                        dicePieceValueDrawerType: {
                            type: create,
                            boardKey,
                            piece: pieceLocationWhichIsCellMode,
                        }
                    }));
                    onContextMenuClear();
                }} >
                    セルにスナップする
                </Menu.Item>
                <Menu.Item onClick={() => {
                    dispatch(roomDrawerModule.actions.set({
                        dicePieceValueDrawerType: {
                            type: create,
                            boardKey,
                            piece: pieceLocationWhichIsNotCellMode,
                        }
                    }));
                    onContextMenuClear();
                }} >
                    セルにスナップしない
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu title='数値コマを追加'>
                <Menu.Item onClick={() => {
                    dispatch(roomDrawerModule.actions.set({
                        numberPieceValueDrawerType: {
                            type: create,
                            boardKey,
                            piece: pieceLocationWhichIsCellMode,
                        }
                    }));
                    onContextMenuClear();
                }} >
                    セルにスナップする
                </Menu.Item>
                <Menu.Item onClick={() => {
                    dispatch(roomDrawerModule.actions.set({
                        numberPieceValueDrawerType: {
                            type: create,
                            boardKey,
                            piece: pieceLocationWhichIsNotCellMode,
                        }
                    }));
                    onContextMenuClear();
                }} >
                    セルにスナップしない
                </Menu.Item>
            </Menu.SubMenu>
        </>;
    };


    type Props = {
        contextMenuState: State;
        boardKey: CompositeKey;
        onContextMenuClear: () => void;
        board: BoardState;
        boardConfig: BoardConfig;
    }

    export const Main: React.FC<Props> = ({
        contextMenuState,
        boardKey,
        onContextMenuClear,
        board,
        boardConfig,
    }: Props) => {
        const dispatch = useDispatch();
        const operate = useOperate();
        const characters = useCharacters();
        const { userUid: myUserUid } = useMe();

        if (characters == null || myUserUid == null) {
            return null;
        }

        return (
            <div style={({ position: 'absolute', left: contextMenuState.x, top: contextMenuState.y })}>
                <Menu>
                    {/* React.FCなどを用いるとantdがエラーを出すので、単なるJSX.Elementを返す関数として定義している */}

                    {selectedCharacterPiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                    })}
                    {selectedTachiePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                    })}
                    {selectedDicePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                        myUserUid,
                    })}
                    {selectedNumberPiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                        myUserUid,
                    })}
                    {selectedCharacterCommandsMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        operate,
                    })}
                    {board == null ? null : basicMenu({
                        contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                        boardConfig,
                        characters,
                        board,
                    })}
                </Menu>
            </div>);
    };
}

type Props = {
    canvasWidth: number;
    canvasHeight: number;
} & ({
    type: 'activeBoard';
    activeBoardPanel: ActiveBoardPanelConfig;
} | {
    type: 'boardEditor';
    boardEditorPanel: BoardEditorPanelConfig;
    boardEditorPanelId: string;
})

const boardsDropDownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 20,
    right: 20,
};

const zoomButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 70,
    right: 20,
};

const Board: React.FC<Props> = ({
    canvasWidth,
    canvasHeight,
    ...panel
}: Props) => {
    const dispatch = useDispatch();
    const [contextMenuState, setContextMenuState] = React.useState<ContextMenu.State | null>(null);
    const [tooltipState, setTooltipState] = React.useState<OnTooltipParams | null>(null);
    const [popupEditorState, setPopupEditorState] = React.useState<OnPopupEditorParams | null>(null);
    const roomId = useSelector(state => state.roomModule.roomId);
    const boards = useBoards();
    const characters = useCharacters();
    const dicePieceValues = useDicePieceValues();
    const numberPieceValues = useNumberPieceValues();
    const { participant: me, userUid: myUserUid } = useMe();
    const activeBoardKey = useSelector(state => state.roomModule.roomState?.state?.activeBoardKey);
    const activeBoardPanelConfig = useSelector(state => state.roomConfigModule?.panels.activeBoardPanel);
    const [activeBoardSelectorModalVisibility, setActiveBoardSelectorModalVisibility] = React.useState(false);

    if (me == null || myUserUid == null || roomId == null || boards == null || characters == null || numberPieceValues == null) {
        return null;
    }

    const boardKeyToShow = (() => {
        if (panel.type === 'activeBoard') {
            return activeBoardKey;
        }
        if (panel.boardEditorPanel.activeBoardKey == null) {
            return null;
        }
        return stringToCompositeKey(panel.boardEditorPanel.activeBoardKey);
    })();

    const boardConfig = (() => {
        if (boardKeyToShow == null) {
            return null;
        }
        if (panel.type === 'activeBoard') {
            if (activeBoardPanelConfig == null) {
                return null;
            }
            return activeBoardPanelConfig.boards[compositeKeyToString(boardKeyToShow)];
        }
        return panel.boardEditorPanel.boards[compositeKeyToString(boardKeyToShow)];
    })() ?? defaultBoardConfig();

    const boardEditorPanelId = panel.type === 'boardEditor' ? panel.boardEditorPanelId : null;

    const board = boardKeyToShow == null ? null : boards.get(boardKeyToShow);

    const boardComponent = (() => {
        if (boardKeyToShow == null) {
            return (<div>ボードビュアーに表示するボードが指定されていません。</div>);
        }
        if (board == null) {
            return (<div>{`キーが ${compositeKeyToString(boardKeyToShow)} であるボードが見つかりませんでした。`}</div>);
        }

        return (<BoardCore
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            board={board}
            boardKey={boardKeyToShow}
            boardConfig={boardConfig}
            boardEditorPanelId={boardEditorPanelId}
            onClick={() => setContextMenuState(null)}
            onTooltip={newValue => setTooltipState(newValue)}
            onPopupEditor={newValue => setPopupEditorState(newValue)}
            onContextMenu={(e, stateOffset) => {
                e.evt.preventDefault();
                setContextMenuState({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                    characterPiecesOnCursor: _(characters.toArray())
                        .map(([characterKey, character]) => {
                            const found = dualKeyRecordToDualKeyMap<PieceState>(character.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { characterKey, character, piece: found[1] };
                        })
                        .compact()
                        .value(),
                    tachiesOnCursor: _(characters.toArray())
                        .map(([characterKey, character]) => {
                            const found = dualKeyRecordToDualKeyMap<BoardLocationState>(character.tachieLocations).toArray()
                                .find(([boardKey, tachie]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
                                        return false;
                                    }
                                    return BoardLocation.isCursorOnIcon({ state: tachie, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { characterKey, character, tachieLocation: found[1] };
                        })
                        .compact()
                        .value(),
                    dicePieceValuesOnCursor: _(dicePieceValues)
                        .map(element => {
                            const found = dualKeyRecordToDualKeyMap<PieceState>(element.value.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return {
                                dicePieceValueKey: element.valueId,
                                dicePieceValue: element.value,
                                piece: found[1],
                                characterKey: { createdBy: element.characterKey.createdBy, id: element.characterKey.id }
                            };
                        })
                        .compact()
                        .value(),
                    numberPieceValuesOnCursor: _(numberPieceValues)
                        .map(element => {
                            const found = dualKeyRecordToDualKeyMap<PieceState>(element.value.pieces).toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.first !== boardKeyToShow.createdBy || boardKey.second !== boardKeyToShow.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return {
                                numberPieceValueKey: element.valueId,
                                numberPieceValue: element.value,
                                piece: found[1],
                                characterKey: { createdBy: element.characterKey.createdBy, id: element.characterKey.id }
                            };
                        })
                        .compact()
                        .value(),
                });
            }} />);
    })();

    const dropDownItems = boardEditorPanelId == null ? null : boards.toArray().map(([key, board]) => (
        <Menu.Item
            key={compositeKeyToString(key)}
            onClick={() => dispatch(roomConfigModule.actions.updateBoardEditorPanel({
                boardEditorPanelId,
                roomId,
                panel: {
                    activeBoardKey: compositeKeyToString(key),
                }
            }))}>
            {board.name === '' ? '(名前なし)' : board.name}
        </Menu.Item>));

    // activeBoardPanelモードのときは boardsMenu==null
    const boardsMenu = dropDownItems == null ? null : (
        <Menu>
            <Menu.ItemGroup title="ボード一覧">
                {dropDownItems}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.Item
                icon={<Icons.PlusOutlined />}
                onClick={() => dispatch(roomDrawerModule.actions.set({ boardDrawerType: { type: create } }))}>
                新規作成
            </Menu.Item>
        </Menu>
    );

    const noActiveBoardText = '';

    return (
        <div style={({ position: 'relative' })}>
            {boardComponent}
            <span style={boardsDropDownStyle}>
                {boardsMenu != null
                    ? <Dropdown overlay={boardsMenu} trigger={['click']}>
                        <Button>
                            {boardKeyToShow == null ? noActiveBoardText : (boards.get(boardKeyToShow)?.name ?? noActiveBoardText)} <Icons.DownOutlined />
                        </Button>
                    </Dropdown>
                    : <Dropdown
                        trigger={['click']}
                        overlay={<Menu>
                            <Menu.Item
                                onClick={() => {
                                    setActiveBoardSelectorModalVisibility(true);
                                }}>
                                表示ボードの変更
                            </Menu.Item>
                        </Menu>}>
                        <Button>{board?.name}<Icons.DownOutlined /></Button>
                    </Dropdown>}
                <Button
                    disabled={boardKeyToShow == null}
                    onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomDrawerModule.actions.set({ boardDrawerType: { type: update, stateKey: boardKeyToShow } }));
                    }}>
                    編集
                </Button>
            </span>
            <div style={zoomButtonStyle}>
                <div style={({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' })}>
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                            zoomDelta: 0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
                        }));
                    }}>
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.zoomBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                            zoomDelta: -0.25,
                            prevCanvasWidth: canvasWidth,
                            prevCanvasHeight: canvasHeight,
                        }));
                    }}>
                        <Icon.ZoomOutOutlined />
                    </Button>
                    <div style={({ height: 6 })} />
                    <Button onClick={() => {
                        if (boardKeyToShow == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.resetBoard({
                            roomId,
                            boardKey: boardKeyToShow,
                            boardEditorPanelId,
                        }));
                    }}>
                        Boardの位置とズームをリセット
                    </Button>
                </div>
            </div>
            {(tooltipState != null && popupEditorState == null) && <PieceTooltip {...tooltipState} />}
            {popupEditorState != null && <PopupEditor {...popupEditorState} />}
            {(board != null && boardKeyToShow != null && contextMenuState != null) &&
                <ContextMenu.Main
                    contextMenuState={contextMenuState}
                    board={board}
                    boardConfig={boardConfig}
                    boardKey={boardKeyToShow}
                    onContextMenuClear={() => setContextMenuState(null)} />}
            <ActiveBoardSelectorModal
                visible={activeBoardSelectorModalVisibility}
                onComplete={() => setActiveBoardSelectorModalVisibility(false)} />
        </div>
    );
};

export default Board;