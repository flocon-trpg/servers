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

export const DialogFooter: React.FC<Props> = ({ close, ok, destroy }: Props) => {
    if (close == null && ok == null && destroy == null) {
        return null;
    }

    let closeButton: JSX.Element | null = null;
    if (close != null) {
        let closeText: string;
        switch (close.textType) {
            case 'close':
                closeText = '閉じる';
                break;
            case 'cancel':
                closeText = 'キャンセル';
                break;
        }
        closeButton = (
            <Button
                onClick={() => {
                    if (close.onClick != null) {
                        close.onClick();
                    }
                }}
                style={{ marginLeft: 8 }}
            >
                {closeText}
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
        let okText: string;
        switch (ok.textType) {
            case 'create':
                okText = '作成';
                break;
            case 'loading':
                okText = '読み込み中';
                break;
            case 'ok':
                okText = 'OK';
                break;
            case 'post':
                okText = '投稿する';
                break;
        }
        okButton = (
            <Button
                onClick={() => {
                    ok.onClick();
                }}
                disabled={ok.disabled ?? false}
                type='primary'
                style={{ marginLeft: 8 }}
            >
                {okText}
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
