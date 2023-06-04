import { SpanAPI, TracerAPI } from "./deps.ts";
import { NoOpSpan } from "./no-op-span.ts";
import { TracerProvider } from "./tracer-provider.ts";

export class NoOpTracer implements TracerAPI {
  name = "NoOpTracer";
  constructor(private provider: TracerProvider) {}

  createSpan(): SpanAPI {
    const traceId = this.provider.idGenerator.generateTraceIdBytes();
    const spanId = this.provider.idGenerator.generateSpanIdBytes();
    return new NoOpSpan(traceId, spanId);
  }
}
