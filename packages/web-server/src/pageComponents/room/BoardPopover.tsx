import {
    execCharacterCommand,
    BoardState,
    CharacterState,
    dicePieceValueStrIndexes,
    PieceState,
    State,
    diff,
    toUpOperation,
    FilePath,
    simpleId,
    BoardPositionState,
} from '@flocon-trpg/core';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { Menu, Tooltip } from 'antd';
import _ from 'lodash';
import React from 'react';
import { InputDie } from '../../components/InputDie';
import { NewTabLinkify } from '../../components/NewTabLinkify';
import { FileSourceType, WriteRoomSoundEffectDocument } from '@flocon-trpg/typed-document-node';
import { useBoards } from '../../hooks/state/useBoards';
import { useCharacters } from '../../hooks/state/useCharacters';
import { DicePieceValueElement, useDicePieceValues } from '../../hooks/state/useDicePieceValues';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
import { replace, update } from '../../stateManagers/states/types';
import { testCommand } from '../../utils/command';
import { noValue } from '../../utils/dice';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { Piece } from '../../utils/piece';
import { useMutation } from '@apollo/client';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { BoardConfig } from '../../atoms/roomConfig/types/boardConfig';
import { boardTooltipAtom } from '../../atoms/overlay/board/boardTooltipAtom';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import {
    character,
    dicePieceValue,
    imagePieceValue,
    portrait,
} from '../../atoms/overlay/board/types';
import { boardPopoverEditorAtom } from '../../atoms/overlay/board/boardPopoverEditorAtom';
import {
    boardContextMenuAtom,
    ContextMenuState,
} from '../../atoms/overlay/board/boardContextMenuAtom';
import { imagePieceDrawerAtom } from '../../atoms/overlay/imagePieceDrawerAtom';
import { create } from '../../utils/constants';
import { useCloneImagePiece } from '../../hooks/state/useCloneImagePiece';
import { ImageView } from '../../components/ImageView';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '../../utils/className';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { useIsMyCharacter } from '../../hooks/state/useIsMyCharacter';
import {
    boardPositionAndPieceEditorModalAtom,
    characterPiece,
    characterPortrait,
} from './BoardPositionAndPieceEditorModal';
import { characterEditorModalAtom } from './CharacterEditorModal';
import { dicePieceValueEditorModalAtom } from './DicePieceValueEditorModal';
import { stringPieceEditorModalAtom } from './StringPieceValueEditorModal';

/* absolute positionで表示するときにBoardの子として表示させると、Boardウィンドウから要素がはみ出ることができないため、ウィンドウ右端に近いところで要素を表示させるときに不便なことがある。そのため、ページ全体の子として持たせるようにしている。 */

const backgroundColor = '#202020E8';
const padding = 8;
const zIndex = 500; // .ant-drawerによると、antdのDrawerのz-indexは100

export const PieceTooltip: React.FC = () => {
    const boardTooltipState = useAtomValue(boardTooltipAtom);

    if (boardTooltipState == null) {
        return null;
    }

    const left = boardTooltipState.pageX - 30;
    const top = boardTooltipState.pageY + 1;

    const style: React.CSSProperties = {
        position: 'absolute',
        left,
        top,
        padding,
        backgroundColor,
        zIndex,
        maxWidth: 400,
        maxHeight: 600,
        overflowY: 'scroll',
    };
    const hrStyle: React.CSSProperties = {
        transform: 'scaleY(0.5)',
        borderWidth: '1px 0 0 0',
        borderStyle: 'solid',
        borderColor: '#FFFFFFD0',
    };

    switch (boardTooltipState.mouseOverOn.type) {
        case character:
        case portrait:
        case imagePieceValue: {
            let name: string;
            let memo: string;
            if (boardTooltipState.mouseOverOn.type === imagePieceValue) {
                name = boardTooltipState.mouseOverOn.element.value.name ?? '';
                memo = boardTooltipState.mouseOverOn.element.value.memo ?? '';
            } else {
                name = boardTooltipState.mouseOverOn.character.name ?? '';
                memo = boardTooltipState.mouseOverOn.character.memo ?? '';
            }
            if (name === '' && memo === '') {
                return null;
            }
            return (
                <div style={style}>
                    <div>{name}</div>
                    {memo.trim() !== '' && <hr style={hrStyle} />}
                    <NewTabLinkify>
                        <span
                            style={{
                                whiteSpace:
                                    'pre-wrap' /* これがないと、stringに存在する改行が無視されてしまう */,
                            }}
                        >
                            {memo}
                        </span>
                    </NewTabLinkify>
                </div>
            );
        }
        default:
            return null;
    }
};

namespace PopupEditorBase {
    type DicePieceValueProps = {
        element: DicePieceValueElement;
    };

    export const DicePieceValue: React.FC<DicePieceValueProps> = ({
        element,
    }: DicePieceValueProps) => {
        const setRoomState = useSetRoomStateWithImmer();

        const dicePieceValues = useDicePieceValues();
        const dicePieceValue = dicePieceValues?.find(x => x.id === element.id)?.value;
        if (dicePieceValue == null) {
            return null;
        }

        const titleWidth = 60;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {dicePieceValueStrIndexes.map(key => {
                    const die = dicePieceValue.dice[key];
                    return (
                        <div
                            key={key}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                minHeight: 26,
                            }}
                        >
                            <div
                                style={{ flex: 0, minWidth: titleWidth, width: titleWidth }}
                            >{`ダイス${key}`}</div>
                            <InputDie
                                size='small'
                                state={die ?? null}
                                onChange={e => {
                                    setRoomState(roomState => {
                                        const dicePieceValue =
                                            roomState.dicePieceValues[element.id];
                                        if (dicePieceValue == null) {
                                            return;
                                        }
                                        if (e.type === replace) {
                                            if (e.newValue == null) {
                                                dicePieceValue.dice[key] = undefined;
                                                return;
                                            }
                                            dicePieceValue.dice[key] = {
                                                $v: 1,
                                                $r: 1,
                                                dieType: e.newValue.dieType,
                                                isValuePrivate: false,
                                                value: undefined,
                                            };
                                            return;
                                        }
                                        const dice = dicePieceValue.dice[key];
                                        if (dice == null) {
                                            return;
                                        }
                                        dice.value =
                                            e.newValue === noValue ? undefined : e.newValue;
                                    });
                                }}
                                onIsValuePrivateChange={e => {
                                    setRoomState(roomState => {
                                        const die =
                                            roomState.dicePieceValues[element.id]?.dice?.[key];
                                        if (die == null) {
                                            return;
                                        }
                                        die.isValuePrivate = e;
                                    });
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };
}

export const PopoverEditor: React.FC = () => {
    const popoverEditor = useAtomValue(boardPopoverEditorAtom);

    if (popoverEditor == null) {
        return null;
    }

    const left = popoverEditor.pageX - 30;
    const top = popoverEditor.pageY - 3;

    let children: JSX.Element | null;
    switch (popoverEditor.dblClickOn.type) {
        case dicePieceValue:
            children = (
                <PopupEditorBase.DicePieceValue element={popoverEditor.dblClickOn.element} />
            );
            break;
        default:
            children = null;
            break;
    }

    if (children == null) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                padding,
                backgroundColor,
                zIndex,
            }}
        >
            {children}
        </div>
    );
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
        x: konvaOffset.x / scale + boardConfig.offsetX,
        y: konvaOffset.y / scale + boardConfig.offsetY,
    };
};

// 1つ1つ個別に渡すコードを書くのが面倒なのでこのように1つにまとめて全て渡している
const useHooks = () => {
    const setCharacterEditor = useUpdateAtom(characterEditorModalAtom);
    const setDicePieceEditor = useUpdateAtom(dicePieceValueEditorModalAtom);
    const setStringPieceEditor = useUpdateAtom(stringPieceEditorModalAtom);
    const setImagePieceDrawer = useUpdateAtom(imagePieceDrawerAtom);
    const setBoardPositionAndPieceEditorModal = useUpdateAtom(boardPositionAndPieceEditorModalAtom);
    const cloneImagePiece = useCloneImagePiece();
    return React.useMemo(
        () => ({
            setCharacterEditor,
            setDicePieceEditor,
            setStringPieceEditor,
            setImagePieceDrawer,
            setBoardPositionAndPieceEditorModal,
            cloneImagePiece,
        }),
        [
            setCharacterEditor,
            setDicePieceEditor,
            setStringPieceEditor,
            setImagePieceDrawer,
            setBoardPositionAndPieceEditorModal,
            cloneImagePiece,
        ]
    );
};

namespace ContextMenuModule {
    type SelectedCharacterPiecesMenuProps = {
        characterPiecesOnCursor: ContextMenuState['characterPiecesOnCursor'];
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedCharacterPiecesMenu = ({
        characterPiecesOnCursor,
        onContextMenuClear,
        hooks,
        setRoomState,
    }: SelectedCharacterPiecesMenuProps): JSX.Element | null => {
        if (characterPiecesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='コマ'>
                {characterPiecesOnCursor.map(({ characterId: characterId, character, pieceId }) => (
                    // characterIdとpieceIdを組み合わせてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={keyNames(characterId, pieceId, 'selected-piece')}
                        title={character.name}
                    >
                        <Menu.Item
                            onClick={() => {
                                hooks.setBoardPositionAndPieceEditorModal({
                                    type: characterPiece,
                                    characterId,
                                    pieceId,
                                });
                                onContextMenuClear();
                            }}
                        >
                            コマの編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setRoomState(roomState => {
                                    delete roomState.characters[characterId]?.pieces[pieceId];
                                });
                                onContextMenuClear();
                            }}
                        >
                            コマを削除
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                hooks.setCharacterEditor({
                                    type: update,
                                    stateId: characterId,
                                });
                                onContextMenuClear();
                            }}
                        >
                            キャラクターの編集
                        </Menu.Item>
                    </Menu.SubMenu>
                ))}
                <Menu.Divider />
            </Menu.ItemGroup>
        );
    };

    type SelectedTachiesPiecesMenuProps = {
        portraitsOnCursor: ContextMenuState['portraitsOnCursor'];
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedTachiePiecesMenu = ({
        portraitsOnCursor,
        onContextMenuClear,
        hooks,
        setRoomState,
    }: SelectedTachiesPiecesMenuProps): JSX.Element | null => {
        if (portraitsOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='立ち絵'>
                {portraitsOnCursor.map(({ characterId, character, portraitPositionId }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={keyNames(characterId) + '@selected-tachie'}
                        title={character.name}
                    >
                        <Menu.Item
                            onClick={() => {
                                hooks.setBoardPositionAndPieceEditorModal({
                                    type: characterPortrait,
                                    characterId,
                                    boardPositionId: portraitPositionId,
                                });
                                onContextMenuClear();
                            }}
                        >
                            立ち絵の編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setRoomState(roomState => {
                                    delete roomState.characters[characterId]?.portraitPositions?.[
                                        portraitPositionId
                                    ];
                                });
                                onContextMenuClear();
                            }}
                        >
                            立ち絵を削除
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            onClick={() => {
                                hooks.setCharacterEditor({
                                    type: update,
                                    stateId: characterId,
                                });
                                onContextMenuClear();
                            }}
                        >
                            キャラクターを編集
                        </Menu.Item>
                    </Menu.SubMenu>
                ))}
                <Menu.Divider />
            </Menu.ItemGroup>
        );
    };

    const selectedCharacterCommandsMenu = ({
        characterPiecesOnCursor,
        portraitsOnCursor,
        onContextMenuClear,
        operate,
        room,
        myUserUid,
        onSe,
    }: {
        characterPiecesOnCursor: ContextMenuState['characterPiecesOnCursor'];
        portraitsOnCursor: ContextMenuState['portraitsOnCursor'];
        onContextMenuClear: () => void;
        operate: ReturnType<typeof useSetRoomStateByApply>;
        room: State;
        myUserUid: string;
        onSe: (filePath: FilePath, volume: number) => void;
    }): JSX.Element | null => {
        if (characterPiecesOnCursor.length + portraitsOnCursor.length === 0) {
            return null;
        }

        const characters: { id: string; value: CharacterState }[] = [];
        [...characterPiecesOnCursor, ...portraitsOnCursor].forEach(elem => {
            if (characters.some(exists => exists.id === elem.characterId)) {
                return;
            }
            characters.push({ id: elem.characterId, value: elem.character });
        });
        const characterMenuItems = _(characters)
            .map(characterPair => {
                const privateCommands = recordToArray(characterPair.value.privateCommands).map(
                    ({ key, value }) => {
                        const testResult = testCommand(value.value);
                        if (testResult.isError) {
                            return (
                                <Menu.Item key={key} title={value.name} disabled>
                                    <Tooltip title={testResult.error}>(コマンド文法エラー)</Tooltip>
                                </Menu.Item>
                            );
                        }
                        return (
                            <Menu.Item
                                key={key}
                                onClick={() => {
                                    const commandResult = execCharacterCommand({
                                        script: value.value,
                                        room,
                                        characterId: characterPair.id,
                                        ownerParticipantId: myUserUid,
                                    });
                                    if (commandResult.isError) {
                                        // TODO: 通知する
                                        return;
                                    }
                                    const operation = diff({
                                        prevState: room,
                                        nextState: commandResult.value,
                                    });
                                    if (operation != null) {
                                        operate(toUpOperation(operation));
                                    }
                                    onContextMenuClear();
                                }}
                            >
                                {value.name}
                            </Menu.Item>
                        );
                    }
                );
                if (privateCommands.length === 0) {
                    return null;
                }
                return (
                    <Menu.ItemGroup key={characterPair.id} title={characterPair.value.name}>
                        {privateCommands}
                    </Menu.ItemGroup>
                );
            })
            .compact()
            .value();
        if (characterMenuItems.length === 0) {
            return null;
        }
        return (
            <>
                <Menu.ItemGroup title='キャラクターコマンド'>{characterMenuItems}</Menu.ItemGroup>
                <Menu.Divider />
            </>
        );
    };

    const youCannotEditPieceMessage = '自分以外が作成したコマでは、値を編集することはできません。';

    type SelectedDicePiecesMenuProps = {
        dicePieceValuesOnCursor: ContextMenuState['dicePieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardId: string;
        hooks: ReturnType<typeof useHooks>;
        isMyCharacter: ReturnType<typeof useIsMyCharacter>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedDicePiecesMenu = ({
        dicePieceValuesOnCursor,
        onContextMenuClear,
        boardId: boardIdToShow,
        hooks,
        isMyCharacter,
        setRoomState,
    }: SelectedDicePiecesMenuProps): JSX.Element | null => {
        if (dicePieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='ダイスコマ'>
                {dicePieceValuesOnCursor.map(({ dicePieceValueId, dicePieceValue, piece }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={dicePieceValueId + '@selected'}
                        title={
                            <DicePieceValue.images
                                state={dicePieceValue}
                                size={22}
                                padding='6px 0 0 0'
                            />
                        }
                    >
                        {isMyCharacter(dicePieceValue.ownerCharacterId) ? (
                            <Menu.Item
                                onClick={() => {
                                    hooks.setDicePieceEditor({
                                        type: update,
                                        boardId: boardIdToShow,
                                        stateId: dicePieceValueId,
                                    });
                                    onContextMenuClear();
                                }}
                            >
                                編集
                            </Menu.Item>
                        ) : (
                            <Menu.Item disabled>
                                <Tooltip title={youCannotEditPieceMessage}>編集</Tooltip>
                            </Menu.Item>
                        )}
                        <Menu.Item
                            onClick={() => {
                                setRoomState(roomState => {
                                    delete roomState.dicePieceValues[dicePieceValueId]?.pieces[
                                        piece.boardId
                                    ];
                                });
                                onContextMenuClear();
                            }}
                        >
                            削除
                        </Menu.Item>
                    </Menu.SubMenu>
                ))}
                <Menu.Divider />
            </Menu.ItemGroup>
        );
    };

    type SelectedNumberPiecesMenuProps = {
        stringPieceValuesOnCursor: ContextMenuState['stringPieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardId: string;
        hooks: ReturnType<typeof useHooks>;
        isMyCharacter: ReturnType<typeof useIsMyCharacter>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedStringPiecesMenu = ({
        stringPieceValuesOnCursor,
        onContextMenuClear,
        boardId: boardIdToShow,
        hooks,
        isMyCharacter,
        setRoomState,
    }: SelectedNumberPiecesMenuProps): JSX.Element | null => {
        if (stringPieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='数値コマ'>
                {stringPieceValuesOnCursor.map(
                    ({ stringPieceValueId, stringPieceValue, piece }) => (
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu
                            key={stringPieceValueId + '@selected'}
                            title={StringPieceValue.stringify(stringPieceValue)}
                        >
                            {isMyCharacter(stringPieceValue.ownerCharacterId) ? (
                                <Menu.Item
                                    onClick={() => {
                                        hooks.setStringPieceEditor({
                                            type: update,
                                            boardId: boardIdToShow,
                                            stateId: stringPieceValueId,
                                        });
                                        onContextMenuClear();
                                    }}
                                >
                                    編集
                                </Menu.Item>
                            ) : (
                                <Menu.Item disabled>
                                    <Tooltip title={youCannotEditPieceMessage}>編集</Tooltip>
                                </Menu.Item>
                            )}
                            <Menu.Item
                                onClick={() => {
                                    setRoomState(roomState => {
                                        delete roomState.stringPieceValues[stringPieceValueId]
                                            ?.pieces[piece.boardId];
                                    });
                                    onContextMenuClear();
                                }}
                            >
                                削除
                            </Menu.Item>
                        </Menu.SubMenu>
                    )
                )}
                <Menu.Divider />
            </Menu.ItemGroup>
        );
    };

    type SelectedImagePiecesMenuProps = {
        imagePieceValuesOnCursor: ContextMenuState['imagePieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardId: string;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
        myUserUid: string;
    };

    const selectedImagePiecesMenu = ({
        imagePieceValuesOnCursor,
        onContextMenuClear,
        boardId: boardIdToShow,
        hooks,
        setRoomState,
        myUserUid,
    }: SelectedImagePiecesMenuProps): JSX.Element | null => {
        if (imagePieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='画像コマ'>
                {imagePieceValuesOnCursor.map(({ imagePieceValueId, imagePieceValue, piece }) => (
                    <Menu.SubMenu
                        key={imagePieceValueId + '@selected'}
                        title={
                            <div className={classNames(flex, flexRow, itemsCenter)}>
                                {imagePieceValue.image == null ? null : (
                                    <ImageView filePath={imagePieceValue.image} size={26} />
                                )}
                                <div style={{ paddingLeft: 3 }}>{imagePieceValue.name}</div>
                            </div>
                        }
                    >
                        <Menu.Item
                            onClick={() => {
                                hooks.setImagePieceDrawer({
                                    type: update,
                                    boardId: boardIdToShow,
                                    stateId: imagePieceValueId,
                                });
                                onContextMenuClear();
                            }}
                        >
                            編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                hooks.cloneImagePiece({
                                    myUserUid,
                                    source: imagePieceValue,
                                });
                                onContextMenuClear();
                            }}
                        >
                            複製
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setRoomState(roomState => {
                                    delete roomState.imagePieceValues[imagePieceValueId]?.pieces[
                                        piece.boardId
                                    ];
                                });
                                onContextMenuClear();
                            }}
                        >
                            削除
                        </Menu.Item>
                    </Menu.SubMenu>
                ))}
                <Menu.Divider />
            </Menu.ItemGroup>
        );
    };

    type BasicMenuProps = {
        contextMenuState: ContextMenuState;
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
        characters: ReadonlyMap<string, CharacterState>;
        board: BoardState;
    };

    const basicMenu = ({
        contextMenuState,
        onContextMenuClear,
        hooks,
        setRoomState,
        characters,
        board,
    }: BasicMenuProps): JSX.Element | null => {
        const boardId = contextMenuState.boardId;
        const boardConfig = contextMenuState.boardConfig;
        const { x, y } = toBoardPosition({
            konvaOffset: { x: contextMenuState.offsetX, y: contextMenuState.offsetY },
            boardConfig,
        });
        const cellPosition = Piece.getCellPosition({ x, y, board });
        // TODO: x,y,w,h の値が適当
        const piecePositionWhichIsCellMode: PieceState = {
            $v: 2,
            $r: 1,
            boardId,
            x: 0,
            y: 0,
            w: 50,
            h: 50,
            opacity: undefined,
            cellX: cellPosition.cellX,
            cellY: cellPosition.cellY,
            cellW: 1,
            cellH: 1,
            isCellMode: true,
            isPrivate: false,
            isPositionLocked: false,
        };

        const piecePositionWhichIsNotCellMode: PieceState = {
            $v: 2,
            $r: 1,
            boardId,
            x,
            y,
            w: 50,
            h: 50,
            opacity: undefined,
            isCellMode: false,
            isPrivate: false,
            isPositionLocked: false,
            cellX: 0,
            cellY: 0,
            cellW: 1,
            cellH: 1,
        };

        const portraitPositionWhichIsNotCellMode: BoardPositionState = {
            $v: 2,
            $r: 1,
            boardId,
            x,
            y,
            w: 100,
            h: 100,
            opacity: undefined,
            isPrivate: false,
            isPositionLocked: false,
        };

        const pieceMenus = [...characters].map(([characterId, character]) => {
            return (
                <Menu.SubMenu key={keyNames(characterId) + '@piece'} title={character.name}>
                    <Menu.Item
                        onClick={() => {
                            setRoomState(roomState => {
                                const pieces = roomState.characters[characterId]?.pieces;
                                if (pieces == null) {
                                    return;
                                }
                                pieces[simpleId()] = { ...piecePositionWhichIsCellMode };
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            setRoomState(roomState => {
                                const pieces = roomState.characters[characterId]?.pieces;
                                if (pieces == null) {
                                    return;
                                }
                                pieces[simpleId()] = { ...piecePositionWhichIsNotCellMode };
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
            );
        });

        const portraitMenus = [...characters].map(([characterId, character]) => {
            return (
                <Menu.Item
                    key={keyNames(characterId) + '@tachie'}
                    onClick={() => {
                        setRoomState(roomState => {
                            const portraitPositions =
                                roomState.characters[characterId]?.portraitPositions;
                            if (portraitPositions == null) {
                                return;
                            }
                            portraitPositions[simpleId()] = {
                                ...portraitPositionWhichIsNotCellMode,
                            };
                        });
                        onContextMenuClear();
                    }}
                >
                    {character.name}
                </Menu.Item>
            );
        });

        return (
            <Menu.ItemGroup title='新規作成'>
                <Menu.SubMenu title='キャラクターコマ'>{pieceMenus}</Menu.SubMenu>
                <Menu.SubMenu title='キャラクター立ち絵'>{portraitMenus}</Menu.SubMenu>
                <Menu.SubMenu title='ダイスコマ'>
                    <Menu.Item
                        onClick={() => {
                            hooks.setDicePieceEditor({
                                type: create,
                                piece: piecePositionWhichIsCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            hooks.setDicePieceEditor({
                                type: create,
                                piece: piecePositionWhichIsNotCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu title='数値コマ'>
                    <Menu.Item
                        onClick={() => {
                            hooks.setStringPieceEditor({
                                type: create,
                                piece: piecePositionWhichIsCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            hooks.setDicePieceEditor({
                                type: create,
                                piece: piecePositionWhichIsNotCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu title='画像コマ'>
                    <Menu.Item
                        onClick={() => {
                            hooks.setImagePieceDrawer({
                                type: create,
                                piece: piecePositionWhichIsCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            hooks.setImagePieceDrawer({
                                type: create,
                                piece: piecePositionWhichIsNotCellMode,
                            });
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
            </Menu.ItemGroup>
        );
    };

    export const Main: React.FC = () => {
        const operate = useSetRoomStateByApply();
        const setRoomState = useSetRoomStateWithImmer();
        const room = useAtomSelector(roomAtom, state => state.roomState?.state);
        const boards = useBoards();
        const characters = useCharacters();
        const myUserUid = useMyUserUid();
        const contextMenuState = useAtomValue(boardContextMenuAtom);
        const roomId = useAtomSelector(roomAtom, state => state.roomId);
        const [writeSe] = useMutation(WriteRoomSoundEffectDocument);
        const setBoardContextMenu = useUpdateAtom(boardContextMenuAtom);
        const hooks = useHooks();
        const isMyCharacter = useIsMyCharacter();

        if (
            contextMenuState == null ||
            characters == null ||
            myUserUid == null ||
            roomId == null ||
            room == null
        ) {
            return null;
        }

        const boardId = contextMenuState.boardId;
        const board = boards?.get(boardId);

        if (board == null) {
            return null;
        }

        const onContextMenuClear = () => setBoardContextMenu(null);

        return (
            <div
                style={{
                    position: 'absolute',
                    left: contextMenuState.pageX,
                    top: contextMenuState.pageY,
                    zIndex,
                }}
            >
                <Menu>
                    {/* React.FCなどを用いるとantdがエラーを出すので、単なるJSX.Elementを返す関数として定義している */}

                    {selectedCharacterPiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        hooks,
                        setRoomState,
                    })}
                    {selectedTachiePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        hooks,
                        setRoomState,
                    })}
                    {selectedDicePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardId,
                        hooks,
                        setRoomState,
                        isMyCharacter,
                    })}
                    {selectedStringPiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardId,
                        hooks,
                        setRoomState,
                        isMyCharacter,
                    })}
                    {selectedImagePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardId,
                        hooks,
                        setRoomState,
                        myUserUid,
                    })}
                    {selectedCharacterCommandsMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        operate: operate,
                        room,
                        onSe: (se, volume) =>
                            writeSe({
                                variables: {
                                    roomId,
                                    volume,
                                    file: {
                                        ...se,
                                        sourceType:
                                            se.sourceType === 'Default'
                                                ? FileSourceType.Default
                                                : FileSourceType.FirebaseStorage,
                                    },
                                },
                            }),
                        myUserUid,
                    })}
                    {basicMenu({
                        contextMenuState,
                        onContextMenuClear,
                        hooks,
                        setRoomState,
                        characters,
                        board,
                    })}
                </Menu>
            </div>
        );
    };
}

export const BoardContextMenu = ContextMenuModule.Main;
