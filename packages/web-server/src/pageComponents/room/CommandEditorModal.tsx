import { mapToRecord, recordToMap } from '@flocon-trpg/utils';
import { Button, Input, Modal, Select } from 'antd';
import React from 'react';
import { useCharacter } from '../../hooks/state/useCharacter';
import { useReadonlyRef } from '../../hooks/useReadonlyRef';
import { useSelector } from '../../store';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useBufferValue } from '../../hooks/useBufferValue';
import { testCommand } from '../../utils/command';
import { useOperate } from '../../hooks/useOperate';
import { privateCommandsDiff, simpleId } from '@flocon-trpg/core';
import { useDispatch } from 'react-redux';
import { roomDrawerAndPopoverAndModalModule } from '../../modules/roomDrawerAndPopoverAndModalModule';
import classNames from 'classnames';
import { flex, flexRow } from '../../utils/className';
import { characterUpdateOperation } from '../../utils/characterUpdateOperation';
import { usePrevious } from 'react-use';
import { characterCommandLibSource } from '../../monaco/characterCommandLibSource';
import { defaultLibSource } from '../../monaco/defaultLibSource';

/*
Monaco Editorでは、複数のエディターごとに異なるextraLibなどを個別に設定することはできない( https://github.com/microsoft/monaco-editor/issues/2098 , https://stackoverflow.com/questions/53881473/monaco-editor-configure-libs-by-editor )。
そのため、Monaco Editorを表示する要素はすべてシングルトンとして管理することで、状況に応じてextraLibを差し替えることを可能にしている。
*/

type EditorProps = {
    script: string;
    onChange: (newValue: string) => void;
    extraLib: 'defaultCommand' | 'characterCommand';
};

const Editor: React.FC<EditorProps> = ({ script, onChange, extraLib }: EditorProps) => {
    const monaco = useMonaco();
    const previousExtraLib = usePrevious(extraLib);
    React.useEffect(() => {
        if (monaco == null) {
            return;
        }
        if (previousExtraLib === extraLib) {
            return;
        }
        const opts = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            ...opts,
            noLib: true,
            allowTsExtensions: true,
        });
        monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);
        switch (extraLib) {
            case 'characterCommand':
                monaco.languages.typescript.typescriptDefaults.addExtraLib(
                    characterCommandLibSource
                );
                break;
            default:
                monaco.languages.typescript.typescriptDefaults.addExtraLib(defaultLibSource);
                break;
        }
    }, [monaco, extraLib, previousExtraLib]);

    const [scriptState, setScriptState] = React.useState(script);
    React.useEffect(() => {
        setScriptState(script);
    }, [script]);
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
                language='typescript'
                value={scriptState}
                height='70vh'
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
    $v: 1;
    $r: 1;
    name: string;
    value: string;
};

// シングルトンとして使わなければならないことに注意（理由はこのコードの上部）
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
    const privateCommandsAsArray = [...privateCommands].sort(([, x], [, y]) =>
        x.name.localeCompare(y.name)
    );
    const [selectedKeyState, setSelectedKeyState] = React.useState<string | undefined>();
    React.useEffect(() => {
        setSelectedKeyState(undefined);
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
            const newState = new Map(privateCommands);
            const found = newState.get(key);
            if (found == null) {
                return privateCommands;
            }
            newState.set(key, { ...found, value: command });
            return newState;
        });
    };

    const setCommandName = (key: string, name: string) => {
        setPrivateCommands(privateCommands => {
            const newState = new Map(privateCommands);
            const found = newState.get(key);
            if (found == null) {
                return privateCommands;
            }
            newState.set(key, { ...found, name });
            return newState;
        });
    };

    if (commandEditorModalType == null) {
        return <Modal width={modalWidth} visible={false} />;
    }

    const options = () => {
        if (character == null) {
            return null;
        }
        return privateCommandsAsArray.map(([key, value]) => (
            <Select.Option key={key} value={key}>
                {value.name}
            </Select.Option>
        ));
    };

    const firstPrivateCommand = privateCommandsAsArray[0];
    const selectedKey = selectedKeyState ?? firstPrivateCommand?.[0];
    const privateCommand = selectedKey == null ? undefined : privateCommands.get(selectedKey);
    let editorElement: JSX.Element | null;
    if (selectedKey == null) {
        editorElement = <div>コマンドがありません。</div>;
    } else if (privateCommand == null) {
        editorElement = <div>指定されたコマンドが見つかりませんでした。</div>;
    } else {
        editorElement = (
            <>
                <Input
                    placeholder='コマンド名'
                    value={privateCommand.name}
                    onChange={e => {
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
                    extraLib='characterCommand'
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
                operate(
                    characterUpdateOperation(commandEditorModalType.characterKey, {
                        $v: 1,
                        $r: 2,
                        privateCommands: privateCommandsDiff({
                            prevState: character.privateCommands,
                            nextState: mapToRecord(privateCommands),
                        }),
                    })
                );
                dispatch(
                    roomDrawerAndPopoverAndModalModule.actions.set({ commandEditorModalType: null })
                );
            }}
            onCancel={() => close()}
        >
            <div>
                <div className={classNames(flex, flexRow)}>
                    <Select
                        value={selectedKey}
                        onSelect={x => setSelectedKeyState(x)}
                        style={{ minWidth: 100 }}
                    >
                        {options()}
                    </Select>
                    <Button
                        disabled={selectedKey == null}
                        onClick={() => {
                            if (selectedKey == null) {
                                return;
                            }
                            setPrivateCommands(privateCommands => {
                                const newState = new Map(privateCommands);
                                newState.delete(selectedKey);
                                return newState;
                            });
                        }}
                    >
                        削除
                    </Button>
                    <Button
                        onClick={() => {
                            const id = simpleId();
                            setPrivateCommands(privateCommands => {
                                if (privateCommands.has(id)) {
                                    return privateCommands;
                                }
                                privateCommands.set(id, {
                                    $v: 1,
                                    $r: 1,
                                    name: '新規作成コマンド',
                                    value: '',
                                });
                                return privateCommands;
                            });
                            setSelectedKeyState(id);
                        }}
                    >
                        新規作成
                    </Button>
                </div>
                {editorElement}
            </div>
        </Modal>
    );
};
