import { Button, Modal } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { flex, flexRow, justifyEnd } from '@/styles/className';

type CloseTextType = 'close' | 'cancel';
type OkTextType = 'ok' | 'create' | 'post' | 'loading';

type Props = {
    close?: {
        textType: CloseTextType;
        onClick?: () => void;
        disabled?: boolean;
    };
    ok?: {
        textType: OkTextType;
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
    custom?: React.ReactNode;
};

export const DialogFooter: React.FC<Props> = ({ close, ok, destroy, custom }: Props) => {
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
                    if (close.disabled === true) {
                        return;
                    }
                    close.onClick && close.onClick();
                }}
                disabled={close.disabled ?? false}
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
                    if (destroy.disabled === true) {
                        return;
                    }
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
                disabled={destroy.disabled ?? false}
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
                    if (ok.disabled === true) {
                        return;
                    }
                    ok.onClick();
                }}
                disabled={ok.disabled ?? false}
                type='primary'
            >
                {okText}
            </Button>
        );
    }

    return (
        <div className={classNames(flex, flexRow, justifyEnd)} style={{ gap: '0 8px' }}>
            {closeButton}
            {custom}
            {destroyButton}
            {okButton}
        </div>
    );
};
