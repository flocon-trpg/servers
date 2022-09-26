import { Input } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';

type Props = {
    title?: string;
    label?: string;
    visible: boolean;
    isTextArea: boolean;
    onOk: (value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    onClose: (setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    onOpen?: (setValue: React.Dispatch<React.SetStateAction<string>>) => void;
    disabled?: (value: string) => boolean;
};

export const InputModal: React.FC<Props> = ({
    title,
    label,
    visible,
    isTextArea,
    onOk: onOkCore,
    onClose,
    onOpen,
    disabled,
}: Props) => {
    const [value, setValue] = React.useState('');
    const [disabledValue, setDisabledValue] = React.useState(
        disabled == null ? false : disabled('')
    );
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
            visible={visible}
            title={title}
            onOk={onOk}
            okButtonProps={disabledValue ? { disabled: true } : undefined}
            onCancel={() => onClose(setValue)}
        >
            <div>
                <div>{label}</div>
                {!isTextArea && (
                    <Input
                        autoFocus
                        value={value}
                        onChange={e => {
                            setValue(e.target.value);
                            setDisabledValue(disabled == null ? false : disabled(e.target.value));
                        }}
                        onPressEnter={() => {
                            onOk();
                        }}
                    />
                )}
                {/* Enterキーを押したときは改行せずにonOkの処理に入るのが想定された挙動だが、isOkExecutedがないとTextAreaの文字が一瞬改行されたように見えてしまう（onOkに渡される文字は改行されていない正常なもの）。混乱や不自然さを防ぐため、isOkExecutedを用いることでTextAreaを隠している。 */}
                {isTextArea && (
                    <Input.TextArea
                        style={{ resize: 'none', height: 100 }}
                        autoFocus
                        value={value}
                        onChange={e => {
                            setValue(e.target.value);
                            setDisabledValue(disabled == null ? false : disabled(e.target.value));
                        }}
                        onPressEnter={e => {
                            if (e.shiftKey) {
                                return;
                            }
                            // これがないと、TextAreaの文字が一瞬改行されたように見えてしまう（onOkに渡される文字は、改行されていない正常なものではあるが）。
                            e.preventDefault();
                            onOk();
                        }}
                    />
                )}
            </div>
        </Modal>
    );
};
