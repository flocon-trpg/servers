import React from 'react';
import { Radio } from 'antd';
import { usePixelRectToCompositeRect } from '../../../../../../hooks/usePixelRectToCompositeRect';
import { CompositeRect } from '../../../../../../utils/positionAndSizeAndRect';
import { useCellRectToCompositeRect } from '../../../../../../hooks/useCellRectToCompositeRect';
import produce from 'immer';

type StateBase = CompositeRect & {
    isCellMode: boolean;
};

type Props<T extends StateBase> = {
    value: T;
    onChange: (newValue: T) => void;
    boardId: string;
};

export const IsCellModeSelector = <T extends StateBase>({ value, onChange, boardId }: Props<T>) => {
    const cellRect = usePixelRectToCompositeRect({ boardId, pixelRect: value });
    const pixelRect = useCellRectToCompositeRect({ boardId, cellRect: value });

    return (
        <Radio.Group
            value={value.isCellMode}
            disabled={cellRect == null || pixelRect == null}
            onChange={e => {
                const newGroupValue = e.target.value;
                let newValue: T;
                switch (newGroupValue) {
                    case true: {
                        newValue = produce(value, value => {
                            if (cellRect == null) {
                                return;
                            }
                            value.isCellMode = true;
                            value.cellH = cellRect.cellH;
                            value.cellW = cellRect.cellW;
                            value.cellX = cellRect.cellX;
                            value.cellY = cellRect.cellY;
                        });
                        break;
                    }
                    case false: {
                        newValue = produce(value, value => {
                            if (pixelRect == null) {
                                return;
                            }
                            value.isCellMode = false;
                            value.h = pixelRect.h;
                            value.w = pixelRect.w;
                            value.x = pixelRect.x;
                            value.y = pixelRect.y;
                        });
                        break;
                    }
                    default:
                        return;
                }
                onChange(newValue);
            }}
        >
            <Radio.Button value={true}>セルにスナップさせる</Radio.Button>
            <Radio.Button value={false}>セルにスナップさせない</Radio.Button>
        </Radio.Group>
    );
};
