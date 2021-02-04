import { Drawer } from 'antd';
import React from 'react';
import { interval } from 'rxjs';
import useConstant from 'use-constant';
import BufferedInput from '../../foundations/BufferedInput';
import { BufferResult } from '../../hooks/useBuffer';

const Main: React.FC = () => {
    const [changelog, setChangelog] = React.useState<BufferResult<string>[]>([]);
    const onChange = useConstant(() => (e: BufferResult<string>) => {
        setChangelog(state => [...state, e]);
    });
    const [value, setValue] = React.useState<string>('init text');
    const [valueKey, setValueKey] = React.useState(0);
    React.useEffect(() => {
        interval(3000).subscribe(() => {
            setValue('new text');
            setValueKey(i => i + 1);
        });
    }, []);

    return <div>
        <BufferedInput value={value} onChange={onChange} valueKey={valueKey} />
        <div>
            {changelog.map((log, i) => <div key={i}>{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}. isReset: ${log.isReset}`}</div>)}
        </div>
    </div>;
};

export default Main;