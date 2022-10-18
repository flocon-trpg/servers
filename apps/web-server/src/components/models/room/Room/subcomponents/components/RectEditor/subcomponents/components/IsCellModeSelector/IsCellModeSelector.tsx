import { Checkbox } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import produce from 'immer';
import React from 'react';
import { useLatest } from 'react-use';
import { useCellRectToCompositeRect } from '../../../../../hooks/useCellRectToCompositeRect';
import { usePixelRectToCompositeRect } from '../../../../../hooks/usePixelRectToCompositeRect';
import { CompositeRect } from '../../../../../utils/positionAndSizeAndRect';

type StateBase = CompositeRect & {
    isCellMode: boolean;
};

type Props<T extends StateBase> = {
    value: T;
    onChange: (newValue: T) => void;
    boardId: string;
    disabled?: boolean;
};

export const IsCellModeSelector = <T extends StateBase>({
    value,
    onChange,
    boardId,
    disabled,
}: Props<T>) => {
    const cellRect = usePixelRectToCompositeRect({ boardId, pixelRect: value });
    const pixelRect = useCellRectToCompositeRect({ boardId, cellRect: value });

    const onChangeCallbackDepsRef = useLatest({
        cellRect,
        pixelRect,
        value,
        onChange,
    });

    const onChangeCallback = React.useCallback(
        (e: CheckboxChangeEvent) => {
            const { value, cellRect, pixelRect, onChange } = onChangeCallbackDepsRef.current;

            const newChecked = e.target.checked;
            let newValue: T;
            switch (newChecked) {
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
        },
        [onChangeCallbackDepsRef]
    );

    return (
        <Checkbox
            checked={value.isCellMode}
            disabled={disabled === true || cellRect == null || pixelRect == null}
            onChange={onChangeCallback}
        >
            セルにスナップさせる
        </Checkbox>
    );
};
