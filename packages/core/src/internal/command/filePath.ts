import {
    FType,
    FValue,
    ScriptError,
    beginCast,
    FObject,
    FRecord,
    FString,
    AstInfo,
} from '@flocon-trpg/flocon-script';
import * as FilePath from '../ot/flocon/filePath/types';
import { State } from '../ot/generator';

export const toFFilePath = (
    source: State<typeof FilePath.filePathTemplate>,
    astInfo: AstInfo | undefined
): FObject => {
    const result = new FRecord();
    result.set({ property: new FString('path'), newValue: new FString(source.path), astInfo });
    result.set({
        property: new FString('sourceType'),
        newValue: new FString(source.sourceType),
        astInfo,
    });
    return result;
};

export const toFilePathOrUndefined = (
    source: FValue,
    astInfo: AstInfo | undefined
): State<typeof FilePath.filePathTemplate> | undefined => {
    if (source === undefined) {
        return undefined;
    }
    if (source?.type !== FType.Object) {
        throw new ScriptError();
    }
    const path = beginCast(source.get({ property: new FString('path'), astInfo }), astInfo)
        .addString()
        .cast();
    const sourceType = beginCast(
        source.get({ property: new FString('sourceType'), astInfo }),
        astInfo
    )
        .addString()
        .cast();
    if (sourceType !== FilePath.Default && sourceType !== FilePath.FirebaseStorage) {
        throw new ScriptError(
            `File type must be '${FilePath.Default}' or '${FilePath.FirebaseStorage}'`,
            astInfo?.range
        );
    }
    return {
        $v: 1,
        $r: 1,
        path,
        sourceType,
    };
};

export const toFilePath = (
    source: FValue,
    astInfo: AstInfo | undefined
): State<typeof FilePath.filePathTemplate> => {
    const result = toFilePathOrUndefined(source, astInfo);
    if (result === undefined) {
        throw new ScriptError();
    }
    return result;
};
