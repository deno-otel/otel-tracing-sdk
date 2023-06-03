import { Span, SpanCreationParams } from "./span.ts";
import { getSpan } from "./context.ts";
import {
  AttributeCollection,
  ContextAPI,
  SpanAPI,
  SpanAttributes,
  SpanKind,
  TracerAPI,
} from "./deps.ts";
import { NoOpSpan } from "./no-op-span.ts";

export class NoOpTracer implements TracerAPI {
  name = "NoOpTracer";
  constructor() {}

  createSpan(): SpanAPI {
    return new NoOpSpan();
  }
}
