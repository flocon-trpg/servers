import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { CompositeKey, compositeKeyToString, createStateMap, ReadonlyStateMap, stringToCompositeKey, toJSONString } from '../../@shared/StateMap';
import { Button, Dropdown, Menu } from 'antd';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import { boardDrawerType, characterDrawerType, create } from './RoomComponentsState';
import { useDispatch } from 'react-redux';
import roomConfigModule from '../../modules/roomConfigModule';
import { BoardsPanelConfig, createDefaultBoardConfig } from '../../states/BoardsPanelConfig';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { FilePath } from '../../utils/types';
import { __ } from '../../@shared/collection';
import OperateContext from './contexts/OperateContext';
import { OperationElement, replace, update } from '../../stateManagers/states/types';
import * as Icon from '@ant-design/icons';
import { getCellPosition, getCellSize } from './utils';
import { Character } from '../../stateManagers/states/character';
import { Piece } from '../../stateManagers/states/piece';
import { Room } from '../../stateManagers/states/room';
import { Board as StatesBoard } from '../../stateManagers/states/board';

type Vector2 = {
    x: number;
    y: number;
}

type Size = {
    w: number;
    h: number;
}

type DragEndResult = {
    readonly newLocation?: Vector2;
    readonly newSize?: Size;
}

const iconImageMinimalSize = 10;

type IconImageProps = {
    filePath: FilePath;
    isSelected: boolean;
    draggable: boolean;
    listening: boolean;

    onDragEnd?: (resize: DragEndResult) => void;
    onClick?: () => void;
} & Vector2 & Size

const IconImage: React.FC<IconImageProps> = (props: IconImageProps) => {
    /*
    リサイズや移動の実装方法についてはこちらを参照
    https://konvajs.org/docs/react/Transformer.html
    */

    const image = useImageFromGraphQL(props.filePath);
    const imageRef = React.useRef<Konva.Image | null>(null);
    const transformerRef = React.useRef<Konva.Transformer | null>(null);

    React.useEffect(() => {
        if (!props.isSelected) {
            return;
        }
        if (transformerRef.current == null) {
            return;
        }
        transformerRef.current.nodes(imageRef.current == null ? [] : [imageRef.current]);
        const layer = transformerRef.current.getLayer();
        if (layer == null) {
            return;
        }
        layer.batchDraw();
    }); // deps=[props.isSelected]だと何故かうまくいかない(isSelectedは最初falseで、クリックなどの操作によって初めてtrueにならないとだめ？)のでdepsは空にしている

    if (image.type !== success) {
        return null;
    }

    const onDragEnd = (e: KonvaEventObject<unknown>) => {
        if (!props.draggable) {
            return;
        }
        const x = e.target.x();
        const y = e.target.y();
        // セルにスナップする設定の場合、このようにxy座標をリセットしないと少しだけ動かしたときにprops.xとprops.yの値が変わらないため再レンダリングされない。そのため、スナップしない。
        e.target.x(props.x);
        e.target.y(props.y);
        if (props.onDragEnd == null) {
            return;
        }
        props.onDragEnd({
            newLocation: {
                x,
                y,
            }
        });
    };

    return (
        <>
            <ReactKonva.Image
                listening={props.listening}
                ref={imageRef}
                x={props.x}
                y={props.y}
                width={props.w}
                height={props.h}
                image={image.image}
                draggable={props.draggable}
                onClick={e => {
                    e.cancelBubble = true;
                    props.onClick == null ? undefined : props.onClick();
                }}
                onDragEnd={e => onDragEnd(e)}
                onTouchEnd={e => onDragEnd(e)}
                onTransformEnd={() => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = imageRef.current;
                    if (node == null) {
                        return;
                    }
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    if (props.onDragEnd == null) {
                        return;
                    }
                    props.onDragEnd({
                        newLocation: {
                            x: node.x(),
                            y: node.y(),
                        },
                        newSize: {
                            // set minimal value
                            w: Math.max(iconImageMinimalSize, node.width() * scaleX),
                            h: Math.max(iconImageMinimalSize, node.height() * scaleY)
                        },
                    });
                }} />
            {props.isSelected && (
                <ReactKonva.Transformer
                    ref={transformerRef}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < iconImageMinimalSize || newBox.height < iconImageMinimalSize) {
                            return oldBox;
                        }
                        return newBox;
                    }}>
                </ReactKonva.Transformer>
            )}
        </>
    );
};

type BoardProps = {
    roomId: string;
    boardKey: CompositeKey;
    boardsPanelConfigId: string;
    board: StatesBoard.State;
    boardsPanelConfig: BoardsPanelConfig;
    characters: ReadonlyStateMap<Character.State>;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    onContextMenu?: (e: KonvaEventObject<PointerEvent>, stateOffset: Vector2) => void; // stateOffsetは、configなどのxy座標を基準にした位置。
    canvasWidth: number;
    canvasHeight: number;
}

const Board: React.FC<BoardProps> = ({ roomId, board, boardKey, boardsPanelConfigId, boardsPanelConfig, characters, onClick, onContextMenu, canvasWidth, canvasHeight }: BoardProps) => {
    const [selectedPieceKey, setSelectedPieceKey] = React.useState<CompositeKey>(); // keyはcharacter
    const [isBackgroundDragging, setIsBackgroundDragging] = React.useState(false); // これがないと、pieceをドラッグでリサイズする際に背景が少し動いてしまう。
    const backgroundImage = useImageFromGraphQL(board.backgroundImage);
    const dispatch = useDispatch();
    const operate = React.useContext(OperateContext);

    const boardConfig = boardsPanelConfig.boards[compositeKeyToString(boardKey)] ?? createDefaultBoardConfig();

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
        const pieces = __(characters).compact(([characterKey, character]) => {
            const piece = __(character.pieces).find(([boardKey$]) => {
                return boardKey.createdBy === boardKey$.createdBy && boardKey.id === boardKey$.id;
            });
            if (piece == null) {
                return null;
            }
            const [, pieceValue] = piece.value;
            if (character.image == null) {
                // TODO: 画像なしでコマを表示する
                return null;
            }
            return <IconImage
                {...Piece.getPosition({ ...board, state: pieceValue })}
                key={compositeKeyToString(characterKey)}
                filePath={character.image}
                draggable
                listening
                isSelected={selectedPieceKey != null && (selectedPieceKey.createdBy === characterKey.createdBy && selectedPieceKey.id === characterKey.id)}
                onClick={() => setSelectedPieceKey(characterKey)}
                onDragEnd={e => {
                    const pieceOperation: Piece.PostOperation = {};
                    if (e.newLocation != null) {
                        pieceOperation.x = { newValue: e.newLocation.x };
                        pieceOperation.y = { newValue: e.newLocation.y };
                    }
                    if (e.newSize != null) {
                        pieceOperation.w = { newValue: e.newSize.w };
                        pieceOperation.h = { newValue: e.newSize.h };
                    }
                    if (pieceValue.isCellMode) {
                        if (e.newLocation != null) {
                            const position = getCellPosition({ ...e.newLocation, board });
                            pieceOperation.cellX = { newValue: position.cellX };
                            pieceOperation.cellY = { newValue: position.cellY };
                        }
                        if (e.newSize != null) {
                            const size = getCellSize({ ...e.newSize, board });
                            pieceOperation.cellW = { newValue: size.cellW };
                            pieceOperation.cellH = { newValue: size.cellH };
                        }
                    }
                    const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                    pieces.set(boardKey, { type: update, operation: pieceOperation });
                    const operation = Room.createPostOperationSetup();
                    operation.characters.set(characterKey, {
                        type: update,
                        operation: {
                            pieces,
                            boolParams: new Map(),
                            numParams: new Map(),
                            numMaxParams: new Map(),
                            strParams: new Map(),
                        }
                    });
                    operate(operation);
                }} />;
        }).toArray();

        return (
            <ReactKonva.Layer>
                {pieces}
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
            offsetX={boardConfig.offsetX}
            offsetY={boardConfig.offsetY}
            scaleX={scale}
            scaleY={scale}
            onWheel={e => {
                e.evt.preventDefault();
                dispatch(roomConfigModule.actions.zoomBoard({
                    roomId,
                    boardKey,
                    panelId: boardsPanelConfigId,
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
                        panelId: boardsPanelConfigId,
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

type ContextMenuState = {
    x: number;
    y: number;
    valuesOnCursor: ReadonlyArray<{ characterKey: CompositeKey; character: Character.State; piece: Piece.State }>;
}

type Props = {
    boards: ReadonlyStateMap<StatesBoard.State>;
    boardsPanelConfig: BoardsPanelConfig;
    boardsPanelConfigId: string;
    characters: ReadonlyStateMap<Character.State>;
    roomId: string;
    canvasWidth: number;
    canvasHeight: number;
}

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

const Boards: React.FC<Props> = ({ boards, boardsPanelConfig, boardsPanelConfigId, characters, roomId, canvasWidth: width, canvasHeight: height }: Props) => {
    const dispatchRoomComponentsState = React.useContext(DispatchRoomComponentsStateContext);
    const dispatch = useDispatch();
    const [contextMenuState, setContextMenuState] = React.useState<ContextMenuState | null>(null);
    const operate = React.useContext(OperateContext);

    const activeBoardKey = (() => {
        if (boardsPanelConfig.activeBoardKey == null) {
            return null;
        }
        return stringToCompositeKey(boardsPanelConfig.activeBoardKey);
    })();
    const boardComponent = (() => {
        if (boards.size === 0) {
            return (
                <div>
                    Boardが1つも存在しません。
                </div>
            );
        }
        if (activeBoardKey == null) {
            return (<div>Boardが選択されていません。</div>);
        }
        const board = boards.get(activeBoardKey);
        if (board == null) {
            return (<div>{`キーが ${toJSONString(activeBoardKey)} であるBoardが見つかりません。他のBoardを選択してください。`}</div>);
        }
        return (<Board
            canvasWidth={width}
            canvasHeight={height}
            board={board}
            roomId={roomId}
            boardKey={activeBoardKey}
            boardsPanelConfig={boardsPanelConfig}
            boardsPanelConfigId={boardsPanelConfigId}
            characters={characters}
            onClick={() => setContextMenuState(null)}
            onContextMenu={(e, stateOffset) => {
                e.evt.preventDefault();
                setContextMenuState({
                    x: e.evt.offsetX,
                    y: e.evt.offsetY,
                    valuesOnCursor: __(characters.toArray())
                        .compact(([characterKey, character]) => {
                            const found = character.pieces.toArray()
                                .find(([boardKey, piece]) => {
                                    if (boardKey.createdBy !== activeBoardKey.createdBy || boardKey.id !== activeBoardKey.id) {
                                        return false;
                                    }
                                    return Piece.isCursorOnIcon({ ...board, state: piece, cursorPosition: stateOffset });
                                });
                            if (found === undefined) {
                                return null;
                            }
                            return { characterKey, character, piece: found[1] };
                        }).toArray(),
                });
            }} />);
    })();
    const dropDownItems = boards.toArray().map(([key, board]) => (
        <Menu.Item
            key={toJSONString(key)}
            onClick={() => dispatch(roomConfigModule.actions.updateBoardPanel({
                panelId: boardsPanelConfigId,
                roomId: roomId,
                panel: {
                    activeBoardKey: compositeKeyToString(key),
                }
            }))}>
            {board.name === '' ? '(名前なし)' : board.name}
        </Menu.Item>));
    const boardsMenu = (
        <Menu>
            <Menu.ItemGroup title="ボード一覧">
                {dropDownItems}
            </Menu.ItemGroup>
            <Menu.Divider />
            <Menu.Item
                icon={<PlusOutlined />}
                onClick={() => dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: create } })}>
                新規作成
            </Menu.Item>
        </Menu>
    );
    const contextMenu = (() => {
        if (contextMenuState == null) {
            return null;
        }
        const board = activeBoardKey == null ? undefined : boards.get(activeBoardKey);
        const selectedCharactersMenu = (() => {
            if (activeBoardKey == null || contextMenuState.valuesOnCursor.length === 0) {
                return null;
            }
            return (
                <>
                    {
                        contextMenuState.valuesOnCursor.map(({ characterKey, character, piece }) =>
                            // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                            <Menu.SubMenu key={compositeKeyToString(characterKey) + '@selected'} title={character.name}>
                                <Menu.Item
                                    onClick={() => {
                                        dispatchRoomComponentsState({
                                            type: characterDrawerType,
                                            newValue: {
                                                type: update,
                                                boardKey: activeBoardKey,
                                                stateKey: characterKey,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: undefined,
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(characterKey, {
                                            type: update,
                                            operation: {
                                                pieces,
                                                boolParams: new Map(),
                                                numParams: new Map(),
                                                numMaxParams: new Map(),
                                                strParams: new Map(),
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                    削除
                                </Menu.Item>
                            </Menu.SubMenu>
                        )
                    }
                    <Menu.Divider />
                </>);
        })();
        const allCharactersListMenu = (() => {
            const title = 'キャラクター一覧';
            if (board == null || activeBoardKey == null) {
                return <Menu.SubMenu title={title} disabled />;
            }
            return (
                <Menu.SubMenu title={title}>
                    {__(characters.toArray()).compact(([key, value]) => {
                        const pieceLocationExists = __(value.pieces).exists(([boardKey]) => activeBoardKey.id === boardKey.id && activeBoardKey.createdBy === boardKey.createdBy);

                        const cellPosition = getCellPosition({ ...contextMenuState, board });
                        // TODO: x,y,w,h の値が適当
                        const pieceLocationWhichIsCellMode = {
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
                        
                        const pieceLocationWhichIsNotCellMode = {
                            x: contextMenuState.x,
                            y: contextMenuState.y,
                            w: 50,
                            h: 50,
                            isPrivate: false,
                            isCellMode: false,
                            cellX: 0,
                            cellY: 0,
                            cellW: 1,
                            cellH: 1,
                        };

                        return (
                            <Menu.SubMenu key={compositeKeyToString(key)} title={<span>{pieceLocationExists ? <Icon.CheckOutlined /> : null} {value.name}</span>}>
                                <Menu.Item
                                    disabled={!pieceLocationExists}
                                    onClick={() => {
                                        dispatchRoomComponentsState({
                                            type: characterDrawerType,
                                            newValue: {
                                                type: update,
                                                boardKey: activeBoardKey,
                                                stateKey: key,
                                            }
                                        });
                                        setContextMenuState(null);
                                    }}>
                                    編集
                                </Menu.Item>
                                <Menu.SubMenu disabled={pieceLocationExists} title="置く">
                                    <Menu.Item onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();

                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: pieceLocationWhichIsCellMode
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                pieces,
                                                boolParams: new Map(),
                                                numParams: new Map(),
                                                numMaxParams: new Map(),
                                                strParams: new Map(),
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                        セルにスナップする
                                    </Menu.Item>
                                    <Menu.Item onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: pieceLocationWhichIsNotCellMode
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                pieces,
                                                boolParams: new Map(),
                                                numParams: new Map(),
                                                numMaxParams: new Map(),
                                                strParams: new Map(),
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                        セルにスナップしない
                                    </Menu.Item>
                                </Menu.SubMenu>
                                <Menu.Item
                                    disabled={!pieceLocationExists}
                                    onClick={() => {
                                        const pieces = createStateMap<OperationElement<Piece.State, Piece.PostOperation>>();
                                        pieces.set(activeBoardKey, {
                                            type: replace,
                                            newValue: undefined,
                                        });
                                        const operation = Room.createPostOperationSetup();
                                        operation.characters.set(key, {
                                            type: update,
                                            operation: {
                                                pieces,
                                                boolParams: new Map(),
                                                numParams: new Map(),
                                                numMaxParams: new Map(),
                                                strParams: new Map(),
                                            }
                                        });
                                        operate(operation);
                                        setContextMenuState(null);
                                    }}>
                                    削除
                                </Menu.Item>
                            </Menu.SubMenu>
                        );
                    }).toArray()}
                </Menu.SubMenu>
            );
        })();
        return (
            <div style={({ position: 'absolute', left: contextMenuState.x, top: contextMenuState.y })}>
                <Menu>
                    {selectedCharactersMenu}
                    {allCharactersListMenu}
                </Menu>
            </div>);
    }
    )();

    const noActiveBoardText = '';

    return (
        <div style={({ position: 'relative' })}>
            {boardComponent}
            <span style={boardsDropDownStyle}>
                <Dropdown overlay={boardsMenu} trigger={['click']}>
                    <Button>
                        {activeBoardKey == null ? noActiveBoardText : (boards.get(activeBoardKey)?.name ?? noActiveBoardText)} <DownOutlined />
                    </Button>
                </Dropdown>
                <Button
                    disabled={activeBoardKey == null}
                    onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatchRoomComponentsState({ type: boardDrawerType, newValue: { type: update, stateKey: activeBoardKey } });
                    }}>
                    編集
                </Button>
            </span>
            <div style={zoomButtonStyle}>
                <div style={({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' })}>
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.updateBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: 0.25,
                        }));
                    }}>
                        <Icon.ZoomInOutlined />
                    </Button>
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.updateBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                            zoomDelta: -0.25,
                        }));
                    }}>
                        <Icon.ZoomOutOutlined />
                    </Button>
                    <div style={({ height: 6 })} />
                    <Button onClick={() => {
                        if (activeBoardKey == null) {
                            return;
                        }
                        dispatch(roomConfigModule.actions.resetBoard({
                            roomId,
                            boardKey: activeBoardKey,
                            panelId: boardsPanelConfigId,
                        }));
                    }}>
                        Boardの位置とズームをリセット
                    </Button>
                </div>
            </div>
            {contextMenu}
        </div >
    );
};

export default Boards;