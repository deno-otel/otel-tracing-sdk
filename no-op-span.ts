import {
  SpanAPI,
  SpanAttributes,
  SpanEvent,
  SpanKind,
  SpanLink,
  SpanStatus,
  StatusCode,
  getEmptyTraceState,
} from "./deps.ts";
import { SpanContext } from "./span-context.ts";

export class NoOpSpan implements SpanAPI {
  readonly name: string;
  readonly spanContext: SpanContext;
  readonly parent: SpanAPI | SpanContext | null;
  readonly spanKind: SpanKind.INTERNAL;
  readonly start: number;
  readonly end: number | null;
  readonly attributes: SpanAttributes;
  readonly links: SpanLink[];
  readonly events: SpanEvent[];
  readonly status: SpanStatus;
  readonly isRecording: boolean;

  constructor(traceId: Uint8Array, spanId: Uint8Array) {
    this.name = "";
    this.spanContext = new SpanContext(
      traceId,
      spanId,
      0,
      getEmptyTraceState(),
      false
    );

    this.parent = null;
    this.spanKind = SpanKind.INTERNAL;
    this.start = 0;
    this.end = null;
    this.attributes = new SpanAttributes();
    this.links = [];
    this.events = [];
    this.status = { code: StatusCode.UNSET };
    this.isRecording = false;
  }

  getSpanContext(): SpanContext {
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
