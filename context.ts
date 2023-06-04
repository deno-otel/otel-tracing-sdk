import { ContextSpanAccessAPI } from "./deps.ts";
import { ContextAPI, createContextKey, SpanAPI } from "./deps.ts";

const SPAN_KEY = createContextKey("Span Key");

/**
 * Extract the current Span from the current Context
 */
export const getSpan: ContextSpanAccessAPI["extractSpan"] = (
  context: ContextAPI,
): SpanAPI | null => {
  return (context.getValue(SPAN_KEY) as SpanAPI) ?? null;
};

/**
 * Injects a Span into the current Context
 */
export const addSpan: ContextSpanAccessAPI["injectSpan"] = (
  context: ContextAPI,
  span: SpanAPI,
) => {
  return context.setValue(SPAN_KEY, span);
};
