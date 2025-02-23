import { z } from 'zod';
import { filePathValue } from '../filePath/types';

export const FilePath = 'FilePath';

// 将来、カスタム画像以外(例: 白背景など)にも対応できるように、unionに移行可能な形で定義している。
export const cardImageValue = z.object({
    $v: z.literal(1),
    $r: z.literal(1),

    type: z.literal(FilePath),
    filePath: filePathValue,
});
