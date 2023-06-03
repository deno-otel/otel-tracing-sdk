import {
  AttributeCollection,
  TraceState,
  ContextAPI,
  SpanKind,
  SpanLink,
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
  attributes: AttributeCollection;
  links: SpanLink[];
}

export interface SamplingResult {
  decision: Decision;
  attributes: AttributeCollection | null;
  traceState: TraceState;
}

export interface SamplerAPI {
  getDescription(): string;
  shouldSample(params: SamplingParameters): SamplingResult;
}
