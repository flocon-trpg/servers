import {
    State,
    boardPositionTemplate,
    characterTemplate,
    diff,
    execCharacterCommand,
    filePathTemplate,
    pieceTemplate,
    roomTemplate,
    simpleId,
    toUpOperation,
} from '@flocon-trpg/core';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { Menu, Tooltip } from 'antd';
import React from 'react';
import { NewTabLinkify } from '@/components/ui/NewTabLinkify/NewTabLinkify';
import {
    FileSourceType,
    WriteRoomSoundEffectDocument,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import { useBoards } from '../../hooks/useBoards';
import { useCharacters } from '../../hooks/useCharacters';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { useSetRoomStateByApply } from '@/hooks/useSetRoomStateByApply';
import { update } from '@/stateManagers/states/types';
import { testCommand } from '@/utils/character/command';
import { DicePieceValue } from '../../utils/dicePieceValue';
import { StringPieceValue } from '../../utils/stringPieceValue';
import { useMutation } from 'urql';
import { roomAtom } from '@/atoms/roomAtom/roomAtom';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { BoardConfig } from '@/atoms/roomConfigAtom/types/boardConfig';
import { boardTooltipAtom } from '../../atoms/boardTooltipAtom/boardTooltipAtom';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { character, dicePiece, imagePiece, portrait, stringPiece } from '../../utils/types';
import { boardPopoverEditorAtom } from '../../atoms/boardPopoverEditorAtom/boardPopoverEditorAtom';
import {
    ContextMenuState,
    boardContextMenuAtom,
} from '../../atoms/boardContextMenuAtom/boardContextMenuAtom';
import { create } from '@/utils/constants';
import { useCloneImagePiece } from '../../hooks/useCloneImagePiece';
import { ImageView } from '../../../../../file/ImageView/ImageView';
import classNames from 'classnames';
import { flex, flexRow, itemsCenter } from '@/styles/className';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { useIsMyCharacter } from '../../hooks/useIsMyCharacter';
import { characterEditorModalAtom, piece } from '../CharacterEditorModal/CharacterEditorModal';
import { imagePieceModalAtom } from '../ImagePieceModal/ImagePieceModal';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { defaultTriggerSubMenuAction } from '@/utils/variables';
import {
    UpdateMode as DicePiceUpdateMode,
    DicePieceEditor,
} from '../DicePieceEditor/DicePieceEditor';
import {
    UpdateMode as StringPiceUpdateMode,
    StringPieceEditor,
} from '../StringPieceEditor/StringPieceEditor';
import { CellConfig, CompositeRect, toCellPosition } from '../../utils/positionAndSizeAndRect';
import {
    ImagePieceEditor,
    UpdateMode as ImagePieceUpdateMode,
} from '../ImagePieceEditor/ImagePieceEditor';
import { stringPieceModalAtom } from '../StringPieceEditorModal/StringPieceEditorModal';
import { dicePieceModalAtom } from '../DicePieceEditorModal/DicePieceEditorModal';

type BoardPositionState = State<typeof boardPositionTemplate>;
type CharacterState = State<typeof characterTemplate>;
type RoomState = State<typeof roomTemplate>;
type PieceState = State<typeof pieceTemplate>;
type FilePath = State<typeof filePathTemplate>;

/* absolute position????????????????????????Board????????????????????????????????????Board??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? */

const backgroundColor = '#202020E8';
const padding = 8;
const zIndex = 500; // .ant-drawer???????????????antd???Drawer???z-index???100

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
        case imagePiece:
        case dicePiece:
        case stringPiece: {
            let name: string;
            let memo: string;
            switch (boardTooltipState.mouseOverOn.type) {
                case character:
                case portrait: {
                    name = boardTooltipState.mouseOverOn.character.name ?? '';
                    memo = boardTooltipState.mouseOverOn.character.memo ?? '';
                    break;
                }
                default: {
                    name = boardTooltipState.mouseOverOn.piece.name ?? '';
                    memo = boardTooltipState.mouseOverOn.piece.memo ?? '';
                    break;
                }
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
                                    'pre-wrap' /* ?????????????????????string???????????????????????????????????????????????? */,
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

type PieceProps = {
    boardId: string;
    pieceId: string;
};

const DicePieceContent: React.FC<PieceProps> = ({ boardId, pieceId }: PieceProps) => {
    const updateMode: DicePiceUpdateMode = React.useMemo(() => {
        return {
            boardId,
            pieceId,
        };
    }, [boardId, pieceId]);

    return <DicePieceEditor updateMode={updateMode} />;
};

const ImagePieceContent: React.FC<PieceProps> = ({ boardId, pieceId }: PieceProps) => {
    const updateMode: ImagePieceUpdateMode = React.useMemo(() => {
        return {
            boardId,
            pieceId,
        };
    }, [boardId, pieceId]);

    return <ImagePieceEditor updateMode={updateMode} />;
};

const StringPieceContent: React.FC<PieceProps> = ({ boardId, pieceId }: PieceProps) => {
    const updateMode: StringPiceUpdateMode = React.useMemo(() => {
        return {
            boardId,
            pieceId,
        };
    }, [boardId, pieceId]);

    return <StringPieceEditor updateMode={updateMode} />;
};

export const PopoverEditor: React.FC = () => {
    const popoverEditor = useAtomValue(boardPopoverEditorAtom);
    const setCharacterEditorModal = useUpdateAtom(characterEditorModalAtom);

    const [childrenState, setChildrenState] = React.useState<{
        children: JSX.Element;
        width: number;
    }>();
    React.useEffect(() => {
        if (popoverEditor == null) {
            setChildrenState(undefined);
            return;
        }
        // character???portrait???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        // ???????????????????????????????????????????????????Popover?????????????????????????????????????????????Modal???????????????????????????
        switch (popoverEditor.clickOn.type) {
            case character:
                setChildrenState(undefined);
                setCharacterEditorModal({
                    type: update,
                    stateId: popoverEditor.clickOn.characterId,
                    selectedPieceType: piece,
                    boardId: popoverEditor.clickOn.boardId,
                    pieceId: popoverEditor.clickOn.pieceId,
                });
                break;
            case portrait:
                setChildrenState(undefined);
                setCharacterEditorModal({
                    type: update,
                    stateId: popoverEditor.clickOn.characterId,
                    selectedPieceType: portrait,
                    boardId: popoverEditor.clickOn.boardId,
                    pieceId: popoverEditor.clickOn.pieceId,
                });
                break;
            case dicePiece:
                setChildrenState({
                    children: (
                        <DicePieceContent
                            boardId={popoverEditor.clickOn.boardId}
                            pieceId={popoverEditor.clickOn.pieceId}
                        />
                    ),
                    width: 400,
                });
                break;
            case imagePiece:
                setChildrenState({
                    children: (
                        <ImagePieceContent
                            boardId={popoverEditor.clickOn.boardId}
                            pieceId={popoverEditor.clickOn.pieceId}
                        />
                    ),
                    width: 500,
                });
                break;
            case stringPiece:
                setChildrenState({
                    children: (
                        <StringPieceContent
                            boardId={popoverEditor.clickOn.boardId}
                            pieceId={popoverEditor.clickOn.pieceId}
                        />
                    ),
                    width: 400,
                });
                break;
            default:
                setChildrenState(undefined);
                break;
        }
    }, [popoverEditor, setCharacterEditorModal]);

    if (childrenState == null || popoverEditor == null) {
        return null;
    }

    const left = popoverEditor.pageX - 30;
    const top = popoverEditor.pageY - 3;

    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                width: childrenState.width,
                padding,
                backgroundColor,
                zIndex,
            }}
        >
            {childrenState.children}
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

// 1???1????????????????????????????????????????????????????????????????????????1???????????????????????????????????????
const useHooks = () => {
    const setCharacterModal = useUpdateAtom(characterEditorModalAtom);
    const setDicePieceModal = useUpdateAtom(dicePieceModalAtom);
    const setStringPieceModal = useUpdateAtom(stringPieceModalAtom);
    const setImagePieceModal = useUpdateAtom(imagePieceModalAtom);
    const setPopoverEditor = useUpdateAtom(boardPopoverEditorAtom);
    const cloneImagePiece = useCloneImagePiece();
    return React.useMemo(
        () => ({
            setCharacterModal,
            setDicePieceModal,
            setStringPieceModal,
            setImagePieceModal,
            setPopoverEditor,
            cloneImagePiece,
        }),
        [
            setCharacterModal,
            setDicePieceModal,
            setStringPieceModal,
            setImagePieceModal,
            setPopoverEditor,
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
        boardId: string;
    };

    const selectedCharacterPiecesMenu = ({
        characterPiecesOnCursor,
        onContextMenuClear,
        hooks,
        setRoomState,
        boardId,
    }: SelectedCharacterPiecesMenuProps): ItemType => {
        if (characterPiecesOnCursor.length === 0) {
            return null;
        }
        return {
            key: '??????@boardPopover',
            label: '??????',
            children: [
                ...characterPiecesOnCursor.map(({ characterId, character, pieceId }) => ({
                    key: keyNames(characterId, pieceId, 'selected-piece@boardPopover'),
                    label: character.name,
                    children: [
                        {
                            key: '??????@??????@boardPopover',
                            label: '??????',
                            onClick: () => {
                                hooks.setCharacterModal({
                                    type: update,
                                    stateId: characterId,
                                    selectedPieceType: piece,
                                    boardId,
                                    pieceId,
                                });
                                onContextMenuClear();
                            },
                        },
                        {
                            key: '???????????????@??????@boardPopover',
                            label: '???????????????',
                            onClick: () => {
                                setRoomState(roomState => {
                                    delete roomState.characters?.[characterId]?.pieces?.[pieceId];
                                });
                                onContextMenuClear();
                            },
                        },
                    ],
                })),
                { type: 'divider' },
            ],
        };
    };

    type SelectedPortraitPiecesMenuProps = {
        portraitsOnCursor: ContextMenuState['portraitsOnCursor'];
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
        boardId: string;
    };

    const selectedPortraitPiecesMenu = ({
        portraitsOnCursor,
        onContextMenuClear,
        hooks,
        setRoomState,
        boardId,
    }: SelectedPortraitPiecesMenuProps): ItemType => {
        if (portraitsOnCursor.length === 0) {
            return null;
        }
        return {
            key: '?????????@boardPopover',
            label: '?????????',
            children: [
                ...portraitsOnCursor.map(
                    ({ characterId, character, pieceId: portraitPositionId }) => ({
                        key: characterId + '@selected-tachie@boardPopover',
                        label: character.name,
                        children: [
                            {
                                key: '??????@?????????@boardPopover',
                                label: '??????',
                                onClick: () => {
                                    hooks.setCharacterModal({
                                        type: update,
                                        stateId: characterId,
                                        selectedPieceType: portrait,
                                        boardId,
                                        pieceId: portraitPositionId,
                                    });
                                    onContextMenuClear();
                                },
                            },
                            {
                                key: '??????????????????@?????????@boardPopover',
                                label: '??????????????????',
                                onClick: () => {
                                    setRoomState(roomState => {
                                        delete roomState.characters?.[characterId]
                                            ?.portraitPieces?.[portraitPositionId];
                                    });
                                    onContextMenuClear();
                                },
                            },
                        ],
                    })
                ),
                { type: 'divider' },
            ],
        };
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
        room: RoomState;
        myUserUid: string;
        onSe: (filePath: FilePath, volume: number) => void;
    }): ItemType[] => {
        if (characterPiecesOnCursor.length + portraitsOnCursor.length === 0) {
            return [];
        }

        const characters: { id: string; value: CharacterState }[] = [];
        [...characterPiecesOnCursor, ...portraitsOnCursor].forEach(elem => {
            if (characters.some(exists => exists.id === elem.characterId)) {
                return;
            }
            characters.push({ id: elem.characterId, value: elem.character });
        });
        const characterMenuItems = characters.map((characterPair): ItemType => {
            const privateCommands = recordToArray(characterPair.value.privateCommands ?? {}).map(
                ({ key, value }): ItemType => {
                    const testResult = testCommand(value.value);
                    if (testResult.isError) {
                        return {
                            key: key,
                            label: (
                                <Tooltip overlay={'??????????????????????????? - ' + testResult.error}>
                                    {' '}
                                    {value.name}
                                </Tooltip>
                            ),
                            disabled: true,
                        };
                    }
                    return {
                        key,
                        label: value.name,
                        onClick: () => {
                            const commandResult = execCharacterCommand({
                                script: value.value,
                                room,
                                characterId: characterPair.id,
                                myUserUid,
                            });
                            if (commandResult.isError) {
                                // TODO: ????????????
                                return;
                            }
                            const operation = diff(roomTemplate)({
                                prevState: room,
                                nextState: commandResult.value,
                            });
                            if (operation != null) {
                                operate(toUpOperation(roomTemplate)(operation));
                            }
                            onContextMenuClear();
                        },
                    };
                }
            );
            if (privateCommands.length === 0) {
                return null;
            }
            return {
                key: characterPair.id,
                label: characterPair.value.name,
                children: privateCommands,
            };
        });
        if (characterMenuItems.length === 0) {
            return [];
        }
        return [
            {
                key: '??????????????????????????????@boardPopover',
                label: '??????????????????????????????',
                children: characterMenuItems,
            },
            { type: 'divider' },
        ];
    };

    const youCannotEditPieceMessage = '???????????????????????????????????????????????????????????????????????????????????????';

    type SelectedDicePiecesMenuProps = {
        pageX: number;
        pageY: number;
        dicePiecesOnCursor: ContextMenuState['dicePiecesOnCursor'];
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        isMyCharacter: ReturnType<typeof useIsMyCharacter>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedDicePiecesMenu = ({
        pageX,
        pageY,
        dicePiecesOnCursor,
        onContextMenuClear,
        hooks,
        isMyCharacter,
        setRoomState,
    }: SelectedDicePiecesMenuProps): ItemType => {
        if (dicePiecesOnCursor.length === 0) {
            return null;
        }
        return {
            key: '???????????????@selectedDicePiecesMenu',
            label: '???????????????',
            children: [
                ...dicePiecesOnCursor.map(
                    ({ pieceId, piece, boardId }): ItemType => ({
                        key: pieceId + '@selected',
                        label: (
                            <DicePieceValue.images state={piece} size={22} padding='6px 0 0 0' />
                        ),
                        children: [
                            isMyCharacter(piece.ownerCharacterId)
                                ? {
                                      key: '??????@selectedDicePiecesMenu',
                                      label: '??????',
                                      onClick: () => {
                                          hooks.setPopoverEditor({
                                              pageX,
                                              pageY,
                                              clickOn: {
                                                  type: 'dicePiece',
                                                  boardId,
                                                  pieceId,
                                                  piece,
                                              },
                                          });
                                          onContextMenuClear();
                                      },
                                  }
                                : {
                                      key: '??????@selectedDicePiecesMenu',
                                      label: (
                                          <Tooltip title={youCannotEditPieceMessage}>??????</Tooltip>
                                      ),
                                      disabled: true,
                                  },
                            {
                                key: '??????@selectedDicePiecesMenu',
                                label: '??????',
                                onClick: () => {
                                    setRoomState(roomState => {
                                        delete roomState.boards?.[boardId]?.dicePieces?.[pieceId];
                                    });
                                    onContextMenuClear();
                                },
                            },
                        ],
                    })
                ),
                { type: 'divider' },
            ],
        };
    };

    type SelectedNumberPiecesMenuProps = {
        pageX: number;
        pageY: number;
        stringPiecesOnCursor: ContextMenuState['stringPiecesOnCursor'];
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        isMyCharacter: ReturnType<typeof useIsMyCharacter>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedStringPiecesMenu = ({
        pageX,
        pageY,
        stringPiecesOnCursor,
        onContextMenuClear,
        hooks,
        isMyCharacter,
        setRoomState,
    }: SelectedNumberPiecesMenuProps): ItemType => {
        if (stringPiecesOnCursor.length === 0) {
            return null;
        }
        return {
            key: '???????????????@boardPopover',
            label: '???????????????',
            children: [
                ...stringPiecesOnCursor.map(
                    ({ pieceId, piece, boardId }): ItemType => ({
                        // CharacterKey???compositeKeyToString??????key????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                        key: pieceId + '@selected',
                        label: StringPieceValue.stringify(piece),
                        children: [
                            isMyCharacter(piece.ownerCharacterId)
                                ? {
                                      key: '??????@boardPopover',
                                      label: '??????',
                                      onClick: () => {
                                          hooks.setPopoverEditor({
                                              pageX,
                                              pageY,
                                              clickOn: {
                                                  type: 'stringPiece',
                                                  boardId,
                                                  pieceId,
                                                  piece,
                                              },
                                          });
                                          onContextMenuClear();
                                      },
                                  }
                                : {
                                      key: '??????@boardPopover',
                                      disabled: true,
                                      label: (
                                          <Tooltip title={youCannotEditPieceMessage}>??????</Tooltip>
                                      ),
                                  },
                            {
                                key: '??????@boardPopover',
                                label: '??????',
                                onClick: () => {
                                    setRoomState(roomState => {
                                        delete roomState.boards?.[boardId]?.stringPieces?.[pieceId];
                                    });
                                    onContextMenuClear();
                                },
                            },
                        ],
                    })
                ),
                { type: 'divider' },
            ],
        };
    };

    type SelectedImagePiecesMenuProps = {
        pageX: number;
        pageY: number;
        imagePiecesOnCursor: ContextMenuState['imagePiecesOnCursor'];
        onContextMenuClear: () => void;
        boardId: string;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
    };

    const selectedImagePiecesMenu = ({
        pageX,
        pageY,
        imagePiecesOnCursor,
        onContextMenuClear,
        hooks,
        setRoomState,
    }: SelectedImagePiecesMenuProps): ItemType => {
        if (imagePiecesOnCursor.length === 0) {
            return null;
        }
        return {
            key: '????????????@boardPopover',
            label: '????????????',
            children: [
                ...imagePiecesOnCursor.map(
                    ({ pieceId, piece, boardId }): ItemType => ({
                        key: pieceId + '@selected',
                        label: (
                            <div className={classNames(flex, flexRow, itemsCenter)}>
                                {piece.image == null ? null : (
                                    <ImageView filePath={piece.image} size={26} />
                                )}
                                <div style={{ paddingLeft: 3 }}>{piece.name}</div>
                            </div>
                        ),
                        children: [
                            {
                                key: '??????@????????????@boardPopover',
                                label: '??????',
                                onClick: () => {
                                    hooks.setPopoverEditor({
                                        pageX,
                                        pageY,
                                        clickOn: {
                                            type: 'imagePiece',
                                            boardId,
                                            pieceId,
                                            piece,
                                        },
                                    });
                                    onContextMenuClear();
                                },
                            },
                            {
                                key: '??????@????????????@boardPopover',
                                label: '??????',
                                onClick: () => {
                                    hooks.cloneImagePiece({
                                        boardId,
                                        pieceId,
                                    });
                                    onContextMenuClear();
                                },
                            },
                            {
                                key: '??????@????????????@boardPopover',
                                label: '??????',
                                onClick: () => {
                                    setRoomState(roomState => {
                                        delete roomState.boards?.[boardId]?.imagePieces?.[pieceId];
                                    });
                                    onContextMenuClear();
                                },
                            },
                        ],
                    })
                ),
            ],
        };
    };

    type BasicMenuProps = {
        contextMenuState: ContextMenuState;
        onContextMenuClear: () => void;
        hooks: ReturnType<typeof useHooks>;
        setRoomState: ReturnType<typeof useSetRoomStateWithImmer>;
        characters: ReadonlyMap<string, CharacterState>;
        board: CellConfig;
    };

    const basicMenu = ({
        contextMenuState,
        onContextMenuClear,
        hooks,
        setRoomState,
        characters,
        board,
    }: BasicMenuProps): ItemType => {
        const boardId = contextMenuState.boardId;
        const boardConfig = contextMenuState.boardConfig;
        const { x, y } = toBoardPosition({
            konvaOffset: { x: contextMenuState.offsetX, y: contextMenuState.offsetY },
            boardConfig,
        });
        const cellPosition = toCellPosition({ pixelPosition: { x, y }, cellConfig: board });

        // TODO: w,h ???????????????
        // TODO: w,h ???????????????????????????

        const piecePosition: CompositeRect = {
            x,
            y,
            w: 50,
            h: 50,
            cellX: cellPosition.cellX,
            cellY: cellPosition.cellY,
            cellW: 1,
            cellH: 1,
        };

        const pieceStateWhichIsCellMode: PieceState = {
            $v: undefined,
            $r: undefined,
            x,
            y,
            w: 50,
            h: 50,
            opacity: undefined,
            cellX: cellPosition.cellX,
            cellY: cellPosition.cellY,
            cellW: 1,
            cellH: 1,
            isCellMode: true,
            isPositionLocked: false,
            memo: undefined,
            name: undefined,
        };

        const pieceStateWhichIsNotCellMode: PieceState = {
            $v: undefined,
            $r: undefined,
            x,
            y,
            w: 50,
            h: 50,
            opacity: undefined,
            isCellMode: false,
            isPositionLocked: false,
            cellX: cellPosition.cellX,
            cellY: cellPosition.cellY,
            cellW: 1,
            cellH: 1,
            memo: undefined,
            name: undefined,
        };

        const portraitPositionWhichIsNotCellMode: BoardPositionState = {
            $v: undefined,
            $r: undefined,
            x,
            y,
            w: 100,
            h: 100,
            opacity: undefined,
            isPositionLocked: false,
            memo: undefined,
            name: undefined,
        };

        const pieceMenus = [...characters].map(([characterId, character]): ItemType => {
            const rootKey = keyNames(characterId) + '@piece';
            return {
                key: rootKey,
                label: character.name,
                children: [
                    {
                        key: `??????????????????????????????@???????????????@${rootKey}`,
                        label: '??????????????????????????????',
                        onClick: () => {
                            setRoomState(roomState => {
                                const pieces = roomState.characters?.[characterId]?.pieces;
                                if (pieces == null) {
                                    return;
                                }
                                pieces[simpleId()] = {
                                    ...pieceStateWhichIsCellMode,
                                    $v: 2,
                                    $r: 1,
                                    boardId,
                                    isPrivate: false,
                                };
                            });
                            onContextMenuClear();
                        },
                    },
                    {
                        key: `?????????????????????????????????@???????????????@${rootKey}`,
                        label: '?????????????????????????????????',
                        onClick: () => {
                            setRoomState(roomState => {
                                const pieces = roomState.characters?.[characterId]?.pieces;
                                if (pieces == null) {
                                    return;
                                }
                                pieces[simpleId()] = {
                                    ...pieceStateWhichIsNotCellMode,
                                    $v: 2,
                                    $r: 1,
                                    boardId,
                                    isPrivate: false,
                                };
                            });
                            onContextMenuClear();
                        },
                    },
                ],
            };
        });

        const portraitMenus = [...characters].map(([characterId, character]): ItemType => {
            return {
                key: keyNames(characterId) + '@portrait',
                label: character.name,
                onClick: () => {
                    setRoomState(roomState => {
                        const portraitPieces = roomState.characters?.[characterId]?.portraitPieces;
                        if (portraitPieces == null) {
                            return;
                        }
                        portraitPieces[simpleId()] = {
                            ...portraitPositionWhichIsNotCellMode,
                            $v: 2,
                            $r: 1,
                            boardId,
                            isPrivate: false,
                        };
                    });
                    onContextMenuClear();
                },
            };
        });

        return {
            key: '????????????@boardPopover',
            label: '????????????',
            children: [
                {
                    key: '????????????????????????@????????????@boardPopover',
                    label: '????????????????????????',
                    children: pieceMenus,
                },
                {
                    key: '???????????????????????????@????????????@boardPopover',
                    label: '???????????????????????????',
                    children: portraitMenus,
                },
                {
                    key: '???????????????@????????????@boardPopover',
                    label: '???????????????',
                    onClick: () => {
                        hooks.setDicePieceModal({
                            type: create,
                            boardId,
                            piecePosition,
                        });
                        onContextMenuClear();
                    },
                },
                {
                    key: '???????????????@????????????@boardPopover',
                    label: '???????????????',
                    onClick: () => {
                        hooks.setStringPieceModal({
                            type: create,
                            boardId,
                            piecePosition,
                        });
                        onContextMenuClear();
                    },
                },
                {
                    key: '????????????@????????????@boardPopover',
                    label: '????????????',
                    onClick: () => {
                        hooks.setImagePieceModal({
                            type: create,
                            boardId,
                            piecePosition,
                        });
                        onContextMenuClear();
                    },
                },
            ],
        };
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
        const [, writeSe] = useMutation(WriteRoomSoundEffectDocument);
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
        const menuItems: ItemType[] = [
            selectedCharacterPiecesMenu({
                ...contextMenuState,
                onContextMenuClear,
                hooks,
                setRoomState,
            }),
            selectedPortraitPiecesMenu({
                ...contextMenuState,
                onContextMenuClear,
                hooks,
                setRoomState,
            }),
            selectedDicePiecesMenu({
                ...contextMenuState,
                onContextMenuClear,
                hooks,
                setRoomState,
                isMyCharacter,
            }),
            selectedStringPiecesMenu({
                ...contextMenuState,
                onContextMenuClear,
                hooks,
                setRoomState,
                isMyCharacter,
            }),
            selectedImagePiecesMenu({
                ...contextMenuState,
                onContextMenuClear,
                boardId,
                hooks,
                setRoomState,
            }),
            ...selectedCharacterCommandsMenu({
                ...contextMenuState,
                onContextMenuClear,
                operate: operate,
                room,
                onSe: (se, volume) =>
                    writeSe({
                        roomId,
                        volume,
                        file: {
                            ...se,
                            sourceType:
                                se.sourceType === 'Default'
                                    ? FileSourceType.Default
                                    : FileSourceType.FirebaseStorage,
                        },
                    }),
                myUserUid,
            }),
            basicMenu({
                contextMenuState,
                onContextMenuClear,
                hooks,
                setRoomState,
                characters,
                board,
            }),
        ];

        return (
            <div
                style={{
                    position: 'absolute',
                    left: contextMenuState.pageX,
                    top: contextMenuState.pageY,
                    zIndex,
                }}
            >
                <Menu items={menuItems} triggerSubMenuAction={defaultTriggerSubMenuAction} />
            </div>
        );
    };
}

export const BoardContextMenu = ContextMenuModule.Main;
