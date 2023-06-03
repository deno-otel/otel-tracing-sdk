import { getSpan } from "https://deno.land/x/otel_tracing_api@v0.0.3/context.ts";
import { getEmptyTraceState } from "../deps.ts";
import {
  Decision,
  SamplerAPI,
  SamplingParameters,
  SamplingResult,
} from "./sampler.ts";

export class AlwaysOnSampler implements SamplerAPI {
  getDescription(): string {
    return "AlwaysOnSampler";
  }

  shouldSample({ context }: SamplingParameters): SamplingResult {
    const span = getSpan(context);

    const traceState =
      span === null ? getEmptyTraceState() : span.getSpanContext().traceState;

    return {
      decision: Decision.RECORD_AND_SAMPLE,
      attributes: null,
      traceState,
    };
  }
}
