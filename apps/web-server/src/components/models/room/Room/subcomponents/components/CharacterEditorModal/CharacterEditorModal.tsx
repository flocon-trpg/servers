import { Button, Modal, Tooltip } from 'antd';
import React from 'react';
import { DialogFooter } from '@/components/ui/DialogFooter/DialogFooter';
import { FileView } from '../../../../../file/FileView/FileView';
import { NumberParameterInput } from '../NumberParameterInput/NumberParameterInput';
import { BooleanParameterInput } from '../BooleanParameterInput/BooleanParameterInput';
import { StringParameterInput } from '../StringParameterInput/StringParameterInput';
import { ToggleButton } from '@/components/ui/ToggleButton/ToggleButton';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
    characterIsPrivate,
} from '@/resources/text/main';
import { CreateModeParams, UpdateModeParams, useStateEditor } from '../../hooks/useStateEditor';
import { useCharacters } from '../../hooks/useCharacters';
import { useParticipants } from '../../hooks/useParticipants';
import { useBoolParamNames, useNumParamNames, useStrParamNames } from '../../hooks/useParamNames';
import { State, characterTemplate, simpleId, strIndex20Array } from '@flocon-trpg/core';
import { useMyUserUid } from '@/hooks/useMyUserUid';
import { FilePath } from '@/utils/file/filePath';
import { useSetRoomStateWithImmer } from '@/hooks/useSetRoomStateWithImmer';
import { atom } from 'jotai';
import { create, update } from '@/utils/constants';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useIsMyCharacter } from '../../hooks/useIsMyCharacter';
import { CharacterVarInput } from '../CharacterVarInput/CharacterVarInput';
import classNames from 'classnames';
import { flex, flexAuto, flexColumn, flexRow } from '@/styles/className';
import { EditorGroupHeader } from '@/components/ui/EditorGroupHeader/EditorGroupHeader';
import { OverriddenParameterNameEditor } from '../OverriddenParameterNameEditor/OverriddenParameterNameEditor';
import { CharacterTagsSelect } from './subcomponent/components/CharacterTagsSelect/CharacterTagsSelect';
import { CopyToClipboardButton } from '@/components/ui/CopyToClipboardButton/CopyToClipboardButton';
import { CollaborativeInput } from '@/components/ui/CollaborativeInput/CollaborativeInput';
import { useCharacterPiece } from '../../hooks/useCharacterPiece';
import { usePortraitPiece } from '../../hooks/usePortraitPiece';
import { BoardPositionRectEditor, PieceRectEditor } from '../RectEditor/RectEditor';
import { Table, TableCombinedRow, TableHeader, TableRow } from '@/components/ui/Table/Table';
import { keyNames } from '@flocon-trpg/utils';
import { useMemoOne } from 'use-memo-one';
import { commandEditorModalAtom } from '../CommandEditorModal/CommandEditorModal';
import { image } from '@/utils/fileType';

type CharacterState = State<typeof characterTemplate>;

type CharacterEditorModalState =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;

          // BufferedInput???????????????????????????????????????????????????Modal?????????????????????????????????????????????????????????update????????????Modal???????????????????????????PieceValueEditorState???null????????????????????????closed???false??????????????????????????????????????????
          closed: boolean;

          selectedPieceType: null;
      }
    | {
          type: typeof update;
          stateId: string;
          closed: boolean;

          selectedPieceType: typeof piece | typeof portrait;
          boardId: string;
          pieceId: string;
      };

export const piece = 'piece';
export const portrait = 'portrait';

export type CharacterEditorModalAction =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;

          selectedPieceType: null;
      }
    | {
          type: typeof update;
          stateId: string;

          selectedPieceType: typeof piece | typeof portrait;
          boardId: string;
          pieceId: string;
      }
    | null;

const characterEditorModalPrimitiveAtom = atom<CharacterEditorModalState | null>(null);
export const characterEditorModalAtom = atom<
    CharacterEditorModalState | null,
    CharacterEditorModalAction
>(
    get => get(characterEditorModalPrimitiveAtom),
    (get, set, newValue) => {
        switch (newValue?.type) {
            case create:
                set(characterEditorModalPrimitiveAtom, newValue);
                break;
            case update:
                set(characterEditorModalPrimitiveAtom, {
                    ...newValue,
                    closed: false,
                });
                break;
            case undefined: {
                const prevValue = get(characterEditorModalPrimitiveAtom);
                if (prevValue?.type === update) {
                    set(characterEditorModalPrimitiveAtom, { ...prevValue, closed: true });
                    return;
                }
                set(characterEditorModalPrimitiveAtom, newValue);
            }
        }
    }
);

const pieceEditorTitle = '???????????????';

const CharacterPieceEditor: React.FC<{ boardId: string; pieceId: string }> = ({
    boardId,
    pieceId,
}) => {
    const setRoomState = useSetRoomStateWithImmer();
    const piece = useCharacterPiece({ boardId, pieceId });

    if (piece == null) {
        return null;
    }

    return (
        <>
            <TableHeader>{pieceEditorTitle}</TableHeader>
            <PieceRectEditor
                value={piece.piece}
                onChange={newValue => {
                    setRoomState(room => {
                        const pieces = room?.characters?.[piece.characterId]?.pieces;
                        if (pieces == null) {
                            return;
                        }
                        pieces[pieceId] = newValue;
                    });
                }}
                boardId={boardId}
            />
        </>
    );
};

const PortraitPieceEditor: React.FC<{ boardId: string; pieceId: string }> = ({
    boardId,
    pieceId,
}) => {
    const setRoomState = useSetRoomStateWithImmer();
    const piece = usePortraitPiece({ boardId, pieceId });

    if (piece == null) {
        return null;
    }

    return (
        <>
            <TableHeader>{pieceEditorTitle}</TableHeader>
            <BoardPositionRectEditor
                value={piece.piece}
                onChange={newValue => {
                    setRoomState(room => {
                        const portraitPieces =
                            room?.characters?.[piece.characterId]?.portraitPieces;
                        if (portraitPieces == null) {
                            return;
                        }
                        portraitPieces[pieceId] = newValue;
                    });
                }}
            />
        </>
    );
};

const defaultCharacter: CharacterState = {
    $v: 2,
    $r: 1,

    // create?????????????????????????????????ID?????????????????????????????????
    ownerParticipantId: undefined,

    chatPalette: '',
    memo: '',
    name: '',
    hasTag1: false,
    hasTag2: false,
    hasTag3: false,
    hasTag4: false,
    hasTag5: false,
    hasTag6: false,
    hasTag7: false,
    hasTag8: false,
    hasTag9: false,
    hasTag10: false,
    isPrivate: false,
    image: undefined,
    privateCommands: {},
    privateVarToml: '',
    portraitImage: undefined,
    portraitPieces: {},
    boolParams: {},
    numParams: {},
    numMaxParams: {},
    strParams: {},
    pieces: {},
};

export const CharacterEditorModal: React.FC = () => {
    const myUserUid = useMyUserUid();
    const atomValue = useAtomValue(characterEditorModalPrimitiveAtom);
    const setAtomValue = useUpdateAtom(characterEditorModalAtom);
    const setCommandEditorModal = useUpdateAtom(commandEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const isMyCharacter = useIsMyCharacter();
    const characters = useCharacters();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();
    const participants = useParticipants();
    const participantName = React.useMemo(() => {
        if (atomValue?.type === update) {
            return participants?.get(atomValue.stateId)?.name;
        }
        return undefined;
    }, [atomValue, participants]);
    const createMode: CreateModeParams<CharacterState | undefined> | undefined = useMemoOne(() => {
        if (atomValue?.type !== create) {
            return undefined;
        }
        return {
            createInitState: () => defaultCharacter,
            onCreate: newValue => {
                if (newValue == null) {
                    return;
                }
                const id = simpleId();
                setRoomState(roomState => {
                    if (roomState.characters == null) {
                        roomState.characters = {};
                    }
                    roomState.characters[id] = {
                        ...newValue,
                        ownerParticipantId: myUserUid,
                    };
                });
            },
        };
    }, [atomValue?.type, myUserUid, setRoomState]);
    const updateMode: UpdateModeParams<CharacterState | undefined> | undefined = useMemoOne(() => {
        if (atomValue?.type !== update) {
            return undefined;
        }
        return {
            state: characters?.get(atomValue.stateId),
            onUpdate: nextState => {
                setRoomState(roomState => {
                    if (roomState.characters == null) {
                        roomState.characters = {};
                    }
                    roomState.characters[atomValue.stateId] = nextState;
                });
            },
        };
    }, [atomValue, characters, setRoomState]);
    const {
        state: character,
        updateState: updateCharacter,
        ok,
    } = useStateEditor({ createMode, updateMode });

    return React.useMemo(() => {
        if (
            boolParamNames == null ||
            numParamNames == null ||
            strParamNames == null ||
            myUserUid == null ||
            character == null
        ) {
            return null;
        }

        const isCreate = atomValue?.type === create;
        const createdByMe = (() => {
            if (atomValue?.type !== update) {
                return true;
            }
            return isMyCharacter(atomValue.stateId);
        })();

        let onDestroy: (() => void) | undefined = undefined;
        if (atomValue?.type === update) {
            onDestroy = () => {
                setRoomState(roomState => {
                    delete roomState.characters?.[atomValue.stateId];
                });
                setAtomValue(null);
            };
        }

        let visible: boolean;
        switch (atomValue?.type) {
            case undefined:
                visible = false;
                break;
            case update:
                visible = !atomValue.closed;
                break;
            case create:
                visible = true;
                break;
        }

        return (
            <Modal
                width={1000}
                title={atomValue?.type === create ? '?????????????????????????????????' : '???????????????????????????'}
                visible={visible}
                closable
                onCancel={() => setAtomValue(null)}
                footer={
                    <DialogFooter
                        close={{
                            textType: atomValue?.type === create ? 'cancel' : 'close',
                            onClick: () => setAtomValue(null),
                        }}
                        ok={
                            atomValue?.type === create
                                ? {
                                      textType: 'create',
                                      onClick: () => {
                                          ok();
                                          setAtomValue(null);
                                      },
                                  }
                                : undefined
                        }
                        destroy={
                            onDestroy == null
                                ? undefined
                                : {
                                      modal: {
                                          title: '????????????????????????????????????',
                                          content: `???????????????????????? "${character.name}" ?????????????????????????????????????????????`,
                                      },
                                      onClick: onDestroy,
                                  }
                        }
                    />
                }
            >
                <div className={classNames(flex, flexRow)}>
                    <Table style={{ minWidth: 500 }}>
                        {atomValue?.type === update && atomValue.selectedPieceType === piece && (
                            <CharacterPieceEditor
                                pieceId={atomValue.pieceId}
                                boardId={atomValue.boardId}
                            />
                        )}

                        {atomValue?.type === update && atomValue.selectedPieceType === portrait && (
                            <PortraitPieceEditor
                                pieceId={atomValue.pieceId}
                                boardId={atomValue.boardId}
                            />
                        )}

                        {atomValue?.type === update && (
                            <>
                                <TableHeader>?????????</TableHeader>
                                <TableRow label='?????????'>
                                    <>
                                        <span>{participantName}</span>
                                        {createdByMe && (
                                            <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>
                                                (??????)
                                            </span>
                                        )}
                                    </>
                                </TableRow>
                            </>
                        )}

                        {atomValue?.type !== update ? null : (
                            <>
                                <TableHeader>???????????????</TableHeader>

                                <TableRow>
                                    <Tooltip title='???????????????????????????????????????????????????????????????'>
                                        {/* TODO: ?????????????????????????????????????????????????????????????????? */}
                                        <Button
                                            size='small'
                                            onClick={() => {
                                                const id = simpleId();
                                                setRoomState(roomState => {
                                                    if (roomState.characters == null) {
                                                        roomState.characters = {};
                                                    }
                                                    roomState.characters[id] = {
                                                        ...character,
                                                        name: `${character.name} (??????)`,
                                                    };
                                                });
                                            }}
                                        >
                                            ?????????????????????????????????
                                        </Button>
                                    </Tooltip>
                                </TableRow>
                            </>
                        )}

                        <TableHeader>????????????</TableHeader>

                        <TableRow label='????????????'>
                            <ToggleButton
                                size='small'
                                disabled={
                                    createdByMe || atomValue?.type === create
                                        ? false
                                        : characterIsNotPrivateAndNotCreatedByMe
                                }
                                showAsTextWhenDisabled
                                checked={!character.isPrivate}
                                checkedChildren={<EyeOutlined />}
                                unCheckedChildren={<EyeInvisibleOutlined />}
                                tooltip={
                                    character.isPrivate
                                        ? characterIsPrivate({
                                              isCreate,
                                          })
                                        : characterIsNotPrivate({
                                              isCreate,
                                          })
                                }
                                onChange={newValue =>
                                    updateCharacter(character => {
                                        if (character == null) {
                                            return;
                                        }
                                        character.isPrivate = !newValue;
                                    })
                                }
                                shape='circle'
                                defaultType='dashed'
                            />
                        </TableRow>

                        <TableHeader>????????????????????????</TableHeader>

                        <TableRow label='??????'>
                            <CollaborativeInput
                                bufferDuration='default'
                                size='small'
                                value={character.name}
                                onChange={e => {
                                    if (e.previousValue === e.currentValue) {
                                        return;
                                    }
                                    updateCharacter(character => {
                                        if (character == null) {
                                            return;
                                        }
                                        character.name = e.currentValue;
                                    });
                                }}
                            />
                        </TableRow>

                        <TableRow label='??????????????????'>
                            <FileView
                                filePath={character.image ?? undefined}
                                onPathChange={path =>
                                    updateCharacter(character => {
                                        if (character == null) {
                                            return;
                                        }
                                        character.image =
                                            path == null ? undefined : FilePath.toOt(path);
                                    })
                                }
                                showImage
                                maxWidthOfLink={100}
                                uploaderFileBrowserHeight={null}
                                defaultFileTypeFilter={image}
                            />
                        </TableRow>

                        <TableRow label='???????????????'>
                            <FileView
                                filePath={character.portraitImage ?? undefined}
                                onPathChange={path =>
                                    updateCharacter(character => {
                                        if (character == null) {
                                            return;
                                        }
                                        character.portraitImage =
                                            path == null ? undefined : FilePath.toOt(path);
                                    })
                                }
                                showImage
                                maxWidthOfLink={100}
                                defaultFileTypeFilter={image}
                                uploaderFileBrowserHeight={null}
                            />
                        </TableRow>

                        <TableHeader>??????</TableHeader>

                        <TableCombinedRow>
                            <CharacterTagsSelect
                                character={character}
                                onChange={recipe =>
                                    updateCharacter(character => {
                                        if (character == null) {
                                            return;
                                        }
                                        recipe(character);
                                    })
                                }
                            />
                        </TableCombinedRow>

                        <TableHeader>????????????????????????</TableHeader>

                        {strIndex20Array.map(key => {
                            const paramName = numParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.numParams?.[key];
                            const maxValue = character.numMaxParams?.[key];
                            return (
                                <TableRow
                                    key={keyNames('CharacterEditorModal', `numParam${key}Row`)}
                                    label={
                                        <OverriddenParameterNameEditor
                                            type='editor'
                                            baseName={paramName.name}
                                            overriddenParameterName={value?.overriddenParameterName}
                                            onOverriddenParameterNameChange={newValue =>
                                                updateCharacter(character => {
                                                    const param = character?.numParams?.[key];
                                                    if (param == null) {
                                                        return;
                                                    }
                                                    param.overriddenParameterName = newValue;
                                                })
                                            }
                                        />
                                    }
                                >
                                    <NumberParameterInput
                                        isCharacterPrivate={character.isPrivate}
                                        isCreate={isCreate}
                                        compact={false}
                                        parameterKey={key}
                                        numberParameter={value}
                                        numberMaxParameter={maxValue}
                                        createdByMe={createdByMe}
                                        onOperate={mapping => {
                                            updateCharacter(character => {
                                                if (character == null) {
                                                    return;
                                                }
                                                return mapping(character);
                                            });
                                        }}
                                    />
                                </TableRow>
                            );
                        })}

                        {numParamNames.size === 0 && (
                            <TableCombinedRow>?????????????????????????????????????????????</TableCombinedRow>
                        )}

                        <TableHeader>???????????????????????????????????????</TableHeader>

                        {strIndex20Array.map(key => {
                            const paramName = boolParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.boolParams?.[key];
                            return (
                                <TableRow
                                    key={keyNames('CharacterEditorModal', `boolParam${key}Row`)}
                                    label={
                                        <OverriddenParameterNameEditor
                                            type='editor'
                                            baseName={paramName.name}
                                            overriddenParameterName={value?.overriddenParameterName}
                                            onOverriddenParameterNameChange={newValue =>
                                                updateCharacter(character => {
                                                    const param = character?.boolParams?.[key];
                                                    if (param == null) {
                                                        return;
                                                    }
                                                    param.overriddenParameterName = newValue;
                                                })
                                            }
                                        />
                                    }
                                >
                                    <BooleanParameterInput
                                        isCharacterPrivate={character.isPrivate}
                                        isCreate={isCreate}
                                        compact={false}
                                        parameterKey={key}
                                        parameter={value}
                                        createdByMe={createdByMe}
                                        onOperate={mapping => {
                                            updateCharacter(character => {
                                                if (character == null) {
                                                    return;
                                                }
                                                return mapping(character);
                                            });
                                        }}
                                    />
                                </TableRow>
                            );
                        })}

                        {boolParamNames.size === 0 && (
                            <TableCombinedRow>
                                ????????????????????????????????????????????????????????????
                            </TableCombinedRow>
                        )}

                        <TableHeader>???????????????????????????</TableHeader>

                        {strIndex20Array.map(key => {
                            const paramName = strParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.strParams?.[key];
                            return (
                                <TableRow
                                    key={keyNames('CharacterEditorModal', `strParam${key}Row`)}
                                    label={
                                        <OverriddenParameterNameEditor
                                            type='editor'
                                            baseName={paramName.name}
                                            overriddenParameterName={value?.overriddenParameterName}
                                            onOverriddenParameterNameChange={newValue =>
                                                updateCharacter(character => {
                                                    const param = character?.strParams?.[key];
                                                    if (param == null) {
                                                        return;
                                                    }
                                                    param.overriddenParameterName = newValue;
                                                })
                                            }
                                        />
                                    }
                                >
                                    <StringParameterInput
                                        compact={false}
                                        isCharacterPrivate={character.isPrivate}
                                        isCreate={isCreate}
                                        parameterKey={key}
                                        parameter={value}
                                        createdByMe={createdByMe}
                                        onOperate={mapping => {
                                            updateCharacter(character => {
                                                if (character == null) {
                                                    return;
                                                }
                                                return mapping(character);
                                            });
                                        }}
                                    />
                                </TableRow>
                            );
                        })}

                        {strParamNames.size === 0 && (
                            <TableCombinedRow>????????????????????????????????????????????????</TableCombinedRow>
                        )}
                    </Table>

                    <div
                        className={classNames(flexAuto, flex, flexColumn)}
                        style={{ paddingLeft: 60, overflow: 'hidden' }}
                    >
                        <EditorGroupHeader>??????</EditorGroupHeader>

                        <CollaborativeInput
                            style={{ overflow: 'auto', flex: '1 0 auto', maxHeight: 300 }}
                            multiline
                            size='small'
                            bufferDuration='default'
                            value={character.memo}
                            onChange={e => {
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.memo = e.currentValue;
                                });
                            }}
                        />

                        {createdByMe && (
                            <>
                                <EditorGroupHeader>??????</EditorGroupHeader>

                                <CharacterVarInput
                                    style={{ overflow: 'auto', flex: '1 0 auto', maxHeight: 300 }}
                                    character={character}
                                    onChange={newValue =>
                                        updateCharacter(character => {
                                            if (character == null) {
                                                return;
                                            }
                                            character.privateVarToml = newValue;
                                        })
                                    }
                                />
                            </>
                        )}

                        {createdByMe && atomValue?.type === update && (
                            <>
                                <EditorGroupHeader>????????????</EditorGroupHeader>

                                <div>
                                    <Button
                                        onClick={() =>
                                            setCommandEditorModal({
                                                characterId: atomValue.stateId,
                                            })
                                        }
                                    >
                                        ??????
                                    </Button>
                                </div>
                            </>
                        )}

                        <EditorGroupHeader>??????????????????</EditorGroupHeader>

                        <div>
                            <CopyToClipboardButton
                                clipboardText={async () => {
                                    const characterToExport: typeof character = {
                                        ...character,
                                        pieces: {},
                                        portraitPieces: {},
                                    };
                                    return JSON.stringify(characterToExport);
                                }}
                            >
                                ??????????????????????????????????????????
                            </CopyToClipboardButton>
                            <p>
                                {
                                    '???????????????????????????????????????????????????????????????????????????????????????????????????'
                                }
                                <br />
                                {
                                    '???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }, [
        atomValue,
        boolParamNames,
        character,
        isMyCharacter,
        myUserUid,
        numParamNames,
        ok,
        participantName,
        setAtomValue,
        setCommandEditorModal,
        setRoomState,
        strParamNames,
        updateCharacter,
    ]);
};
