import { SpanAPI } from "../deps.ts";
import { ExportResult, SpanExporterAPI } from "../span-exporters/api.ts";
import { SpanProcessorAPI } from "./api.ts";

interface Configuration {
  exporter: SpanExporterAPI;
  maxQueueSize?: number;
  scheduledDelayMillis?: number;
  exportTimeoutMillis?: number;
  maxExportBatchSize?: number;
}

export class BatchingSpanProcessor implements SpanProcessorAPI {
  private isShutdown = false;
  private config: Required<Configuration>;
  private queue: SpanAPI[] = [];
  private timer: number | null = null;

  constructor({
    exporter,
    maxQueueSize = 2048,
    scheduledDelayMillis = 5000,
    exportTimeoutMillis = 30_000,
    maxExportBatchSize = 512,
  }: Configuration) {
    this.config = {
      exporter,
      maxQueueSize,
      scheduledDelayMillis,
      exportTimeoutMillis,
      maxExportBatchSize: Math.min(maxExportBatchSize, maxQueueSize),
    };
  }

  private async sendBatch(): Promise<ExportResult> {
    this.clearTimer();
    const batch = this.queue.splice(0, this.config.maxExportBatchSize);
    const result = await this.config.exporter.export(batch);
    this.startTimer();
    return result;
  }

  private startTimer() {
    this.clearTimer();

    this.timer = setTimeout(async () => {
      this.timer = null;
      await this.sendBatch();
    }, this.config.scheduledDelayMillis);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  onStart(): void {
    if (this.isShutdown) {
      return;
    }
    this.startTimer();
  }

  onEnd(span: SpanAPI): void {
    if (this.isShutdown) {
      return;
    }
    this.queue.push(span);
    if (this.queue.length >= this.config.maxQueueSize) {
      this.sendBatch();
    }
  }

  async shutdown(): Promise<void> {
    if (this.isShutdown) {
      return Promise.resolve();
    }
    this.isShutdown = true;
    this.clearTimer();
    await this.forceFlush();
    return this.config.exporter.shutdown();
  }

  async forceFlush(): Promise<void> {
    if (this.isShutdown) {
      return Promise.resolve();
    }
    while (this.queue.length > 0) {
      await this.sendBatch();
    }
    return this.config.exporter.forceFlush();
  }
}
