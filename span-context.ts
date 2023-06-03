import { TraceFlags } from "https://deno.land/x/w3_trace_context@v1.2.0/trace-flags.ts";
import { TraceState } from "https://deno.land/x/w3_trace_state@v1.1.0/trace_state.ts";
import { SpanAPI, SpanContextAPI } from "./deps.ts";

export const getHexstring = (uArray: Uint8Array) => {
  return [...uArray]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .padStart(uArray.length * 2, "0");
};

// /**
//  * Gets the Trace ID from a SpanContext as either a hex string or an array of 16 bytes
//  */
// export function getTraceId(context: SpanContextAPI, format: "hex"): string;
// export function getTraceId(context: SpanContextAPI, format: "bin"): Uint8Array;
// export function getTraceId(context: SpanContextAPI): string;
// export function getTraceId(
//   context: SpanContextAPI,
//   format: "hex" | "bin" = "hex"
// ): Uint8Array | string {
//   const { traceId } = context;

//   return format === "bin" ? new Uint8Array(traceId) : getHexstring(traceId);
// }

// /**
//  * Gets the Span ID from a SpanContext as either a hex string or an array of 8 bytes
//  */
// export function getSpanId(context: SpanContextAPI, format: "hex"): string;
// export function getSpanId(context: SpanContextAPI, format: "bin"): Uint8Array;
// export function getSpanId(context: SpanContextAPI): string;
// export function getSpanId(
//   context: SpanContextAPI,
//   format: "hex" | "bin" = "hex"
// ): Uint8Array | string {
//   const { spanId } = context;

//   return format === "bin" ? new Uint8Array(spanId) : getHexstring(spanId);
// }

// /**
//  * Returns true if the Trace ID and Span ID in a SpanContext are valid
//  */
// export function isValid(context: SpanContext) {
//   const traceId = getTraceId(context, "bin");
//   const spanId = getSpanId(context, "bin");
//   return (
//     spanId.length === 8 &&
//     spanId.some((byte) => byte !== 0) &&
//     traceId.length === 16 &&
//     traceId.some((byte) => byte !== 0)
//   );
// }

const isSpanContext = (sp: SpanAPI | SpanContextAPI): sp is SpanContextAPI =>
  "spanId" in sp;

export const getSpanContext = (sp: SpanAPI | SpanContext): SpanContextAPI => {
  if (isSpanContext(sp)) {
    return sp;
  }
  return sp.getSpanContext();
};

export class SpanContext implements SpanContextAPI {
  constructor(
    public readonly traceId: Uint8Array,
    public readonly spanId: Uint8Array,
    public readonly traceFlags: TraceFlags,
    public readonly traceState: TraceState,
    public readonly isRemote: boolean
  ) {}

  getTraceId(format: "hex"): string;
  getTraceId(format: "bin"): Uint8Array;
  getTraceId(): string;
  getTraceId(format: "hex" | "bin" = "hex"): Uint8Array | string {
    const { traceId } = this;

    return format === "bin" ? new Uint8Array(traceId) : getHexstring(traceId);
  }
  getSpanId(format: "hex"): string;
  getSpanId(format: "bin"): Uint8Array;
  getSpanId(): string;
  getSpanId(format: "hex" | "bin" = "hex"): Uint8Array | string {
    const { spanId } = this;

    return format === "bin" ? new Uint8Array(spanId) : getHexstring(spanId);
  }

  get isValid(): boolean {
    const traceId = this.getTraceId("bin");
    const spanId = this.getSpanId("bin");
    return (
      spanId.length === 8 &&
      spanId.some((byte) => byte !== 0) &&
      traceId.length === 16 &&
      traceId.some((byte) => byte !== 0)
    );
  }
}
