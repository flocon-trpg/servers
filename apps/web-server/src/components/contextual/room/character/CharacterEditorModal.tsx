import { Button, Modal, Tooltip } from 'antd';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import { InputFile } from '../file/InputFile';
import { FilesManagerDrawerType } from '../../../../utils/types';
import { FilesManagerDrawer } from '../file/FilesManagerDrawer';
import { NumberParameterInput } from './NumberParameterInput';
import { BooleanParameterInput } from './BooleanParameterInput';
import { StringParameterInput } from './StringParameterInput';
import { ToggleButton } from '../../../ui/ToggleButton';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import {
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
    characterIsPrivate,
} from '../../../../resources/text/main';
import { StateEditorParams, useStateEditor } from '../../../../hooks/useStateEditor';
import { useCharacters } from '../../../../hooks/state/useCharacters';
import { useParticipants } from '../../../../hooks/state/useParticipants';
import {
    useBoolParamNames,
    useNumParamNames,
    useStrParamNames,
} from '../../../../hooks/state/useParamNames';
import { State, characterTemplate, simpleId, strIndex20Array } from '@flocon-trpg/core';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { FilePath } from '../../../../utils/file/filePath';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { atom } from 'jotai';
import { create, update } from '../../../../utils/constants';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { commandEditorModalAtom } from '../../../../atoms/overlay/commandEditorModalAtom';
import { useIsMyCharacter } from '../../../../hooks/state/useIsMyCharacter';
import { CharacterVarInput } from './CharacterVarInput';
import classNames from 'classnames';
import {
    flex,
    flex1,
    flexAuto,
    flexColumn,
    flexRow,
    itemsCenter,
    justifyEnd,
} from '../../../../utils/className';
import { EditorGroupHeader } from '../../../ui/EditorGroupHeader';
import { OverriddenParameterNameEditor } from './OverriddenParameterNameEditor';
import { CharacterTagsSelect } from './CharacterTagsSelect';
import { CopyToClipboardButton } from '../../../ui/CopyToClipboardButton';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';

type CharacterState = State<typeof characterTemplate>;

type CharacterEditorModalState =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;

          // BufferedInputの変更内容が保存されていない状態でModalを閉じてもその変更が反映されるように、updateモードのModalが閉じられたときはPieceValueEditorStateをnullにするのではなくclosedをfalseに切り替えるようにしている。
          closed: boolean;
      };

export type CharacterEditorModalAction =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;
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

// eslint-disable-next-line @typescript-eslint/ban-types
type RowProps = {
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
};

const Row: React.FC<RowProps> = ({ leftContent, rightContent }: RowProps) => {
    return (
        <div className={classNames(flex, flexRow, itemsCenter)}>
            <div
                className={classNames(justifyEnd, flex)}
                style={{ flexBasis: 240, paddingRight: 20 }}
            >
                {leftContent}
            </div>
            <div className={flex1}>{rightContent}</div>
        </div>
    );
};

const defaultCharacter: CharacterState = {
    $v: 2,
    $r: 1,

    // createするときはこれに自身のIDを入れなければならない
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
    let stateEditorParams: StateEditorParams<CharacterState | undefined> | undefined;
    switch (atomValue?.type) {
        case undefined:
            stateEditorParams = undefined;
            break;
        case create:
            stateEditorParams = {
                type: create,
                initState: defaultCharacter,
            };
            break;
        case update:
            stateEditorParams = {
                type: update,
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
            break;
    }
    const {
        uiState: character,
        updateUiState: updateCharacter,
        resetUiState: resetCharacterToCreate,
    } = useStateEditor(stateEditorParams);
    const [filesManagerDrawerType, setFilesManagerDrawerType] =
        React.useState<FilesManagerDrawerType | null>(null);

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

        let onOkClick: (() => void) | undefined = undefined;
        if (atomValue?.type === create) {
            onOkClick = () => {
                const id = simpleId();
                setRoomState(roomState => {
                    if (roomState.characters == null) {
                        roomState.characters = {};
                    }
                    roomState.characters[id] = {
                        ...character,
                        ownerParticipantId: myUserUid,
                    };
                });
                resetCharacterToCreate();
                setAtomValue(null);
            };
        }

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
                title={atomValue?.type === create ? 'キャラクターの新規作成' : 'キャラクターの編集'}
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
                            onOkClick == null
                                ? undefined
                                : { textType: 'create', onClick: onOkClick }
                        }
                        destroy={
                            onDestroy == null
                                ? undefined
                                : {
                                      modal: {
                                          title: 'キャラクターの削除の確認',
                                          content: `このキャラクター "${character.name}" を削除します。よろしいですか？`,
                                      },
                                      onClick: onDestroy,
                                  }
                        }
                    />
                }
            >
                <div className={classNames(flex, flexRow)}>
                    <div style={{ minWidth: 500 }}>
                        {atomValue?.type === update && (
                            <>
                                <EditorGroupHeader>作成者</EditorGroupHeader>
                                <Row
                                    leftContent='作成者'
                                    rightContent={
                                        <>
                                            <span>{participantName}</span>
                                            {createdByMe && (
                                                <span
                                                    style={{ paddingLeft: 2, fontWeight: 'bold' }}
                                                >
                                                    (自分)
                                                </span>
                                            )}
                                        </>
                                    }
                                />
                            </>
                        )}

                        {atomValue?.type !== update ? null : (
                            <>
                                <EditorGroupHeader>アクション</EditorGroupHeader>

                                <Row
                                    rightContent={
                                        <Tooltip title='コマを除き、このキャラクターを複製します。'>
                                            {/* TODO: 複製したことを何らかの形で通知したほうがいい */}
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
                                                            name: `${character.name} (複製)`,
                                                        };
                                                    });
                                                }}
                                            >
                                                このキャラクターを複製
                                            </Button>
                                        </Tooltip>
                                    }
                                />
                            </>
                        )}

                        <EditorGroupHeader>全体公開</EditorGroupHeader>

                        <Row
                            leftContent='全体公開'
                            rightContent={
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
                            }
                        />

                        <EditorGroupHeader>共通パラメーター</EditorGroupHeader>

                        <Row
                            leftContent='名前'
                            rightContent={
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
                            }
                        />

                        <Row
                            leftContent='アイコン画像'
                            rightContent={
                                <InputFile
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
                                    openFilesManager={setFilesManagerDrawerType}
                                    showImage
                                    maxWidthOfLink={100}
                                />
                            }
                        />

                        <Row
                            leftContent='立ち絵画像'
                            rightContent={
                                <InputFile
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
                                    openFilesManager={setFilesManagerDrawerType}
                                    showImage
                                    maxWidthOfLink={100}
                                />
                            }
                        />

                        <EditorGroupHeader>タグ</EditorGroupHeader>

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

                        <EditorGroupHeader>数値パラメーター</EditorGroupHeader>

                        {strIndex20Array.map(key => {
                            const paramName = numParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.numParams?.[key];
                            const maxValue = character.numMaxParams?.[key];
                            return (
                                <Row
                                    key={`numParam${key}Row`}
                                    leftContent={
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
                                    rightContent={
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
                                    }
                                />
                            );
                        })}

                        {numParamNames.size === 0 && <div>数値パラメーターはありません。</div>}

                        <EditorGroupHeader>チェックマークパラメーター</EditorGroupHeader>

                        {strIndex20Array.map(key => {
                            const paramName = boolParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.boolParams?.[key];
                            return (
                                <Row
                                    key={`boolParam${key}Row`}
                                    leftContent={
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
                                    rightContent={
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
                                    }
                                />
                            );
                        })}

                        {boolParamNames.size === 0 && (
                            <div>チェックマークパラメーターはありません。</div>
                        )}

                        <EditorGroupHeader>文字列パラメーター</EditorGroupHeader>

                        {strIndex20Array.map(key => {
                            const paramName = strParamNames.get(key);
                            if (paramName === undefined) {
                                return null;
                            }
                            const value = character.strParams?.[key];
                            return (
                                <Row
                                    key={`strParam${key}Row`}
                                    leftContent={
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
                                    rightContent={
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
                                    }
                                />
                            );
                        })}

                        {strParamNames.size === 0 && <div>文字列パラメーターはありません。</div>}
                    </div>

                    <div
                        className={classNames(flexAuto, flex, flexColumn)}
                        style={{ paddingLeft: 60, overflow: 'hidden' }}
                    >
                        <EditorGroupHeader>メモ</EditorGroupHeader>

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
                                <EditorGroupHeader>変数</EditorGroupHeader>

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
                                <EditorGroupHeader>コマンド</EditorGroupHeader>

                                <div>
                                    <Button
                                        onClick={() =>
                                            setCommandEditorModal({
                                                characterId: atomValue.stateId,
                                            })
                                        }
                                    >
                                        編集
                                    </Button>
                                </div>
                            </>
                        )}

                        <EditorGroupHeader>エクスポート</EditorGroupHeader>

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
                                クリップボードにエクスポート
                            </CopyToClipboardButton>
                            <p>
                                {
                                    'キャラクターコマ、キャラクター立ち絵コマはエクスポートされません。'
                                }
                                <br />
                                {
                                    '自分が閲覧できない値はエクスポートされません。例えば、他のユーザーによって非公開にされている値はエクスポートの対象外ですが、自分が非公開にしている値は自分が閲覧可能なためエクスポートの対象内となります。'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <FilesManagerDrawer
                    drawerType={filesManagerDrawerType}
                    onClose={() => setFilesManagerDrawerType(null)}
                />
            </Modal>
        );
    }, [
        atomValue,
        boolParamNames,
        character,
        filesManagerDrawerType,
        isMyCharacter,
        myUserUid,
        numParamNames,
        participantName,
        resetCharacterToCreate,
        setAtomValue,
        setCommandEditorModal,
        setRoomState,
        strParamNames,
        updateCharacter,
    ]);
};
