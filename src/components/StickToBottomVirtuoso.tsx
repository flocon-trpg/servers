import { Button } from 'antd';
import React from 'react';
import { ItemContent, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { usePrevious } from '../hooks/usePrevious';
import { useReadonlyRef } from '../hooks/useReadonlyRef';
import { backgroundColor } from './DraggableCard';

type Props<T> = {
    items: ReadonlyArray<T>;
    create: ItemContent<T> | undefined;
    height: React.CSSProperties['height'];
};

// https://virtuoso.dev/stick-to-bottom/ を基にして作成
export function StickToBottomVirtuoso<T>({ items, create, height }: Props<T>) {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null);

    const scrollToBottom = React.useCallback(
        (itemsLength: number) => {
            if (virtuosoRef.current == null) {
                return;
            }
            virtuosoRef.current.scrollToIndex({
                index: itemsLength - 1,
                behavior: 'auto',
            });
        },
        [virtuosoRef]
    );

    const prevItemsLength = usePrevious(items.length);
    const prevItemsLengthRef = useReadonlyRef(prevItemsLength);
    const [atBottom, setAtBottom] = React.useState(false);
    const atBottomRef = useReadonlyRef(atBottom);
    const showButtonTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [showButton, setShowButton] = React.useState(false);

    React.useEffect(() => {
        if (prevItemsLengthRef.current === items.length) {
            return;
        }
        if (!atBottomRef.current) {
            return;
        }
        scrollToBottom(items.length);
    }, [atBottomRef, items.length, prevItemsLengthRef, scrollToBottom]);

    React.useEffect(() => {
        if (showButtonTimeoutRef.current != null) {
            clearTimeout(showButtonTimeoutRef.current);
        }
        if (!atBottom) {
            showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500);
        } else {
            setShowButton(false);
        }
    }, [atBottom, setShowButton]);

    return (
        <div style={{ height, position: 'relative' }}>
            <Virtuoso
                ref={virtuosoRef}
                style={{ height }}
                initialTopMostItemIndex={items.length - 1}
                data={items}
                atBottomStateChange={bottom => {
                    setAtBottom(bottom);
                }}
                itemContent={create == null ? undefined : (index, data) => create(index, data)}
                followOutput="auto"
            />
            {showButton && (
                <Button
                    size="small"
                    onClick={() => scrollToBottom(items.length)}
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        backgroundColor,
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    最下部に移動
                </Button>
            )}
        </div>
    );
}
