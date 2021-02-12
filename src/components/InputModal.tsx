import { Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';

type Props = {
    title?: string;
    label?: string;
    visible: boolean;
    onOk: (value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    onClose: (setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    onOpen?: (setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    disabled?: (value: string) => boolean;
}

const InputModal: React.FC<Props> = ({ title, label, visible, onOk: onOkCore, onClose, onOpen, disabled }: Props) => {
    const [value, setValue] = React.useState('');
    const [disabledValue, setDisabledValue] = React.useState(disabled == null ? false : disabled(''));
    const prevVisible = React.useRef(visible);
    const onOpenRef = React.useRef(onOpen);

    React.useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    React.useEffect(() => {
        const onOpen = onOpenRef.current;
        if (onOpen == null) {
            return;
        }
        if (visible) {
            onOpen(setValue);
        }
    }, [visible]);

    React.useEffect(() => {
        const prevVisibleCurrent = prevVisible.current;
        prevVisible.current = visible;
        if (!prevVisibleCurrent && visible) {
            setDisabledValue(disabled == null ? false : disabled(''));
        }
    }, [visible, disabled]);

    const onOk = () => {
        if (disabledValue) {
            return;
        }
        onOkCore(value, setValue);
        setDisabledValue(disabled == null ? false : disabled(''));
    };

    // className='cancel-rnd'がないと、RoomMessageComponent内でInputModalを表示した際に、ドラッグするとカーソルの位置に関わらずメッセージウィンドウが動いてしまう。
    return (
        <Modal
            className='cancel-rnd'
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