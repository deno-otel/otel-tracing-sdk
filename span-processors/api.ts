import { ContextAPI, SpanAPI } from "../deps.ts";

export interface SpanProcessorAPI {
  onStart(span: SpanAPI, context: ContextAPI): void;
  onEnd(span: SpanAPI): void;
  shutdown(): Promise<void>;
  forceFlush(): Promise<void>;
}
