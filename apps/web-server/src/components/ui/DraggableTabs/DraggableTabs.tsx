import { Tabs, TabsProps } from 'antd';
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const dndItemKey = 'key';

type WrapTabNodeProps = {
    dndType: string;
    index: string;
    children?: React.ReactNode;
    onDnd: (move: { from: string; to: string }) => void;
};

const WrapTabNode: React.FC<WrapTabNodeProps> = ({
    dndType,
    index,
    children,
    onDnd,
}: WrapTabNodeProps) => {
    const [, drag] = useDrag(
        {
            type: dndType,
            end: (_, monitor) => {
                const dropResult = monitor.getDropResult();
                const draggedItemKey = (dropResult as any)?.[dndItemKey] as string | undefined;
                if (draggedItemKey == null) {
                    return;
                }
                if (index === draggedItemKey) {
                    return;
                }
                onDnd({ from: index, to: draggedItemKey });
            },
        },
        [dndType, index]
    );
    const [, drop] = useDrop({
        accept: dndType,
        drop: () => ({ [dndItemKey]: index }),
    });

    return (
        <div ref={drop}>
            <div ref={drag}>{children}</div>
        </div>
    );
};

type PropsSource = {
    dndType: string;
    onDnd: (move: { from: string; to: string }) => void;
} & TabsProps;
type Props = Omit<PropsSource, 'renderTabBar'>;

export const DraggableTabs: React.FC<Props> = (props: Props) => {
    const { dndType, onDnd, ...tabsProps } = props;

    const tabBarChildren = React.useCallback(
        (node: any) => (
            <WrapTabNode key={node.key} index={node.key} dndType={dndType} onDnd={onDnd}>
                {node}
            </WrapTabNode>
        ),
        [dndType, onDnd]
    );
    const renderTabBar: TabsProps['renderTabBar'] = React.useCallback(
        (props, DefaultTabBar) => <DefaultTabBar {...props}>{tabBarChildren}</DefaultTabBar>,
        [tabBarChildren]
    );

    return <Tabs {...tabsProps} renderTabBar={renderTabBar} />;
};
