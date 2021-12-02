import { Button, Modal, Tooltip } from 'antd';
import React from 'react';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { InputFile } from '../../components/InputFile';
import { FilesManagerDrawerType } from '../../utils/types';
import { FilesManagerDrawer } from '../../components/FilesManagerDrawer';
import { NumberParameterInput } from '../../components/NumberParameterInput';
import { BooleanParameterInput } from '../../components/BooleanParameterInput';
import { StringParameterInput } from '../../components/StringParameterInput';
import { ToggleButton } from '../../components/ToggleButton';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import {
    characterIsPrivate,
    characterIsNotPrivate,
    characterIsNotPrivateAndNotCreatedByMe,
} from '../../resource/text/main';
import { StateEditorParams, useStateEditor } from '../../hooks/useStateEditor';
import { BufferedInput } from '../../components/BufferedInput';
import { useCharacters } from '../../hooks/state/useCharacters';
import { useParticipants } from '../../hooks/state/useParticipants';
import {
    useBoolParamNames,
    useNumParamNames,
    useStrParamNames,
} from '../../hooks/state/useParamNames';
import { CharacterState, strIndex20Array, simpleId } from '@flocon-trpg/core';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { BufferedTextArea } from '../../components/BufferedTextArea';
import { FilePath } from '../../utils/filePath';
import { useSetRoomStateWithImmer } from '../../hooks/useSetRoomStateWithImmer';
import { atom, useAtom } from 'jotai';
import { create, update } from '../../utils/constants';
import { useUpdateAtom } from 'jotai/utils';
import { commandEditorModalAtom } from '../../atoms/overlay/commandEditorModalAtom';
import { useIsMyCharacter } from '../../hooks/state/useIsMyCharacter';
import { CharacterVarInput } from '../../components/CharacterVarInput';
import classNames from 'classnames';
import { flex, flex1, flexAuto, flexRow, itemsCenter, justifyEnd } from '../../utils/className';
import { EditorGroupHeader } from '../../components/EditorGroupHeader';
import { OverriddenParameterNameEditor } from '../../components/OverriddenParameterNameEditor';
import { CharacterTagsSelect } from '../../components/CharacterTagsSelect';
import { CopyToClipboardButton } from '../../components/CopyToClipboardButton';

export type CharacterEditorModalType =
    | {
          type: typeof create;
      }
    | {
          type: typeof update;
          stateId: string;
      };

export const characterEditorModalAtom = atom<CharacterEditorModalType | null>(null);

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
    const [atomValue, setAtomValue] = useAtom(characterEditorModalAtom);
    const setCommandEditorModal = useUpdateAtom(commandEditorModalAtom);
    const setRoomState = useSetRoomStateWithImmer();
    const isMyCharacter = useIsMyCharacter();
    const characters = useCharacters();
    const boolParamNames = useBoolParamNames();
    const numParamNames = useNumParamNames();
    const strParamNames = useStrParamNames();
    const participants = useParticipants();
    let stateEditorParams: StateEditorParams<CharacterState | undefined>;
    switch (atomValue?.type) {
        case create:
        case undefined:
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

    if (
        boolParamNames == null ||
        numParamNames == null ||
        strParamNames == null ||
        participants == null ||
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
                delete roomState.characters[atomValue.stateId];
            });
            setAtomValue(null);
        };
    }

    return (
        <Modal
            width={1000}
            title={atomValue?.type === create ? 'キャラクターの新規作成' : 'キャラクターの編集'}
            visible={atomValue != null}
            closable
            onCancel={() => setAtomValue(null)}
            footer={
                <DrawerFooter
                    close={{
                        textType: atomValue?.type === create ? 'cancel' : 'close',
                        onClick: () => setAtomValue(null),
                    }}
                    ok={onOkClick == null ? undefined : { textType: 'create', onClick: onOkClick }}
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
                                        <span>{participants.get(atomValue.stateId)?.name}</span>
                                        {createdByMe && (
                                            <span style={{ paddingLeft: 2, fontWeight: 'bold' }}>
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
                            />
                        }
                    />

                    <EditorGroupHeader>共通パラメーター</EditorGroupHeader>

                    <Row
                        leftContent='名前'
                        rightContent={
                            <BufferedInput
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
                        const value = character.numParams[key];
                        const maxValue = character.numMaxParams[key];
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
                                                const param = character?.numParams[key];
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
                        const value = character.boolParams[key];
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
                                                const param = character?.boolParams[key];
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
                        const value = character.strParams[key];
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
                                                const param = character?.strParams[key];
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

                <div className={flexAuto} style={{ paddingLeft: 60 }}>
                    <div>
                        <EditorGroupHeader>メモ</EditorGroupHeader>

                        <BufferedTextArea
                            size='small'
                            bufferDuration='default'
                            value={character.memo}
                            rows={10}
                            disableResize
                            onChange={e =>
                                updateCharacter(character => {
                                    if (character == null) {
                                        return;
                                    }
                                    character.memo = e.currentValue;
                                })
                            }
                        />

                        {createdByMe && (
                            <>
                                <EditorGroupHeader>変数</EditorGroupHeader>

                                <CharacterVarInput
                                    character={character}
                                    rows={10}
                                    disableResize
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

                                <Button
                                    onClick={() =>
                                        setCommandEditorModal({
                                            characterId: atomValue.stateId,
                                        })
                                    }
                                >
                                    編集
                                </Button>
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
            </div>

            <FilesManagerDrawer
                drawerType={filesManagerDrawerType}
                onClose={() => setFilesManagerDrawerType(null)}
            />
        </Modal>
    );
};
