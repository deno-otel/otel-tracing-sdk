import { SpanAPI } from "../deps.ts";
import { SpanExporterAPI } from "../span-exporters/api.ts";
import { SpanProcessorAPI } from "./api.ts";

export class SimpleSpanProcessor implements SpanProcessorAPI {
  private isShutdown = false;
  constructor(private exporter: SpanExporterAPI) {}

  onStart(): void {}

  onEnd(span: SpanAPI): void {
    if (this.isShutdown) {
      return;
    }
    this.exporter.export([span]);
  }

  shutdown(): Promise<void> {
    if (this.isShutdown) {
      return Promise.resolve();
    }
    this.isShutdown = true;
    return this.exporter.shutdown();
  }

  forceFlush(): Promise<void> {
    if (this.isShutdown) {
      return Promise.resolve();
    }
    return this.exporter.forceFlush();
  }
}
