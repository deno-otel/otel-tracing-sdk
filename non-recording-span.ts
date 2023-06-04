import {
  SpanAPI,
  SpanAttributes,
  SpanContextAPI,
  SpanEvent,
  SpanKind,
  SpanLink,
  SpanStatus,
  StatusCode,
} from "./deps.ts";

export class NonRecordingSpan implements SpanAPI {
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

  private constructor(spanContext: SpanContextAPI, attributes: SpanAttributes) {
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
  }

  static fromSpanContext(
    spanContext: SpanContextAPI,
    attributes?: SpanAttributes | null,
  ): NonRecordingSpan {
    return new NonRecordingSpan(
      spanContext,
      attributes ?? new SpanAttributes(),
    );
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
  isRecording(): boolean {
    return false;
  }
}
