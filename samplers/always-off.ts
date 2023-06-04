import { getSpan } from "../context.ts";
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
