import { Checkbox, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import React from 'react';
import DrawerFooter from '../../layouts/DrawerFooter';
import * as Room from '../../stateManagers/states/room';
import * as Board from '../../stateManagers/states/board';
import * as Character from '../../stateManagers/states/character';
import ComponentsStateContext from './contexts/RoomComponentsStateContext';
import DispatchRoomComponentsStateContext from './contexts/DispatchRoomComponentsStateContext';
import OperateContext from './contexts/OperateContext';
import { simpleId } from '../../utils/generators';
import { replace } from '../../stateManagers/states/types';
import InputFile from '../InputFile';
import { FilePath } from '../../generated/graphql';
import { DrawerProps } from 'antd/lib/drawer';
import { boardDrawerType, create, update } from './RoomComponentsState';
import FilesManagerDrawer from '../FilesManagerDrawer';
import { FilesManagerDrawerType } from '../../utils/types';
import { Gutter } from 'antd/lib/grid/row';

const notFound = 'notFound';

const drawerBaseProps: Partial<DrawerProps> = {
    width: 600,
};

type Props = {
    roomState: Room.State;
}

const defaultBoard: Board.State = {
    name: '',
    cellColumnCount: 0,
    cellRowCount: 0,
    cellHeight: 0,
    cellWidth: 0,
    cellOffsetX: 0,
    cellOffsetY: 0,
    backgroundImageZoom: 1,
};

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

const BoardDrawer: React.FC<Props> = ({ roomState }: Props) => {
    const componentsState = React.useContext(ComponentsStateContext);
    const dispatch = React.useContext(DispatchRoomComponentsStateContext);
    const operate = React.useContext(OperateContext);
    const [board, setBoard] = React.useState<Board.State | typeof notFound>(defaultBoard);
    const [filesManagerDrawerType, setFilesManagerDrawerType] = React.useState<FilesManagerDrawerType | null>(null);

    const drawerType = componentsState.boardDrawerType;
    const boardForUseEffect = (() => {
        switch (drawerType?.type) {
            case update:
                return roomState.boards.get(drawerType.stateKey) ?? notFound;
            case create:
                return 'create';
            default:
                return null;
        }
    })();

    React.useEffect(() => {
        if (boardForUseEffect == null) {
            return;
        }
        if (boardForUseEffect === 'create') {
            setBoard(defaultBoard);
            return;
        }
        setBoard(boardForUseEffect);
    }, [boardForUseEffect]);

    if (board === notFound) {
        return (
            <Drawer
                {...drawerBaseProps}
            >
                該当するCharacterが見つかりません。
            </Drawer>
        );
    }

    // createのときは、直接setCharacterが呼ばれることでcharacterが変わる。
    // updateのときは、operateが実行されることでroomStateが変わり、useEffectによって変更が検知されてsetCharacterが呼ばれることでcharacterが変わる。
    const updateBoard = (partialState: Partial<Board.State>) => {
        switch (drawerType?.type) {
            case create:
                setBoard({ ...board, ...partialState });
                return;
            case update: {
                const diffOperation = Board.diff({ prev: board, next: { ...board, ...partialState } });
                const operation = Room.createPostOperationSetup();
                operation.boards.set(drawerType.stateKey, { type: update, operation: diffOperation });
                operate(operation);
                return;
            }
        }
    };

    let onOkClick: (() => void) | undefined = undefined;
    if (drawerType?.type === create) {
        onOkClick = () => {
            const id = simpleId();
            const operation = Room.createPostOperationSetup();
            operation.addBoards.set(id, board);
            operate(operation);
            setBoard(defaultBoard);
            dispatch({ type: boardDrawerType, newValue: null });
        };
    }

    return (
        <Drawer
            {...drawerBaseProps}
            title={drawerType?.type === create ? 'Boardの新規作成' : 'Boardの編集'}
            visible={drawerType != null}
            closable
            onClose={() => dispatch({ type: boardDrawerType, newValue: null })}
            footer={(
                <DrawerFooter
                    close={({
                        textType: drawerType?.type === create ? 'cancel' : 'close',
                        onClick: () => dispatch({ type: boardDrawerType, newValue: null })
                    })}
                    ok={onOkClick == null ? undefined : ({ textType: 'create', onClick: onOkClick })} />)}>
            <div>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>名前</Col>
                    <Col span={inputSpan}>
                        <Input size='small' value={board.name} onChange={e => updateBoard({ name: e.target.value })} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>背景画像</Col>
                    <Col span={inputSpan}>
                        <InputFile filePath={board.backgroundImage ?? undefined} onPathChange={path => updateBoard({ backgroundImage: path ?? undefined })} openFilesManager={setFilesManagerDrawerType} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>背景画像の拡大率</Col>
                    <Col span={inputSpan}>
                        <InputNumber 
                            size='small' 
                            value={board.backgroundImageZoom * 100}
                            min={0}
                            formatter={value => `${value}%`}
                            parser={value => {
                                if (value == null) {
                                    return 100;
                                }
                                const num = Number(value.replace('%', ''));
                                if (isNaN(num)) {
                                    return 100;
                                }
                                return num;
                            }}
                            onChange={newValue => typeof newValue === 'number' ? updateBoard({ backgroundImageZoom: newValue / 100 }) : undefined} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>グリッドの数</Col>
                    <Col span={inputSpan}>
                        <span>x=</span>
                        <InputNumber 
                            size='small' 
                            style={({ width: 80 })} 
                            value={board.cellColumnCount} 
                            onChange={newValue => typeof newValue === 'number' ? updateBoard({ cellColumnCount: newValue }) : undefined} />
                        <span style={({ marginLeft: 10 })}>y=</span>
                        <InputNumber 
                            size='small' 
                            style={({ width: 80 })} 
                            value={board.cellRowCount} 
                            onChange={newValue => typeof newValue === 'number' ? updateBoard({ cellRowCount: newValue }) : undefined} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>グリッドの大きさ</Col>
                    <Col span={inputSpan}>
                        {/* cellWidth === cellHeight という前提だが、もし異なる場合は代表してcellWidthの値を用いることにしている */}
                        <InputNumber size='small' value={board.cellWidth} onChange={newValue => typeof newValue === 'number' ? updateBoard({ cellWidth: newValue, cellHeight: newValue }) : undefined} />
                    </Col>
                </Row>
                <Row gutter={gutter} align='middle'>
                    <Col flex='auto' />
                    <Col flex={0}>グリッドの基準点</Col>
                    <Col span={inputSpan}>
                        <span>x=</span>
                        <InputNumber 
                            size='small' 
                            value={board.cellOffsetX} 
                            onChange={newValue => typeof newValue === 'number' ? updateBoard({ cellOffsetX: newValue }) : undefined} />
                        <span style={({ marginLeft: 10 })}>y=</span>
                        <InputNumber 
                            size='small'
                            value={board.cellOffsetY} 
                            onChange={newValue => typeof newValue === 'number' ? updateBoard({ cellOffsetY: newValue }) : undefined} />
                    </Col>
                </Row>
            </div>
            <FilesManagerDrawer drawerType={filesManagerDrawerType} onClose={() => setFilesManagerDrawerType(null)} />
        </Drawer>
    );
};

export default BoardDrawer;