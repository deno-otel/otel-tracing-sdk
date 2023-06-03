import {
  IdGenerator,
  SimpleIdGenerator,
  TracerAPI,
  TracerOptions,
  TracerProviderAPI,
} from "./deps.ts";
import { NoOpTracer } from "./no-op-tracer.ts";
import { SamplerAPI } from "./samplers/sampler.ts";
import { TraceIdRatioBasedSampler } from "./samplers/trace-id-ratio-based.ts";
import { SpanLimits } from "./span-limits.ts";
import { SpanProcessorAPI } from "./span-processors/api.ts";
import { Tracer } from "./tracer.ts";

type TracerProviderConfiguration = {
  idGenerator: IdGenerator;
  spanProcessors: SpanProcessorAPI[];
  spanLimits: SpanLimits;
  sampler: SamplerAPI;
};

export class TracerProvider implements TracerProviderAPI {
  private isShutdown = false;
  private tracers: Map<string, TracerAPI> = new Map();
  private configuration: TracerProviderConfiguration = {
    idGenerator: new SimpleIdGenerator(),
    spanProcessors: [],
    spanLimits: new SpanLimits(),
    sampler: new TraceIdRatioBasedSampler(1, 2),
  };

  get idGenerator(): IdGenerator {
    return this.configuration.idGenerator;
  }

  get sampler(): SamplerAPI {
    return this.configuration.sampler;
  }

  setIdGenerator(idGenerator: IdGenerator): TracerProvider {
    this.configuration.idGenerator = idGenerator;
    return this;
  }

  addSpanProcessor(spanProcessor: SpanProcessorAPI): TracerProvider {
    this.configuration.spanProcessors.push(spanProcessor);
    return this;
  }

  clearSpanProcessors(): TracerProvider {
    this.configuration.spanProcessors = [];
    return this;
  }

  getTracer(name: string, options: TracerOptions = {}): TracerAPI {
    if (this.isShutdown) {
      return new NoOpTracer();
    }
    const tracerKey = [
      name,
      options.version ?? "",
      options.schema_url ?? "",
    ].join(":");
    if (!this.tracers.has(tracerKey)) {
      this.tracers.set(tracerKey, new Tracer(name, options, this));
    }

    return this.tracers.get(tracerKey)!;
  }

  async shutdown(): Promise<void> {
    if (this.isShutdown) {
      return;
    }

    await Promise.all(
      this.configuration.spanProcessors.map((processor) => processor.shutdown())
    );

    this.isShutdown = true;
  }

  async forceFlush(): Promise<void> {
    if (this.isShutdown) {
      return;
    }

    await Promise.all(
      this.configuration.spanProcessors.map((processor) =>
        processor.forceFlush()
      )
    );
  }
}
