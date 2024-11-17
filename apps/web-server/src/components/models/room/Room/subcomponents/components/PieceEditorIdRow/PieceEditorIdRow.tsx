import React from 'react';
import { TableRow } from '@/components/ui/Table/Table';

export const PieceEditorIdRow: React.FC<{ pieceId: string | undefined }> = ({ pieceId }) => {
    return <TableRow label="ID">{pieceId ?? '(なし)'}</TableRow>;
};
