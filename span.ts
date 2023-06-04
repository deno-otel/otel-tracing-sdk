import {
  Attribute,
  EventAttributes,
  LinkAttributes,
  SpanAPI,
  SpanAttributes,
  SpanContextAPI,
  SpanEvent,
  SpanKind,
  SpanLink,
  SpanStatus,
  StatusCode,
  Timestamp,
} from "./deps.ts";
import { SpanContext } from "./span-context.ts";

export interface SpanCreationParams {
  kind?: SpanKind;
  attributes?: SpanAttributes;
  links?: SpanLink[];
  startTime?: Timestamp;
}

type SpanConstructorProperties = {
  name: string;
  kind: SpanKind;
  start: Timestamp;
  attributes?: SpanAttributes;
  links?: SpanLink[];
  parent?: SpanAPI | null;
};

export class Span implements SpanAPI {
  name: string;
  spanContext: SpanContextAPI;
  parent: SpanAPI | null;
  spanKind: SpanKind;
  start: number;
  end: number | null;
  attributes: SpanAttributes;
  links: SpanLink[];
  events: SpanEvent[];
  status: SpanStatus;
  isRecording: boolean;

  constructor(
    properties: SpanConstructorProperties,
    spanContext: SpanContextAPI,
  ) {
    const {
      name,
      kind,
      start,
      attributes = new SpanAttributes(),
      links = [],
    } = properties;
    this.name = name;

    this.spanKind = kind;
    this.start = start;
    this.end = null;
    this.attributes = attributes;
    this.links = links;
    this.events = [];
    this.status = { code: StatusCode.UNSET };
    this.isRecording = true;

    this.parent = properties.parent ?? null;
    this.spanContext = spanContext;
  }

  getSpanContext(): SpanContext {
    return this.spanContext;
  }

  setAttribute(key: string, value: Attribute["value"]): void {
    this.attributes.setAttribute(key, value);
  }

  setAttributes(attributes: Attribute[]): void {
    this.attributes.addAttributes(attributes);
  }

  addLink(spanContext: SpanContext, attributes = new LinkAttributes()): void {
    this.links.push({ spanContext, attributes });
    throw new Error("Method not implemented.");
  }

  addEvent(
    name: string,
    eventTime: Timestamp = Date.now(),
    attributes = new EventAttributes(),
  ): void {
    this.events.push({ name, eventTime, attributes });
  }

  recordException(exception: Error, attributes = new EventAttributes()): void {
    this.addEvent(exception.message, Date.now(), attributes);
  }

  /* Spec: https://opentelemetry.io/docs/specs/otel/trace/api/#set-status */
  setStatus(code: StatusCode, message?: string | undefined): void {
    if (this.status.code === StatusCode.OK) {
      return;
    }
    switch (code) {
      case StatusCode.UNSET:
        return;
      case StatusCode.OK:
        this.status = { code };
        return;
      case StatusCode.ERROR:
        this.status = { code, description: message };
        return;
    }
  }

  updateName(name: string): void {
    this.name = name;
  }

  endSpan(endTime?: number | undefined): void {
    this.end = endTime ?? Date.now();
    this.isRecording = false;
  }
}
