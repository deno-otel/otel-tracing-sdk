import {
  ContextAPI,
  SpanAttributes,
  SpanKind,
  SpanLink,
  TraceState,
} from "../deps.ts";

export enum Decision {
  DROP,
  RECORD_ONLY,
  RECORD_AND_SAMPLE,
}

export interface SamplingParameters {
  context: ContextAPI;
  traceId: Uint8Array;
  spanKind: SpanKind;
  attributes: SpanAttributes;
  links: SpanLink[];
}

export interface SamplingResult {
  decision: Decision;
  attributes: SpanAttributes | null;
  traceState: TraceState;
}

export interface SamplerAPI {
  getDescription(): string;
  shouldSample(params: SamplingParameters): SamplingResult;
}
