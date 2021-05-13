import { Drawer } from 'antd';
import React from 'react';
import { interval } from 'rxjs';
import useConstant from 'use-constant';
import BufferedInput, { OnChangeParams } from '../../foundations/BufferedInput';
import BufferedTextArea from '../../foundations/BufferedTextArea';

const Main: React.FC = () => {
    const [changelog, setChangelog] = React.useState<OnChangeParams[]>([]);
    const [value, setValue] = React.useState<string>('init text');
    React.useEffect(() => {
        interval(3000).subscribe(i => {
            setValue('new text ' + i);
        });
    }, []);

    return <div>
        <BufferedTextArea value={value} bufferDuration='default' onChange={e => {
            setChangelog(state => [...state, e]);
        }} />
        <div>
            {changelog.map((log, i) => <div key={i}>{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}`}</div>)}
        </div>
    </div>;
};

export default Main;