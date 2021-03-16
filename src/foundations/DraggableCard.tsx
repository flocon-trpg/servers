import React, { PropsWithChildren } from 'react';
import { Rnd, Props as RndProps, Position, ResizableDelta } from 'react-rnd';
import { ResizeDirection } from 're-resizable';
import { CloseOutlined } from '@ant-design/icons';

// 上からheader、topElement、children、bottomElementの順で描画される。children以外はheightが固定されている。
// それぞれの要素は、styleにheightやpaddingなどが自動的に設定されたdivに包まれる。このdivのstyleは、自動的に設定されていない値であれば、*ContainerStyleというプロパティに渡すことで好きな値をセットすることができる。
// divに包んでいる理由は、
// デザインはantdのCardを参考にしているところもあるが、結構変えている。

const defaultBottomElementContainerHeight = 60;
const defaultTopElementContainerHeight = 60;
export const horizontalPadding = 24;
const headerBackgroundColor = 'rgba(32, 49, 117, 1)'; // antdのgeekblue-4と等しい
const borderColor = 'rgba(32, 49, 117, 0.4)';
const headerColor = undefined;
const backgroundColor = '#141414';
const defaultHeaderHeight = 28;
const borderWidth = 2;

type Props = {
    bottomElement?: React.ReactNode;
    bottomElementContainerHeight?: number;
    bottomElementContainerStyle?: Omit<React.CSSProperties, 'height' | 'backgroundColor'>;
    bounds?: string;
    childrenContainerStyle?: Omit<React.CSSProperties, 'height' | 'backgroundColor'>;
    position: RndProps['position'];
    size: RndProps['size'];
    onDragStop: (data: Position) => void;
    onResizeStop: (dir: ResizeDirection, delta: ResizableDelta) => void;
    // 当初、onDragStartやOnResizeStartでもトリガーするようにしていたが、reduxのmoveToFrontの処理が重いためパネルの動きが一瞬止まってしまうので却下している。
    onMoveToFront: () => void;
    onClose: () => void;
    header: string;
    headerHeight?: number;
    minHeight?: string | number;
    minWidth?: string | number;
    topElement?: React.ReactNode;
    topElementContainerHeight?: number;
    topElementContainerStyle?: Omit<React.CSSProperties, 'height' | 'backgroundColor'>;
    zIndex: number;
}

const DraggableCard: React.FC<Props> = (props: PropsWithChildren<Props>) => {
    const bottomElementContainerHeight = props.bottomElement == null ? 0 : (props.bottomElementContainerHeight ?? defaultBottomElementContainerHeight);
    const topElementContainerHeight = props.topElement == null ? 0 : (props.topElementContainerHeight ?? defaultTopElementContainerHeight);

    return (
        <Rnd
            bounds={props.bounds}
            cancel=".cancel-rnd"
            position={props.position}
            size={props.size}
            minHeight={props.minHeight}
            minWidth={props.minWidth}
            onDragStop={(e, data) => props.onDragStop(data)}
            onResizeStop={(e, dir, elementRef, delta) => props.onResizeStop(dir, delta)}
            style={({ zIndex: props.zIndex })}
            onMouseDown={e => {
                if((e.buttons & 1) !== 1) {
                    return;
                }
                props.onMoveToFront();
            }}>
            <div
                style={({
                    borderWidth: `0 ${borderWidth}px ${borderWidth}px ${borderWidth}px`,
                    borderStyle: 'solid',
                    borderColor,
                    backgroundColor,
                    height: '100%', // heightとwidthを設定することで、childrenの（親要素の）大きさがDraggableCardの大きさに連動するようになる
                    width: '100%',
                })}>
                <div
                    style={({
                        alignItems: 'center',
                        background: headerBackgroundColor,
                        color: headerColor,
                        display: 'flex', // display: flexとalignItems: centerを組み合わせることで、headerが中央に表示されるようにしている
                        fontSize: 14,
                        height: props.headerHeight ?? defaultHeaderHeight,
                        padding: `0 ${horizontalPadding}px`,
                    })}>
                    <div style={({ flex: 0, whiteSpace: 'nowrap' })}>{props.header}</div>
                    <div style={({ flex: 'auto' })} />
                    <div style={({ flex: 0, cursor: 'pointer' })} onClick={() => props.onClose()}><CloseOutlined style={({ opacity: 0.7 })} /></div>
                </div>
                <div
                    className="cancel-rnd"
                    style={({
                        ...props.topElementContainerStyle,
                        backgroundColor,
                        height: `${topElementContainerHeight}px`,
                        //padding: `6px ${horizontalPadding}px`
                    })}>
                    {props.topElement}
                </div>
                <div
                    className="cancel-rnd"
                    style={({
                        ...props.childrenContainerStyle,
                        backgroundColor,
                        height: `calc(100% - ${props.headerHeight ?? defaultHeaderHeight}px - ${topElementContainerHeight}px - ${bottomElementContainerHeight}px)`,
                        //padding: `12px ${horizontalPadding}px`,
                    })}>
                    {props.children}
                </div>
                <div
                    className="cancel-rnd"
                    style={({
                        ...props.bottomElementContainerStyle,
                        backgroundColor,
                        height: `${bottomElementContainerHeight}px`,
                        //padding: `6px ${horizontalPadding}px`
                    })}>
                    {props.bottomElement}
                </div>
            </div>
        </Rnd >
    );
};

export default DraggableCard;