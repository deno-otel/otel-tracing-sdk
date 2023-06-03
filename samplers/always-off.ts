import { getSpan } from "https://deno.land/x/otel_tracing_api@v0.0.3/context.ts";
import { getEmptyTraceState } from "../deps.ts";
import {
  Decision,
  SamplerAPI,
  SamplingParameters,
  SamplingResult,
} from "./sampler.ts";

export class AlwaysOffSampler implements SamplerAPI {
  getDescription(): string {
    return "AlwaysOffSampler";
  }

  shouldSample({ context }: SamplingParameters): SamplingResult {
    const span = getSpan(context);

    const traceState =
      span === null ? getEmptyTraceState() : span.getSpanContext().traceState;

    return {
      decision: Decision.DROP,
      attributes: null,
      traceState,
    };
  }
}
