import { SpanAPI } from "../deps.ts";

export enum ExportResult {
  SUCCESS,
  FAILUER,
}

export interface SpanExporterAPI {
  export(spans: SpanAPI[]): Promise<ExportResult>;
  shutdown(): Promise<void>;
  forceFlush(): Promise<void>;
}
