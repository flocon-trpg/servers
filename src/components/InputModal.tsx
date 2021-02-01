import { Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';

type Props = {
    title?: string;
    label?: string;
    visible: boolean;
    onOk: (value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    onClose: (setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    disabled?: (value: string) => boolean;
}

const InputModal: React.FC<Props> = ({ title, label, visible, onOk: onOkCore, onClose, disabled }: Props) => {
    const [value, setValue] = React.useState('');
    const [disabledValue, setDisabledValue] = React.useState(disabled == null ? false : disabled(''));
    const prevVisible = React.useRef(visible);

    React.useEffect(() => {
        const prevVisibleCurrent = prevVisible.current;
        prevVisible.current = visible;
        if (!prevVisibleCurrent && visible) {
            setValue('');
            setDisabledValue(disabled == null ? false : disabled(''));
        }
    }, [visible, disabled]);

    const onOk = () => {
        if (disabledValue) {
            return;
        }
        onOkCore(value, setValue);
        setValue('');
        setDisabledValue(disabled == null ? false : disabled(''));
    };

    return (
        <Modal
            visible={visible}
            title={title}
            onOk={onOk}
            okButtonProps={(disabledValue ? { disabled: true } : undefined)}
            onCancel={() => onClose(setValue)}>
            <div>
                <div>{label}</div>
                <Input
                    autoFocus
                    value={value}
                    onChange={e => {
                        setValue(e.target.value);
                        setDisabledValue(disabled == null ? false : disabled(e.target.value));
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            onOk();
                        }
                    }} />
            </div>
        </Modal>);
};

export default InputModal;