import React from 'react';
import { interval } from 'rxjs';
import { OnChangeParams } from '../../components/BufferedInput';
import { BufferedTextArea } from '../../components/BufferedTextArea';

const Main: React.FC = () => {
    const [changelog, setChangelog] = React.useState<OnChangeParams[]>([]);
    const [value, setValue] = React.useState<string>('init text');
    React.useEffect(() => {
        interval(3000).subscribe(i => {
            setValue('new text ' + i);
        });
    }, []);

    return (
        <div>
            <BufferedTextArea
                value={value}
                bufferDuration='default'
                onChange={e => {
                    setChangelog(state => [...state, e]);
                }}
            />
            <div>
                {changelog.map((log, i) => (
                    <div
                        key={i}
                    >{`previousValue: ${log.previousValue}, currentValue: ${log.currentValue}`}</div>
                ))}
            </div>
        </div>
    );
};

export default Main;
