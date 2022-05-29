import { State, boardTemplate, simpleId, state } from '@flocon-trpg/core';
import { Result } from '@kizahasi/result';
import { Alert, Modal } from 'antd';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { DialogFooter } from '../../../ui/DialogFooter';
import * as E from 'fp-ts/Either';
import { useSetRoomStateWithImmer } from '../../../../hooks/useSetRoomStateWithImmer';
import { useMyUserUid } from '../../../../hooks/useMyUserUid';
import { formatValidationErrors } from '../../../../utils/io-ts/io-ts-reporters';
import classNames from 'classnames';
import { flex, flexColumn } from '../../../../utils/className';
import { CollaborativeInput } from '../../../ui/CollaborativeInput';

const boardState = state(boardTemplate, { exact: true });
type BoardState = State<typeof boardTemplate>;

export const importBoardModalVisibilityAtom = atom(false);

export const ImportBoardModal: React.FC = () => {
    const [visibility, setVisibility] = useAtom(importBoardModalVisibilityAtom);
    const [value, setValue] = React.useState('');
    const [parsed, setParsed] = React.useState<Result<BoardState>>();
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
        const decoded = E.mapLeft(formatValidationErrors)(boardState.decode(json));
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
            title={'ボードのインポート'}
            visible={visibility}
            closable
            onCancel={() => setVisibility(false)}
            footer={
                <DialogFooter
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
                                if (roomState.boards == null) {
                                    roomState.boards = {};
                                }
                                roomState.boards[id] = {
                                    ...parsed.value,
                                    ownerParticipantId: myUserUid,
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
                    インポートしたボードの作成者は常に自分になります。ただしボード内に存在するコマの作成者の情報は保持されます(これらの仕様は後で変更されるかもしれません)。
                </div>
                <CollaborativeInput
                    multiline
                    value={value}
                    onChange={e => {
                        setValue(e.currentValue);
                    }}
                    bufferDuration='short'
                    placeholder='ここにJSONをペーストしてください。'
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
