import _ from 'lodash';
import React from 'react';

type Props = {
    // 戻り値にはkeyを付けなければならない。また、minHeightをprops.minHeight以上の値にしなければならない。
    source: ReadonlyArray<JSX.Element>;
    height: number;
    elementMinHeight: number;
};

function useSkipAndTake<T>(array: ReadonlyArray<T>, skipCount: number, thenTakeCount: number) {
    const [cache, setCache] = React.useState<ReadonlyArray<T>>(
        _(array).drop(skipCount).take(thenTakeCount).value()
    );
    React.useEffect(() => {
        setCache(_(array).drop(skipCount).take(thenTakeCount).value());
    }, [array, skipCount, thenTakeCount]);
    return { result: cache, hasMore: skipCount + thenTakeCount < array.length };
}

const heightMultiplier = 3;

function PagenationScroll({ source, height, elementMinHeight }: Props): JSX.Element | null {
    if (elementMinHeight <= 0) {
        throw new Error('elementMinHeight <= 0');
    }

    const threshold = elementMinHeight * 2;

    const countPerPage = Math.ceil(height / elementMinHeight);
    const [skipCount, setSkipCount] = React.useState(0);

    const { result, hasMore } = useSkipAndTake(
        source,
        skipCount,
        Math.max(countPerPage * heightMultiplier, 0)
    );

    if (height <= 0) {
        return null;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height,
                overflowX: 'hidden',
                overflowY: 'scroll',
                overscrollBehavior: 'contain',
            }}
            onScroll={e => {
                const target = e.target as HTMLTextAreaElement;
                if (target.scrollHeight - target.scrollTop <= target.clientHeight + threshold) {
                    if (hasMore) {
                        setSkipCount(oldValue => oldValue + countPerPage);
                    }
                    return;
                }
                if (target.scrollTop < threshold && skipCount > 0) {
                    setSkipCount(oldValue => Math.max(0, oldValue - countPerPage));
                    return;
                }
            }}
        >
            {result}
        </div>
    );
}

export default PagenationScroll;
