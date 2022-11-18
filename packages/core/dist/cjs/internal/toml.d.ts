import { Result } from '@kizahasi/result';
import { LocalDate as TomlLocalDate, LocalDateTime as TomlLocalDateTime, LocalTime as TomlLocalTime, OffsetDateTime as TomlOffsetDateTime } from '@ltd/j-toml';
export declare const parseToml: (toml: string) => import("@kizahasi/result").Error<string> | import("@kizahasi/result").Ok<unknown>;
export declare const isValidVarToml: (toml: string) => Result<undefined>;
export declare const getVariableFromVarTomlObject: (tomlObject: unknown, path: ReadonlyArray<string>) => import("@kizahasi/result").Error<string> | import("@kizahasi/result").Ok<string | number | TomlLocalDate | TomlLocalDateTime | TomlLocalTime | TomlOffsetDateTime | Record<string, unknown> | null | undefined>;
/** @deprecated We no longer use TOML in chat palettes. */
export declare const generateChatPalette: (toml: string) => Result<string[]>;
//# sourceMappingURL=toml.d.ts.map