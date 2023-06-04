import {
  createSpanContext,
  getEmptyTraceState,
  SpanAPI,
  SpanAttributes,
  SpanContextAPI,
  SpanEvent,
  SpanKind,
  SpanLink,
  SpanStatus,
  StatusCode,
  TraceFlags,
} from "./deps.ts";

export class NoOpSpan implements SpanAPI {
  readonly name: string;
  readonly spanContext: SpanContextAPI;
  readonly parent: SpanAPI | SpanContextAPI | null;
  readonly spanKind: SpanKind.INTERNAL;
  readonly start: number;
  readonly end: number | null;
  readonly attributes: SpanAttributes;
  readonly links: SpanLink[];
  readonly events: SpanEvent[];
  readonly status: SpanStatus;

  constructor(traceId: Uint8Array, spanId: Uint8Array) {
    this.name = "";
    this.spanContext = createSpanContext({
      traceId,
      spanId,
      traceFlags: TraceFlags.NONE,
      traceState: getEmptyTraceState(),
      isRemote: false,
    });

    this.parent = null;
    this.spanKind = SpanKind.INTERNAL;
    this.start = 0;
    this.end = null;
    this.attributes = new SpanAttributes();
    this.links = [];
    this.events = [];
    this.status = { code: StatusCode.UNSET };
  }

  isRecording(): boolean {
    return false;
  }
  getSpanContext(): SpanContextAPI {
    return this.spanContext;
  }
  setAttribute(): void {}
  setAttributes(): void {}
  addLink(): void {}
  addEvent(): void {}
  recordException(): void {}
  setStatus(): void {}
  updateName(): void {}
  endSpan(): void {}
}
