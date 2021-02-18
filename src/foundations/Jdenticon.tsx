import React from 'react';
import * as jdenticon from 'jdenticon';
import { Tooltip } from 'antd';

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
    return <Tooltip title={tooltipTitle}><img src={src} width={size} height={size} /></Tooltip>;
};

export default Jdenticon;