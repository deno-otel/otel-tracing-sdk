import { TraceFlags } from "../deps.ts";
import { AlwaysOffSampler } from "./always-off.ts";
import { AlwaysOnSampler } from "./always-on.ts";
import { SamplerAPI, SamplingParameters, SamplingResult } from "./sampler.ts";

import { getSpan } from "../context.ts";
import { getSpanContext } from "../span-context.ts";

type ParentSamplers = {
  remoteParentSampled: SamplerAPI;
  remoteParentNotSampled: SamplerAPI;
  localParentSampled: SamplerAPI;
  localParentNotSampled: SamplerAPI;
};

enum SampleScenarios {
  REMOTE_PARENT = 0b00,
  LOCAL_PARENT = 0b01,
  SAMPLED = 0b10,
  NOT_SAMPLED = 0b00,
}

export class ParentBasedSampler implements SamplerAPI {
  private rootSampler: SamplerAPI;
  private parentSamplers: ParentSamplers;

  constructor(
    rootSampler: SamplerAPI,
    parentSamplers: Partial<ParentSamplers> = {}
  ) {
    this.rootSampler = rootSampler;
    this.parentSamplers = {
      remoteParentSampled:
        parentSamplers.remoteParentSampled ?? new AlwaysOnSampler(),
      remoteParentNotSampled:
        parentSamplers.remoteParentNotSampled ?? new AlwaysOffSampler(),
      localParentSampled:
        parentSamplers.localParentSampled ?? new AlwaysOnSampler(),
      localParentNotSampled:
        parentSamplers.localParentNotSampled ?? new AlwaysOffSampler(),
    };
  }

  getDescription(): string {
    return `ParentBased`;
  }

  shouldSample(sp: SamplingParameters): SamplingResult {
    const span = getSpan(sp.context);
    const { parent = null } = span ?? {};
    if (parent === null) {
      return this.rootSampler.shouldSample(sp);
    }
    const { isRemote, traceFlags } = getSpanContext(parent);
    const isSampled = (traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;

    const sampleScenario =
      (isRemote
        ? SampleScenarios.REMOTE_PARENT
        : SampleScenarios.LOCAL_PARENT) |
      (isSampled ? SampleScenarios.SAMPLED : SampleScenarios.NOT_SAMPLED);

    switch (sampleScenario) {
      case SampleScenarios.REMOTE_PARENT | SampleScenarios.SAMPLED:
        return this.parentSamplers.remoteParentSampled.shouldSample(sp);
      case SampleScenarios.REMOTE_PARENT | SampleScenarios.NOT_SAMPLED:
        return this.parentSamplers.remoteParentNotSampled.shouldSample(sp);
      case SampleScenarios.LOCAL_PARENT | SampleScenarios.SAMPLED:
        return this.parentSamplers.localParentSampled.shouldSample(sp);
      case SampleScenarios.LOCAL_PARENT | SampleScenarios.NOT_SAMPLED:
        return this.parentSamplers.localParentNotSampled.shouldSample(sp);
      default:
        return this.rootSampler.shouldSample(sp);
    }
  }
}
