import { ExportResult, Exporter, SpanAPI } from "../deps.ts";

export interface SpanExporterAPI extends Exporter<SpanAPI> {
  export(spans: SpanAPI[]): Promise<ExportResult>;
  shutdown(): Promise<void>;
  forceFlush(): Promise<void>;
}
