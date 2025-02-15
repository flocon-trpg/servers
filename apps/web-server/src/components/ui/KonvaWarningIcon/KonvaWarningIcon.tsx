import { App, ModalFuncProps } from 'antd';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { PixelRect } from '@/components/models/room/Room/subcomponents/utils/positionAndSizeAndRect';
import { useImage } from '@/hooks/imageHooks';

type Props = {
    modal?: Pick<ModalFuncProps, 'content'>;
} & PixelRect;

export const KonvaWarningIcon: React.FC<Props> = ({ x, y, w, h, modal: modalProp }) => {
    const warningImage = useImage('/assets/warning.png', { skipAnalyzeUrl: true });
    const warningImageValue = warningImage.type === 'success' ? warningImage.image : undefined;
    const warningImageWidth = w * 0.3;
    const warningImageHeight = h * 0.3;
    const { modal } = App.useApp();

    return (
        <ReactKonva.Group x={x} y={y} width={w} height={h}>
            <ReactKonva.Rect fill="gray" x={0} y={0} width={w} height={h} />
            <ReactKonva.Image
                image={warningImageValue}
                x={(w - warningImageWidth) / 2}
                y={(h - warningImageHeight) / 2}
                width={warningImageWidth}
                height={warningImageHeight}
                onMouseEnter={e => {
                    if (modalProp == null) {
                        return;
                    }

                    const stage = e.target.getStage();
                    if (stage == null) {
                        return;
                    }
                    const container = stage.container();
                    container.style.cursor = 'pointer';
                }}
                onMouseLeave={e => {
                    const stage = e.target.getStage();
                    if (stage == null) {
                        return;
                    }
                    const container = stage.container();
                    container.style.cursor = 'default';
                }}
                onClick={() => {
                    if (modalProp == null) {
                        return;
                    }

                    modal.warning({
                        ...modalProp,
                        maskClosable: true,
                        okType: 'default',
                        autoFocusButton: 'ok',
                        title: 'エラーの内容',
                    });
                }}
            />
        </ReactKonva.Group>
    );
};
