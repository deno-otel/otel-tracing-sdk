import {
  SpanAPI,
  SpanAttributes,
  SpanEvent,
  SpanKind,
  SpanLink,
  SpanStatus,
  StatusCode,
} from "./deps.ts";
import { SpanContext } from "./span-context.ts";

export class NonRecordingSpan implements SpanAPI {
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

  private constructor(spanContext: SpanContext, attributes: SpanAttributes) {
    this.name = "";
    this.spanContext = spanContext;
    this.parent = null;
    this.spanKind = SpanKind.INTERNAL;
    this.start = 0;
    this.end = null;
    this.attributes = attributes ?? new SpanAttributes();
    this.links = [];
    this.events = [];
    this.status = { code: StatusCode.UNSET };
    this.isRecording = false;
  }

  static fromSpanContext(
    spanContext: SpanContext,
    attributes?: SpanAttributes | null
  ): NonRecordingSpan {
    return new NonRecordingSpan(
      spanContext,
      attributes ?? new SpanAttributes()
    );
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
