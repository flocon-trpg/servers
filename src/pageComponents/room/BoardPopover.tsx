import {
    applyCommands,
    BoardLocationState,
    BoardState,
    CharacterState,
    dicePieceValueStrIndexes,
    parseToCommands,
    PieceState,
    State,
    UpOperation,
    diff,
    toUpOperation,
    FilePath,
} from '@kizahasi/flocon-core';
import {
    CompositeKey,
    compositeKeyToString,
    dualKeyRecordToDualKeyMap,
    ReadonlyStateMap,
} from '@kizahasi/util';
import { Menu, Tooltip } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useDispatch } from 'react-redux';
import { InputDie } from '../../components/InputDie';
import { NewTabLinkify } from '../../components/NewTabLinkify';
import { FileSourceType, useWriteRoomSoundEffectMutation } from '../../generated/graphql';
import { useBoards } from '../../hooks/state/useBoards';
import { useCharacters } from '../../hooks/state/useCharacters';
import { DicePieceValueElement } from '../../hooks/state/useDicePieceValues';
import { useMe } from '../../hooks/useMe';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { useOperate } from '../../hooks/useOperate';
import {
    character,
    ContextMenuState,
    create,
    dicePieceValue,
    roomDrawerAndPopoverModule,
    tachie,
} from '../../modules/roomDrawerAndPopoverModule';
import { replace, update } from '../../stateManagers/states/types';
import { BoardConfig } from '../../states/BoardConfig';
import { useSelector } from '../../store';
import { noValue } from '../../utils/dice';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { NumberPieceValue } from '../../utils/numberPieceValue';
import { Piece } from '../../utils/piece';

/* absolute positionで表示するときにBoardの子として表示させると、Boardウィンドウから要素がはみ出ることができないため、ウィンドウ右端に近いところで要素を表示させるときに不便なことがある。そのため、ページ全体の子として持たせるようにしている。 */

const backgroundColor = '#202020E8';
const padding = 8;
const zIndex = 500; // .ant-drawerによると、antdのDrawerのz-indexは100

export const PieceTooltip: React.FC = () => {
    const boardTooltipState = useSelector(state => state.roomDrawerAndPopoverModule.boardTooltip);

    if (boardTooltipState == null) {
        return null;
    }

    const left = boardTooltipState.pagePosition.x - 30;
    const top = boardTooltipState.pagePosition.y + 1;

    switch (boardTooltipState.mouseOverOn.type) {
        case character:
        case tachie:
            return (
                <div
                    style={{
                        position: 'absolute',
                        left,
                        top,
                        padding,
                        backgroundColor,
                        zIndex,
                        maxWidth: 200,
                    }}
                >
                    <div>{boardTooltipState.mouseOverOn.character.name}</div>
                    {boardTooltipState.mouseOverOn.character.memo.trim() !== '' && (
                        <hr
                            style={{
                                transform: 'scaleY(0.5)',
                                borderWidth: '1px 0 0 0',
                                borderStyle: 'solid',
                                borderColor: '#FFFFFFD0',
                            }}
                        />
                    )}
                    <NewTabLinkify>
                        <span
                            style={{
                                whiteSpace:
                                    'pre-wrap' /* これがないと、stringに存在する改行が無視されてしまう */,
                            }}
                        >
                            {boardTooltipState.mouseOverOn.character.memo}
                        </span>
                    </NewTabLinkify>
                </div>
            );
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
        const operate = useOperate();

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
                                size="small"
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
                                                                        [key]:
                                                                            e.type === replace
                                                                                ? {
                                                                                      type: replace,
                                                                                      replace: {
                                                                                          newValue:
                                                                                              e.newValue ==
                                                                                              null
                                                                                                  ? undefined
                                                                                                  : {
                                                                                                        $version: 1,
                                                                                                        dieType:
                                                                                                            e
                                                                                                                .newValue
                                                                                                                .dieType,
                                                                                                        isValuePrivate: false,
                                                                                                        value: null,
                                                                                                    },
                                                                                      },
                                                                                  }
                                                                                : {
                                                                                      type: update,
                                                                                      update: {
                                                                                          $version: 1,
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
                                                    },
                                                },
                                            },
                                        },
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
                                                                                isValuePrivate: {
                                                                                    newValue: e,
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
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
    const popoverEditor = useSelector(state => state.roomDrawerAndPopoverModule.boardPopoverEditor);

    if (popoverEditor == null) {
        return null;
    }

    const left = popoverEditor.pagePosition.x - 30;
    const top = popoverEditor.pagePosition.y + 1;

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
        operate: ReturnType<typeof useOperate>;
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
            <>
                {characterPiecesOnCursor.map(({ characterKey, character }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={compositeKeyToString(characterKey) + '@selected-piece'}
                        title={`${character.name} (コマ)`}
                    >
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomDrawerAndPopoverModule.actions.set({
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
                                                            },
                                                        },
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
            </>
        );
    };

    type SelectedTachiesPiecesMenuProps = {
        tachiesOnCursor: ContextMenuState['tachiesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
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
            <>
                {tachiesOnCursor.map(({ characterKey, character }) => (
                    // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が他にもあるため、キーを互いに異なるものにするように文字列を付加している。
                    <Menu.SubMenu
                        key={compositeKeyToString(characterKey) + '@selected-tachie'}
                        title={`${character.name} (立ち絵)`}
                    >
                        <Menu.Item
                            onClick={() => {
                                dispatch(
                                    roomDrawerAndPopoverModule.actions.set({
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
                                                            },
                                                        },
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
            </>
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
        operate: ReturnType<typeof useOperate>;
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
        const itemGroups = _(characters)
            .map(pair => {
                if (pair.value.privateCommand.trim() === '') {
                    return null;
                }
                const key = compositeKeyToString(pair.key);
                const commands = parseToCommands(pair.value.privateCommand);
                if (commands.isError) {
                    return (
                        <Menu.ItemGroup key={key}>
                            <Menu.Item disabled>
                                <Tooltip title={commands.error}>(コマンド文法エラー)</Tooltip>
                            </Menu.Item>
                        </Menu.ItemGroup>
                    );
                }
                const _ = Array.isArray(commands.value._) ? commands.value._ : [commands.value._];
                const menuItems = _.map((command, i) => {
                    return (
                        <Menu.Item
                            key={i}
                            onClick={() => {
                                const applyCommandResult = applyCommands({
                                    commands: commands.value,
                                    room,
                                    selfCharacterId: pair.key,
                                    commandIndex: i,
                                });
                                if (applyCommandResult == null) {
                                    return;
                                }
                                const operation = diff({
                                    prevState: room,
                                    nextState: applyCommandResult.room,
                                });
                                if (operation != null) {
                                    operate(toUpOperation(operation));
                                }
                                if (applyCommandResult.se != null) {
                                    onSe(applyCommandResult.se.file, applyCommandResult.se.volume);
                                }
                                onContextMenuClear();
                            }}
                        >
                            {command.name ?? `(コマンド${i})`}
                        </Menu.Item>
                    );
                });
                return (
                    <Menu.ItemGroup key={key} title={pair.value.name}>
                        {menuItems}
                    </Menu.ItemGroup>
                );
            })
            .compact()
            .value();
        if (itemGroups.length === 0) {
            return null;
        }
        return (
            <>
                <Menu.SubMenu title="キャラクターコマンド">{itemGroups}</Menu.SubMenu>
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
        operate: ReturnType<typeof useOperate>;
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
            <>
                {dicePieceValuesOnCursor.map(
                    ({ dicePieceValueKey, dicePieceValue, characterKey }) => (
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu
                            key={dicePieceValueKey + '@selected'}
                            title={
                                <DicePieceValue.images
                                    state={dicePieceValue}
                                    size={22}
                                    padding="6px 0 0 0"
                                />
                            }
                        >
                            {characterKey.createdBy === myUserUid ? (
                                <Menu.Item
                                    onClick={() => {
                                        dispatch(
                                            roomDrawerAndPopoverModule.actions.set({
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
                                                                replace: { newValue: undefined },
                                                            },
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
                    )
                )}
                <Menu.Divider />
            </>
        );
    };

    type SelectedNumberPiecesMenuProps = {
        numberPieceValuesOnCursor: ContextMenuState['numberPieceValuesOnCursor'];
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        myUserUid: string;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
    };

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
                {numberPieceValuesOnCursor.map(
                    ({ numberPieceValueKey, numberPieceValue, characterKey }) => (
                        // CharacterKeyをcompositeKeyToStringしてkeyにしている場所が下にもあるため、キーを互いに異なるものにするように文字列を付加している。
                        <Menu.SubMenu
                            key={numberPieceValueKey + '@selected'}
                            title={NumberPieceValue.stringify(numberPieceValue)}
                        >
                            {characterKey.createdBy === myUserUid ? (
                                <Menu.Item
                                    onClick={() => {
                                        dispatch(
                                            roomDrawerAndPopoverModule.actions.set({
                                                numberPieceValueDrawerType: {
                                                    type: update,
                                                    boardKey: boardKeyToShow,
                                                    stateKey: numberPieceValueKey,
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
                                                                replace: { newValue: undefined },
                                                            },
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
                    )
                )}
                <Menu.Divider />
            </>
        );
    };

    type BasicMenuProps = {
        contextMenuState: ContextMenuState;
        onContextMenuClear: () => void;
        boardKey: CompositeKey;
        boardConfig: BoardConfig;
        dispatch: ReturnType<typeof useDispatch>;
        operate: ReturnType<typeof useOperate>;
        characters: ReadonlyStateMap<CharacterState>;
        board: BoardState;
    };

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
        const pieceExists = (character: CharacterState) =>
            dualKeyRecordToDualKeyMap(character.pieces)
                .toArray()
                .some(
                    ([pieceBoardKey]) =>
                        boardKey.id === pieceBoardKey.second &&
                        boardKey.createdBy === pieceBoardKey.first
                );
        const tachieExists = (character: CharacterState) =>
            dualKeyRecordToDualKeyMap(character.tachieLocations)
                .toArray()
                .some(
                    ([pieceBoardKey]) =>
                        boardKey.id === pieceBoardKey.second &&
                        boardKey.createdBy === pieceBoardKey.first
                );

        const { x, y } = toBoardPosition({
            konvaOffset: { x: contextMenuState.offsetX, y: contextMenuState.offsetY },
            boardConfig,
        });
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
            return (
                <Menu.SubMenu
                    key={compositeKeyToString(characterKey) + '@piece'}
                    title={character.name}
                >
                    <Menu.SubMenu title="追加" disabled={pieceExists(character)}>
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
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                });
                                onContextMenuClear();
                            }}
                        >
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
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                });
                                onContextMenuClear();
                            }}
                        >
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
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            });
                            onContextMenuClear();
                        }}
                    >
                        削除
                    </Menu.Item>
                </Menu.SubMenu>
            );
        });

        const tachieMenus = [...characters.toArray()].map(([characterKey, character]) => {
            return (
                <Menu.SubMenu
                    key={compositeKeyToString(characterKey) + '@tachie'}
                    title={character.name}
                >
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
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            });
                            onContextMenuClear();
                        }}
                    >
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
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            });
                            onContextMenuClear();
                        }}
                    >
                        削除
                    </Menu.Item>
                </Menu.SubMenu>
            );
        });

        return (
            <>
                <Menu.SubMenu title="キャラクターコマ">{pieceMenus}</Menu.SubMenu>
                <Menu.SubMenu title="キャラクター立ち絵">{tachieMenus}</Menu.SubMenu>
                <Menu.SubMenu title="ダイスコマを追加">
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverModule.actions.set({
                                    dicePieceValueDrawerType: {
                                        type: create,
                                        boardKey,
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
                                roomDrawerAndPopoverModule.actions.set({
                                    dicePieceValueDrawerType: {
                                        type: create,
                                        boardKey,
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
                <Menu.SubMenu title="数値コマを追加">
                    <Menu.Item
                        onClick={() => {
                            dispatch(
                                roomDrawerAndPopoverModule.actions.set({
                                    numberPieceValueDrawerType: {
                                        type: create,
                                        boardKey,
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
                                roomDrawerAndPopoverModule.actions.set({
                                    numberPieceValueDrawerType: {
                                        type: create,
                                        boardKey,
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
            </>
        );
    };

    export const Main: React.FC = () => {
        const dispatch = useDispatch();
        const operate = useOperate();
        const room = useSelector(state => state.roomModule.roomState?.state);
        const boards = useBoards();
        const characters = useCharacters();
        const myUserUid = useMyUserUid();
        const contextMenuState = useSelector(
            state => state.roomDrawerAndPopoverModule.boardContextMenu
        );
        const roomId = useSelector(state => state.roomModule.roomId);
        const [writeSe] = useWriteRoomSoundEffectMutation();

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
            dispatch(roomDrawerAndPopoverModule.actions.set({ boardContextMenu: null }));

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
                              boardKey,
                              dispatch,
                              operate,
                              boardConfig: contextMenuState.boardConfig,
                              characters,
                              board,
                          })}
                </Menu>
            </div>
        );
    };
}

export const BoardContextMenu = ContextMenuModule.Main;
