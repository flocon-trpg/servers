import { Button } from 'antd';
import React from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Styles } from '../../../styles';

type Props<T> = {
    items: ReadonlyArray<T>;
    create: ((index: number, data: T) => React.ReactNode) | undefined;
    height: React.CSSProperties['height'];
};

// https://virtuoso.dev/stick-to-bottom/ を基にして作成
export function JumpToBottomVirtuoso<T>({ items, create, height }: Props<T>) {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null);

    const scrollToBottom = (itemsLength: number) => {
        if (virtuosoRef.current == null) {
            return;
        }
        virtuosoRef.current.scrollToIndex({
            index: itemsLength - 1,
            behavior: 'auto',
        });
    };

    const [atBottom, setAtBottom] = React.useState(false);
    const showButtonTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [showButton, setShowButton] = React.useState(false);

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
                        backgroundColor: Styles.backgroundColor,
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
