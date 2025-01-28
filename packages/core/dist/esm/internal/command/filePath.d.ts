import { AstInfo, FObject, FValue } from '@flocon-trpg/flocon-script';
import * as FilePath from '../ot/flocon/filePath/types';
import { State } from '../ot/generator/types';
export declare const toFFilePath: (source: State<typeof FilePath.filePathTemplate>, astInfo: AstInfo | undefined) => FObject;
export declare const toFilePathOrUndefined: (source: FValue, astInfo: AstInfo | undefined) => State<typeof FilePath.filePathTemplate> | undefined;
export declare const toFilePath: (source: FValue, astInfo: AstInfo | undefined) => State<typeof FilePath.filePathTemplate>;
//# sourceMappingURL=filePath.d.ts.map