import { Button } from 'antd';
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

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
}

const DrawerFooter: React.FC<Props> = ({ close, ok }: Props) => {
    if (close == null && ok == null) {
        return null;
    }

    let okButton: JSX.Element | null = null;
    if (ok != null) {
        okButton = (
            <Button 
                onClick={() => {
                    ok.onClick();
                }} 
                disabled={ok.disabled ?? false} 
                type="primary">
                {ok.textType}
            </Button>);
    }
    let closeButton: JSX.Element | null = null;
    if (close != null) {
        closeButton = (
            <Button onClick={() => {
                if (close.onClick != null) {
                    close.onClick();
                }
            }} style={{ marginRight: okButton == null ? 0 : 8 }}>
                {close.textType}
            </Button>);
    }

    return (
        <div
            style={{ textAlign: 'right' }}>
            {closeButton}
            {okButton}
        </div>
    );
};

export default DrawerFooter;