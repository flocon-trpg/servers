import {
    execCharacterCommand,
    BoardLocationState,
    BoardState,
    CharacterState,
    dicePieceValueStrIndexes,
    PieceState,
    State,
    UpOperation,
    diff,
    toUpOperation,
    FilePath,
    simpleId,
} from '@flocon-trpg/core';
import { CompositeKey, keyNames, ReadonlyStateMap, recordToArray } from '@flocon-trpg/utils';
import { Menu, Tooltip } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useDispatch } from 'react-redux';
import { InputDie } from '../../components/InputDie';
import { NewTabLinkify } from '../../components/NewTabLinkify';
import { FileSourceType, WriteRoomSoundEffectDocument } from '@flocon-trpg/typed-document-node';
import { useBoards } from '../../hooks/state/useBoards';
import { useCharacters } from '../../hooks/state/useCharacters';
import { DicePieceValueElement } from '../../hooks/state/useDicePieceValues';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useSetRoomStateByApply } from '../../hooks/useSetRoomStateByApply';
import {
    character,
    ContextMenuState,
    create,
    dicePieceValue,
    imagePieceValue,
    roomDrawerAndPopoverAndModalModule,
    tachie,
} from '../../modules/roomDrawerAndPopoverAndModalModule';
import { replace, update } from '../../stateManagers/states/types';
import { useSelector } from '../../store';
import { testCommand } from '../../utils/command';
import { noValue } from '../../utils/dice';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { Piece } from '../../utils/piece';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { useMutation } from '@apollo/client';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';
import { BoardConfig } from '../../atoms/roomConfig/types/boardConfig';

/* absolute positionで表示するときにBoardの子として表示させると、Boardウィンドウから要素がはみ出ることができないため、ウィンドウ右端に近いところで要素を表示させるときに不便なことがある。そのため、ページ全体の子として持たせるようにしている。 */

const backgroundColor = '#202020E8';
const padding = 8;
const zIndex = 500; // .ant-drawerによると、antdのDrawerのz-indexは100

export const PieceTooltip: React.FC = () => {
    const boardTooltipState = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.boardTooltip
    );

    if (boardTooltipState == null) {
        return null;
    }

    const left = boardTooltipState.pagePosition.x - 30;
    const top = boardTooltipState.pagePosition.y + 1;

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
        case tachie:
        case imagePieceValue: {
            let name: string;
            let memo: string;
            if (boardTooltipState.mouseOverOn.type === imagePieceValue) {
                name = boardTooltipState.mouseOverOn.element.value.name;
                memo = boardTooltipState.mouseOverOn.element.value.memo;
            } else {
                name = boardTooltipState.mouseOverOn.character.name;
                memo = boardTooltipState.mouseOverOn.character.memo;
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
        const operate = useSetRoomStateByApply();

        const characters = useCharacters();
        const dicePieceValue = (() => {
            const character = characters?.get({
                createdBy: element.characterKey.createdBy,
                id: element.characterKey.id,
            });
            if (character == null) {
                return undefined;
            }
            const dicePieceValue = character.dicePieceValues[element.valueId];
            if (dicePieceValue == null) {
                return undefined;
            }
            return dicePieceValue;
        })();

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
                                    operate(
                                        characterUpdateOperation(element.characterKey, {
                                            $v: 1,
                                            $r: 2,
                                            dicePieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $v: 1,
                                                        $r: 1,
                                                        dice: {
                                                            [key]:
                                                                e.type === replace
                                                                    ? {
                                                                          type: replace,
                                                                          replace: {
                                                                              newValue:
                                                                                  e.newValue == null
                                                                                      ? undefined
                                                                                      : {
                                                                                            $v: 1,
                                                                                            $r: 1,
                                                                                            dieType:
                                                                                                e
                                                                                                    .newValue
                                                                                                    .dieType,
                                                                                            isValuePrivate:
                                                                                                false,
                                                                                            value: null,
                                                                                        },
                                                                          },
                                                                      }
                                                                    : {
                                                                          type: update,
                                                                          update: {
                                                                              $v: 1,
                                                                              $r: 1,
                                                                              value: {
                                                                                  newValue:
                                                                                      e.newValue ===
                                                                                      noValue
                                                                                          ? null
                                                                                          : e.newValue,
                                                                              },
                                                                          },
                                                                      },
                                                        },
                                                    },
                                                },
                                            },
                                        })
                                    );
                                }}
                                onIsValuePrivateChange={e => {
                                    operate(
                                        characterUpdateOperation(element.characterKey, {
                                            $v: 1,
                                            $r: 2,
                                            dicePieceValues: {
                                                [element.valueId]: {
                                                    type: update,
                                                    update: {
                                                        $v: 1,
                                                        $r: 1,
                                                        dice: {
                                                            [key]: {
                                                                type: update,
                                                                update: {
                                                                    $v: 1,
                                                                    $r: 1,
                                                                    isValuePrivate: {
                                                                        newValue: e,
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        })
                                    );
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
    const popoverEditor = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.boardPopoverEditor
    );

    if (popoverEditor == null) {
        return null;
    }

    const left = popoverEditor.pagePosition.x - 30;
    const top = popoverEditor.pagePosition.y - 3;

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

namespace ContextMenuModule {
    type SelectedCharacterPiecesMenuProps = {
        characterPiecesOnCursor: ContextMenuState['characterPiecesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
    };

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
            <Menu.ItemGroup title='コマ'>
                {characterPiecesOnCursor.map(({ characterKey, character, pieceKey }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={keyNames(characterKey) + '@selected-piece'}
                        title={character.name}
                    >
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomDrawerAndPopoverAndModalModule.actions.set({
                                        characterDrawerType: {
                                            type: update,
                                            boardKey,
                                            stateKey: characterKey,
                                        },
                                    })
                                );
                                onContextMenuClear();
                            }}
                        >
                            編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                operate(
                                    characterUpdateOperation(characterKey, {
                                        $v: 1,
                                        $r: 2,
                                        pieces: {
                                            [pieceKey.createdBy]: {
                                                [pieceKey.id]: {
                                                    type: replace,
                                                    replace: { newValue: undefined },
                                                },
                                            },
                                        },
                                    })
                                );
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

    type SelectedTachiesPiecesMenuProps = {
        tachiesOnCursor: ContextMenuState['tachiesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
    };

    const selectedTachiePiecesMenu = ({
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
            <Menu.ItemGroup title='立ち絵'>
                {tachiesOnCursor.map(({ characterKey, character, tachieLocationKey }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={keyNames(characterKey) + '@selected-tachie'}
                        title={character.name}
                    >
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomDrawerAndPopoverAndModalModule.actions.set({
                                        characterDrawerType: {
                                            type: update,
                                            boardKey: boardKey,
                                            stateKey: characterKey,
                                        },
                                    })
                                );
                                onContextMenuClear();
                            }}
                        >
                            編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                operate(
                                    characterUpdateOperation(characterKey, {
                                        $v: 1,
                                        $r: 2,
                                        tachieLocations: {
                                            [tachieLocationKey.createdBy]: {
                                                [tachieLocationKey.id]: {
                                                    type: replace,
                                                    replace: { newValue: undefined },
                                                },
                                            },
                                        },
                                    })
                                );
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

    const selectedCharacterCommandsMenu = ({
        characterPiecesOnCursor,
        tachiesOnCursor,
        onContextMenuClear,
        operate,
        room,
        onSe,
    }: {
        characterPiecesOnCursor: ContextMenuState['characterPiecesOnCursor'];
        tachiesOnCursor: ContextMenuState['tachiesOnCursor'];
        onContextMenuClear: () => void;
        operate: ReturnType<typeof useSetRoomStateByApply>;
        room: State;
        onSe: (filePath: FilePath, volume: number) => void;
    }): JSX.Element | null => {
        if (characterPiecesOnCursor.length + tachiesOnCursor.length === 0) {
            return null;
        }

        const characters: { key: CompositeKey; value: CharacterState }[] = [];
        [...characterPiecesOnCursor, ...tachiesOnCursor].forEach(elem => {
            if (
                characters.some(
                    exists =>
                        exists.key.createdBy === elem.characterKey.createdBy &&
                        exists.key.id === elem.characterKey.id
                )
            ) {
                return;
            }
            characters.push({ key: elem.characterKey, value: elem.character });
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
                                        characterKey: characterPair.key,
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
                const characterKey = keyNames(characterPair.key);
                return (
                    <Menu.ItemGroup key={characterKey} title={characterPair.value.name}>
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
        boardKey: CompositeKey;
        myUserUid: string;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
    };

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
            <Menu.ItemGroup title='ダイスコマ'>
                {dicePieceValuesOnCursor.map(
                    ({ dicePieceValueKey, dicePieceValue, characterKey }) => (
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu
                            key={dicePieceValueKey + '@selected'}
                            title={
                                <DicePieceValue.images
                                    state={dicePieceValue}
                                    size={22}
                                    padding='6px 0 0 0'
                                />
                            }
                        >
                            {characterKey.createdBy === myUserUid ? (
                                <Menu.Item
                                    onClick={() => {
                                        dispatch(
                                            roomDrawerAndPopoverAndModalModule.actions.set({
                                                dicePieceValueDrawerType: {
                                                    type: update,
                                                    boardKey: boardKeyToShow,
                                                    stateKey: dicePieceValueKey,
                                                    characterKey,
                                                },
                                            })
                                        );
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
                                    operate(
                                        characterUpdateOperation(characterKey, {
                                            $v: 1,
                                            $r: 2,
                                            dicePieceValues: {
                                                [dicePieceValueKey]: {
                                                    type: replace,
                                                    replace: { newValue: undefined },
                                                },
                                            },
                                        })
                                    );
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

    type SelectedNumberPiecesMenuProps = {
        stringPieceValuesOnCursor: ContextMenuState['stringPieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        myUserUid: string;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
    };

    const selectedStringPiecesMenu = ({
        stringPieceValuesOnCursor,
        onContextMenuClear,
        boardKey: boardKeyToShow,
        myUserUid,
        dispatch,
        operate,
    }: SelectedNumberPiecesMenuProps): JSX.Element | null => {
        if (stringPieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='数値コマ'>
                {stringPieceValuesOnCursor.map(
                    ({
                        stringPieceValueKey: stringPieceValueKey,
                        stringPieceValue: numberPieceValue,
                        characterKey,
                    }) => (
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu
                            key={stringPieceValueKey + '@selected'}
                            title={StringPieceValue.stringify(numberPieceValue)}
                        >
                            {characterKey.createdBy === myUserUid ? (
                                <Menu.Item
                                    onClick={() => {
                                        dispatch(
                                            roomDrawerAndPopoverAndModalModule.actions.set({
                                                stringPieceValueDrawerType: {
                                                    type: update,
                                                    boardKey: boardKeyToShow,
                                                    stateKey: stringPieceValueKey,
                                                    characterKey,
                                                },
                                            })
                                        );
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
                                    operate(
                                        characterUpdateOperation(characterKey, {
                                            $v: 1,
                                            $r: 2,
                                            stringPieceValues: {
                                                [stringPieceValueKey]: {
                                                    type: replace,
                                                    replace: { newValue: undefined },
                                                },
                                            },
                                        })
                                    );
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
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
    };

    const selectedImagePiecesMenu = ({
        imagePieceValuesOnCursor,
        onContextMenuClear,
        boardKey: boardKeyToShow,
        dispatch,
        operate,
    }: SelectedImagePiecesMenuProps): JSX.Element | null => {
        if (imagePieceValuesOnCursor.length === 0) {
            return null;
        }
        return (
            <Menu.ItemGroup title='画像コマ'>
                {imagePieceValuesOnCursor.map(({ participantKey, valueId, value }) => (
                    <Menu.SubMenu key={`${participantKey}@${valueId}`} title={value.name}>
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomDrawerAndPopoverAndModalModule.actions.set({
                                        imagePieceDrawerType: {
                                            type: update,
                                            boardKey: boardKeyToShow,
                                            participantKey,
                                            stateKey: valueId,
                                        },
                                    })
                                );
                                onContextMenuClear();
                            }}
                        >
                            編集
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                const operation: UpOperation = {
                                    $v: 1,
                                    $r: 2,
                                    participants: {
                                        [participantKey]: {
                                            type: update,
                                            update: {
                                                $v: 1,
                                                $r: 2,
                                                imagePieceValues: {
                                                    [valueId]: {
                                                        type: replace,
                                                        replace: { newValue: undefined },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                };
                                operate(operation);
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
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useSetRoomStateByApply>;
        characters: ReadonlyStateMap<CharacterState>;
        board: BoardState;
        myUserUid: string;
    };

    const basicMenu = ({
        contextMenuState,
        onContextMenuClear,
        operate,
        dispatch,
        characters,
        board,
        myUserUid,
    }: BasicMenuProps): JSX.Element | null => {
        const boardKey = contextMenuState.boardKey;
        const boardConfig = contextMenuState.boardConfig;
        const { x, y } = toBoardPosition({
            konvaOffset: { x: contextMenuState.offsetX, y: contextMenuState.offsetY },
            boardConfig,
        });
        const cellPosition = Piece.getCellPosition({ x, y, board });
        // TODO: x,y,w,h の値が適当
        const pieceLocationWhichIsCellMode: PieceState = {
            $v: 1,
            $r: 1,
            boardKey,
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
            $v: 1,
            $r: 1,
            boardKey,
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
            $v: 1,
            $r: 1,
            boardKey,
            x,
            y,
            w: 100,
            h: 150,
            isPrivate: false,
        };

        const pieceMenus = [...characters.toArray()].map(([characterKey, character]) => {
            return (
                <Menu.SubMenu key={keyNames(characterKey) + '@piece'} title={character.name}>
                    <Menu.Item
                        onClick={() => {
                            operate(
                                characterUpdateOperation(characterKey, {
                                    $v: 1,
                                    $r: 2,
                                    pieces: {
                                        [myUserUid]: {
                                            [simpleId()]: {
                                                type: replace,
                                                replace: {
                                                    newValue: pieceLocationWhichIsCellMode,
                                                },
                                            },
                                        },
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            operate(
                                characterUpdateOperation(characterKey, {
                                    $v: 1,
                                    $r: 2,
                                    pieces: {
                                        [myUserUid]: {
                                            [simpleId()]: {
                                                type: replace,
                                                replace: {
                                                    newValue: pieceLocationWhichIsNotCellMode,
                                                },
                                            },
                                        },
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
            );
        });

        const tachieMenus = [...characters.toArray()].map(([characterKey, character]) => {
            return (
                <Menu.Item
                    key={keyNames(characterKey) + '@tachie'}
                    onClick={() => {
                        operate(
                            characterUpdateOperation(characterKey, {
                                $v: 1,
                                $r: 2,
                                tachieLocations: {
                                    [myUserUid]: {
                                        [simpleId()]: {
                                            type: replace,
                                            replace: {
                                                newValue: tachieLocationWhichIsNotCellMode,
                                            },
                                        },
                                    },
                                },
                            })
                        );
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
                <Menu.SubMenu title='キャラクター立ち絵'>{tachieMenus}</Menu.SubMenu>
                <Menu.SubMenu title='ダイスコマ'>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    dicePieceValueDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsCellMode,
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    dicePieceValueDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsNotCellMode,
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu title='数値コマ'>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    stringPieceValueDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsCellMode,
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    stringPieceValueDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsNotCellMode,
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップしない
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu title='画像コマ'>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    imagePieceDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsCellMode,
                                    },
                                })
                            );
                            onContextMenuClear();
                        }}
                    >
                        セルにスナップする
                    </Menu.Item>
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverAndModalModule.actions.set({
                                    imagePieceDrawerType: {
                                        type: create,
                                        piece: pieceLocationWhichIsNotCellMode,
                                    },
                                })
                            );
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
        const dispatch = useDispatch();
        const operate = useSetRoomStateByApply();
        const room = useAtomSelector(roomAtom,state => state.roomState?.state);
        const boards = useBoards();
        const characters = useCharacters();
        const myUserUid = useMyUserUid();
        const contextMenuState = useSelector(
            state => state.roomDrawerAndPopoverAndModalModule.boardContextMenu
        );
        const roomId = useAtomSelector(roomAtom,state => state.roomId);
        const [writeSe] = useMutation(WriteRoomSoundEffectDocument);

        if (
            contextMenuState == null ||
            characters == null ||
            myUserUid == null ||
            roomId == null ||
            room == null
        ) {
            return null;
        }

        const boardKey = contextMenuState.boardKey;
        const board = boards?.get(boardKey);

        if (board == null) {
            return null;
        }

        const onContextMenuClear = () =>
            dispatch(roomDrawerAndPopoverAndModalModule.actions.set({ boardContextMenu: null }));

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
                    {selectedStringPiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                        myUserUid,
                    })}
                    {selectedImagePiecesMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        boardKey,
                        dispatch,
                        operate,
                    })}
                    {selectedCharacterCommandsMenu({
                        ...contextMenuState,
                        onContextMenuClear,
                        operate,
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
                    })}
                    {board == null
                        ? null
                        : basicMenu({
                              contextMenuState,
                              onContextMenuClear,
                              dispatch,
                              operate,
                              characters,
                              board,
                              myUserUid,
                          })}
                </Menu>
            </div>
        );
    };
}

export const BoardContextMenu = ContextMenuModule.Main;
