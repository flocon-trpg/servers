import { mapToRecord, recordToArray, recordToMap } from '@kizahasi/util';
import { Button, Input, Modal, Select } from 'antd';
import React from 'react';
import { useCharacter } from '../../hooks/state/useCharacter';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { useSelector } from '../../store';
import MonacoEditor from '@monaco-editor/react';
import { simpleId } from '../../utils/generators';
import { useBufferValue } from '../../hooks/useBufferValue';
import { testCommand } from '../../utils/command';
import { useOperate } from '../../hooks/useOperate';
import { privateCommandsDiff, update } from '@kizahasi/flocon-core';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';

type EditorProps = {
    script: string;
    onChange: (newValue: string) => void;
};

const Editor: React.FC<EditorProps> = ({ script, onChange }: EditorProps) => {
    const [scriptState, setScriptState] = React.useState(script);
    const [errorMarkers, setErrorMarkers] = React.useState<{ message: string }[]>([]);
    const { isSkipping, currentValue } = useBufferValue({
        value: scriptState,
        bufferDuration: 1000,
    });
    const bottomElement = React.useMemo(() => {
        const errorMarker = errorMarkers[0];
        if (errorMarker != null) {
            return <div>{errorMarker.message}</div>;
        }
        const testResult = testCommand(currentValue);
        if (testResult.isError) {
            return <div>{testResult.error}</div>;
        }
        return <div>文法エラーなし</div>;
    }, [currentValue, errorMarkers]);

    return (
        <>
            <MonacoEditor
                language="typescript"
                value={scriptState}
                height="70vh"
                onChange={newValue => {
                    if (newValue == null) {
                        return;
                    }
                    setScriptState(newValue);
                    onChange(newValue);
                }}
                onValidate={markers => {
                    setErrorMarkers(markers.filter(m => m.severity >= 8));
                }}
            />
            {isSkipping ? <div>編集中…</div> : bottomElement}
        </>
    );
};

type CommandState = {
    $version: 1;
    name: string;
    value: string;
};

export const CommandEditorModal: React.FC = () => {
    const modalWidth = 10000;

    const operate = useOperate();
    const dispatch = useDispatch();
    const commandEditorModalType = useSelector(
        state => state.roomDrawerAndPopoverAndModalModule.commandEditorModalType
    );
    const character = useCharacter(commandEditorModalType?.characterKey);
    const characterRef = useReadonlyRef(character);
    const [privateCommands, setPrivateCommands] = React.useState<Map<string, CommandState>>(
        new Map()
    );
    const [selectedKey, setSelectedKey] = React.useState<string | undefined>();
    React.useEffect(() => {
        setSelectedKey(undefined);
        if (commandEditorModalType == null) {
            return;
        }
        if (characterRef.current == null) {
            return;
        }
        setPrivateCommands(recordToMap(characterRef.current.privateCommands));
    }, [commandEditorModalType, characterRef]);

    const setCommandValue = (key: string, command: string) => {
        setPrivateCommands(privateCommands => {
            const found = privateCommands.get(key);
            if (found == null) {
                return privateCommands;
            }
            privateCommands.set(key, { ...found, value: command });
            return privateCommands;
        });
    };

    const setCommandName = (key: string, name: string) => {
        setPrivateCommands(privateCommands => {
            const found = privateCommands.get(key);
            if (found == null) {
                return privateCommands;
            }
            privateCommands.set(key, { ...found, name });
            return privateCommands;
        });
    };

    if (commandEditorModalType == null) {
        return <Modal width={modalWidth} visible={false} />;
    }

    const options = () => {
        if (character == null) {
            return null;
        }
        return recordToArray(character.privateCommands)
            .sort((x, y) => x.value.name.localeCompare(y.value.name))
            .map(pair => (
                <Select.Option key={pair.key} value={pair.key}>
                    {pair.value.name}
                </Select.Option>
            ));
    };

    const privateCommand = selectedKey == null ? undefined : privateCommands.get(selectedKey);
    let editorElement: JSX.Element | null;
    if (selectedKey == null) {
        editorElement = <div>コマンドを選択してください。</div>;
    } else if (privateCommand == null) {
        editorElement = <div>指定されたコマンドが見つかりませんでした。</div>;
    } else {
        editorElement = (
            <>
                <Input
                    placeholder="コマンド名"
                    value={privateCommand.name}
                    onChange={e => {
                        if (selectedKey == null) {
                            return;
                        }
                        setCommandName(selectedKey, e.target.value);
                    }}
                />
                <Editor
                    script={privateCommand.value}
                    onChange={newValue => {
                        if (selectedKey == null || newValue == null) {
                            return;
                        }
                        setCommandValue(selectedKey, newValue);
                    }}
                />
            </>
        );
    }

    const close = () => {
        Modal.confirm({
            content:
                '閉じてもよろしいですか？もしコマンドに変更があった場合、その変更は破棄されます。',
            onOk: () => {
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({ commandEditorModalType: null })
                );
            },
        });
    };

    return (
        <Modal
            width={modalWidth}
            visible
            maskClosable={false}
            onOk={() => {
                if (character == null) {
                    return;
                }
                operate({
                    $version: 1,
                    characters: {
                        [commandEditorModalType.characterKey.createdBy]: {
                            [commandEditorModalType.characterKey.id]: {
                                type: update,
                                update: {
                                    $version: 1,
                                    privateCommands: privateCommandsDiff({
                                        prevState: character.privateCommands,
                                        nextState: mapToRecord(privateCommands),
                                    }),
                                },
                            },
                        },
                    },
                });
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({ commandEditorModalType: null })
                );
            }}
            onCancel={() => close()}
        >
            <div>
                <Select
                    value={selectedKey}
                    onSelect={x => setSelectedKey(x)}
                    style={{ minWidth: 100 }}
                >
                    {options()}
                </Select>
                <Button
                    onClick={() => {
                        const id = simpleId();
                        setPrivateCommands(privateCommands => {
                            if (privateCommands.has(id)) {
                                return privateCommands;
                            }
                            privateCommands.set(id, {
                                $version: 1,
                                name: '新規作成コマンド',
                                value: '',
                            });
                            return privateCommands;
                        });
                        setSelectedKey(id);
                    }}
                >
                    追加
                </Button>
                {editorElement}
            </div>
        </Modal>
    );
};
