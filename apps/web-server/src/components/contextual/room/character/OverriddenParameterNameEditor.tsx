import { Button, Tooltip } from 'antd';
import React from 'react';
import * as Icons from '@ant-design/icons';
import { BufferedInput } from '../../../ui/BufferedInput';
import classNames from 'classnames';
import { flex, flexRow } from '../../../../utils/className';
import { InputDescription } from '../../../ui/InputDescription';

type PropsBase = {
    style?: React.CSSProperties;
    className?: string;
    overriddenParameterName: string | undefined;
    onOverriddenParameterNameChange: (newValue: string | undefined) => void;
};

type Props = PropsBase &
    (
        | {
              type: 'editor';
              baseName: string;
          }
        | {
              type: 'table';
          }
    );

export const OverriddenParameterNameEditor: React.FC<Props> = ({
    style,
    className,
    overriddenParameterName,
    onOverriddenParameterNameChange,
    ...restProps
}: Props) => {
    let overriddenParameterNameArea: JSX.Element | null;
    if (overriddenParameterName == null) {
        if (restProps.type === 'editor') {
            overriddenParameterNameArea = (
                <Tooltip title='クリックすることで、このキャラクターにのみ代わりに用いられる変数名を設定できます。'>
                    <Button size='small' onClick={() => onOverriddenParameterNameChange('')}>
                        <Icons.EditOutlined />
                    </Button>
                </Tooltip>
            );
        } else {
            overriddenParameterNameArea = null;
        }
    } else {
        overriddenParameterNameArea = (
            <>
                <Tooltip title='このキャラクターにのみ代わりに用いられている変数名です。'>
                    <BufferedInput
                        style={{ maxWidth: 80 }}
                        size='small'
                        value={overriddenParameterName ?? ''}
                        bufferDuration='default'
                        onChange={({ currentValue }) => {
                            onOverriddenParameterNameChange(currentValue);
                        }}
                    />
                </Tooltip>
                {restProps.type === 'editor' && (
                    <Button size='small' onClick={() => onOverriddenParameterNameChange(undefined)}>
                        <Icons.DeleteOutlined />
                    </Button>
                )}
            </>
        );
    }
    return (
        <div className={classNames(className, flex, flexRow)} style={style}>
            {restProps.type === 'editor' && (
                <InputDescription>
                    <div
                        style={{
                            textDecoration:
                                overriddenParameterName == null ? undefined : 'line-through',
                        }}
                    >
                        {restProps.baseName}
                    </div>
                </InputDescription>
            )}
            {overriddenParameterNameArea}
        </div>
    );
};
