import { CloseOutlined } from '@ant-design/icons';
import { animated, useSpring } from '@react-spring/web';
import { NumberSize, ResizeDirection } from 're-resizable';
import React, { PropsWithChildren } from 'react';
import { ControlPosition } from 'react-draggable';
import { Rnd, Props as RndProps } from 'react-rnd';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import {
    defaultPanelOpacity,
    minPanelOpacity,
} from '@/atoms/roomConfigAtom/types/roomConfig/resources';
import { useAtomSelector } from '@/hooks/useAtomSelector';
import { Styles } from '@/styles';
import { cancelRnd } from '@/styles/className';

// 上からheader、topElement、children、bottomElementの順で描画される。children以外はheightが固定されている。
// それぞれの要素は、styleにheightやpaddingなどが自動的に設定されたdivに包まれる。このdivのstyleは、自動的に設定されていない値であれば、*ContainerStyleというプロパティに渡すことで好きな値をセットすることができる。
// デザインはantdのCardを参考にしているところもあるが、結構変えている。

const defaultBottomElementContainerHeight = 60;
const defaultTopElementContainerHeight = 60;
export const horizontalPadding = 24;
const headerBackgroundColor = 'rgba(32, 49, 117, 1)'; // antdのgeekblue-4と等しい
const borderColor = 'rgba(32, 49, 117, 0.4)';
const headerBackgroundActiveColor = 'rgba(242, 171, 48, 1)';
const borderActiveColor = 'rgba(242, 171, 48, 0.4)';
const headerColor = undefined;
const defaultHeaderHeight = 28;
const borderWidth = 2;

type Props = {
    bottomElement?: React.ReactNode;
    bottomElementContainerHeight?: number;
    bottomElementContainerStyle?: Omit<React.CSSProperties, 'flex' | 'backgroundColor'>;
    childrenContainerStyle?: Omit<React.CSSProperties, 'flex' | 'backgroundColor'>;
    position: RndProps['position'];
    size: RndProps['size'];
    onDragStop: (data: ControlPosition) => void;
    onResizeStop: (dir: ResizeDirection, delta: NumberSize) => void;
    // 当初、onDragStartやOnResizeStartでもトリガーするようにしていたが、reduxのmoveToFrontの処理が重いためパネルの動きが一瞬止まってしまうので却下している。
    onMoveToFront: () => void;
    onClose: () => void;
    header: string;
    headerHeight?: number;
    minHeight?: string | number;
    minWidth?: string | number;
    topElement?: React.ReactNode;
    topElementContainerHeight?: number;
    topElementContainerStyle?: Omit<React.CSSProperties, 'flex' | 'backgroundColor'>;
    zIndex: number;
    // これをtrueにするとリサイズ時のパフォーマンス向上が期待できるが、ユーザー体験は損なわれる。
    // また、リサイズ中はcontent自体がなくなるため、content内で例えば'network-only'のuseQueryが初めに呼び出されるようになっている場合は無駄な処理が発生してしまう。
    hideElementsOnResize?: boolean;
    /** この値が変更されるたびに、ウィンドウの色が変わり強調表示されます。ただし `undefined` に変更されたときは除きます。 */
    highlightKey?: string | undefined;
} & PropsWithChildren;

export const DraggableCard: React.FC<Props> = (props: Props) => {
    const [styles, api] = useSpring(() => ({ headerBackgroundColor, borderColor }), []);

    React.useEffect(() => {
        if (props.highlightKey == null) {
            return;
        }
        api.start({
            to: [
                {
                    headerBackgroundColor: headerBackgroundActiveColor,
                    borderColor: borderActiveColor,
                },
                { headerBackgroundColor, borderColor },
            ],
        });
    }, [props.highlightKey, api]);

    const bottomElementContainerHeight =
        props.bottomElement == null
            ? 0
            : (props.bottomElementContainerHeight ?? defaultBottomElementContainerHeight);
    const topElementContainerHeight =
        props.topElement == null
            ? 0
            : (props.topElementContainerHeight ?? defaultTopElementContainerHeight);

    const rawPanelOpacity =
        useAtomSelector(roomConfigAtom, state => state?.panelOpacity) ?? defaultPanelOpacity;
    let panelOpacity = rawPanelOpacity;
    panelOpacity = Math.max(minPanelOpacity, panelOpacity);
    panelOpacity = Math.min(1, panelOpacity);

    const [resizing, setResizing] = React.useState(false);

    const header = (
        <animated.div
            style={{
                flex: `0 1 ${props.headerHeight ?? defaultHeaderHeight}px`,
                display: 'flex',
                alignItems: 'center',
                background: styles.headerBackgroundColor,
                color: headerColor,
                fontSize: 14,
                padding: `0 ${horizontalPadding}px`,
            }}
        >
            <div style={{ flex: 0, whiteSpace: 'nowrap' }}>{props.header}</div>
            <div style={{ flex: 'auto' }} />
            <div style={{ flex: 0, cursor: 'pointer' }} onClick={() => props.onClose()}>
                <CloseOutlined style={{ opacity: 0.7 }} />
            </div>
        </animated.div>
    );

    const hideElementsOnResize = props.hideElementsOnResize === true && resizing;

    return (
        <Rnd
            cancel={`.${cancelRnd}, .ant-modal`}
            position={props.position}
            size={props.size}
            minHeight={props.minHeight}
            minWidth={props.minWidth}
            onDragStop={(_, data) => props.onDragStop(data)}
            onResizeStart={() => setResizing(true)}
            onResizeStop={(_, dir, __, delta) => {
                props.onResizeStop(dir, delta);
                setResizing(false);
            }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: Styles.backgroundColor,
                zIndex: props.zIndex,
                opacity: panelOpacity,
            }}
            onMouseDown={e => {
                if ((e.buttons & 1) !== 1) {
                    return;
                }
                props.onMoveToFront();
            }}
        >
            {header}
            <animated.div
                className={cancelRnd}
                style={{
                    flex: 1,
                    display: 'flex',
                    borderWidth: `0 ${borderWidth}px ${borderWidth}px ${borderWidth}px`,
                    borderStyle: 'solid',
                    borderColor: styles.borderColor,
                    overflow: 'auto',
                }}
            >
                <div
                    style={{
                        ...props.topElementContainerStyle,
                        flex: `0 1 ${topElementContainerHeight}px`,
                        backgroundColor: Styles.backgroundColor,
                        //padding: `6px ${horizontalPadding}px`
                    }}
                >
                    {!hideElementsOnResize && props.topElement}
                </div>
                <div
                    style={{
                        ...props.childrenContainerStyle,
                        flex: 1,
                        backgroundColor: Styles.backgroundColor,
                        // padding: `12px ${horizontalPadding}px`,
                    }}
                >
                    {!hideElementsOnResize && props.children}
                </div>
                <div
                    style={{
                        ...props.bottomElementContainerStyle,
                        flex: `0 1 ${bottomElementContainerHeight}px`,
                        backgroundColor: Styles.backgroundColor,
                        //padding: `6px ${horizontalPadding}px`
                    }}
                >
                    {!hideElementsOnResize && props.bottomElement}
                </div>
            </animated.div>
        </Rnd>
    );
};
