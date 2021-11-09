import React from 'react';
import { Button, Drawer, Row, Col, Checkbox, Alert } from 'antd';
import { recordToArray } from '@flocon-trpg/utils';
import _ from 'lodash';
import { useParticipants } from '../../hooks/state/useParticipants';
import { useMyUserUid } from '../../hooks/useMyUserUid';
import { DrawerFooter } from '../../layouts/DrawerFooter';
import { Gutter } from 'antd/lib/grid/row';
import { cancelRnd, flex, flexNone, flexRow, itemsCenter } from '../../utils/className';
import classNames from 'classnames';
import { roomAtom } from '../../atoms/room/roomAtom';
import { useAtomSelector } from '../../atoms/useAtomSelector';

type PrivateMessageDrawerProps = {
    visible: boolean;
    selectedParticipants: ReadonlySet<string>;
    onChange: (selectedParticipants: ReadonlySet<string>) => void;
    onClose: () => void;
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 18;

// TODO: playerの場合、characterの情報も一緒に載せたほうがわかりやすい
const PrivateMessageDrawer: React.FC<PrivateMessageDrawerProps> = ({
    visible,
    selectedParticipants,
    onChange,
    onClose,
}: PrivateMessageDrawerProps) => {
    const myUserUid = useMyUserUid();
    const participants = useAtomSelector(roomAtom,state => state.roomState?.state?.participants);

    if (myUserUid == null || participants == null) {
        return null;
    }

    return (
        <Drawer
            className={cancelRnd}
            width={600}
            title='秘話の送信先'
            visible={visible}
            closable
            onClose={() => onClose()}
            footer={
                <DrawerFooter
                    close={{
                        textType: 'close',
                        onClick: () => onClose(),
                    }}
                />
            }
        >
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>送信先</Col>
                    <Col span={inputSpan}>
                        <div>
                            {recordToArray(participants).length <= 1
                                ? '(自分以外の入室者がいません)'
                                : recordToArray(participants)
                                      .filter(pair => myUserUid !== pair.key)
                                      .sort((x, y) =>
                                          (x.value.name ?? '').localeCompare(y.value.name ?? '')
                                      )
                                      .map(pair => {
                                          return (
                                              <React.Fragment key={pair.key}>
                                                  <Checkbox
                                                      checked={selectedParticipants.has(pair.key)}
                                                      onChange={newValue => {
                                                          const newSelectedParticipants = new Set(
                                                              selectedParticipants
                                                          );
                                                          if (newValue.target.checked) {
                                                              newSelectedParticipants.add(pair.key);
                                                          } else {
                                                              newSelectedParticipants.delete(
                                                                  pair.key
                                                              );
                                                          }
                                                          onChange(newSelectedParticipants);
                                                      }}
                                                  >
                                                      {pair.value.name}
                                                  </Checkbox>
                                                  <br />
                                              </React.Fragment>
                                          );
                                      })}
                        </div>
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col span={inputSpan}>
                        {selectedParticipants.size === 0 ? (
                            <Alert
                                message='送信先のユーザーが選択されていないため、独り言になります。独り言を使うことで、自分の考えをログに残すことができます。'
                                type='info'
                                showIcon
                            />
                        ) : null}
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

type Props = {
    titleStyle?: React.CSSProperties;
    participantIdsOfSendTo: ReadonlySet<string>;
    onParticipantIdsOfSendToChange: (newValue: ReadonlySet<string>) => void;
};

export const PrivateMessageChannelSelector: React.FC<Props> = ({
    titleStyle,
    participantIdsOfSendTo,
    onParticipantIdsOfSendToChange,
}: Props) => {
    const participants = useParticipants();
    const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
    const selectedParticipantsBase = React.useMemo(
        () =>
            _([...participantIdsOfSendTo])
                .map(id => {
                    const found = participants?.get(id);
                    if (found == null) {
                        return null;
                    }
                    return [id, found] as const;
                })
                .compact()
                .sort(([, x], [, y]) => (x.name ?? '').localeCompare(y.name ?? ''))
                .value(),
        [participantIdsOfSendTo, participants]
    );
    const selectedParticipantElements = React.useMemo(
        () =>
            selectedParticipantsBase.map(([id, participant]) => {
                return (
                    <div key={id} style={{ maxWidth: '60px' }}>
                        {participant.name}
                    </div>
                );
            }),
        [selectedParticipantsBase]
    );

    return (
        <div className={classNames(flexNone, flex, flexRow, itemsCenter)}>
            <PrivateMessageDrawer
                visible={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                selectedParticipants={participantIdsOfSendTo}
                onChange={x => onParticipantIdsOfSendToChange(x)}
            />
            <div style={titleStyle}>送信先</div>
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'row' }}>
                {selectedParticipantElements.length === 0
                    ? '(自分のみ)'
                    : selectedParticipantElements}
            </div>
            <Button style={{ flex: '0 0 auto' }} onClick={() => setIsDrawerVisible(true)}>
                編集
            </Button>
            <div style={{ flex: 1 }} />
        </div>
    );
};
