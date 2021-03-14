import { Input } from 'antd';
import { InputProps } from 'antd/lib/input';
import React from 'react';
import { Subject, Subscription } from 'rxjs';
import { auditTime, debounceTime } from 'rxjs/operators';
import useConstant from 'use-constant';

// Inputの制御は、Controlled（useStateなどを用いて値をInputにわたす）ではなくUncontrolled（DOMを直接操作）を採用している。
// 現段階の状態ではControlledでも書けるが、collaborative editingを実現するためにはカーソルの自動移動も必要だと考えられ、この場合はおそらくDOM操作が必須になる。これを見越してUncontrolledで書いている。

export type OnChangeParams = {
    previousValue: string;
    currentValue: string;
}

export type Props = Omit<InputProps, 'defaultValue' | 'value' | 'ref' | 'onChange'> & {
    value: string;
    bufferDuration: number | 'default' | 'short';
    onChange: (params: OnChangeParams) => void;
};

const CollaborativeInput: React.FC<Props> = (props: Props) => {
    const { value, bufferDuration: bufferDurationCore, onChange } = props;

    if (bufferDurationCore < 0) {
        throw 'bufferDurationCore < 0';
    }

    let bufferDuration: number | null;
    switch (bufferDurationCore) {
        case 'default':
            bufferDuration = 500;
            break;
        case 'short':
            bufferDuration = 100;
            break;
        default:
            bufferDuration = bufferDurationCore === 0 ? null : bufferDurationCore;
            break;
    }

    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const ref = React.useRef<Input>(null);
    const subject = useConstant(() => new Subject<string>());
    const [, setSubscription] = React.useState<Subscription>();
    const [changeParams, setChangeParams] = React.useState<{ previousValue?: string; currentValue: string }>({ currentValue: value });

    React.useEffect(() => {
        if (ref.current == null) {
            return;
        }

        const inputValue = ref.current.input.value;
        if (inputValue !== value) {
            setChangeParams({ currentValue: value });
            ref.current.setValue(value);
        }
    }, [value]);

    React.useEffect(() => {
        const newSubscription = (bufferDuration == null ? subject : subject.pipe(debounceTime(bufferDuration))).subscribe(newValue => setChangeParams(oldResult => {
            return {
                previousValue: oldResult.currentValue,
                currentValue: newValue,
            };
        }));
        setSubscription(oldSubscription => {
            oldSubscription?.unsubscribe();
            return newSubscription;
        });
        return (() => {
            newSubscription.unsubscribe();
        });
    }, [subject, bufferDuration, value]);

    React.useEffect(() => {
        if (changeParams.previousValue !== undefined) {
            onChangeRef.current({
                previousValue: changeParams.previousValue,
                currentValue: changeParams.currentValue,
            });
        }
    }, [changeParams]);

    return (
        <Input {...props} value={undefined} ref={ref} defaultValue={undefined} onChange={e => {
            subject.next(e.currentTarget.value);
        }} />
    );
};

export default CollaborativeInput;