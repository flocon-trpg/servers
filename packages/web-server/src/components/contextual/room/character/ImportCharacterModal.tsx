import { CharacterState, characterState, simpleId } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Alert, Modal } from 'antd';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { BufferedTextArea } from '../../../ui/BufferedTextArea';
import { DrawerFooter } from '../../../ui/DrawerFooter';
import * as E from 'fp-ts/Either';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { formatValidationErrors } from '../../../../utils/io-ts/io-ts-reporters';
import classNames from 'classnames';
import { flex, flexColumn } from '../../../../utils/className';

export const importCharacterModalVisibilityAtom = atom(false);

export const ImportCharacterModal: React.FC = () => {
    const [visibility, setVisibility] = useAtom(importCharacterModalVisibilityAtom);
    const [value, setValue] = React.useState('');
    const [parsed, setParsed] = React.useState<Result<CharacterState>>();
    React.useEffect(() => {
        if (value.trim() === '') {
            setParsed(undefined);
            return;
        }
        let json: unknown;
        try {
            json = JSON.parse(value);
        } catch (e) {
            setParsed(Result.error(`JSONをパースできませんでした - ${e}`));
            return;
        }
        const decoded = E.mapLeft(formatValidationErrors)(characterState.decode(json));
        if (decoded._tag === 'Left') {
            setParsed(Result.error(decoded.left));
            return;
        }
        setParsed(Result.ok(decoded.right));
    }, [value]);
    const setRoomState = useSetRoomStateWithImmer();
    const myUserUid = useMyUserUid();

    return (
        <Modal
            width={800}
            title={'キャラクターのインポート'}
            visible={visibility}
            closable
            onCancel={() => setVisibility(false)}
            footer={
                <DrawerFooter
                    close={{
                        textType: 'cancel',
                        onClick: () => setVisibility(false),
                    }}
                    ok={{
                        textType: 'create',
                        onClick: () => {
                            if (parsed?.value == null || myUserUid == null) {
                                return;
                            }
                            setRoomState(roomState => {
                                const id = simpleId();
                                roomState.characters[id] = {
                                    ...parsed.value,
                                    ownerParticipantId: myUserUid,
                                    pieces: {},
                                    portraitPieces: {},
                                };
                            });
                            setValue('');
                            setVisibility(false);
                        },
                        disabled: parsed?.value == null,
                    }}
                />
            }
        >
            <div className={classNames(flex, flexColumn)}>
                <div>
                    インポートしたキャラクターの作成者は常に自分になります(この仕様は後で変更されるかもしれません)。
                </div>
                <BufferedTextArea
                    value={value}
                    onChange={e => {
                        setValue(e.currentValue);
                    }}
                    bufferDuration='short'
                    placeholder='ここにJSONをペーストしてください。'
                    disableResize
                    spellCheck={false}
                    rows={15}
                    bottomElement={() => null}
                />
                <div>
                    {parsed?.error != null && (
                        <Alert type='error' showIcon message={parsed.error} />
                    )}
                </div>
            </div>
        </Modal>
    );
};
