import React from 'react';
import * as jdenticon from 'jdenticon';
import { Popover, Tooltip } from 'antd';

const userUid = 'userUid';

type Props = {
    hashOrValue: string;
    size: number;
    tooltipMode?: typeof userUid;
};

const Jdenticon: React.FC<Props> = ({ hashOrValue, size, tooltipMode }: Props) => {
    const [src, setSrc] = React.useState<string>();
    React.useEffect(() => {
        setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(jdenticon.toSvg(hashOrValue, size))}`);
    }, [hashOrValue, size]);

    let tooltipTitle: string;
    if (tooltipMode === userUid) {
        tooltipTitle = `ユーザーID: ${hashOrValue}`;
    } else {
        tooltipTitle = hashOrValue;
    }
    return <Popover
        trigger='hover'
        content={
            <div style={({ display: 'flex', flexDirection: 'column' })}>
                <img src={src} width={70} height={70} />
                <p>{tooltipTitle}</p>
            </div>}>
        <img src={src} width={size} height={size} />
    </Popover>;
};

export default Jdenticon;