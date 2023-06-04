import { getSpan } from "./context.ts";
import {
  ContextAPI,
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
import { getSpanContext, SpanContext } from "./span-context.ts";
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
    if (shouldSample.decision === Decision.DROP) {
      const newSpanContext = new SpanContext(
        traceId,
        spanId,
        0,
        shouldSample.traceState,
        false,
      );
      return NonRecordingSpan.fromSpanContext(
        newSpanContext,
        shouldSample.attributes,
      );
    } else {
      const newSpanContext = new SpanContext(
        traceId,
        spanId,
        shouldSample.decision === Decision.RECORD_AND_SAMPLE
          ? TraceFlags.SAMPLED
          : TraceFlags.NONE,
        shouldSample.traceState,
        false,
      );
      return new Span(
        {
          name: spanName,
          kind,
          attributes,
          links,
          start: startTime,
          parent: parentSpan === null ? undefined : parentSpan,
        },
        newSpanContext,
      );
    }
  }
}
