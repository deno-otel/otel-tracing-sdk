import { getSpan } from "https://deno.land/x/otel_tracing_api@v0.0.3/context.ts";
import { getEmptyTraceState } from "../deps.ts";
import {
  Decision,
  SamplerAPI,
  SamplingParameters,
  SamplingResult,
} from "./sampler.ts";

const TraceIdForSamplingMax = 0x00ffffffffffffn;

const traceIdSegmentToInt = (
  traceId: Uint8Array,
  start = 0,
  end: number = traceId.length - 1
): bigint => {
  const range = [
    Math.max(0, Math.min(start, end)),
    Math.min(Math.max(start, end), traceId.length),
  ];
  return traceId
    .slice(range[0], range[1] + 1)
    .reduce((acc, cur) => (acc << 8n) + BigInt(cur), 0n);
};

export class TraceIdRatioBasedSampler implements SamplerAPI {
  constructor(private numerator: number, private denominator: number) {}

  getDescription(): string {
    return `TraceIdRatioBased{${(this.numerator / this.denominator).toFixed(
      6
    )}}`;
  }

  shouldSample({ context }: SamplingParameters): SamplingResult {
    const span = getSpan(context);
    const spanContext = span?.getSpanContext();
    if (spanContext === undefined) {
      return {
        decision: Decision.DROP,
        attributes: null,
        traceState: getEmptyTraceState(),
      };
    }
    const { traceId } = spanContext;

    const traceIdForSampling = traceIdSegmentToInt(traceId, 0, 6);

    if (traceIdForSampling < TraceIdForSamplingMax) {
      return {
        decision: Decision.RECORD_AND_SAMPLE,
        traceState: spanContext.traceState,
        attributes: null,
      };
    }
    return {
      decision: Decision.DROP,
      traceState: spanContext.traceState,
      attributes: null,
    };
  }
}
