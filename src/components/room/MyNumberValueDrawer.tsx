import { Checkbox, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Character from '../../stateManagers/states/character';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { simpleId } from '../../utils/generators';
import { OperationElement, replace } from '../../stateManagers/states/types';
import InputFile from '../InputFile';
import { FilePath } from '../../generated/graphql';
import { DrawerProps } from 'antd/lib/drawer';
import { boardDrawerType, create, myNumberValueDrawerType, update } from './RoomComponentsState';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { FilesManagerDrawerType } from '../../utils/types';
import { Gutter } from 'antd/lib/grid/row';
import { Room } from '../../stateManagers/states/room';
import { Board } from '../../stateManagers/states/board';
import { Participant } from '../../stateManagers/states/participant';
import { useStateEditor } from '../../hooks/useStateEditor';
import { MyNumberValue } from '../../stateManagers/states/myNumberValue';
import { createStateMap } from '../../@shared/StateMap';
import { __ } from '../../@shared/collection';
import { Piece } from '../../stateManagers/states/piece';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    me: Participant.State;
    myUserUid: string;
}

const defaultMyNumberValue: MyNumberValue.State = {
    value: 0,
    isValuePrivate: false,
    pieces: createStateMap(),
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const MyNumberValueDrawer: React.FC<Props> = ({ me, myUserUid }: Props) => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);

    const drawerType = componentsState.myNumberValueDrawerType;

    const { state, setState, stateToCreate } = useStateEditor(drawerType?.type === update ? me.myNumberValues.get(drawerType.stateKey) : null, defaultMyNumberValue, ({ prevState, nextState }) => {
        if (drawerType?.type !== update) {
            return;
        }
        const diff = MyNumberValue.diff({ prev: prevState, next: nextState });
        const operation = Room.createPostOperationSetup();
        const myNumberValues = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
        myNumberValues.set(drawerType.stateKey, { type: update, operation: diff });
        const participantsOperation: Participant.PostOperation = {
            myNumberValues,
        };
        operation.participants.set(myUserUid, participantsOperation);
        operate(operation);
    });

    let onCreate: (() => void) | undefined = undefined;
    // drawerType != nullを付けていることで、updateから閉じる際に一瞬onCreateボタンが出るのを防いでいる。ただし、これで適切なのかどうかは吟味していない
    if (drawerType != null && stateToCreate !== undefined) {
        onCreate = () => {
            if (componentsState.myNumberValueDrawerType?.type !== create) {
                return;
            }

            const id = simpleId();
            const operation = Room.createPostOperationSetup();
            const pieces = createStateMap<Piece.State>();
            pieces.set(componentsState.myNumberValueDrawerType.boardKey, componentsState.myNumberValueDrawerType.piece);
            const newValue: MyNumberValue.State = {
                ...stateToCreate,
                pieces,
            };
            const myNumberValues = new Map<string, OperationElement<MyNumberValue.State, MyNumberValue.PostOperation>>();
            myNumberValues.set(id, { type: replace, newValue });
            const participantsOperation: Participant.PostOperation = {
                myNumberValues,
            };
            operation.participants.set(myUserUid, participantsOperation);
            operate(operation);
            dispatch({ type: myNumberValueDrawerType, newValue: null });
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={stateToCreate === undefined ? '数値コマの新規作成' : '数値コマの編集'}
            visible={drawerType != null}
            closable
            onClose={() => dispatch({ type: myNumberValueDrawerType, newValue: null })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: stateToCreate === undefined ? 'close' : 'cancel',
                        onClick: () => dispatch({ type: myNumberValueDrawerType, newValue: null })
                    })}
                    ok={onCreate == null ? undefined : ({ textType: 'create', onClick: onCreate })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値</Col>
                    <Col span={inputSpan}>
                        <InputNumber size='small' value={state.value ?? 0} onChange={e => {
                            if (typeof e !== 'number') {
                                return;
                            }
                            setState({ ...state, value: e });
                        }} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>値を非公開にする</Col>
                    <Col span={inputSpan}>
                        <Checkbox checked={state.isValuePrivate} onChange={e => setState({ ...state, isValuePrivate: e.target.checked })} />
                    </Col>
                </Row>
            </div>
        </Drawer>
    );
};

export default MyNumberValueDrawer;