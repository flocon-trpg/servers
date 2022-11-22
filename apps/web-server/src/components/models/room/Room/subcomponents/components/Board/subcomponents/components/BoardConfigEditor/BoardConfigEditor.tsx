import { Checkbox, InputNumber } from 'antd';
import React from 'react';
import { roomConfigAtom } from '@/atoms/roomConfigAtom/roomConfigAtom';
import { BoardConfig } from '@/atoms/roomConfigAtom/types/boardConfig';
import { RoomConfigUtils } from '@/atoms/roomConfigAtom/types/roomConfig/utils';
import { ColorPickerButton } from '@/components/ui/ColorPickerButton/ColorPickerButton';
import {
    Table,
    TableCombinedRow,
    TableDivider,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';
import { useImmerUpdateAtom } from '@/hooks/useImmerUpdateAtom';
import { Styles } from '@/styles';
import { rgba } from '@/utils/rgba';
import { BoardType } from '@/utils/types';

const NonTransparentStyle: React.CSSProperties = {
    background: Styles.backgroundColor,
};

export const BoardConfigEditor: React.FC<{
    boardId: string;
    boardType: BoardType;
    boardConfig: BoardConfig;
}> = ({ boardId, boardType, boardConfig }) => {
    const setRoomConfig = useImmerUpdateAtom(roomConfigAtom);

    const createLabelVisibilityCheckbox = (
        label: string,
        key:
            | 'showCharacterPieceLabel'
            | 'showDicePieceLabel'
            | 'showImagePieceLabel'
            | 'showPortraitPieceLabel'
            | 'showShapePieceLabel'
            | 'showStringPieceLabel'
    ) => {
        return (
            <TableRow label={label}>
                <Checkbox
                    checked={boardConfig[key]}
                    onChange={e => {
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            RoomConfigUtils.editBoard(
                                roomConfig,
                                boardId,
                                boardType,
                                boardConfig => {
                                    boardConfig[key] = e.target.checked;
                                }
                            );
                        });
                    }}
                >
                    表示
                </Checkbox>
            </TableRow>
        );
    };

    return (
        <Table>
            <TableHeader>セル</TableHeader>
            <TableRow>
                <Checkbox
                    checked={boardConfig.showGrid}
                    onChange={e => {
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            RoomConfigUtils.editBoard(
                                roomConfig,
                                boardId,
                                boardType,
                                boardConfig => {
                                    boardConfig.showGrid = e.target.checked;
                                }
                            );
                        });
                    }}
                >
                    表示
                </Checkbox>
            </TableRow>
            <TableRow label='線の太さ'>
                <InputNumber
                    value={boardConfig.gridLineTension}
                    onChange={e => {
                        if (e == null) {
                            return;
                        }
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            RoomConfigUtils.editBoard(
                                roomConfig,
                                boardId,
                                boardType,
                                boardConfig => {
                                    boardConfig.gridLineTension = e;
                                }
                            );
                        });
                    }}
                />
            </TableRow>
            <TableRow label='色'>
                {/* ↓ trigger='click' にすると、SketchPickerを開いている状態でPopover全体を閉じたときに次にSketchPickerが開かず（開き直したら直る）操作性が悪いため、'click'は用いていない */}
                <ColorPickerButton
                    buttonStyle={NonTransparentStyle}
                    buttonContent={boardConfig.gridLineColor}
                    color={boardConfig.gridLineColor}
                    onChange={e => {
                        if (boardId == null) {
                            return;
                        }
                        setRoomConfig(roomConfig => {
                            if (roomConfig == null) {
                                return;
                            }
                            RoomConfigUtils.editBoard(
                                roomConfig,
                                boardId,
                                boardType,
                                boardConfig => {
                                    boardConfig.gridLineColor = rgba(e.rgb);
                                }
                            );
                        });
                    }}
                />
            </TableRow>

            <TableHeader>コマのラベル</TableHeader>
            {createLabelVisibilityCheckbox('キャラクターコマ', 'showCharacterPieceLabel')}
            {createLabelVisibilityCheckbox('立ち絵コマ', 'showPortraitPieceLabel')}
            {createLabelVisibilityCheckbox('画像コマ', 'showImagePieceLabel')}
            {createLabelVisibilityCheckbox('ダイスコマ', 'showDicePieceLabel')}
            {createLabelVisibilityCheckbox('文字列コマ', 'showStringPieceLabel')}
            {createLabelVisibilityCheckbox('図形コマ', 'showShapePieceLabel')}
            <TableDivider />
            <TableCombinedRow>
                <div style={{ color: 'gray' }}>
                    これらの設定は個人設定です。他のユーザーには影響しません。
                </div>
            </TableCombinedRow>
        </Table>
    );
};
