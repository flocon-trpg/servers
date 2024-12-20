import { Popover } from 'antd';
import classNames from 'classnames';
import * as jdenticon from 'jdenticon';
import React from 'react';
import { flex, flexColumn } from '@/styles/className';

const userUid = 'userUid';
const none = 'none';

type Props = {
    hashOrValue: string;
    size: number;
    tooltipMode?:
        | {
              type: typeof userUid;
              userName?: string;
          }
        | {
              type: typeof none;
          };
};

export const Jdenticon: React.FC<Props> = ({ hashOrValue, size, tooltipMode }: Props) => {
    const [src, setSrc] = React.useState<string>();
    React.useEffect(() => {
        setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(jdenticon.toSvg(hashOrValue, size))}`);
    }, [hashOrValue, size]);

    const content = <img src={src} width={size} height={size} />;

    if (tooltipMode?.type === none) {
        return content;
    }

    let tooltipTitle: string;
    let tooltipTitle2: string | null = null;
    if (tooltipMode?.type === userUid) {
        tooltipTitle = `ユーザーID: ${hashOrValue}`;
        if (tooltipMode.userName != null) {
            tooltipTitle2 = `ユーザー名: ${tooltipMode.userName}`;
        }
    } else {
        tooltipTitle = hashOrValue;
    }
    return (
        <Popover
            trigger="hover"
            content={
                <div className={classNames(flex, flexColumn)}>
                    <img src={src} width={70} height={70} />
                    <span>
                        {tooltipTitle}
                        {tooltipTitle2 && (
                            <>
                                <br />
                                <span>{tooltipTitle2}</span>
                            </>
                        )}
                    </span>
                </div>
            }
        >
            {content}
        </Popover>
    );
};
