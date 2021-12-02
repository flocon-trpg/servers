import { BoardPositionState } from '@flocon-trpg/core';
import { Checkbox, Col, Row } from 'antd';
import { Gutter } from 'antd/lib/grid/row';
import React from 'react';
import { PositionEditor } from './PositionEditor';

const gutter: [Gutter, Gutter] = [16, 16];
const inputSpan = 16;

type Props = {
    state: BoardPositionState;
    onUpdate: (immerRecipe: (pieceState: BoardPositionState) => void) => void;
};

export const BoardPositionEditor: React.FC<Props> = ({ state, onUpdate }: Props) => {
    return (
        <div>
            {<PositionEditor state={state} gutter={gutter} inputSpan={inputSpan} onUpdate={onUpdate} />}
            <Row gutter={gutter} align='middle'>
                <Col flex='auto' />
                <Col flex={0}></Col>
                <Col span={inputSpan}>
                    <Checkbox
                        checked={state.isPositionLocked}
                        onChange={e =>
                            onUpdate(piece => {
                                piece.isPositionLocked = e.target.checked;
                            })
                        }
                    >
                        位置を固定する
                    </Checkbox>
                </Col>
            </Row>
        </div>
    );
};
