import { getSpan } from "./context.ts";
import {
  ContextAPI,
  createSpanContext,
  getSpanContext,
  SpanAPI,
  SpanAttributes,
  SpanKind,
  TraceFlags,
  TracerAPI,
  TracerOptions,
} from "./deps.ts";
import { NoOpSpan } from "./no-op-span.ts";
import { NonRecordingSpan } from "./non-recording-span.ts";
import { Decision } from "./samplers/sampler.ts";
import { Span, SpanCreationParams } from "./span.ts";
import { TracerProvider } from "./tracer-provider.ts";

export class Tracer implements TracerAPI {
  constructor(
    public readonly name: string,
    private options: TracerOptions,
    private provider: TracerProvider,
  ) {}

  createSpan(
    spanName: string,
    parentContext: ContextAPI | null,
    params: SpanCreationParams = {},
  ): SpanAPI {
    const {
      kind = SpanKind.INTERNAL,
      attributes = new SpanAttributes(),
      links = [],
      startTime = Date.now(),
    } = params;

    if (parentContext === null) {
      return new NoOpSpan(
        this.provider.idGenerator.generateTraceIdBytes(),
        this.provider.idGenerator.generateSpanIdBytes(),
      );
    }

    let traceId: Uint8Array;
    const parentSpan = parentContext === null ? null : getSpan(parentContext);
    if (parentSpan === null) {
      traceId = this.provider.idGenerator.generateTraceIdBytes();
    } else {
      const parentSpanContext = getSpanContext(parentSpan);
      if (parentSpanContext.isValid === false) {
        traceId = this.provider.idGenerator.generateTraceIdBytes();
      } else {
        traceId = parentSpanContext.traceId;
      }
    }

    const shouldSample = this.provider.sampler.shouldSample({
      context: parentContext,
      traceId,
      spanKind: kind,
      links,
      attributes,
    });
    const spanId = this.provider.idGenerator.generateSpanIdBytes();
    const newSpanContext = createSpanContext({
      traceId,
      spanId,
      traceFlags: shouldSample.decision === Decision.RECORD_AND_SAMPLE
        ? TraceFlags.SAMPLED
        : TraceFlags.NONE,
      traceState: shouldSample.traceState,
      isRemote: false,
    });
    if (shouldSample.decision === Decision.DROP) {
      return NonRecordingSpan.fromSpanContext(
        newSpanContext,
        shouldSample.attributes,
      );
    } else {
      return new Span(
        {
          name: spanName,
          kind,
          attributes: shouldSample.attributes ?? new SpanAttributes(),
          links,
          start: startTime,
          parent: parentSpan === null ? undefined : parentSpan,
        },
        newSpanContext,
      );
    }
  }
}
