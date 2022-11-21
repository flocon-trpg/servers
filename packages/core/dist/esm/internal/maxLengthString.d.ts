import { z } from 'zod';
export declare const maxLengthString: <N extends number>(maxLength: N) => z.ZodBranded<z.ZodString, `MaxLength${N}String`>;
export declare const maxLength100String: z.ZodBranded<z.ZodString, "MaxLength100String">;
export declare type MaxLength100String = z.TypeOf<typeof maxLength100String>;
export declare const maxLength1000String: z.ZodBranded<z.ZodString, "MaxLength1000String">;
export declare type MaxLength1000String = z.TypeOf<typeof maxLength1000String>;
declare const maxLength100EmptyString: z.TypeOf<typeof maxLength100String>;
declare const maxLength1000EmptyString: z.TypeOf<typeof maxLength1000String>;
export { maxLength100EmptyString, maxLength1000EmptyString };
//# sourceMappingURL=maxLengthString.d.ts.map