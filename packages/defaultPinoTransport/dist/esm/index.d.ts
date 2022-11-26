/// <reference types="node" />
export declare const notice = "notice";
export declare const LOG_FORMAT = "LOG_FORMAT";
declare const transport: () => import("stream").Transform & import("pino-abstract-transport").OnUnknown;
/** pinoのJSONではなく、比較的見やすい形でconsoleに出力します。 */
export default transport;
//# sourceMappingURL=index.d.ts.map