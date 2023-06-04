import { TraceFlags } from "https://deno.land/x/w3_trace_context@v1.2.0/trace-flags.ts";
import { TraceState } from "https://deno.land/x/w3_trace_state@v1.1.0/trace_state.ts";
import { SpanAPI, SpanContextAPI } from "./deps.ts";

export const getHexstring = (uArray: Uint8Array) => {
  return [...uArray]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .padStart(uArray.length * 2, "0");
};

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
