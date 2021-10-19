import { Button, Modal } from 'antd';
import React from 'react';

type closeTextType = 'close' | 'cancel';
type okTextType = 'ok' | 'create' | 'post' | 'loading';

type Props = {
    close?: {
        textType: closeTextType;
        onClick?: () => void;
    };
    ok?: {
        textType: okTextType;
        onClick: () => void;
        disabled?: boolean;
    };
    destroy?: {
        onClick: () => void;
        modal?: {
            title?: React.ReactNode;
            content?: React.ReactNode;
        };
        disabled?: boolean;
    };
};

export const DrawerFooter: React.FC<Props> = ({ close, ok, destroy }: Props) => {
    if (close == null && ok == null && destroy == null) {
        return null;
    }

    let closeButton: JSX.Element | null = null;
    if (close != null) {
        closeButton = (
            <Button
                onClick={() => {
                    if (close.onClick != null) {
                        close.onClick();
                    }
                }}
                style={{ marginLeft: 8 }}
            >
                {close.textType}
            </Button>
        );
    }

    let destroyButton: JSX.Element | null = null;
    if (destroy != null) {
        destroyButton = (
            <Button
                onClick={() => {
                    if (destroy.onClick != null) {
                        if (destroy.modal == null) {
                            destroy.onClick();
                            return;
                        }
                        Modal.confirm({
                            title: destroy.modal.title,
                            content: destroy.modal.content,
                            onOk: () => {
                                destroy.onClick();
                            },
                            okButtonProps: {
                                danger: true,
                            },
                            okText: '削除',
                            cancelText: 'キャンセル',
                            closable: true,
                            maskClosable: true,
                        });
                    }
                }}
                style={{ marginLeft: 8 }}
                danger
            >
                削除
            </Button>
        );
    }

    let okButton: JSX.Element | null = null;
    if (ok != null) {
        okButton = (
            <Button
                onClick={() => {
                    ok.onClick();
                }}
                disabled={ok.disabled ?? false}
                type='primary'
                style={{ marginLeft: 8 }}
            >
                {ok.textType}
            </Button>
        );
    }

    return (
        <div style={{ textAlign: 'right' }}>
            {closeButton}
            {destroyButton}
            {okButton}
        </div>
    );
};
